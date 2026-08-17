"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { motion } from "framer-motion";
import { MapPin, Search } from "lucide-react";

const POPULAR_QUERIES = ["Abidjan", "Résidence", "Studio meublé"];

export function Hero() {
  const router = useRouter();
  const [query, setQuery] = useState("");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const q = query.trim();
    router.push(q ? `/hotels?q=${encodeURIComponent(q)}` : "/hotels");
  }

  return (
    <section className="relative overflow-hidden">
      <div className="hero-blob h-72 w-72 bg-emerald-200 -top-10 -left-10" />
      <div className="hero-blob h-96 w-96 bg-teal-200 top-20 right-0" />
      <div className="hero-blob h-64 w-64 bg-amber-200 bottom-0 left-1/3" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12 sm:py-28 text-center">
        <motion.div
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <span className="inline-flex items-center gap-2 rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 sm:px-4 sm:py-1.5 text-xs sm:text-sm font-medium text-emerald-700">
            <MapPin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
            Annonces vérifiées · Côte d&apos;Ivoire & Afrique de l&apos;Ouest
          </span>

          <h1 className="mt-4 sm:mt-6 text-3xl sm:text-5xl lg:text-6xl font-bold tracking-tight text-foreground">
            Trouvez{" "}
            <span className="text-primary">tout</span>,{" "}
            <span className="text-primary">restez</span> serein.
          </h1>

          <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg text-muted-foreground">
            Hôtels, résidences meublées, écoles et cliniques de confiance
            partout en Afrique de l&apos;Ouest. Comparez, contactez et réservez en
            quelques clics.
          </p>
        </motion.div>

        <motion.form
          onSubmit={handleSubmit}
          initial={{ opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="mx-auto mt-6 sm:mt-10 flex max-w-2xl flex-col sm:flex-row items-stretch gap-3 rounded-2xl border border-border bg-card p-3 shadow-lg shadow-emerald-100/50"
        >
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
            <input
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ville, nom de résidence, type de chambre…"
              className="h-12 w-full rounded-xl border-0 bg-transparent pl-12 pr-4 text-sm outline-none placeholder:text-muted-foreground"
            />
          </div>
          <button
            type="submit"
            className="inline-flex h-12 items-center justify-center gap-2 rounded-xl bg-primary px-6 text-sm font-medium text-primary-foreground shadow-sm transition-colors hover:bg-primary-hover"
          >
            <Search className="h-4 w-4" />
            Rechercher
          </button>
        </motion.form>

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-5 flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground"
        >
          <span>Populaire :</span>
          {POPULAR_QUERIES.map((q) => (
            <button
              key={q}
              onClick={() => router.push(`/hotels?q=${encodeURIComponent(q)}`)}
              className="rounded-full border border-border bg-card px-3 py-1 text-xs font-medium transition-colors hover:border-primary hover:text-primary"
            >
              {q}
            </button>
          ))}
        </motion.div>
      </div>
    </section>
  );
}
