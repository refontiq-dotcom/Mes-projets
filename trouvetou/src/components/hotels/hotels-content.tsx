"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  CircleAlert,
  Search,
  SlidersHorizontal,
  Sparkles,
} from "lucide-react";
import { RoomCard } from "@/components/hotels/room-card";
import { RoomCardSkeletonGrid } from "@/components/hotels/room-card-skeleton";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { fetchListedRooms, sortRooms } from "@/lib/supabase/hotels";
import { ESTABLISHMENT_TYPE_LABELS, cn } from "@/lib/utils";
import type { EstablishmentType, ListedRoom } from "@/lib/supabase/database.types";

const TYPE_FILTERS = Object.keys(ESTABLISHMENT_TYPE_LABELS) as EstablishmentType[];

const BUDGET_OPTIONS = [
  { label: "Tous les budgets", value: 0 },
  { label: "≤ 15 000 F", value: 15000 },
  { label: "≤ 30 000 F", value: 30000 },
  { label: "≤ 50 000 F", value: 50000 },
  { label: "≤ 100 000 F", value: 100000 },
];

const SORT_OPTIONS = [
  { label: "Prix croissant", value: "price_asc" },
  { label: "Prix décroissant", value: "price_desc" },
  { label: "Nom", value: "name" },
];

function useDebouncedValue<T>(value: T, delay: number): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

interface HotelsContentProps {
  initialQuery?: string;
}

export function HotelsContent({ initialQuery = "" }: HotelsContentProps) {
  const [query, setQuery] = useState(initialQuery);
  const [types, setTypes] = useState<EstablishmentType[]>([]);
  const [budget, setBudget] = useState(0);
  const [sort, setSort] = useState<string>("price_asc");

  const [rooms, setRooms] = useState<ListedRoom[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  const debounced = useDebouncedValue(query, 350);

  useEffect(() => {
    let cancelled = false;

    fetchListedRooms({
      search: debounced,
      establishmentTypes: types.length > 0 ? types : undefined,
      maxPrice: budget > 0 ? budget : undefined,
    })
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) {
          setError(error.message);
        } else {
          setRooms(sortRooms(data, sort));
        }
        setLoading(false);
      })
      .catch((err: unknown) => {
        if (cancelled) return;
        setError(err instanceof Error ? err.message : "Erreur inconnue");
        setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [debounced, types, budget, sort, reloadKey]);

  function toggleType(type: EstablishmentType) {
    setLoading(true);
    setTypes((prev) =>
      prev.includes(type) ? prev.filter((t) => t !== type) : [...prev, type]
    );
  }

  function resetFilters() {
    setLoading(true);
    setQuery("");
    setTypes([]);
    setBudget(0);
    setSort("price_asc");
  }

  function retry() {
    setLoading(true);
    setError(null);
    setReloadKey((k) => k + 1);
  }

  const hasActiveFilters = query !== "" || types.length > 0 || budget > 0;

  return (
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-10 sm:py-14">
      <div className="flex flex-col gap-2">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
        >
          <p className="text-sm text-muted-foreground">
            Accueil <span className="mx-1">/</span>
            <span className="font-medium text-foreground">
              Hôtels & Résidences
            </span>
          </p>
          <h1 className="mt-2 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Hôtels & Résidences Meublées
          </h1>
          <p className="mt-2 text-muted-foreground">
            Chambres et appartements publiés en direct par nos établissements
            partenaires.
          </p>
        </motion.div>
      </div>

      <div className="mt-8 rounded-2xl border border-border bg-card p-4 shadow-sm">
        <div className="flex flex-col gap-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => {
                setLoading(true);
                setQuery(e.target.value);
              }}
              placeholder="Rechercher une ville, une résidence, une chambre…"
              className="h-12 pl-12"
            />
          </div>

          <div className="flex items-center gap-3">
            <SlidersHorizontal className="h-4 w-4 text-muted-foreground shrink-0" />
            <select
              value={budget}
              onChange={(e) => {
                setLoading(true);
                setBudget(Number(e.target.value));
              }}
              className="h-12 rounded-xl border border-border bg-card px-4 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring"
            >
              {BUDGET_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>

            <select
              value={sort}
              onChange={(e) => {
                setLoading(true);
                setSort(e.target.value);
              }}
              className="h-12 rounded-xl border border-border bg-card px-4 text-sm outline-none transition-colors focus:border-ring focus:ring-2 focus:ring-ring"
              aria-label="Trier les résultats"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {TYPE_FILTERS.map((type) => {
            const active = types.includes(type);
            return (
              <button
                key={type}
                onClick={() => toggleType(type)}
                className={cn(
                  "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
                  active
                    ? "border-primary bg-primary text-primary-foreground"
                    : "border-border bg-card text-muted-foreground hover:border-primary hover:text-primary"
                )}
              >
                {ESTABLISHMENT_TYPE_LABELS[type]}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-6 flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {loading ? (
            "Chargement des annonces…"
          ) : (
            <>
              <span className="font-semibold text-foreground">
                {rooms.length}
              </span>{" "}
              annonce{rooms.length > 1 ? "s" : ""} trouvée
              {rooms.length > 1 ? "s" : ""}
            </>
          )}
        </p>
        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={resetFilters}>
            Réinitialiser les filtres
          </Button>
        )}
      </div>

      <div className="mt-6">
        {loading ? (
          <RoomCardSkeletonGrid count={6} />
        ) : error ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-red-50 text-destructive">
              <CircleAlert className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">
              Impossible de charger les annonces
            </h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              {error}
            </p>
            <Button className="mt-6" onClick={retry}>
              Réessayer
            </Button>
          </div>
        ) : rooms.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card px-6 py-20 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-secondary text-secondary-foreground">
              <Search className="h-7 w-7" />
            </div>
            <h3 className="mt-5 text-lg font-semibold text-foreground">
              Aucune annonce trouvée
            </h3>
            <p className="mt-2 max-w-md text-sm text-muted-foreground">
              Essayez d&apos;élargir votre recherche ou de réinitialiser les filtres.
            </p>
            <Button className="mt-6" onClick={resetFilters}>
              Voir toutes les annonces
            </Button>
          </div>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {rooms.map((room, i) => (
              <RoomCard key={room.id} room={room} index={i} />
            ))}
          </div>
        )}
      </div>

      {!loading && !error && rooms.length > 0 && (
        <p className="mt-10 flex items-center justify-center gap-2 text-center text-sm text-muted-foreground">
          <Sparkles className="h-4 w-4 text-accent" />
          Les annonces sont gérées par les établissements via la plateforme
          Séjoura.
        </p>
      )}
    </div>
  );
}
