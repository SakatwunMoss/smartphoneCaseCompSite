export type Phone = {
  id: string;
  name: string;
  maker: string;
  released_year: number;
  image_url?: string | null;
  /** 機種ページ用解説文。### 見出しでセクション分割可能 */
  description?: string | null;
};

export type Case = {
  id: string;
  phone_id: string;
  name: string;
  brand: string;
  price: number;
  url: string;
  created_at: string;
  image_url?: string | null;
};

export type MarketplaceSource = "rakuten" | "yahoo";

export type MarketplaceOffer = {
  id: string;
  phone_id: string;
  source: MarketplaceSource;
  item_code: string;
  name: string;
  brand: string | null;
  price: number;
  url: string;
  image_url: string | null;
  review_count: number | null;
  review_rate: number | null;
  fetched_at: string;
};

export type Database = {
  public: {
    Tables: {
      phones: {
        Row: Phone;
        Insert: Omit<Phone, "id"> & { id?: string };
        Update: Partial<Omit<Phone, "id">>;
      };
      cases: {
        Row: Case;
        Insert: Omit<Case, "id" | "created_at"> & {
          id?: string;
          created_at?: string;
        };
        Update: Partial<Omit<Case, "id">>;
      };
      marketplace_offers: {
        Row: MarketplaceOffer;
        Insert: Omit<MarketplaceOffer, "id"> & { id?: string };
        Update: Partial<Omit<MarketplaceOffer, "id">>;
      };
    };
  };
};
