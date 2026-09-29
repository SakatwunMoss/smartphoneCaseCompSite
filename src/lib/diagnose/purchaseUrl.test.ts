/**
 * 診断 purchaseUrl の確認。
 * 実行: npx tsx src/lib/diagnose/purchaseUrl.test.ts
 */

import assert from "node:assert/strict";

import {
  buildDiagnoseCases,
  classifyPurchaseUrl,
  preferPurchaseUrl,
  resolvePreferredPurchaseUrl,
} from "@/lib/diagnose/purchaseUrl";
import type { CatalogPhone } from "@/lib/catalog";
import type { Case, MarketplaceOffer } from "@/types/database";

{
  assert.equal(
    classifyPurchaseUrl("https://item.rakuten.co.jp/shop/item/"),
    "rakuten",
  );
  assert.equal(
    classifyPurchaseUrl("https://hb.afl.rakuten.co.jp/hgc/xxx/?pc=https%3A%2F%2Fitem.rakuten.co.jp%2Fa%2Fb%2F"),
    "rakuten",
  );
  assert.equal(
    classifyPurchaseUrl("https://store.shopping.yahoo.co.jp/shop/item.html"),
    "yahoo",
  );
  assert.equal(
    classifyPurchaseUrl(
      "https://ck.jp.ap.valuecommerce.com/servlet/referral?sid=1&pid=2&vc_url=https%3A%2F%2Fstore.shopping.yahoo.co.jp%2Fa%2Fb.html",
    ),
    "yahoo",
  );
  assert.equal(
    classifyPurchaseUrl("https://www.amazon.co.jp/dp/B0XXX"),
    "other",
  );
}

{
  const preferred = preferPurchaseUrl("https://www.amazon.co.jp/dp/1", [
    { source: "yahoo", url: "https://store.shopping.yahoo.co.jp/a/b.html" },
    { source: "rakuten", url: "https://item.rakuten.co.jp/a/b/" },
  ]);
  assert.equal(preferred, "https://item.rakuten.co.jp/a/b/");
}

{
  const caseItem: Case = {
    id: "c1",
    phone_id: "p1",
    name: "Same Case Name",
    brand: "Brand",
    price: 2000,
    url: "https://www.amazon.co.jp/dp/1",
    created_at: "2026-01-01T00:00:00Z",
    image_url: null,
  };
  const offers: MarketplaceOffer[] = [
    {
      id: "y1",
      phone_id: "p1",
      source: "yahoo",
      item_code: "y",
      name: "Same Case Name",
      brand: "Brand",
      price: 1800,
      url: "https://store.shopping.yahoo.co.jp/a/b.html",
      image_url: null,
      review_count: null,
      review_rate: null,
      fetched_at: "2026-01-01T00:00:00Z",
    },
    {
      id: "r1",
      phone_id: "p1",
      source: "rakuten",
      item_code: "r",
      name: "Same Case Name",
      brand: "Brand",
      price: 1900,
      url: "https://item.rakuten.co.jp/a/b/",
      image_url: null,
      review_count: null,
      review_rate: null,
      fetched_at: "2026-01-01T00:00:00Z",
    },
  ];
  assert.equal(
    resolvePreferredPurchaseUrl(caseItem, offers),
    "https://item.rakuten.co.jp/a/b/",
  );
}

{
  const phone: CatalogPhone = {
    id: "p1",
    name: "Phone",
    maker: "Maker",
    released_year: 2026,
    cases: [
      {
        id: "c-amazon",
        phone_id: "p1",
        name: "Only Amazon Case",
        brand: "X",
        price: 1000,
        url: "https://www.amazon.co.jp/dp/1",
        created_at: "2026-01-01T00:00:00Z",
      },
    ],
    marketplace_offers: [
      {
        id: "o-yahoo",
        phone_id: "p1",
        source: "yahoo",
        item_code: "y",
        name: "Yahoo Case",
        brand: "Y",
        price: 1200,
        url: "https://store.shopping.yahoo.co.jp/a/b.html",
        image_url: null,
        review_count: null,
        review_rate: null,
        fetched_at: "2026-01-01T00:00:00Z",
      },
      {
        id: "o-rakuten",
        phone_id: "p1",
        source: "rakuten",
        item_code: "r",
        name: "Yahoo Case",
        brand: "Y",
        price: 1100,
        url: "https://item.rakuten.co.jp/a/b/",
        image_url: null,
        review_count: null,
        review_rate: null,
        fetched_at: "2026-01-01T00:00:00Z",
      },
    ],
  };

  const built = buildDiagnoseCases([phone]);
  assert.equal(built.length, 1);
  assert.equal(built[0].url, "https://item.rakuten.co.jp/a/b/");
  assert.equal(classifyPurchaseUrl(built[0].url), "rakuten");
  // Amazon-only curated は、楽天/Yahoo オファーがある端末では除外
  assert.ok(!built.some((item) => item.id === "c-amazon"));
}

{
  const phoneNoOffers: CatalogPhone = {
    id: "p2",
    name: "Phone2",
    maker: "Maker",
    released_year: 2026,
    cases: [
      {
        id: "c1",
        phone_id: "p2",
        name: "Fallback",
        brand: "X",
        price: 1000,
        url: "https://www.amazon.co.jp/dp/1",
        created_at: "2026-01-01T00:00:00Z",
      },
    ],
    marketplace_offers: [],
  };
  const built = buildDiagnoseCases([phoneNoOffers]);
  assert.equal(built.length, 1);
  assert.equal(built[0].id, "c1");
}

console.log("purchaseUrl.test.ts: all assertions passed");
