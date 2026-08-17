"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { GraduationCap, Hotel, Stethoscope } from "lucide-react";
import { cn } from "@/lib/utils";

interface Category {
  title: string;
  subtitle: string;
  icon: typeof Hotel;
  gradient: string;
  href: string;
}

const CATEGORIES: Category[] = [
  {
    title: "Hôtels & Résidences Meublées",
    subtitle:
      "Chambres, studios et appartements meublés disponibles à la nuit, à la semaine ou au mois.",
    icon: Hotel,
    gradient: "from-emerald-500 to-teal-600",
    href: "/hotels",
  },
  {
    title: "Écoles & Établissements Privés",
    subtitle:
      "Campus, écoles primaires, secondaires et centres de formation de confiance.",
    icon: GraduationCap,
    gradient: "from-violet-500 to-indigo-600",
    href: "/ecoles",
  },
  {
    title: "Cliniques & Santé",
    subtitle:
      "Cliniques, cabinets médicaux et centres de santé partenaires vérifiés.",
    icon: Stethoscope,
    gradient: "from-rose-500 to-pink-600",
    href: "/cliniques",
  },
];

function CategoryCard({ category, index }: { category: Category; index: number }) {
  const Icon = category.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ duration: 0.4, delay: index * 0.08 }}
      whileHover={{ y: -4 }}
      className="group relative h-full overflow-hidden rounded-2xl border border-border bg-card p-5 sm:p-6 shadow-sm transition-shadow hover:shadow-xl hover:shadow-emerald-100/60"
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
            "inline-flex h-11 w-11 sm:h-14 sm:w-14 items-center justify-center rounded-2xl bg-gradient-to-br text-white shadow-md",
            category.gradient
          )}
        >
          <Icon className="h-6 w-6 sm:h-7 sm:w-7" />
        </div>

        <h3 className="mt-4 text-base sm:text-xl font-semibold text-foreground leading-snug">
          {category.title}
        </h3>
        <p className="mt-2 flex-1 text-xs sm:text-sm text-muted-foreground">
          {category.subtitle}
        </p>

        <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-primary">
          Comparer les prix
          <span className="transition-transform group-hover:translate-x-1">→</span>
        </span>
      </div>
    </motion.div>
  );
}

export function CategoryCards() {
  return (
    <section className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8 sm:py-16">
      <div className="grid grid-cols-2 gap-3 sm:gap-6 md:grid-cols-3">
        {CATEGORIES.map((category, i) => (
          <Link
            key={category.href}
            href={category.href}
            className={cn(
              "block h-full",
              i === 2 && "col-span-2 md:col-span-1"
            )}
          >
            <CategoryCard category={category} index={i} />
          </Link>
        ))}
      </div>
    </section>
  );
}
