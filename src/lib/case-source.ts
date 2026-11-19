/** 機種ページの販売元タブ ID */
export type CaseSource = "other" | "rakuten" | "yahoo";

/**
 * ?source= クエリをタブ ID に正規化する。
 * 旧ブックマーク ?source=yodobashi は other として扱う。
 * 未指定時は楽天市場。
 */
export function parseCaseSource(value: string | null | undefined): CaseSource {
  if (value === "rakuten" || value === "yahoo" || value === "other") {
    return value;
  }
  if (value === "yodobashi") {
    return "other";
  }
  return "rakuten";
}
