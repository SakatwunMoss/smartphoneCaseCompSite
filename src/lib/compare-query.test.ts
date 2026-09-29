/**
 * compare クエリヘルパーのユニットテスト。
 * 実行: npx tsx src/lib/compare-query.test.ts
 */

import assert from "node:assert/strict";

import {
  buildInitialCompareSelection,
  buildPhoneCompareHref,
  parseCompareQuery,
} from "@/lib/compare-query";
import { MAX_COMPARE_SELECTION } from "@/lib/comparable";
import type { Case, MarketplaceOffer } from "@/types/database";

{
  assert.deepEqual(parseCompareQuery(null), []);
  assert.deepEqual(parseCompareQuery(""), []);
  assert.deepEqual(parseCompareQuery("a,b,c"), ["a", "b", "c"]);
  assert.deepEqual(parseCompareQuery(" a,,b ,a,c,d "), ["a", "b", "c"]);
  assert.equal(parseCompareQuery("1,2,3,4").length, MAX_COMPARE_SELECTION);
}

{
  assert.equal(buildPhoneCompareHref("p1", ["a"]), "/phones/p1");
  assert.equal(
    buildPhoneCompareHref("p1", ["a", "b", "c", "d"]),
    "/phones/p1?compare=a,b,c",
  );
}

const otherCases: Case[] = [
  {
    id: "other-1",
    phone_id: "p1",
    name: "Other Case",
    brand: "B",
    price: 1000,
    url: "https://example.com/o",
    created_at: "2026-01-01T00:00:00Z",
  },
];

const rakutenOffers: MarketplaceOffer[] = [
  {
    id: "rakuten-1",
    phone_id: "p1",
    source: "rakuten",
    item_code: "r1",
    name: "Rakuten Case",
    brand: "R",
    price: 2000,
    url: "https://item.rakuten.co.jp/a/b/",
    image_url: null,
    review_count: null,
    review_rate: null,
    fetched_at: "2026-01-01T00:00:00Z",
  },
];

const yahooOffers: MarketplaceOffer[] = [
  {
    id: "yahoo-1",
    phone_id: "p1",
    source: "yahoo",
    item_code: "y1",
    name: "Yahoo Case",
    brand: "Y",
    price: 1500,
    url: "https://store.shopping.yahoo.co.jp/a/b.html",
    image_url: null,
    review_count: null,
    review_rate: null,
    fetched_at: "2026-01-01T00:00:00Z",
  },
];

{
  const { map, preferredSource } = buildInitialCompareSelection(
    ["missing", "yahoo-1", "rakuten-1", "other-1", "also-missing"],
    otherCases,
    rakutenOffers,
    yahooOffers,
  );
  assert.equal(map.size, 3);
  assert.equal(preferredSource, "yahoo");
  assert.ok(map.has("yahoo:yahoo-1"));
  assert.ok(map.has("rakuten:rakuten-1"));
  assert.ok(map.has("other:other-1"));
}

{
  const { map } = buildInitialCompareSelection(
    ["nope", "also-nope"],
    otherCases,
    rakutenOffers,
    yahooOffers,
  );
  assert.equal(map.size, 0);
}

console.log("compare-query.test.ts: all assertions passed");
