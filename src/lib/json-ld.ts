import { SITE_URL } from "@/lib/metadata";
import type { Case, MarketplaceOffer, Phone } from "@/types/database";

export type JsonLd = Record<string, unknown>;

export function absoluteUrl(path: string): string {
  return new URL(path, SITE_URL).href;
}

type BreadcrumbLdItem = {
  label: string;
  href?: string;
};

/** BreadcrumbList（ホーム > 端末名 など） */
export function buildBreadcrumbListJsonLd(items: BreadcrumbLdItem[]): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => {
      const listItem: Record<string, unknown> = {
        "@type": "ListItem",
        position: index + 1,
        name: item.label,
      };
      if (item.href) {
        listItem.item = absoluteUrl(item.href);
      }
      return listItem;
    }),
  };
}

type OfferInput = {
  price: number;
  url: string;
};

function buildOffer(offer: OfferInput): JsonLd {
  return {
    "@type": "Offer",
    price: offer.price,
    priceCurrency: "JPY",
    url: offer.url,
  };
}

function normalizeProductKey(name: string): string {
  return name.trim().toLowerCase().replace(/\s+/g, " ");
}

function buildProductJsonLd(input: {
  name: string;
  brand: string | null;
  image?: string | null;
  offers: OfferInput[];
}): JsonLd | null {
  if (!input.name.trim() || input.offers.length === 0) {
    return null;
  }

  const offers = input.offers.map(buildOffer);
  const jsonLd: JsonLd = {
    "@type": "Product",
    name: input.name.trim(),
    offers: offers.length === 1 ? offers[0] : offers,
  };

  if (input.brand?.trim()) {
    jsonLd.brand = {
      "@type": "Brand",
      name: input.brand.trim(),
    };
  }

  if (input.image?.trim()) {
    jsonLd.image = input.image.trim();
  }

  return jsonLd;
}

/**
 * 端末詳細用 ItemList。
 * cases を Product 要素とし、同名・同ブランドの marketplace_offers
 * （楽天・Yahoo!）があれば同一 Product の offers 配列にマージする。
 * 紐づかない marketplace_offers は別 Product として追加する。
 */
export function buildPhoneCasesItemListJsonLd(
  phone: Pick<Phone, "id" | "name">,
  cases: Case[],
  marketplaceOffers: MarketplaceOffer[],
): JsonLd {
  const remainingOffers = new Map<string, MarketplaceOffer[]>();

  for (const offer of marketplaceOffers) {
    const key = normalizeProductKey(offer.name);
    const group = remainingOffers.get(key) ?? [];
    group.push(offer);
    remainingOffers.set(key, group);
  }

  const products: JsonLd[] = [];

  for (const caseItem of cases) {
    const key = normalizeProductKey(caseItem.name);
    const matched = remainingOffers.get(key) ?? [];
    remainingOffers.delete(key);

    const offers: OfferInput[] = [
      { price: caseItem.price, url: caseItem.url },
      ...matched.map((offer) => ({ price: offer.price, url: offer.url })),
    ];

    const product = buildProductJsonLd({
      name: caseItem.name,
      brand: caseItem.brand,
      image: caseItem.image_url ?? matched.find((o) => o.image_url)?.image_url,
      offers,
    });
    if (product) {
      products.push(product);
    }
  }

  for (const group of remainingOffers.values()) {
    const primary = group[0];
    const product = buildProductJsonLd({
      name: primary.name,
      brand: primary.brand,
      image: group.find((o) => o.image_url)?.image_url,
      offers: group.map((offer) => ({ price: offer.price, url: offer.url })),
    });
    if (product) {
      products.push(product);
    }
  }

  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: `${phone.name}対応ケース一覧`,
    url: absoluteUrl(`/phones/${phone.id}`),
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      "@type": "ListItem",
      position: index + 1,
      item: product,
    })),
  };
}

/** ホームページ用 ItemList（端末名と URL） */
export function buildPhonesItemListJsonLd(
  phones: Pick<Phone, "id" | "name">[],
): JsonLd {
  return {
    "@context": "https://schema.org",
    "@type": "ItemList",
    name: "スマホ端末一覧",
    url: absoluteUrl("/"),
    numberOfItems: phones.length,
    itemListElement: phones.map((phone, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: phone.name,
      url: absoluteUrl(`/phones/${phone.id}`),
    })),
  };
}
