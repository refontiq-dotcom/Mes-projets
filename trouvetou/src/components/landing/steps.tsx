"use client";

import { motion } from "framer-motion";
import { CircleCheck, HandCoins, MapPin, Search } from "lucide-react";

const STEPS = [
  {
    icon: Search,
    title: "1. Recherchez",
    description:
      "Trouvez la chambre, la résidence ou l'établissement idéal grâce à la recherche et aux filtres.",
  },
  {
    icon: MapPin,
    title: "2. Localisez",
    description:
      "Visualisez l'emplacement exact et obtenez l'itinéraire vers l'établissement en un clic.",
  },
  {
    icon: HandCoins,
    title: "3. Contactez & Réservez",
    description:
      "Contactez directement le gérant par téléphone ou WhatsApp et finalisez votre réservation.",
  },
];

export function HowItWorks() {
  return (
    <section className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.4 }}
          className="text-center"
        >
          <span className="inline-flex items-center gap-2 text-sm font-medium text-primary">
            <CircleCheck className="h-4 w-4" />
            Simple, rapide, sécurisé
          </span>
          <h2 className="mt-3 text-3xl sm:text-4xl font-bold tracking-tight text-foreground">
            Comment ça marche ?
          </h2>
        </motion.div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {STEPS.map((step, i) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={step.title}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: "-80px" }}
                transition={{ duration: 0.45, delay: i * 0.12 }}
                className="rounded-2xl border border-border bg-background p-8"
              >
                <div className="inline-flex h-12 w-12 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
                  <Icon className="h-6 w-6" />
                </div>
                <h3 className="mt-5 text-lg font-semibold text-foreground">
                  {step.title}
                </h3>
                <p className="mt-2 text-sm text-muted-foreground">
                  {step.description}
                </p>
              </motion.div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
