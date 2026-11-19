/**
 * 機種名と商品名の一致判定。
 * 楽天・Yahoo の検索APIがキーワードを緩くマッチさせるため、
 * 取得後に「派生モデルではない形で機種名が含まれるか」を確認する。
 */

/** 空白除去＋小文字化（追加除外語の照合やレビュー用） */
export function normalizePhoneText(text: string): string {
  return text.replace(/[\s\u3000]/g, "").toLowerCase();
}

/** 単語として完全一致したときだけ派生とみなす接尾辞 */
const WORD_DERIVATIVE_SUFFIXES = [
  "promax",
  "pro",
  "max",
  "plus",
  "air",
  "mini",
  "ultra",
  "fold",
  "flip",
  "xl",
  "fe",
] as const;

/** 数字に付く1文字接尾辞（直結・空白区切りの両方: 17e / 17 e / 10a / 10 a） */
const SINGLE_CHAR_VARIANTS = ["e", "a"] as const;

const VARIANT_WORD_SET = new Set<string>([
  ...WORD_DERIVATIVE_SUFFIXES,
  ...SINGLE_CHAR_VARIANTS,
]);

/** 裸の世代番号の前後に許す区切り */
const GEN_DELIMITER_CLASS = "[\\s\\u3000/／・、|｜]";

/**
 * メインの派生判定で防げない例外用の追加除外語。
 * ※ Galaxy Z Fold8 の Ultra 型番（SC-56G / SCG39）は兼用判定が必要なため
 *   hasFold8UltraModelOnlyExclude() で別処理する。
 */
export const ADDITIONAL_EXCLUDE_KEYWORDS: Record<string, string[]> = {
  "Galaxy Z Fold8": ["Flip"],
  "Galaxy Z Flip8": ["Fold"],
};

/** Fold8 Ultra 専用型番（Fold8 ページから除外。兼用は残す） */
const FOLD8_ULTRA_MODEL_CODES = ["sc-56g", "scg39"] as const;
/** Fold8 本体の型番（これがあれば Ultra 型番が併記されていても残す） */
const FOLD8_MODEL_CODES = ["sc-57g", "scg41"] as const;

/** 保護フィルム単体とみなす語（いずれか） */
const FILM_ONLY_MARKERS = ["フィルム", "ガラス", "保護シート"] as const;
/** ケース類とみなす語（いずれかがあればフィルム単体ではない） */
const CASE_MARKERS = ["ケース", "カバー"] as const;

export type PhoneNameParts = {
  /** 例: ["iPhone"] / ["Google", "Pixel"] / ["Galaxy"] / ["Galaxy", "Z"] */
  seriesTokens: string[];
  /** 例: "17" / "10" / "S26" / "Fold8" / "17e" */
  generation: string;
  /** 例: ["Pro"] / ["Pro", "Max"] / ["Pro", "Fold"] / [] */
  variantTokens: string[];
};

function escapeRegExp(text: string): string {
  return text.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

/** トークンが 17e / 10a 形式なら数字と文字の間に空白を許す */
function tokenToPattern(token: string): string {
  const attached = token.match(/^(\d+)([ea])$/i);
  if (attached) {
    return `${escapeRegExp(attached[1])}[\\s\\u3000]*${escapeRegExp(attached[2])}`;
  }
  return escapeRegExp(token);
}

/**
 * 機種名をシリーズ / 世代 / 派生トークンに分解する。
 */
export function parsePhoneNameParts(phoneName: string): PhoneNameParts | null {
  const tokens = phoneName
    .trim()
    .split(/[\s\u3000]+/)
    .filter(Boolean);
  if (tokens.length === 0) {
    return null;
  }

  const variantTokens: string[] = [];
  let end = tokens.length - 1;
  while (end >= 1 && VARIANT_WORD_SET.has(tokens[end].toLowerCase())) {
    variantTokens.unshift(tokens[end]);
    end -= 1;
  }

  const generation = tokens[end];
  if (!generation || !/\d/.test(generation)) {
    // Duo など世代番号なし
    return {
      seriesTokens: tokens.slice(0, end + 1),
      generation: "",
      variantTokens,
    };
  }

  return {
    seriesTokens: tokens.slice(0, end),
    generation,
    variantTokens,
  };
}

/**
 * 機種名のトークン間空白を省略可能にした検索用 RegExp。
 * 17e は「17 e」も許容。
 */
function buildPhoneNameRegExp(phoneName: string): RegExp | null {
  const tokens = phoneName
    .trim()
    .split(/[\s\u3000]+/)
    .filter(Boolean);
  if (tokens.length === 0) {
    return null;
  }
  const body = tokens.map((token) => tokenToPattern(token)).join("[\\s\\u3000]*");
  return new RegExp(body, "gi");
}

function wordDerivativesForPhone(normalizedPhone: string): string[] {
  let suffixes: string[] = [...WORD_DERIVATIVE_SUFFIXES];

  const skipIfPresent: { ending: string; skip: string[] }[] = [
    { ending: "promax", skip: ["promax", "pro", "max"] },
    { ending: "pro", skip: ["promax", "pro"] },
    { ending: "air", skip: ["air", "pro", "promax", "max", "plus"] },
    { ending: "ultra", skip: ["ultra"] },
    { ending: "mini", skip: ["mini"] },
    { ending: "fold", skip: ["fold"] },
    { ending: "flip", skip: ["flip"] },
    { ending: "xl", skip: ["xl"] },
    { ending: "fe", skip: ["fe"] },
    { ending: "plus", skip: ["plus"] },
    { ending: "duo", skip: ["fold", "flip"] },
  ];

  for (const rule of skipIfPresent) {
    if (normalizedPhone.endsWith(rule.ending)) {
      const skip = new Set(rule.skip);
      suffixes = suffixes.filter((s) => !skip.has(s));
      break;
    }
  }

  return suffixes;
}

function isAsciiAlphaNum(char: string | undefined): boolean {
  if (!char) {
    return false;
  }
  return /[a-z0-9]/i.test(char);
}

function isWordEndBoundary(afterToken: string): boolean {
  if (afterToken.length === 0) {
    return true;
  }
  return !isAsciiAlphaNum(afterToken[0]);
}

/**
 * マッチ直後が派生モデルか。
 * - e/a: 直結（17e）または空白区切りの単独1文字（17 e）
 * - pro 等: 単語として完全一致のみ（Protective / AirTag / minimal は不可）
 */
function isFollowedByDerivative(
  rawAfter: string,
  normalizedPhone: string,
): boolean {
  if (!rawAfter) {
    return false;
  }

  if (rawAfter.startsWith("+") || rawAfter.startsWith("＋")) {
    return true;
  }

  // 直結の e / a（空白なし）
  if (!/^[\s\u3000]/.test(rawAfter)) {
    const attached = rawAfter[0]?.toLowerCase();
    if (
      attached &&
      (SINGLE_CHAR_VARIANTS as readonly string[]).includes(attached) &&
      !normalizedPhone.endsWith(attached)
    ) {
      if (isWordEndBoundary(rawAfter.slice(1))) {
        return true;
      }
    }
  }

  const trimmed = rawAfter.replace(/^[\s\u3000]+/, "");
  if (!trimmed) {
    return false;
  }

  if (trimmed.startsWith("+") || trimmed.startsWith("＋")) {
    return true;
  }

  const wordMatch = trimmed.match(/^[a-zA-Z]+/);
  if (!wordMatch) {
    return false;
  }

  const word = wordMatch[0].toLowerCase();
  const afterWord = trimmed.slice(wordMatch[0].length);
  if (!isWordEndBoundary(afterWord)) {
    return false;
  }

  // 空白区切りの単独 e / a（「17 e」「10 a」）
  if (
    (SINGLE_CHAR_VARIANTS as readonly string[]).includes(word) &&
    !normalizedPhone.endsWith(word)
  ) {
    return true;
  }

  return wordDerivativesForPhone(normalizedPhone).includes(word);
}

function hasAdditionalExclude(phoneName: string, itemName: string): boolean {
  const excludes = ADDITIONAL_EXCLUDE_KEYWORDS[phoneName];
  if (!excludes?.length) {
    return false;
  }
  const normalizedItem = normalizePhoneText(itemName);
  return excludes.some((kw) =>
    normalizedItem.includes(normalizePhoneText(kw)),
  );
}

/**
 * 保護フィルム・ガラスフィルム単体か。
 * 「フィルム」「ガラス」「保護シート」を含み、かつ「ケース」「カバー」を含まない。
 * （フィルム付きケース等のセットは残す）
 */
export function isFilmOnlyOffer(itemName: string): boolean {
  const hasFilmMarker = FILM_ONLY_MARKERS.some((m) => itemName.includes(m));
  if (!hasFilmMarker) {
    return false;
  }
  return !CASE_MARKERS.some((m) => itemName.includes(m));
}

/**
 * Fold8 向け: Ultra 型番だけが付き、Fold8 単体・Fold8 型番の根拠がない商品を除外する。
 * 「Fold8 / Fold8 Ultra 兼用」（Fold8 表記や SC-57G / SCG41 あり）は残す。
 */
function hasFold8UltraModelOnlyExclude(
  phoneName: string,
  itemName: string,
): boolean {
  if (phoneName !== "Galaxy Z Fold8") {
    return false;
  }
  const normalizedItem = normalizePhoneText(itemName);
  const hasUltraCode = FOLD8_ULTRA_MODEL_CODES.some((code) =>
    normalizedItem.includes(code),
  );
  if (!hasUltraCode) {
    return false;
  }
  if (FOLD8_MODEL_CODES.some((code) => normalizedItem.includes(code))) {
    return false;
  }
  // Fold8 単体表記があれば兼用扱い（Ultra 派生のみの出現は core が false）
  if (isMatchingPhoneModelCore(phoneName, itemName)) {
    return false;
  }
  return true;
}

function seriesAppearsBefore(
  itemName: string,
  seriesTokens: string[],
  beforeIndex: number,
): boolean {
  if (seriesTokens.length === 0) {
    return false;
  }
  // 末尾のシリーズ語（iPhone / Pixel / Galaxy 等）が、裸番号より前にあればよい
  const anchor = seriesTokens[seriesTokens.length - 1];
  const pattern = new RegExp(escapeRegExp(anchor), "gi");
  let match: RegExpExecArray | null;
  while ((match = pattern.exec(itemName)) !== null) {
    if (match.index + match[0].length <= beforeIndex) {
      return true;
    }
  }
  return false;
}

/**
 * シリーズ名が先行する「裸の世代番号」が、派生なしで出現するか。
 * ベース機種（variant なし）のときだけ使う。
 * 例: 「iPhone 17e 17 兼用」「iPhone 16/17 対応」（「/17 Pro」は派生で不一致）
 */
function hasBareGenerationStandalone(
  parts: PhoneNameParts,
  itemName: string,
  normalizedPhone: string,
): boolean {
  if (!parts.generation || parts.variantTokens.length > 0) {
    return false;
  }
  if (parts.seriesTokens.length === 0) {
    return false;
  }

  const genPattern = tokenToPattern(parts.generation);
  const pattern = new RegExp(
    `(?:^|${GEN_DELIMITER_CLASS})(${genPattern})(?=${GEN_DELIMITER_CLASS}|$)`,
    "gi",
  );

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(itemName)) !== null) {
    const genStart = match.index + (match[0].length - match[1].length);
    const genEnd = genStart + match[1].length;

    if (!seriesAppearsBefore(itemName, parts.seriesTokens, genStart)) {
      continue;
    }

    // 「/17 Pro」→ 区切りのあと Pro が続けば派生
    const afterDelims = itemName
      .slice(genEnd)
      .replace(new RegExp(`^${GEN_DELIMITER_CLASS}+`), "");
    if (isFollowedByDerivative(afterDelims, normalizedPhone)) {
      continue;
    }
    return true;
  }

  return false;
}

/**
 * フル機種名の出現（空白ゆれ・17e の空白ゆれあり）で単体一致するか。
 */
function hasFullNameStandalone(
  phoneName: string,
  itemName: string,
  normalizedPhone: string,
): boolean {
  const pattern = buildPhoneNameRegExp(phoneName);
  if (!pattern) {
    return false;
  }

  let match: RegExpExecArray | null;
  while ((match = pattern.exec(itemName)) !== null) {
    const rawAfter = itemName.slice(match.index + match[0].length);
    if (!isFollowedByDerivative(rawAfter, normalizedPhone)) {
      return true;
    }
    if (match[0].length === 0) {
      pattern.lastIndex += 1;
    }
  }
  return false;
}

/**
 * 追加除外語を無視したコア判定。
 */
export function isMatchingPhoneModelCore(
  phoneName: string,
  itemName: string,
): boolean {
  const normalizedPhone = normalizePhoneText(phoneName);
  if (!normalizedPhone) {
    return false;
  }

  if (hasFullNameStandalone(phoneName, itemName, normalizedPhone)) {
    return true;
  }

  const parts = parsePhoneNameParts(phoneName);
  if (!parts) {
    return false;
  }

  return hasBareGenerationStandalone(parts, itemName, normalizedPhone);
}

/**
 * phoneName が itemName に、派生モデルではない形で含まれるか。
 * 楽天・Yahoo 共通。フィルム単体は機種一致しても除外する。
 */
export function isMatchingPhoneModel(
  phoneName: string,
  itemName: string,
): boolean {
  if (isFilmOnlyOffer(itemName)) {
    return false;
  }
  if (hasAdditionalExclude(phoneName, itemName)) {
    return false;
  }
  if (hasFold8UltraModelOnlyExclude(phoneName, itemName)) {
    return false;
  }
  return isMatchingPhoneModelCore(phoneName, itemName);
}

function nextDerivativeToken(raw: string): string {
  const trimmed = raw.trim();
  if (trimmed.startsWith("+") || trimmed.startsWith("＋")) {
    return "+";
  }
  return trimmed.match(/^[a-zA-Z]+/)?.[0]?.toLowerCase() ?? "";
}

const ALL_DERIVATIVE_TOKENS = new Set<string>([
  ...WORD_DERIVATIVE_SUFFIXES,
  ...SINGLE_CHAR_VARIANTS,
  "+",
]);

/**
 * 削除レビュー用: 機種名・世代番号が「単体」で現れていそうか。
 * - コア一致（追加除外無視）
 * - シリーズ先行のうえで、ベース機種なら世代トークン単体、
 *   派生機種なら世代＋派生トークン列が、その後さらに派生語で続いていない
 */
export function looksLikeStandalonePhoneMention(
  phoneName: string,
  itemName: string,
): boolean {
  // フィルム単体は意図的除外のため、誤削除候補にしない
  if (isFilmOnlyOffer(itemName)) {
    return false;
  }
  if (isMatchingPhoneModelCore(phoneName, itemName)) {
    return true;
  }

  const parts = parsePhoneNameParts(phoneName);
  if (!parts?.generation || parts.seriesTokens.length === 0) {
    return false;
  }

  const seriesAnchor = parts.seriesTokens[parts.seriesTokens.length - 1];
  if (!new RegExp(escapeRegExp(seriesAnchor), "i").test(itemName)) {
    return false;
  }

  const normalizedGen = normalizePhoneText(parts.generation);
  const roughTokens = itemName.split(new RegExp(`${GEN_DELIMITER_CLASS}+`));

  for (let i = 0; i < roughTokens.length; i++) {
    const normalizedToken = normalizePhoneText(roughTokens[i] ?? "");
    if (!normalizedToken || normalizedToken !== normalizedGen) {
      continue;
    }

    if (parts.variantTokens.length === 0) {
      const next = nextDerivativeToken(roughTokens[i + 1] ?? "");
      if (next && ALL_DERIVATIVE_TOKENS.has(next)) {
        continue;
      }
      return true;
    }

    let variantsMatch = true;
    for (let v = 0; v < parts.variantTokens.length; v++) {
      const actual = normalizePhoneText(roughTokens[i + 1 + v] ?? "");
      if (actual !== parts.variantTokens[v].toLowerCase()) {
        variantsMatch = false;
        break;
      }
    }
    if (!variantsMatch) {
      continue;
    }

    const afterVariant = nextDerivativeToken(
      roughTokens[i + 1 + parts.variantTokens.length] ?? "",
    );
    if (afterVariant && ALL_DERIVATIVE_TOKENS.has(afterVariant)) {
      continue;
    }
    return true;
  }

  return false;
}
