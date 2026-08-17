import { fetchListings } from "./listings";
import { toListingViews, type ListingView } from "./listing-view";

// ============================================================================
// TROUVETOU — Service de récupération des annonces du secteur Hôtels
//
// Depuis la migration vers la base dédiée, la lecture passe par la table
// `listings` (polymorphe) filtrée sur les catégories du secteur :
//   hotel (chambres d'hôtel) et residence (résidences meublées).
// ============================================================================

/** Catégories couvertes par la section « Hôtels & Résidences ». */
const HOTELS_SECTION_CATEGORIES = ["hotel", "residence"];

export interface FetchListedListingsParams {
  search?: string;
  categorySlugs?: string[];
  maxPrice?: number;
  limit?: number;
  /** Ne retourne que les annonces `is_boosted = true` (filtre SQL). */
  boosted?: boolean;
}

/**
 * Récupère les annonces du secteur Hôtels depuis la base Trouvetou.
 * Par défaut la section couvre les catégories `hotel` et `residence`.
 */
export async function fetchListedListings(
  params: FetchListedListingsParams = {}
): Promise<{ data: ListingView[]; error: Error | null }> {
  const { search, categorySlugs, maxPrice, limit, boosted } = params;

  const { data, error } = await fetchListings({
    search,
    categorySlugs:
      categorySlugs && categorySlugs.length > 0
        ? categorySlugs
        : HOTELS_SECTION_CATEGORIES,
    maxPrice,
    limit,
    boosted,
  });

  if (error) {
    return { data: [], error };
  }

  return { data: toListingViews(data), error: null };
}

export interface FetchListedRoomsParams {
  search?: string;
  establishmentTypes?: string[];
  maxPrice?: number;
}

/** Alias de compatibilité (ancien nom). */
export async function fetchListedRooms(
  params: FetchListedRoomsParams = {}
): Promise<{ data: ListingView[]; error: Error | null }> {
  return fetchListedListings({
    search: params.search,
    categorySlugs: params.establishmentTypes,
    maxPrice: params.maxPrice,
  });
}

/**
 * Récupère les annonces boostées pour le carrousel sponsorisé.
 * Le filtre `is_boosted` est appliqué en SQL AVANT la limite, afin que les
 * annonces boostées les plus récentes ne soient jamais évincées du lot.
 */
export async function fetchBoostedRooms(
  categorySlugs?: string[]
): Promise<{ data: ListingView[]; error: Error | null }> {
  return fetchListedListings({ limit: 20, boosted: true, categorySlugs });
}

export function sortRooms(rooms: ListingView[], sort: string): ListingView[] {
  const byCriteria = (a: ListingView, b: ListingView): number => {
    if (sort === "price_asc") return (a.price ?? 0) - (b.price ?? 0);
    if (sort === "price_desc") return (b.price ?? 0) - (a.price ?? 0);
    return a.name.localeCompare(b.name, "fr");
  };

  const boosted = rooms.filter((room) => room.is_boosted).sort(byCriteria);
  const regular = rooms.filter((room) => !room.is_boosted).sort(byCriteria);

  // Les annonces boostées apparaissent TOUJOURS en premier.
  return [...boosted, ...regular];
}
