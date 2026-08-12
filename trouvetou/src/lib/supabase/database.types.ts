// ============================================================================
// TROUVETOU — Types TypeScript de la base Supabase partagée (Séjoura)
// Tables cibles : rooms, establishments, subscriptions
// ============================================================================

export type SubscriptionStatus =
  | "trial"
  | "active"
  | "overdue"
  | "suspended"
  | "cancelled";

export type SubscriptionPlan = "standard" | "pro" | "enterprise";

export type EstablishmentType =
  | "hotel"
  | "residence"
  | "appartements"
  | "villa"
  | "guesthouse"
  | "other";

export interface Establishment {
  id: string;
  name: string;
  type: EstablishmentType | null;
  slug: string | null;
  description: string | null;
  city: string | null;
  country: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  cover_image: string | null;
  contact_phone: string | null;
  contact_email: string | null;
  whatsapp: string | null;
  website: string | null;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  establishment_id: string;
  plan: SubscriptionPlan;
  subscription_status: SubscriptionStatus;
  current_period_start: string | null;
  current_period_end: string | null;
  created_at: string;
  updated_at: string;
}

export interface Room {
  id: string;
  establishment_id: string;
  name: string;
  description: string | null;
  price_per_night: number;
  capacity: number;
  amenities: string[];
  images: string[];
  is_listed_on_trouvetou: boolean;
  created_at: string;
  updated_at: string;
}

export interface ListedRoom extends Room {
  establishment: Establishment & {
    subscription: Pick<Subscription, "subscription_status"> | null;
  };
}

export interface Database {
  public: {
    Tables: {
      rooms: {
        Row: Room;
        Insert: Omit<Room, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Room, "id" | "created_at" | "updated_at">>;
      };
      establishments: {
        Row: Establishment;
        Insert: Omit<Establishment, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Establishment, "id" | "created_at" | "updated_at">>;
      };
      subscriptions: {
        Row: Subscription;
        Insert: Omit<Subscription, "id" | "created_at" | "updated_at">;
        Update: Partial<Omit<Subscription, "id" | "created_at" | "updated_at">>;
      };
    };
  };
}
