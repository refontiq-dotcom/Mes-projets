import Link from "next/link";
import { Compass } from "lucide-react";

const CATEGORIES = [
  { href: "/hotels", label: "Hôtels & Résidences meublées" },
  { href: "/ecoles", label: "Écoles & Établissements privés" },
  { href: "/cliniques", label: "Cliniques & Santé" },
];

export function Footer() {
  return (
    <footer className="border-t border-border bg-card">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid gap-10 md:grid-cols-4">
          <div className="md:col-span-2">
            <div className="flex items-center gap-2.5">
              <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-primary-foreground">
                <Compass className="h-5 w-5" />
              </span>
              <span className="text-xl font-bold text-foreground">Trouvetou</span>
            </div>
            <p className="mt-4 max-w-md text-sm text-muted-foreground">
              Le portail public qui vous aide à trouver hôtels, résidences
              meublées, écoles et cliniques de confiance, partout en Afrique de
              l&apos;Ouest. Trouvez tout, restez serein.
            </p>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Univers
            </h3>
            <ul className="mt-4 space-y-3">
              {CATEGORIES.map((cat) => (
                <li key={cat.label}>
                  <Link
                    href={cat.href}
                    className="text-sm text-muted-foreground hover:text-primary transition-colors"
                  >
                    {cat.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h3 className="text-sm font-semibold text-foreground">Navigation</h3>
            <ul className="mt-4 space-y-3">
              <li>
                <Link
                  href="/"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Accueil
                </Link>
              </li>
              <li>
                <Link
                  href="/hotels"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Hôtels & Résidences
                </Link>
              </li>
              <li>
                <Link
                  href="/ecoles"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Écoles & Établissements
                </Link>
              </li>
              <li>
                <Link
                  href="/cliniques"
                  className="text-sm text-muted-foreground hover:text-primary transition-colors"
                >
                  Cliniques & Santé
                </Link>
              </li>
            </ul>
          </div>
        </div>

        <div className="mt-10 border-t border-border pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} Trouvetou. Tous droits réservés.
          </p>
          <p className="text-xs text-muted-foreground">
            Powered by Séjoura · FCFA
          </p>
        </div>
      </div>
    </footer>
  );
}
