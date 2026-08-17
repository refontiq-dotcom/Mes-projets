import { NextRequest, NextResponse } from "next/server";
import { getAdminClient } from "@/lib/supabase/admin";
import { LISTINGS_SELECT } from "@/lib/supabase/listings";

/**
 * TROUVETOU — API publique du catalogue (serveur)
 *
 * Renvoie les annonces `listings` lues avec le client admin (service_role).
 * La lecture directe en base via le rôle `anon` échoue sur le JOIN
 * `providers!inner` car la table `providers` n'a pas de politique RLS en
 * lecture pour ce rôle : toutes les annonces étaient donc filtrées. Passer par
 * le service_role (qui contourne RLS) restaure le catalogue complet.
 *
 *   GET /api/catalog/listings?q=&categories=hotel,residence&maxPrice=&limit=
 */
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest): Promise<NextResponse> {
  const admin = getAdminClient();
  if (!admin) {
    return NextResponse.json(
      {
        data: [],
        error:
          "Configuration serveur incomplète (TROUVETOU_SUPABASE_URL / TROUVETOU_SUPABASE_SERVICE_ROLE_KEY).",
      },
      { status: 500 }
    );
  }

  const sp = req.nextUrl.searchParams;
  const search = (sp.get("q") ?? "").trim();
  const categorySlugs = (sp.get("categories") ?? "")
    .split(",")
    .map((slug) => slug.trim())
    .filter((slug) => slug.length > 0);
  const maxPrice = Number(sp.get("maxPrice") ?? 0);
  const limit = Number(sp.get("limit") ?? 0);

  let query = admin.from("listings").select(LISTINGS_SELECT).eq("is_available", true);

  if (search.length > 0) {
    // Recherche sur le titre, la ville et le nom du provider.
    // Les caractères `%` et `,` sont neutralisés (syntaxe PostgREST .or()).
    const needle = search.replace(/[%,]/g, " ");
    query = query.or(
      `title.ilike.%${needle}%,city.ilike.%${needle}%,providers.name.ilike.%${needle}%`
    );
  }

  if (categorySlugs.length > 0) {
    query = query.in("categories.slug", categorySlugs);
  }

  if (maxPrice > 0) {
    query = query.lte("base_price", maxPrice);
  }

  let dataQuery = query.order("updated_at", { ascending: false });
  if (limit > 0) {
    dataQuery = dataQuery.limit(limit);
  }

  const { data, error } = await dataQuery;
  if (error) {
    return NextResponse.json({ data: [], error: error.message }, { status: 500 });
  }

  return NextResponse.json({ data: data ?? [], error: null });
}
