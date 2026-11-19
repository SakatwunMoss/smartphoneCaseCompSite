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
export const GALAXY_Z_FOLD8_ULTRA_ID =
  "733aed4f-1681-42b4-b5d5-97ded4647fed";
export const GALAXY_Z_FOLD8_ID = "f8b89b53-bda0-4900-aa4f-cc6374aa9bea";
export const GALAXY_Z_FLIP8_ID = "0d6cac04-0a65-4691-89f7-4362f0a44968";
export const PIXEL_11_PRO_FOLD_ID = "dc2f1d0b-796b-4c1f-b88b-3fa4299a9ae5";

/** Apple公式・iPhone Duo 技術仕様 */
const DUO_SPEC_SOURCE =
  "Apple公式「iPhone Duo の技術仕様」（https://support.apple.com/ja-jp/148588）";

const SAMSUNG_Z8_NEWSROOM =
  "Samsung Newsroom 日本「Galaxy Z Fold8 Ultra | Fold8 | Flip8」発売リリース（https://news.samsung.com/jp/galaxy-z-series-onsale-samsung）";

const SAMSUNG_COMPARE =
  "Samsung 公式スペック比較（https://www.samsung.com/jp/smartphones/compare/）";

const PIXEL_11_PRO_FOLD_SPEC =
  "Google 公式「Google Pixel 11 Pro Fold の技術仕様」（https://store.google.com/jp/product/pixel_11_pro_fold_specs?hl=ja）";

const PIXEL_10_PRO_FOLD_SPEC =
  "Google 公式「Google Pixel 10 Pro Fold の技術仕様」（https://store.google.com/jp/product/pixel_10_pro_fold_specs?hl=ja）";

const SAMSUNG_FLIP7_NEWSROOM =
  "Samsung Newsroom 日本「Galaxy Z Flip7」発売リリース（https://news.samsung.com/jp/galaxy-flip7-launch）";

const FOLDABLE_GUIDE_SLUG = "foldable-phone-case-guide";

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
      FOLDABLE_GUIDE_SLUG,
    ],
  },
  [GALAXY_Z_FOLD8_ULTRA_ID]: {
    seoTitle:
      "Galaxy Z Fold8 Ultra対応ケース｜Fold8との違い・ヒンジ保護も解説",
    seoDescription:
      "Galaxy Z Fold8 Ultra向けケースを楽天・Yahoo!で比較。Fold8との寸法差、ヒンジ保護・ワイヤレス充電時の注意点を整理します。",
    extraDescriptionSections: [
      {
        heading: "Fold8とのケース互換性",
        body: `Galaxy Z Fold8 用ケースとの共用は想定しないでください。${SAMSUNG_Z8_NEWSROOM}および${SAMSUNG_COMPARE}によると、Fold8 Ultraは閉じ約158×73×8.9mm・開き約158×143×4.1mm・約215g、Fold8は閉じ約124×82×9.7mm・開き約124×161×4.5mm・約201gと外形が異なります。対応機種に「Fold8 Ultra」と明記された製品を選んでください。カメラ穴の位置・形状の適合は商品ページの対応機種表記で確認してください。`,
      },
    ],
    faqs: [
      {
        question: "Fold8 と Fold8 Ultra のケースは共通で使えますか？",
        answer: `使えません。Samsung公式の寸法では、Fold8 Ultraは閉じ約158×73×8.9mm・開き約158×143×4.1mm・約215g、Fold8は閉じ約124×82×9.7mm・開き約124×161×4.5mm・約201gです（出典: ${SAMSUNG_Z8_NEWSROOM}、${SAMSUNG_COMPARE}）。必ず各機種専用を選んでください。`,
      },
      {
        question: "Fold8 Ultra のケースはヒンジ部分をどう選べばいい？",
        answer: `本体仕様だけでは各社ケースのヒンジ保護方式は決まらないため、次のチェックポイントで選ぶと失敗しにくいです。(1) ヒンジまで覆うタイプか、覆わない薄型か（用途に合うか）。(2) 開閉時にケースが引っかからないか。(3) 閉じたときに画面の間にすき間ができたり、画面同士を圧迫したりしないか。(4) ワイヤレス充電（Qi）を使うなら背面の厚みや充電対応（出典: ${SAMSUNG_Z8_NEWSROOM}）。各ケースの対応内容は商品ページで確認してください。`,
      },
    ],
    relatedColumnSlugs: [FOLDABLE_GUIDE_SLUG],
  },
  [GALAXY_Z_FOLD8_ID]: {
    seoTitle:
      "Galaxy Z Fold8対応ケース｜Ultraとの違い・ヒンジ保護も解説",
    seoDescription:
      "Galaxy Z Fold8向けケースを楽天・Yahoo!で比較。Fold8 Ultraとの寸法差や、横折り機種のケース選びのポイントを整理します。",
    extraDescriptionSections: [
      {
        heading: "Fold8 Ultraとのケース互換性",
        body: `Fold8 Ultra 用ケースは使えません。公式寸法では Fold8（閉じ約124×82×9.7mm・開き約124×161×4.5mm・約201g）と Ultra（閉じ約158×73×8.9mm・開き約158×143×4.1mm・約215g）で外形が異なります（出典: ${SAMSUNG_Z8_NEWSROOM}、${SAMSUNG_COMPARE}）。カメラ穴やボタン位置の適合は商品ページの対応機種表記で確認してください。`,
      },
    ],
    faqs: [
      {
        question: "Fold8 と Fold8 Ultra のケースは共通で使えますか？",
        answer: `使えません。Fold8 と Fold8 Ultra は高さ・幅・厚み・重量が異なります（出典: ${SAMSUNG_Z8_NEWSROOM}、${SAMSUNG_COMPARE}）。対応表記が「Galaxy Z Fold8」の製品を選んでください。`,
      },
      {
        question: "Flip8 のケースは Fold8 に使えますか？",
        answer: `使えません。Fold8 は横折り、Flip8 は縦折りで外形が根本から異なります（出典: ${SAMSUNG_Z8_NEWSROOM}）。`,
      },
    ],
    relatedColumnSlugs: [FOLDABLE_GUIDE_SLUG],
  },
  [GALAXY_Z_FLIP8_ID]: {
    seoTitle:
      "Galaxy Z Flip8対応ケース｜Flip7互換・薄型設計の注意点",
    seoDescription:
      "Galaxy Z Flip8向けケースを楽天・Yahoo!で比較。縦折り機種特有の厚み・カバー画面・ヒンジまわりの確認ポイントを整理します。",
    extraDescriptionSections: [
      {
        heading: "縦折りケース選びの注意点",
        body: `Flip8は閉じた状態で約86×75×13.1mm、開いた状態で約167×75×6.1mm、重量約180gです（出典: ${SAMSUNG_Z8_NEWSROOM}、${SAMSUNG_COMPARE}）。ケースを足すと閉じたときの厚みが増えるため、ポケット収納やヒンジ負荷を考えて薄型かどうかを確認してください。カバー画面の切り抜きや透明度は商品ページで確認してください。`,
      },
    ],
    faqs: [
      {
        question: "Flip8 のケースは Flip7 と共通ですか？",
        answer: `流用はおすすめしません。Flip8専用のケースを選んでください。公式寸法では、Flip8は閉じ約86×75×13.1mm・開き約167×75×6.1mm・約180g（出典: ${SAMSUNG_Z8_NEWSROOM}、${SAMSUNG_COMPARE}）、Flip7は閉じ約85.5×75.2×13.7mm・開き約166.7×75.2×6.5mm・約188gです（出典: ${SAMSUNG_FLIP7_NEWSROOM}）。厚さが変わり、開きやすさのために縁の形状も変更されているため、フィットや開閉に影響する可能性があります。`,
      },
      {
        question: "Fold8 のケースは Flip8 に使えますか？",
        answer: `使えません。横折り（Fold）と縦折り（Flip）では形状がまったく異なります（出典: ${SAMSUNG_Z8_NEWSROOM}）。`,
      },
    ],
    relatedColumnSlugs: [FOLDABLE_GUIDE_SLUG],
  },
  [PIXEL_11_PRO_FOLD_ID]: {
    seoTitle:
      "Pixel 11 Pro Fold対応ケース｜10 Pro Foldとの互換性も解説",
    seoDescription:
      "Google Pixel 11 Pro Fold向けケースを楽天・Yahoo!で比較。公式寸法とPixelsnap充電、前世代との互換性の考え方を整理します。",
    extraDescriptionSections: [
      {
        heading: "Pixelsnap・ワイヤレス充電との兼ね合い",
        body: `${PIXEL_11_PRO_FOLD_SPEC}によると、Pixelsnap ワイヤレス充電（Qi2.2認証・最大25W）に対応します。充電スタンドやマグネットアクセサリーを使う場合は、ケース背面の厚みと磁石位置が製品表記どおりかを確認してください。`,
      },
      {
        heading: "HiLightを使う場合の注意点",
        body: `${PIXEL_11_PRO_FOLD_SPEC}には、背面のライトで画面を見ずに通知を確認できる HiLight が記載されています。HiLight を使うなら、カメラバー周辺の LED を覆わないケースを選んでください。開口の有無は商品ページで確認してください。`,
      },
    ],
    faqs: [
      {
        question:
          "Pixel 10 Pro Fold のケースは 11 Pro Fold に使えますか？",
        answer: `流用はおすすめしません。11 Pro Fold 専用のケースを選んでください。公式寸法では、11 Pro Foldは閉じ155.2×76×10.1mm・開き155.2×150.4×5mm・239g（出典: ${PIXEL_11_PRO_FOLD_SPEC}）、10 Pro Foldは閉じ155.2×76.3×10.8mm・開き155.2×150.4×5.2mm・258gです（出典: ${PIXEL_10_PRO_FOLD_SPEC}）。閉じたときの厚さが0.7mm薄くなり、カメラバーのデザインも新しくなったため、サイズが合わない・カメラ穴がずれる可能性があります。`,
      },
      {
        question: "通常の Pixel 11 用ケースは Pro Fold に使えますか？",
        answer: `使えません。スラブ型の Pixel 11 と折りたたみの Pro Fold では外形が異なります。Pro Fold専用を選んでください。`,
      },
    ],
    relatedColumnSlugs: [FOLDABLE_GUIDE_SLUG],
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
