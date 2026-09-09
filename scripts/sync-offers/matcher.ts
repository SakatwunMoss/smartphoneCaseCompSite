/**
 * 機種名と商品名の一致判定。
 * 楽天・Yahoo の検索APIがキーワードを緩くマッチさせるため、
 * 取得後に機種名が商品名に含まれるかを確認する。
 */

/** 全角/半角スペースを除去し、小文字化する */
function normalize(text: string): string {
  return text.replace(/[\s\u3000]/g, "").toLowerCase();
}

/**
 * phoneName が itemName に（正規化後の部分一致で）含まれるか。
 * 例: "iPhone 18 Pro" → "iphone18pro" が商品名に含まれていれば true
 */
export function isMatchingPhoneModel(
  phoneName: string,
  itemName: string,
): boolean {
  const normalizedPhone = normalize(phoneName);
  if (!normalizedPhone) {
    return false;
  }
  return normalize(itemName).includes(normalizedPhone);
}
