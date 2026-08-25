/** Yahoo!ショッピング商品検索API v3 からスマホケース商品を取得する */

const ENDPOINT =
  "https://shopping.yahooapis.jp/ShoppingWebService/V3/itemSearch";

/** iPhone用ケースのジャンルID */
const IPHONE_CASE_GENRE_ID = "49333";

const EXCLUDE_KEYWORDS = ["本体", "SIMフリー", "白ロム"] as const;

export interface MarketplaceOffer {
  source: "yahoo";
  item_code: string;
  name: string;
  brand: string | null;
  price: number;
  url: string;
  image_url: string | null;
  review_count: number | null;
  review_rate: number | null;
}

interface YahooBrand {
  name?: string;
}

interface YahooSeller {
  name?: string;
}

interface YahooImage {
  medium?: string;
}

interface YahooReview {
  count?: number;
  rate?: number;
}

interface YahooHit {
  code?: string;
  name?: string;
  brand?: YahooBrand;
  seller?: YahooSeller;
  price?: number;
  url?: string;
  image?: YahooImage;
  review?: YahooReview;
}

interface YahooSearchResponse {
  hits?: YahooHit[];
  Error?: { Message?: string };
  error?: { message?: string };
  Message?: string;
  "Error/Message"?: string;
}

function isIrrelevantItem(itemName: string): boolean {
  return EXCLUDE_KEYWORDS.some((kw) => itemName.includes(kw));
}

function isIPhoneKeyword(keyword: string): boolean {
  return /iphone/i.test(keyword);
}

function mapHit(hit: YahooHit): MarketplaceOffer | null {
  if (!hit.code || !hit.name || hit.price == null || !hit.url) {
    return null;
  }

  if (isIrrelevantItem(hit.name)) {
    return null;
  }

  return {
    source: "yahoo",
    item_code: hit.code,
    name: hit.name,
    brand: hit.brand?.name ?? hit.seller?.name ?? null,
    price: hit.price,
    url: hit.url,
    image_url: hit.image?.medium ?? null,
    review_count: hit.review?.count ?? null,
    review_rate: hit.review?.rate ?? null,
  };
}

function getClientId(): string {
  const clientId = process.env.YAHOO_CLIENT_ID;
  if (!clientId) {
    throw new Error(
      "YAHOO_CLIENT_ID が設定されていません。.env.local を確認してください。",
    );
  }
  return clientId;
}

async function fetchPage(
  keyword: string,
  start: number,
): Promise<MarketplaceOffer[]> {
  const clientId = getClientId();

  const params = new URLSearchParams({
    appid: clientId,
    query: keyword,
    results: "30",
    start: String(start),
  });

  // iPhone機種のみジャンルで絞り込み（Androidはkeywordのみ）
  if (isIPhoneKeyword(keyword)) {
    params.set("genre_category_id", IPHONE_CASE_GENRE_ID);
  }

  // appid はクエリのみ。User-Agent に AppID を重ねると
  // 「Authentication parameters ... conflicted」(401) になる
  const response = await fetch(`${ENDPOINT}?${params.toString()}`);

  let data: YahooSearchResponse;
  try {
    data = (await response.json()) as YahooSearchResponse;
  } catch {
    throw new Error(
      `Yahoo APIのJSONパースに失敗しました (HTTP ${response.status})`,
    );
  }

  if (
    !response.ok ||
    data.Error ||
    data.error ||
    data["Error/Message"] ||
    (typeof data.Message === "string" && !data.hits)
  ) {
    const desc =
      data.Error?.Message ||
      data.error?.message ||
      data["Error/Message"] ||
      data.Message ||
      JSON.stringify(data);

    if (response.status === 403 || response.status === 401) {
      throw new Error(
        `Yahoo APIエラー (HTTP ${response.status}): ${desc}\n` +
          `  → YAHOO_CLIENT_ID に「アプリケーションID」（多くは dj0y 始まり）だけを設定してください。\n` +
          `  → シークレットや access_token を混ぜないこと。確認: npm run test:yahoo`,
      );
    }

    throw new Error(`Yahoo APIエラー (HTTP ${response.status}): ${desc}`);
  }

  const hits = Array.isArray(data.hits) ? data.hits : [];
  const offers: MarketplaceOffer[] = [];

  for (const hit of hits) {
    const offer = mapHit(hit);
    if (offer) offers.push(offer);
  }

  return offers;
}

/**
 * キーワードでYahoo!ショッピングを検索し、ケース商品を最大60件返す。
 * iPhone系キーワードの場合は genre_category_id=49333 で絞り込む。
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

export async function fetchYahooOffers(
  keyword: string,
): Promise<MarketplaceOffer[]> {
  // 1クエリ/秒の制限を意識してページは直列＋間隔
  const page1 = await fetchPage(keyword, 1);
  await sleep(1100);
  const page2 = await fetchPage(keyword, 31);

  const seen = new Set<string>();
  const result: MarketplaceOffer[] = [];

  for (const offer of [...page1, ...page2]) {
    if (seen.has(offer.item_code)) continue;
    seen.add(offer.item_code);
    result.push(offer);
  }

  return result;
}
