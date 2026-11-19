/**
 * 機種名マッチ判定のユニットテスト。
 * catalog.json の実商品名から境界ケースを抽出。
 *
 * 実行: npx tsx scripts/sync-offers/matcher.test.ts
 */

import assert from "node:assert/strict";

import { isMatchingPhoneModel } from "./matcher";

type Case = {
  phone: string;
  item: string;
  expected: boolean;
  note: string;
};

const cases: Case[] = [
  // --- iPhone 17 系 ---
  {
    phone: "iPhone 17",
    item: "iPhone17 クリアケース ハードケース 透明 アイフォン17 ケース",
    expected: true,
    note: "17 単体",
  },
  {
    phone: "iPhone 17",
    item: "iPhone 17 Pro ケース クリア 耐衝撃",
    expected: false,
    note: "17 Pro のみ → 17 不一致",
  },
  {
    phone: "iPhone 17",
    item: "【訳あり】 スマホケース iPhoneケース iPhone17e iPhone17 iPhone16 iPhone16e iPhone15",
    expected: true,
    note: "17e と 17 並記 → 17 単体ありで一致",
  },
  {
    phone: "iPhone 17",
    item: "全機種対応 iPhoneケース 透明 iPhone18Pro ProMax クリア iPhone17 iPhone16e iPhone16 iPhone15",
    expected: true,
    note: "マルチ掲載（17 単体あり）",
  },
  {
    phone: "iPhone 17",
    item: "iPhone17e ケース リング付き シンプル iPhone16e スマホケース",
    expected: false,
    note: "17e のみ（17 の派生）",
  },
  {
    phone: "iPhone 17",
    item: "iPhone17Pro ケース iPhone17promax ケース カバー",
    expected: false,
    note: "Pro / Pro Max のみ",
  },
  {
    phone: "iPhone 17",
    item: "iphone17 air ケース iPhone17Pro ケース",
    expected: false,
    note: "Air / Pro のみで 17 単体なし",
  },
  {
    phone: "iPhone 17",
    item: "iPhone18Pro 最短翌日配送 iPhone 17 17e 17Pro 17ProMax Air iPhoneケース",
    expected: true,
    note: "17 と派生の兼用 → 一致",
  },
  {
    phone: "iPhone 17 Pro",
    item: "iPhone17Pro ケース クリア 耐衝撃",
    expected: true,
    note: "17 Pro 単体",
  },
  {
    phone: "iPhone 17 Pro",
    item: "iPhone 17 Pro Max ケース iPhone16 iPhone15",
    expected: false,
    note: "17 Pro Max → 17 Pro 不一致",
  },
  {
    phone: "iPhone 17 Pro",
    item: "【全品20％OFF】iPhone17 ケース リング iphone17 air ケース iPhone17Pro ケース iPhone17promax ケース",
    expected: true,
    note: "17 Pro と Pro Max 並記 → Pro 単体あり",
  },
  {
    phone: "iPhone 17 Air",
    item: "カードホルダー付き iPhone17 Air 16 15 14 13 12 ケース",
    expected: true,
    note: "17 Air 単体",
  },
  {
    phone: "iPhone 17e",
    item: "iPhone17e ケース iPhone17 iPhone16e iPhone15 透明 クリアケース",
    expected: true,
    note: "17e 単体あり",
  },

  // --- iPhone 16 / 15 / 18 ---
  {
    phone: "iPhone 16",
    item: "iPhone16 クリアケース ハードケース 透明 アイフォン16 ケース",
    expected: true,
    note: "16 単体",
  },
  {
    phone: "iPhone 16",
    item: "iPhone 17 ケース TPU 透明 iPhone 17e 16e ケース クリア iPhone 16Pro 16Plus",
    expected: false,
    note: "16Pro / 16Plus / 16e のみ",
  },
  {
    phone: "iPhone 16",
    item: "全機種対応 iPhoneケース iPhone17 iPhone16e iPhone16 iPhone15 iPhoneSE クリアケース",
    expected: true,
    note: "16 と 16e 並記 → 一致",
  },
  {
    phone: "iPhone 16 Pro",
    item: "iPhone16pro カバー 透明 iphone16 iphone15 ケース",
    expected: true,
    note: "16 Pro 単体",
  },
  {
    phone: "iPhone 16 Pro",
    item: "【在庫処分】iPhone 16 Pro Max くすみカラー カメラレンズ保護",
    expected: false,
    note: "16 Pro Max → 不一致",
  },
  {
    phone: "iPhone 15",
    item: "iPhone 15 ケース TPU iphone15 pro ケース クリア iPhone 14 15 plus カバー",
    expected: true,
    note: "15 と 15 Pro / Plus 並記",
  },
  {
    phone: "iPhone 15",
    item: "【在庫処分セール】iPhone16 ケース magsafe対応 iPhone15 Pro Max 15 Plus MagSafe 14",
    expected: false,
    note: "15 Pro Max / Plus のみ",
  },
  {
    phone: "iPhone 15 Pro",
    item: "iPhone15 Pro ケース カバー 黒 ブラック 無地 TPU",
    expected: true,
    note: "15 Pro 単体",
  },
  {
    phone: "iPhone 15 Pro",
    item: "iPhone15 Pro Max ケース クリア 透明 耐衝撃",
    expected: false,
    note: "15 Pro Max → 不一致",
  },
  {
    phone: "iPhone 18 Pro",
    item: "iPhone18Pro 最短翌日配送 クリアケース iPhone18ProMax iPhone 17",
    expected: true,
    note: "18 Pro と Pro Max 並記",
  },
  {
    phone: "iPhone 18 Pro",
    item: "LOOF iPhone 18 Pro Max 17e 16e ケース カバー",
    expected: false,
    note: "18 Pro Max のみ",
  },
  {
    phone: "iPhone 18 Pro Max",
    item: "iPhone18promax ケース スタンド付き iPhone17 ケース",
    expected: true,
    note: "18 Pro Max 単体",
  },

  // --- Pixel ---
  {
    phone: "Google Pixel 10",
    item: "Google Pixel 10 ケース 10 Pro ケース クリア 透明 カバー TPU",
    expected: true,
    note: "Pixel 10 と 10 Pro 並記",
  },
  {
    phone: "Google Pixel 10",
    item: "Google Pixel 10a ケース クリア 透明 ソフト カバー TPU Pixel9a",
    expected: false,
    note: "10a → Pixel 10 不一致",
  },
  {
    phone: "Google Pixel 10",
    item: "Google Pixel 10 10a 10Pro 10Pro XL Pixel 9 ケース ハードケース",
    expected: true,
    note: "10 / 10a / 10Pro 並記 → 10 単体あり",
  },
  {
    phone: "Google Pixel 11",
    item: "Google Pixel 11 対応 TPUケース クリア 透明 ソフトケース",
    expected: true,
    note: "Pixel 11 単体",
  },
  {
    phone: "Google Pixel 11",
    item: "Google Pixel 11 Pro 10a 10 Pro XL 9a ケース シリコン",
    expected: false,
    note: "11 Pro のみ",
  },
  {
    phone: "Google Pixel 11",
    item: "Google Pixel 11 Pro Fold クリア ケース カバー 折りたたみ式",
    expected: false,
    note: "11 Pro Fold → Pixel 11 不一致",
  },
  {
    phone: "Google Pixel 11",
    item: "google pixel 11 ケース クリア google pixel 10a ケース Pixel11Pro",
    expected: true,
    note: "11 と 11 Pro 並記",
  },
  {
    phone: "Google Pixel 11 Pro Fold",
    item: "Google Pixel 11 Pro Fold ケース リング付き 耐衝撃",
    expected: true,
    note: "11 Pro Fold 単体",
  },
  {
    phone: "Google Pixel 11 Pro Fold",
    item: "Google Pixel 11 Pro ケース シリコン",
    expected: false,
    note: "11 Pro（Fold なし）→ 不一致",
  },

  // --- Galaxy ---
  {
    phone: "Galaxy S26",
    item: "Galaxy S26 ケース クリア 透明 S26+ソフト TPU",
    expected: true,
    note: "S26 と S26+ 並記",
  },
  {
    phone: "Galaxy S26",
    item: "Galaxy S26 Ultra S26+ S25Ultra 透明保護ケース",
    expected: false,
    note: "S26 Ultra / S26+ のみ",
  },
  {
    phone: "Galaxy S26",
    item: "Galaxy S26+ フィルム SC-52G カメラレンズ保護",
    expected: false,
    note: "S26+ のみ（+ 派生）",
  },
  {
    phone: "Galaxy S26",
    item: "【LINE登録で15％OFF】Galaxy S26 ケース Galaxy S26+ ケース Galaxy S26 Ultra ケース",
    expected: true,
    note: "S26 / S26+ / Ultra 並記",
  },
  {
    phone: "Galaxy Z Fold8",
    item: "Galaxy Z Fold8 ケース クリア ヒンジ保護",
    expected: true,
    note: "Fold8 単体",
  },
  {
    phone: "Galaxy Z Fold8",
    item: "Galaxy Z Fold8 Ultra ケース 純正風",
    expected: false,
    note: "Fold8 Ultra → Fold8 不一致",
  },
  {
    phone: "Galaxy Z Fold8",
    item: "Galaxy Z Fold8 Ultra ケース SC-56G SCG39 耐衝撃",
    expected: false,
    note: "Ultra 型番のみ（Fold8 単体なし）",
  },
  {
    phone: "Galaxy Z Fold8",
    item: "Galaxy Z Fold8 / Fold8 Ultra ケース SC-57G SC-56G SCG41 SCG39",
    expected: true,
    note: "Fold8 兼用＋双方型番 → 残す",
  },
  {
    phone: "Galaxy Z Fold8",
    item: "Galaxy Z Fold8 ケース 手帳型 Galaxy Z Fold8 Ultra SC-56G カバー",
    expected: true,
    note: "Fold8 単体表記あり（Ultra 型番併記でも残す）",
  },
  {
    phone: "Galaxy Z Fold8",
    item: "Galaxy Z Fold8 / Flip8 対応 ケース",
    expected: false,
    note: "追加除外語 Flip",
  },
  // --- 保護フィルム単体（ケース・カバーなし）---
  {
    phone: "Galaxy Z Fold8 Ultra",
    item: "Galaxy Z Fold8 Ultra 保護フィルム ガラスフィルム SC-56G フィルム SCG39",
    expected: false,
    note: "フィルム単体（ケースなし）",
  },
  {
    phone: "Galaxy Z Fold8",
    item: "Galaxy Z Fold8 ガラスフィルム 全面保護 高光沢 保護フィルム",
    expected: false,
    note: "ガラスフィルム単体",
  },
  {
    phone: "Galaxy S26",
    item: "ギャラクシーS26 フィルム 保護フィルム ガラスフィルム 液晶保護",
    expected: false,
    note: "フィルム単体（S26）",
  },
  {
    phone: "Google Pixel 11",
    item: "Google Pixel 11 保護シート 指紋防止",
    expected: false,
    note: "保護シート単体",
  },
  {
    phone: "Galaxy Z Fold8",
    item: "Galaxy Z Fold8 ケース 液晶ガラスフィルム付き カバー",
    expected: true,
    note: "フィルム付きケースは残す",
  },
  {
    phone: "iPhone 17",
    item: "iPhone17 ガラス ケース クリア 耐衝撃",
    expected: true,
    note: "ガラス＋ケースは残す",
  },
  {
    phone: "Galaxy Z Fold8 Ultra",
    item: "Galaxy Z Fold8 Ultra ケース 耐衝撃",
    expected: true,
    note: "Fold8 Ultra 単体",
  },
  {
    phone: "Galaxy Z Fold8 Ultra",
    item: "Galaxy Z Fold8 ケース（Ultra非対応）",
    expected: false,
    note: "Fold8 のみ → Ultra 不一致",
  },
  {
    phone: "Galaxy Z Flip8",
    item: "Galaxy Z Flip8 ケース 薄型",
    expected: true,
    note: "Flip8 単体",
  },
  {
    phone: "Galaxy Z Flip8",
    item: "Galaxy Z Fold8 ケース ヒンジ保護",
    expected: false,
    note: "Fold 除外 + 名前不一致",
  },

  // --- Duo / 表記ゆれ ---
  {
    phone: "iPhone Duo",
    item: "【iPhone Duo クリア ハードケース】折りたたみ アイフォンデュオ",
    expected: true,
    note: "Duo 単体",
  },
  {
    phone: "iPhone Duo",
    item: "For iPhone Duo Fold ケース 耐衝撃 iPhone Duo Fold対応",
    expected: true,
    note: "Duo Fold SEO（duo 末尾のため Fold を派生扱いしない）",
  },
  {
    phone: "iPhone 17",
    item: "iPhone17Pro ケース",
    expected: false,
    note: "空白なし 17Pro",
  },
  {
    phone: "iPhone 17",
    item: "iPhone 17 2025年モデル 対応ケース",
    expected: true,
    note: "年号が続いても一致（英数字継続でも派生語でなければOK）",
  },
  {
    phone: "iPhone 17",
    item: "iPhone 17 / 17 Pro 兼用ケース",
    expected: true,
    note: "スラッシュ区切りの兼用",
  },

  // --- 単語単位の派生判定（誤反応防止） ---
  {
    phone: "iPhone 17",
    item: "iPhone 17 ESR ケース",
    expected: true,
    note: "ESR の e を 17e と誤認しない",
  },
  {
    phone: "Google Pixel 10",
    item: "Google Pixel 10 Android スマホケース",
    expected: true,
    note: "Android の a を 10a と誤認しない",
  },
  {
    phone: "iPhone 17",
    item: "iPhone 17 au docomo softbank 対応",
    expected: true,
    note: "au の a を誤認しない",
  },
  {
    phone: "iPhone 17",
    item: "iPhone 17 Apple 純正",
    expected: true,
    note: "Apple の a を誤認しない",
  },
  {
    phone: "iPhone 17",
    item: "iPhone 17 AirTag 収納 ケース",
    expected: true,
    note: "AirTag を air 派生としない",
  },
  {
    phone: "iPhone 17",
    item: "iPhone 17 Protective Case",
    expected: true,
    note: "Protective を pro 派生としない",
  },
  {
    phone: "iPhone 17",
    item: "iPhone 17 minimal デザイン",
    expected: true,
    note: "minimal を mini 派生としない",
  },
  {
    phone: "iPhone 17",
    item: "iPhone17 ESR",
    expected: true,
    note: "空白なしでも ESR を 17e と誤認しない",
  },

  // --- 空白区切り e/a と裸の世代番号 ---
  {
    phone: "iPhone 17e",
    item: "iPhone17 e ケース クリア",
    expected: true,
    note: "空白区切り 17 e → 17e と一致",
  },
  {
    phone: "iPhone 17e",
    item: "iPhone 17 e ケース",
    expected: true,
    note: "iPhone 17 e → 17e と一致",
  },
  {
    phone: "iPhone 17",
    item: "iPhone17 e ケース",
    expected: false,
    note: "17 e は 17 ベースとは不一致",
  },
  {
    phone: "iPhone 17",
    item: "iPhone 17 e ケース",
    expected: false,
    note: "空白区切り e は 17 の派生",
  },
  {
    phone: "Google Pixel 10",
    item: "Pixel 10 a ケース",
    expected: false,
    note: "10 a は Pixel 10 と不一致（10a 扱い）",
  },
  {
    phone: "Google Pixel 10a",
    item: "Google Pixel 10 a ケース",
    expected: true,
    note: "Pixel 10 a → 10a と一致",
  },
  {
    phone: "iPhone 17",
    item: "iPhone 17e 17 兼用ケース",
    expected: true,
    note: "裸の 17 が単体で並ぶ → 一致",
  },
  {
    phone: "iPhone 17",
    item: "iPhone 17 Pro/17",
    expected: true,
    note: "Pro/17 の裸 17 → 一致",
  },
  {
    phone: "iPhone 17",
    item: "iPhone 16/17 対応ケース",
    expected: true,
    note: "16/17 対応の裸 17 → 一致",
  },
  {
    phone: "iPhone 17",
    item: "iPhone 16/17 Pro 対応",
    expected: false,
    note: "/17 Pro は派生のためベース 17 不一致",
  },
  {
    phone: "Google Pixel 10",
    item: "Google Pixel 10a / 10 兼用",
    expected: true,
    note: "Pixel 系の裸の世代番号",
  },
  {
    phone: "Galaxy S26",
    item: "Galaxy S26 Ultra / S26 兼用",
    expected: true,
    note: "Galaxy 系の裸の世代番号",
  },
];

let passed = 0;
let failed = 0;

for (const c of cases) {
  const actual = isMatchingPhoneModel(c.phone, c.item);
  try {
    assert.equal(
      actual,
      c.expected,
      `${c.phone} ×「${c.item.slice(0, 60)}…」(${c.note}): expected ${c.expected}, got ${actual}`,
    );
    passed += 1;
  } catch (err) {
    failed += 1;
    console.error(err instanceof Error ? err.message : err);
  }
}

console.log(
  `\nmatcher.test: ${passed} passed, ${failed} failed, ${cases.length} total`,
);

if (failed > 0) {
  process.exit(1);
}
