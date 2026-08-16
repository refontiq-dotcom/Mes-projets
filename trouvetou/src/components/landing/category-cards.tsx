"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { GraduationCap, Hotel, Stethoscope } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { UniverseModal } from "@/components/landing/universe-modal";
import { cn } from "@/lib/utils";

interface Category {
  title: string;
  subtitle: string;
  icon: typeof Hotel;
  gradient: string;
  soon?: boolean;
}

const CATEGORIES: Category[] = [
  {
    title: "Hôtels & Résidences Meublées",
    subtitle:
      "Chambres, studios et appartements meublés disponibles à la nuit, à la semaine ou au mois.",
    icon: Hotel,
    gradient: "from-emerald-500 to-teal-600",
  },
  {
    title: "Écoles & Établissements Privés",
    subtitle:
      "Campus, écoles primaires, secondaires et centres de formation de confiance.",
    icon: GraduationCap,
    gradient: "from-violet-500 to-indigo-600",
    soon: true,
  },
  {
    title: "Cliniques & Santé",
    subtitle:
      "Cliniques, cabinets médicaux et centres de santé partenaires vérifiés.",
    icon: Stethoscope,
    gradient: "from-rose-500 to-pink-600",
    soon: true,
  },
];

function CategoryCard({ category, index }: { category: Category; index: number }) {
  const Icon = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.45, delay: index * 0.12 }}
      whileHover={{ y: -6, scale: 1.02, transition: { duration: 0.2 } }}
      className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-8 shadow-sm transition-shadow hover:shadow-xl hover:shadow-emerald-100/60"
    >
      <div
        className={cn(
          "absolute -right-8 -top-8 h-32 w-32 rounded-full bg-gradient-to-br opacity-10 transition-transform duration-300 group-hover:scale-125",
          category.gradient
        )}
      />
      <div className="relative flex h-full flex-col">
        <div
          className={cn(
            "inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md",
            category.gradient
          )}
        >
          <Icon className="h-7 w-7" />
        </div>

        <h3 className="mt-6 text-xl font-semibold text-foreground">
          {category.title}
        </h3>
        <p className="mt-2 flex-1 text-sm text-muted-foreground">
          {category.subtitle}
        </p>

        {category.soon ? (
          <Badge variant="warning" className="mt-6 w-fit">
            Bientôt disponible
          </Badge>
        ) : (
          <span className="mt-6 inline-flex items-center gap-2 text-sm font-medium text-primary">
            Choisir
            <span className="transition-transform group-hover:translate-x-1">→</span>
          </span>
        )}
      </div>
    </motion.div>
  );
}

export function CategoryCards() {
  const [modalOpen, setModalOpen] = useState(false);

  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true, margin: "-80px" }}
        transition={{ duration: 0.4 }}
        className="text-center"
      >
        <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
          Explorez nos univers
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-muted-foreground">
          Trois grandes familles d&apos;annonces vérifiées, en un seul portail.
        </p>
      </motion.div>

      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {CATEGORIES.map((category, i) => (
          <button
            key={category.title}
            onClick={() => setModalOpen(true)}
            className="block h-full cursor-pointer text-left"
          >
            <CategoryCard category={category} index={i} />
          </button>
        ))}
      </div>

      <UniverseModal open={modalOpen} onClose={() => setModalOpen(false)} />
    </section>
  );
}
