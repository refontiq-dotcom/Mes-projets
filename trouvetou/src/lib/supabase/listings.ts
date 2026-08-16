import { getSupabase } from "./client";
import type { Listing } from "./database.types";

// ============================================================================
// TROUVETOU — Lecture du catalogue public (base autonome Trouvetou)
//
// Le portail consomme désormais la table polymorphe `listings` de sa propre
// base, agrégée par la couche d'ingestion /api/v1/sync (voir `categories`,
// `providers`, `listings` dans supabase/schema.sql).
// ============================================================================

const LISTINGS_SELECT = `
  id,
  provider_id,
  category_id,
  external_id,
  title,
  description,
  city,
  base_price,
  images,
  attributes,
  is_available,
  created_at,
  updated_at,
  categories!inner (
    id,
    slug,
    name
  ),
  providers!inner (
    id,
    name
  )
`;

export interface FetchListingsParams {
  search?: string;
  categorySlugs?: string[];
  maxPrice?: number;
  sort?: "price_asc" | "price_desc" | "updated";
  limit?: number;
}

export interface ListedListing extends Listing {
  category: {
    id: string;
    slug: string;
    name: string;
  };
  provider: {
    id: string;
    name: string;
  };
}

/** Ligne brute retournée par PostgREST (ressources embarquées). */
interface ListingRow {
  id: string;
  provider_id: string;
  category_id: string;
  external_id: string;
  title: string;
  description: string | null;
  city: string | null;
  base_price: number | null;
  images: string[] | null;
  attributes: Record<string, unknown> | null;
  is_available: boolean | null;
  created_at: string;
  updated_at: string;
  categories:
    | { id: string; slug: string; name: string }
    | { id: string; slug: string; name: string }[]
    | null;
  providers: { id: string; name: string } | { id: string; name: string }[] | null;
}

function mapRow(row: ListingRow): ListedListing | null {
  const category = Array.isArray(row.categories) ? row.categories[0] : row.categories;
  const provider = Array.isArray(row.providers) ? row.providers[0] : row.providers;
  if (!category || !provider) return null;

  return {
    id: row.id,
    provider_id: row.provider_id,
    category_id: row.category_id,
    external_id: row.external_id,
    title: row.title,
    description: row.description,
    city: row.city,
    base_price: row.base_price,
    images: Array.isArray(row.images) ? row.images : [],
    attributes: row.attributes ?? {},
    is_available: row.is_available ?? true,
    created_at: row.created_at,
    updated_at: row.updated_at,
    category,
    provider,
  };
}

function mapRows(data: unknown): ListedListing[] {
  const rows = (data as unknown as ListingRow[]) ?? [];
  return rows
    .map(mapRow)
    .filter((l): l is ListedListing => l !== null);
}

/**
 * Récupère les annonces publiques du comparateur depuis la base Trouvetou.
 * Les catégories, le budget et la recherche sont filtrés côté serveur ;
 * le tri est appliqué côté client après normalisation.
 */
export async function fetchListings(
  params: FetchListingsParams = {}
): Promise<{ data: ListedListing[]; error: Error | null }> {
  const supabase = getSupabase();
  if (!supabase) {
    return {
      data: [],
      error: new Error(
        "Supabase n'est pas configuré. Renseignez NEXT_PUBLIC_SUPABASE_URL et NEXT_PUBLIC_SUPABASE_ANON_KEY (voir .env.example)."
      ),
    };
  }

  let query = supabase
    .from("listings")
    .select(LISTINGS_SELECT)
    .eq("is_available", true);

  const { search, categorySlugs, maxPrice, limit } = params;

  if (search && search.trim().length > 0) {
    // Recherche sur le titre, la ville et le nom du provider.
    // Les caractères `%` et `,` sont neutralisés (syntaxe PostgREST .or()).
    const needle = search.trim().replace(/[%,]/g, " ");
    query = query.or(
      `title.ilike.%${needle}%,city.ilike.%${needle}%,providers.name.ilike.%${needle}%`
    );
  }

  if (categorySlugs && categorySlugs.length > 0) {
    query = query.in("categories.slug", categorySlugs);
  }

  if (maxPrice && maxPrice > 0) {
    query = query.lte("base_price", maxPrice);
  }

  let dataQuery = query.order("updated_at", { ascending: false });
  if (limit && limit > 0) {
    dataQuery = dataQuery.limit(limit);
  }

  const { data, error } = await dataQuery;

  if (error) {
    return { data: [], error: new Error(error.message) };
  }

  const listings = mapRows(data);

  const sort = params.sort ?? "updated";
  listings.sort((a, b) => {
    if (sort === "price_asc") return (a.base_price ?? 0) - (b.base_price ?? 0);
    if (sort === "price_desc") return (b.base_price ?? 0) - (a.base_price ?? 0);
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  return { data: listings, error: null };
}

/** Récupère les catégories de référence (filtres de l'interface). */
export async function fetchCategories(): Promise<{
  data: Array<{ slug: string; name: string }>;
  error: Error | null;
}> {
  const supabase = getSupabase();
  if (!supabase) {
    return { data: [], error: null };
  }

  const { data, error } = await supabase
    .from("categories")
    .select("slug, name")
    .order("name", { ascending: true });

  if (error) {
    return { data: [], error: new Error(error.message) };
  }

  return { data: (data ?? []) as Array<{ slug: string; name: string }>, error: null };
}
