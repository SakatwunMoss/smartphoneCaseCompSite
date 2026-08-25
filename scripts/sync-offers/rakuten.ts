/** 楽天市場商品検索APIからスマホケース商品を取得する */

const ENDPOINT =
  "https://openapi.rakuten.co.jp/ichibams/api/IchibaItem/Search/20260701";

/** スマホケースのジャンルID */
const GENRE_ID = "560271";

const DEFAULT_REFERER = "https://smartphone-case-comp-site.vercel.app/";

const EXCLUDE_KEYWORDS = ["本体", "SIMフリー", "白ロム", "ジャンク"] as const;

export interface MarketplaceOffer {
  source: "rakuten";
  item_code: string;
  name: string;
  brand: string | null;
  price: number;
  url: string;
  image_url: string | null;
  review_count: number | null;
  review_rate: number | null;
}

interface RakutenImageUrl {
  imageUrl?: string;
}

interface RakutenItem {
  itemCode?: string;
  itemName?: string;
  shopName?: string;
  itemPrice?: number;
  itemUrl?: string;
  affiliateUrl?: string;
  mediumImageUrls?: RakutenImageUrl[];
  reviewCount?: number;
  reviewAverage?: number;
}

interface RakutenItemWrapper {
  Item?: RakutenItem;
}

interface RakutenSearchResponse {
  Items?: RakutenItemWrapper[];
  error?: string;
  error_description?: string;
  errors?: { errorMessage?: string };
}

function isIrrelevantItem(itemName: string): boolean {
  return EXCLUDE_KEYWORDS.some((kw) => itemName.includes(kw));
}

/**
 * mediumImageUrls は通常 `_ex=128x128`。
 * サムネサーバはサイズ指定を差し替え可能なので、表示用に 300x300 へ上げる。
 */
function upgradeRakutenImageUrl(url: string): string {
  return url.replace(/_ex=\d+x\d+/i, "_ex=300x300");
}

function mapItem(item: RakutenItem): MarketplaceOffer | null {
  const url = item.affiliateUrl || item.itemUrl;
  if (
    !item.itemCode ||
    !item.itemName ||
    item.itemPrice == null ||
    !url
  ) {
    return null;
  }

  if (isIrrelevantItem(item.itemName)) {
    return null;
  }

  const rawImage = item.mediumImageUrls?.[0]?.imageUrl ?? null;

  return {
    source: "rakuten",
    item_code: item.itemCode,
    name: item.itemName,
    brand: item.shopName ?? null,
    price: item.itemPrice,
    url,
    image_url: rawImage ? upgradeRakutenImageUrl(rawImage) : null,
    review_count: item.reviewCount ?? null,
    review_rate: item.reviewAverage ?? null,
  };
}

function getCredentials() {
  const applicationId = process.env.RAKUTEN_APP_ID;
  if (!applicationId) {
    throw new Error(
      "RAKUTEN_APP_ID が設定されていません。.env.local を確認してください。",
    );
  }

  // 新エンドポイント（UUID形式のアプリID）では accessKey が必須
  const accessKey = process.env.RAKUTEN_ACCESS_KEY;
  if (!accessKey) {
    throw new Error(
      "RAKUTEN_ACCESS_KEY が設定されていません。.env.local を確認してください。",
    );
  }

  const affiliateId = process.env.RAKUTEN_AFFILIATE_ID;
  if (!affiliateId) {
    throw new Error(
      "RAKUTEN_AFFILIATE_ID が設定されていません。.env.local を確認してください。",
    );
  }

  const referer = (process.env.RAKUTEN_REFERER || DEFAULT_REFERER).replace(
    /\/?$/,
    "/",
  );
  const origin = referer.replace(/\/$/, "");

  return { applicationId, accessKey, affiliateId, referer, origin };
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => {
    setTimeout(resolve, ms);
  });
}

function parseRetryAfterSeconds(message: string): number {
  const match = message.match(/Try again in (\d+) seconds?/i);
  if (match) return Number(match[1]);
  return 1;
}

async function fetchPage(
  keyword: string,
  page: number,
  attempt = 1,
): Promise<MarketplaceOffer[]> {
  const { applicationId, accessKey, affiliateId, referer, origin } =
    getCredentials();

  const params = new URLSearchParams({
    applicationId,
    accessKey,
    affiliateId,
    keyword,
    genreId: GENRE_ID,
    hits: "30",
    page: String(page),
    format: "json",
  });

  const response = await fetch(`${ENDPOINT}?${params.toString()}`, {
    headers: {
      Referer: referer,
      Origin: origin,
      "User-Agent": "phone-case-compare/0.1",
    },
  });

  let data: RakutenSearchResponse & { statusCode?: number; message?: string };
  try {
    data = (await response.json()) as RakutenSearchResponse & {
      statusCode?: number;
      message?: string;
    };
  } catch {
    throw new Error(`楽天APIのJSONパースに失敗しました (HTTP ${response.status})`);
  }

  // レート制限: 指定秒数待ってリトライ（最大3回）
  if (response.status === 429 && attempt < 3) {
    const waitSec = parseRetryAfterSeconds(
      data.message || JSON.stringify(data),
    );
    await sleep((waitSec + 1) * 1000);
    return fetchPage(keyword, page, attempt + 1);
  }

  if (!response.ok || data.error || data.errors) {
    const desc =
      data.errors?.errorMessage ||
      data.error_description ||
      data.error ||
      data.message ||
      JSON.stringify(data);
    throw new Error(`楽天APIエラー (HTTP ${response.status}): ${desc}`);
  }

  const items = Array.isArray(data.Items) ? data.Items : [];
  const offers: MarketplaceOffer[] = [];

  for (const wrapper of items) {
    const item = wrapper.Item ?? (wrapper as unknown as RakutenItem);
    const offer = mapItem(item);
    if (offer) offers.push(offer);
  }

  return offers;
}

/**
 * キーワードで楽天市場を検索し、ケース商品を最大60件返す。
 */
export async function fetchRakutenOffers(
  keyword: string,
): Promise<MarketplaceOffer[]> {
  // ページ間に間隔を空けて 429 を回避
  const page1 = await fetchPage(keyword, 1);
  await sleep(1200);
  const page2 = await fetchPage(keyword, 2);

  // item_code で重複排除（ページまたぎで同じ商品が返ることがある）
  const seen = new Set<string>();
  const result: MarketplaceOffer[] = [];

  for (const offer of [...page1, ...page2]) {
    if (seen.has(offer.item_code)) continue;
    seen.add(offer.item_code);
    result.push(offer);
  }

  return result;
}
