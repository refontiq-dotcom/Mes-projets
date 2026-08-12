import { getSupabase } from "./client";
import type {
  EstablishmentType,
  ListedRoom,
  Room,
  SubscriptionStatus,
} from "./database.types";

// ============================================================================
// TROUVETOU — Service de récupération des annonces (requête adaptative)
//
// 1. Tente d'abord le schéma du cahier des charges :
//    rooms.is_listed_on_trouvetou + establishments + subscriptions.
// 2. Si les tables/colonnes n'existent pas encore en base (erreur de schéma),
//    bascule automatiquement sur le schéma Séjoura existant :
//    room_types + accommodations + tenants + subscriptions.
// ============================================================================

export interface FetchListedRoomsParams {
  search?: string;
  establishmentTypes?: string[];
  maxPrice?: number;
}

const TROUVETOU_SCHEMA_SELECT = `
  id,
  name,
  description,
  price_per_night,
  capacity,
  amenities,
  images,
  is_listed_on_trouvetou,
  establishments!inner (
    id,
    name,
    type,
    slug,
    city,
    country,
    address,
    latitude,
    longitude,
    cover_image,
    contact_phone,
    contact_email,
    whatsapp,
    website,
    subscriptions!inner (
      subscription_status
    )
  )
`;

const SEJOURA_SCHEMA_SELECT = `
  id,
  name,
  description,
  base_price,
  capacity,
  amenities,
  created_at,
  updated_at,
  accommodations!inner (
    id,
    name,
    description,
    address,
    city,
    country,
    latitude,
    longitude,
    contact_phone,
    is_active,
    created_at,
    updated_at,
    tenants!inner (
      company_name,
      contact_email,
      contact_phone,
      logo_url,
      subscriptions!inner (
        status
      )
    )
  )
`;

/** Image de repli (schéma Séjoura sans photos) pour garder des cartes visuelles. */
const FALLBACK_IMAGE =
  "https://images.unsplash.com/photo-1611892440504-42a792e24d32?w=1200&q=70";

function isSchemaError(error: { code?: string; message?: string }): boolean {
  if (!error) return false;
  const msg = `${error.code ?? ""} ${error.message ?? ""}`;
  return (
    /42703|PGRST200|PGRST205|PGRST206/.test(msg) ||
    /column .* does not exist/.test(msg) ||
    /Could not find the table/.test(msg) ||
    /Could not find a relationship/.test(msg)
  );
}

function sortRooms(rooms: ListedRoom[], sort: string): ListedRoom[] {
  const sorted = [...rooms];
  if (sort === "price_asc") {
    sorted.sort((a, b) => a.price_per_night - b.price_per_night);
  } else if (sort === "price_desc") {
    sorted.sort((a, b) => b.price_per_night - a.price_per_night);
  } else {
    sorted.sort((a, b) => a.name.localeCompare(b.name, "fr"));
  }
  return sorted;
}

/**
 * Récupère les chambres publiées sur Trouvetou, avec repli automatique sur le
 * schéma Séjoura. Le tri et les filtres (recherche, type, budget) sont
 * appliqués côté client.
 */
export async function fetchListedRooms(
  params: FetchListedRoomsParams = {}
): Promise<{ data: ListedRoom[]; error: Error | null }> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      data: [],
      error: new Error(
        "Supabase n'est pas configuré. Renseignez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY (voir .env.example)."
      ),
    };
  }

  const primary = await queryTrouvetouSchema(supabase);
  if (!primary.schemaError) {
    if (primary.error) return { data: [], error: primary.error };
    return applyFilters(primary.data, params);
  }

  const fallback = await querySejouraSchema(supabase);
  if (fallback.error) return { data: [], error: fallback.error };

  return applyFilters(fallback.data, params);
}

/** Schéma du cahier des charges : rooms + establishments + subscriptions. */
async function queryTrouvetouSchema(supabase: ReturnType<typeof getSupabase>) {
  const { data, error } = await supabase!
    .from("rooms")
    .select(TROUVETOU_SCHEMA_SELECT)
    .eq("is_listed_on_trouvetou", true)
    .not("images", "is", null)
    .eq("establishments.subscriptions.subscription_status", "active");

  if (error) {
    return { data: [] as ListedRoom[], error: null, schemaError: isSchemaError(error) };
  }

  const rows = (data as unknown as ListedRoom[]) ?? [];
  return {
    data: rows.filter(
      (room) => Array.isArray(room.images) && room.images.length > 0
    ),
    error: null,
    schemaError: false,
  };
}

/** Schéma Séjoura existant : room_types + accommodations + subscriptions. */
async function querySejouraSchema(supabase: ReturnType<typeof getSupabase>) {
  const { data, error } = await supabase!
    .from("room_types")
    .select(SEJOURA_SCHEMA_SELECT)
    .eq("accommodations.is_active", true)
    .eq("accommodations.tenants.subscriptions.status", "active");

  if (error) {
    return { data: [] as ListedRoom[], error: new Error(error.message) };
  }

  const rows = (data ?? []) as unknown as SejouraRoomTypeRow[];
  const rooms: ListedRoom[] = [];

  for (const row of rows) {
    const accommodation = row.accommodations;
    const tenant = accommodation?.tenants;
    const subscription = tenant?.subscriptions;

    const image =
      tenant?.logo_url && tenant.logo_url.length > 0
        ? tenant.logo_url
        : FALLBACK_IMAGE;

    rooms.push({
      id: row.id,
      establishment_id: accommodation?.id ?? "",
      name: row.name ?? "Chambre",
      description: row.description,
      price_per_night: row.base_price ?? 0,
      capacity: row.capacity ?? 0,
      amenities: Array.isArray(row.amenities) ? row.amenities : [],
      images: [image],
      is_listed_on_trouvetou: true,
      created_at: row.created_at ?? "",
      updated_at: row.updated_at ?? "",
      establishment: {
        id: accommodation?.id ?? "",
        name: accommodation?.name ?? tenant?.company_name ?? "Établissement",
        type: "residence" as EstablishmentType,
        slug: null,
        description: accommodation?.description ?? null,
        city: accommodation?.city ?? null,
        country: accommodation?.country ?? null,
        address: accommodation?.address ?? null,
        latitude: accommodation?.latitude ?? null,
        longitude: accommodation?.longitude ?? null,
        cover_image: image,
        contact_phone:
          accommodation?.contact_phone ?? tenant?.contact_phone ?? null,
        contact_email: tenant?.contact_email ?? null,
        whatsapp: null,
        website: null,
        is_active: accommodation?.is_active ?? false,
        created_at: accommodation?.created_at ?? "",
        updated_at: accommodation?.updated_at ?? "",
        subscription: {
          subscription_status:
            (subscription?.subscription_status ??
              subscription?.status) as SubscriptionStatus,
        },
      },
    });
  }

  return { data: rooms, error: null };
}

function applyFilters(
  rooms: ListedRoom[],
  { search, establishmentTypes, maxPrice }: FetchListedRoomsParams
): { data: ListedRoom[]; error: null } {
  let filtered = rooms;

  if (search && search.trim().length > 0) {
    const needle = search.trim().toLowerCase();
    filtered = filtered.filter(
      (room) =>
        room.name.toLowerCase().includes(needle) ||
        (room.establishment?.name ?? "").toLowerCase().includes(needle) ||
        (room.establishment?.city ?? "").toLowerCase().includes(needle)
    );
  }

  if (establishmentTypes && establishmentTypes.length > 0) {
    filtered = filtered.filter(
      (room) =>
        room.establishment?.type != null &&
        establishmentTypes.includes(room.establishment.type)
    );
  }

  if (maxPrice && maxPrice > 0) {
    filtered = filtered.filter(
      (room) => (room.price_per_night ?? 0) <= maxPrice
    );
  }

  return { data: filtered, error: null };
}

export { sortRooms };

interface SejouraRoomTypeRow {
  id: string;
  name: string | null;
  description: string | null;
  base_price: number | null;
  capacity: number | null;
  amenities: string[] | null;
  created_at: string | null;
  updated_at: string | null;
  accommodations: {
    id: string;
    name: string | null;
    description: string | null;
    address: string | null;
    city: string | null;
    country: string | null;
    latitude: number | null;
    longitude: number | null;
    contact_phone: string | null;
    is_active: boolean;
    created_at: string;
    updated_at: string;
    tenants: {
      company_name: string | null;
      contact_email: string | null;
      contact_phone: string | null;
      logo_url: string | null;
      subscriptions: {
        status: string | null;
        subscription_status: string | null;
      } | null;
    };
  };
}

export function normalizeRoom(room: Room): ListedRoom {
  return {
    ...room,
    images: Array.isArray(room.images) ? room.images : [],
    amenities: Array.isArray(room.amenities) ? room.amenities : [],
  } as ListedRoom;
}
