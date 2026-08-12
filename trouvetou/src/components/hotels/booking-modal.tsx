"use client";

import Image from "next/image";
import {
  Building2,
  Mail,
  MapPin,
  MessageCircle,
  Navigation,
  Phone,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import {
  buildGoogleMapsUrl,
  buildWhatsAppUrl,
  formatFCFA,
  normalizePhone,
  getEstablishmentTypeLabel,
} from "@/lib/utils";
import type { ListedRoom } from "@/lib/supabase/database.types";

interface BookingModalProps {
  room: ListedRoom;
  open: boolean;
  onClose: () => void;
}

export function BookingModal({ room, open, onClose }: BookingModalProps) {
  const establishment = room.establishment;
  const hasContact =
    establishment?.contact_phone != null ||
    establishment?.whatsapp != null ||
    establishment?.contact_email != null;

  const mapsUrl = buildGoogleMapsUrl(
    establishment?.latitude,
    establishment?.longitude,
    establishment?.address ?? establishment?.city
  );

  const whatsappMessage = `Bonjour, je vous contacte depuis Trouvetou. Je suis intéressé(e) par « ${room.name} » à ${formatFCFA(
    room.price_per_night ?? 0
  )}/nuit.`;

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Réserver / Contacter"
      description={`Réservation gérée directement par l'établissement`}
      size="lg"
    >
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="relative aspect-[4/3] overflow-hidden rounded-xl">
          <Image
            src={room.images[0]}
            alt={room.name}
            fill
            sizes="(min-width: 640px) 50vw, 100vw"
            className="object-cover"
          />
        </div>

        <div>
          <div className="flex items-center gap-1.5 text-sm text-muted-foreground">
            <Building2 className="h-4 w-4 text-primary" />
            <span className="font-medium text-foreground">
              {establishment?.name}
            </span>
          </div>

          <h3 className="mt-2 text-xl font-semibold text-foreground">
            {room.name}
          </h3>

          {establishment?.type && (
            <Badge className="mt-2">
              {getEstablishmentTypeLabel(establishment.type)}
            </Badge>
          )}

          <div className="mt-4">
            <p className="text-2xl font-bold text-primary">
              {formatFCFA(room.price_per_night ?? 0)}
              <span className="ml-1 text-sm font-normal text-muted-foreground">
                / nuit
              </span>
            </p>
          </div>

          {establishment?.address && (
            <p className="mt-3 flex items-start gap-2 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
              {establishment.address}
              {establishment.city ? `, ${establishment.city}` : ""}
            </p>
          )}
        </div>
      </div>

      {room.description && (
        <p className="mt-6 rounded-xl bg-muted p-4 text-sm text-muted-foreground">
          {room.description}
        </p>
      )}

      <div className="mt-6 border-t border-border pt-5">
        <p className="text-sm font-semibold text-foreground">
          Coordonnées du gérant
        </p>

        {!hasContact ? (
          <p className="mt-3 text-sm text-muted-foreground">
            Aucune coordonnée renseignée pour le moment. Contactez l&apos;équipe
            Trouvetou pour toute demande.
          </p>
        ) : (
          <div className="mt-4 grid gap-3">
            {establishment?.contact_phone && (
              <a
                href={`tel:${normalizePhone(establishment.contact_phone)}`}
                className="inline-flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Phone className="h-4 w-4 text-primary" />
                {establishment.contact_phone}
              </a>
            )}

            {establishment?.whatsapp && (
              <a
                href={buildWhatsAppUrl(establishment.whatsapp, whatsappMessage)}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-3 rounded-xl bg-emerald-600 px-4 py-3 text-sm font-medium text-white transition-colors hover:bg-emerald-700"
              >
                <MessageCircle className="h-4 w-4" />
                Contacter sur WhatsApp
              </a>
            )}

            {establishment?.contact_email && (
              <a
                href={`mailto:${establishment.contact_email}`}
                className="inline-flex items-center gap-3 rounded-xl border border-border bg-card px-4 py-3 text-sm font-medium text-foreground transition-colors hover:border-primary hover:text-primary"
              >
                <Mail className="h-4 w-4 text-primary" />
                {establishment.contact_email}
              </a>
            )}
          </div>
        )}

        <a
          href={mapsUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="mt-3 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
        >
          <Navigation className="h-4 w-4" />
          Ouvrir l&apos;itinéraire sur Google Maps
        </a>
      </div>
    </Modal>
  );
}
