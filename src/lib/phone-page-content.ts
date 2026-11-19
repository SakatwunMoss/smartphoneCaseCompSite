/**
 * 機種ページ向けの追記コンテンツ（catalog.json とは独立）。
 * catalog の日次 export で消えないよう、ここか SQL description を更新する。
 */

export type PhoneFaq = {
  question: string;
  answer: string;
};

export type PhoneDescriptionSectionDraft = {
  heading: string;
  /** 【要確認】を含む仮文可。ユーザーが本文化する */
  body: string;
};

export type PhonePageContent = {
  seoTitle?: string;
  seoDescription?: string;
  /**
   * catalog の description に追記する ### セクション。
   * 「この機種の特徴」「ケース選びのポイント」以外の拡張用。
   */
  extraDescriptionSections?: PhoneDescriptionSectionDraft[];
  faqs?: PhoneFaq[];
  relatedColumnSlugs?: string[];
};

export const IPHONE_DUO_ID = "9533d6c0-2284-4b2b-a223-504a901460b5";

/** Apple公式・iPhone Duo 技術仕様 */
const DUO_SPEC_SOURCE =
  "Apple公式「iPhone Duo の技術仕様」（https://support.apple.com/ja-jp/148588）";

const PHONE_PAGE_CONTENT: Record<string, PhonePageContent> = {
  [IPHONE_DUO_ID]: {
    seoTitle:
      "iPhone Duo対応ケース｜Apple Pencil併用・他機種との互換性も解説",
    seoDescription:
      "iPhone Duo向けケースを楽天・Yahoo!で比較。Apple Pencil（USB-C）対応時の注意点や、iPhone 17など他機種ケースが使えない理由（寸法差）も整理します。",
    extraDescriptionSections: [
      {
        heading: "Apple Pencilと併用する場合の注意点",
        body: `iPhone Duoで使えるApple Pencilは Apple Pencil (USB-C) のみです。Apple Pencil Pro・第1世代・第2世代は非対応です。対応は iOS 27.2 以降で、内側・外側の両方の画面で利用できます。筆圧感知・ダブルタップ・スクイーズは、USB-Cモデルの仕様として非対応です（出典: ${DUO_SPEC_SOURCE}。公式ページの注記が古い場合があるため、Pencil対応は「iOS 27.2以降」として扱います）。ケースを選ぶときは、画面の縁が高すぎてペン先が届きにくくないかを確認してください。Pencilを本体側面に磁石で装着できるか、またその装着にケースが干渉するか、ホバー対応の有無についてはメーカーの対応表記を確認してください。`,
      },
      {
        heading: "他機種のケースとの互換性",
        body: `結論として、iPhone 17用ケースをはじめ、Duo以外のすべてのiPhone用ケースはiPhone Duoに使えません。${DUO_SPEC_SOURCE}によると、Duoは閉じた状態で幅84.1×高さ117.8×厚さ11.3mm、開いた状態で幅164.6×高さ117.8×厚さ5.2mm（重量254g）です。一方、Apple公式の技術仕様におけるiPhone 17は幅71.5×高さ149.6×厚さ7.95mmです。閉じた状態のDuoと比べても、高さは約32mm低く（117.8 vs 149.6）、幅は約13mm広く（84.1 vs 71.5）、厚さは約1.4倍（11.3 vs 7.95）と形状がまったく異なります。折りたたみ構造用の専用ケースを選んでください。各社ケースのヒンジ保護の具体的な方式や、カメラ穴の形状適合についてはメーカーの対応表記を確認してください。`,
      },
    ],
    faqs: [
      {
        question: "iPhone 17のケースはiPhone Duoに使えますか？",
        answer: `使えません。Duo以外のすべてのiPhone用ケースも非対応です。Apple公式の寸法では、Duo（閉じた状態）は幅84.1×高さ117.8×厚さ11.3mm、iPhone 17は幅71.5×高さ149.6×厚さ7.95mmです。閉じたDuoは17より高さ約32mm低く、幅約13mm広く、厚さ約1.4倍で形状が異なります（出典: ${DUO_SPEC_SOURCE}、およびApple公式のiPhone 17技術仕様）。`,
      },
      {
        question: "iPhone DuoでApple Pencilは使えますか？ケース選択で注意点は？",
        answer: `使えますが、対応は Apple Pencil (USB-C) のみです（Pro・第1世代・第2世代は非対応）。iOS 27.2以降で内側・外側の両方の画面で利用でき、筆圧感知・ダブルタップ・スクイーズは非対応です（出典: ${DUO_SPEC_SOURCE}。公式注記が古い場合があるため対応OSはiOS 27.2以降とします）。ケースは画面の縁が高すぎないかを確認してください。側面への磁石装着やホバー対応の有無・ケース干渉は、メーカーの対応表記を確認してください。`,
      },
      {
        question: "iPhone Duo用ケースを選ぶときのポイントは？",
        answer: `次を基準に選ぶと失敗しにくいです。(1) iPhone Duo専用品であること（他機種用は寸法が合わない）。(2) 閉じた状態・開いた状態の両方で画面とヒンジを守れるか。(3) MagSafe / Qi2（最大25Wワイヤレス充電）に対応しているか（出典: ${DUO_SPEC_SOURCE}）。(4) Apple Pencil (USB-C) を併用するなら画面の縁が高すぎないか。(5) サイドボタン（Touch ID内蔵）を指で押しやすいか。純正には表裏を包む2ピースの「iPhone Duo Case」（磁石装着）や「Folio with Kickstand」があります。各社のヒンジ保護方式の詳細はメーカー表記を確認してください。`,
      },
    ],
    relatedColumnSlugs: [
      "iphone-duo-case-compatibility",
      "iphone-duo-apple-pencil-case",
    ],
  },
};

export function getPhonePageContent(
  phoneId: string,
): PhonePageContent | undefined {
  return PHONE_PAGE_CONTENT[phoneId];
}

/** catalog description に extra セクションを ### 形式で連結 */
export function mergePhoneDescription(
  baseDescription: string | null | undefined,
  extraSections: PhoneDescriptionSectionDraft[] | undefined,
): string | null {
  const base = baseDescription?.trim() ?? "";
  if (!extraSections?.length) {
    return base || null;
  }

  const extra = extraSections
    .map((section) => `### ${section.heading}\n${section.body.trim()}`)
    .join("\n\n");

  if (!base) {
    return extra;
  }
  return `${base}\n\n${extra}`;
}

/** 【要確認】を含まない FAQ のみ JSON-LD 用に返す */
export function getPublishableFaqs(
  faqs: PhoneFaq[] | undefined,
): PhoneFaq[] {
  if (!faqs?.length) {
    return [];
  }
  return faqs.filter((faq) => !faq.answer.includes("【要確認】"));
}
