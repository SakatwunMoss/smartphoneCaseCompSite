/**
 * 検索用正規化:
 * - NFKC（全角英数→半角など）
 * - ASCII 大小無視
 * - ひらがな→カタカナ（読みのゆれを吸収）
 */
export function normalizeSearchText(value: string): string {
  return value
    .normalize("NFKC")
    .toLocaleLowerCase("en-US")
    .replace(/[\u3041-\u3096]/g, (ch) =>
      String.fromCharCode(ch.charCodeAt(0) + 0x60),
    );
}
