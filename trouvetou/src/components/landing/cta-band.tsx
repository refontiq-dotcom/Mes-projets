"use client";

import Link from "next/link";
import { motion } from "framer-motion";
import { ArrowRight, BadgeCheck, ShieldCheck, TrendingUp } from "lucide-react";

const TRUST_POINTS = [
  {
    icon: ShieldCheck,
    title: "Établissements vérifiés",
    description: "Seuls les partenaires avec un abonnement actif sont affichés.",
  },
  {
    icon: BadgeCheck,
    title: "Photos réelles",
    description: "Chaque annonce est publiée directement depuis Séjoura.",
  },
  {
    icon: TrendingUp,
    title: "Prix affichés en FCFA",
    description: "Le tarif par nuit est clair, sans surprise.",
  },
];

export function CtaBand() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.5 }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-600 to-teal-700 px-6 py-16 sm:px-12 text-center"
      >
        <div className="hero-blob h-64 w-64 bg-white/20 -right-16 -top-16" />
        <div className="hero-blob h-72 w-72 bg-amber-300/30 -left-16 -bottom-16" />

        <div className="relative mx-auto max-w-2xl">
          <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-white">
            Prêt à trouver votre prochain logement ?
          </h2>
          <p className="mt-4 text-emerald-50">
            Parcourez les chambres et résidences meublées publiées par nos
            établissements partenaires.
          </p>
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/hotels"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-white px-6 text-sm font-semibold text-emerald-700 shadow-lg transition-transform hover:scale-105"
            >
              Voir les annonces
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/hotels"
              className="inline-flex h-12 items-center gap-2 rounded-xl border border-white/40 px-6 text-sm font-medium text-white transition-colors hover:bg-white/10"
            >
              Trouver un hôtel
            </Link>
          </div>
        </div>
      </motion.div>

      <div className="mt-14 grid gap-6 sm:grid-cols-3">
        {TRUST_POINTS.map((point, i) => {
          const Icon = point.icon;
          return (
            <motion.div
              key={point.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-80px" }}
              transition={{ duration: 0.4, delay: i * 0.1 }}
              className="flex items-start gap-4"
            >
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                <Icon className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-semibold text-foreground">{point.title}</h3>
                <p className="mt-1 text-sm text-muted-foreground">
                  {point.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
