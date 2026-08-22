export type Phone = {
  id: string;
  name: string;
  brand: string;
  releaseYear?: number;
};

export type Case = {
  id: string;
  name: string;
  phoneId: string;
  price: number;
  material?: string;
  shopUrl?: string;
};
