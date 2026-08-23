export type Phone = {
  id: string;
  name: string;
  maker: string;
  released_year: number;
  image_url?: string | null;
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
    };
  };
};
