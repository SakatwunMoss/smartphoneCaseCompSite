-- 折りたたみ4機種の description 投入
-- Supabase SQL Editor 等で実行してください。
--
-- 出典:
--   Samsung Newsroom 日本（Fold8 Ultra / Fold8 / Flip8 仕様表）
--     https://news.samsung.com/jp/galaxy-z-series-onsale-samsung
--   Samsung 公式スペック比較
--     https://www.samsung.com/jp/smartphones/compare/
--   Samsung Newsroom 日本（Galaxy Z Flip7）
--     https://news.samsung.com/jp/galaxy-flip7-launch
--   Google Pixel 11 Pro Fold 技術仕様（Google Store）
--     https://store.google.com/jp/product/pixel_11_pro_fold_specs?hl=ja
--   Google Pixel 10 Pro Fold 技術仕様（Google Store）
--     https://store.google.com/jp/product/pixel_10_pro_fold_specs?hl=ja

-- ============================================================
-- Galaxy Z Fold8 Ultra
-- id: 733aed4f-1681-42b4-b5d5-97ded4647fed
-- ============================================================

UPDATE phones
SET description = '### この機種の特徴
本体は閉じた状態で約158×73×8.9mm、開いた状態で約158×143×4.1mm、重量約215g。メイン約8.0インチ／カバー約6.5インチの横折り（Fold型）モデルです（出典: Samsung Newsroom 日本「Galaxy Z Fold8 Ultra | Fold8 | Flip8」発売リリース https://news.samsung.com/jp/galaxy-z-series-onsale-samsung 、および Samsung 公式スペック比較 https://www.samsung.com/jp/smartphones/compare/）。開いた状態の厚さ約4.1mmが特徴で、ワイヤレス充電（Qi）にも対応します（同リリース）。背面カメラは超広角・広角・望遠の3眼構成です（同リリース）。

### ケース選びのポイント
Fold8 用ケースとの互換性は保証されないため、Galaxy Z Fold8 Ultra 専用と明記された製品を選んでください。閉じた状態と開いた状態で外形が大きく異なるため、ヒンジ可動を妨げない設計か、ワイヤレス充電を使う場合は背面の厚みと磁石位置も確認してください。カバー画面・メイン画面の両方で干渉しないかも重要です。カメラ穴の形状適合やヒンジ保護の有無は、商品ページの対応機種・仕様表記で確認してください。'
WHERE id = '733aed4f-1681-42b4-b5d5-97ded4647fed'
  AND name = 'Galaxy Z Fold8 Ultra';

-- ============================================================
-- Galaxy Z Fold8
-- id: f8b89b53-bda0-4900-aa4f-cc6374aa9bea
-- ============================================================

UPDATE phones
SET description = '### この機種の特徴
本体は閉じた状態で約124×82×9.7mm、開いた状態で約124×161×4.5mm、重量約201g。メイン約7.6インチ／カバー約5.5インチの横折り（Fold型）モデルです（出典: Samsung Newsroom 日本 https://news.samsung.com/jp/galaxy-z-series-onsale-samsung 、Samsung 公式スペック比較 https://www.samsung.com/jp/smartphones/compare/）。Fold8 Ultra（閉じ約158×73×8.9mm・開き約158×143×4.1mm・約215g）とは寸法が異なり、ケースの共用はできません。ワイヤレス充電（Qi）対応（同リリース）。

### ケース選びのポイント
必ず Galaxy Z Fold8 専用と明記されたケースを選んでください。Ultra 用・旧世代 Fold 用は外形が合わない想定です。ヒンジ保護・開閉のしやすさ・ワイヤレス充電時の背面厚みを確認し、カバー／メイン両画面での干渉がないかを見てください。カメラ配置の適合や純正アクセサリーとの併用可否は、商品ページの対応機種表記で確認してください。'
WHERE id = 'f8b89b53-bda0-4900-aa4f-cc6374aa9bea'
  AND name = 'Galaxy Z Fold8';

-- ============================================================
-- Galaxy Z Flip8
-- id: 0d6cac04-0a65-4691-89f7-4362f0a44968
-- ============================================================

UPDATE phones
SET description = '### この機種の特徴
本体は閉じた状態で約86×75×13.1mm、開いた状態で約167×75×6.1mm、重量約180g。メイン約6.9インチ／カバー約4.1インチの縦折り（Flip型）モデルです（出典: Samsung Newsroom 日本 https://news.samsung.com/jp/galaxy-z-series-onsale-samsung 、Samsung 公式スペック比較 https://www.samsung.com/jp/smartphones/compare/）。Fold 型とは開閉方向・外形が根本から異なるため、Fold 用ケースは使えません。ワイヤレス充電（Qi）対応（同リリース）。

### ケース選びのポイント
Galaxy Z Flip8 専用ケースを選んでください。閉じたときの厚み約13.1mmにケースが加わるとポケット収納やヒンジ負荷に影響しやすいため、薄型設計かを確認してください。カバー画面操作を使う場合はカバー側の切り抜き・透明度も重要です。Flip7 用との流用はおすすめしません（厚み・縁の形状が異なるため）。対応機種は商品ページで確認してください。'
WHERE id = '0d6cac04-0a65-4691-89f7-4362f0a44968'
  AND name = 'Galaxy Z Flip8';

-- ============================================================
-- Google Pixel 11 Pro Fold
-- id: dc2f1d0b-796b-4c1f-b88b-3fa4299a9ae5
-- ============================================================

UPDATE phones
SET description = '### この機種の特徴
本体は折りたたんだ状態で155.2×76×10.1mm、開いた状態で155.2×150.4×5mm、重量239g。外側約6.5インチ Super Actua／内側約8インチ Super Actua Flex の横折りモデルです（出典: Google 公式「Google Pixel 11 Pro Fold の技術仕様」https://store.google.com/jp/product/pixel_11_pro_fold_specs?hl=ja ）。Pixelsnap ワイヤレス充電（Qi2.2 認証・最大25W）に対応します（同ページ）。背面は広角・ウルトラワイド・5倍望遠のトリプルカメラ構成です（同ページ）。HiLight（背面のライトで通知を表示する機能）にも対応します（同ページ）。

### ケース選びのポイント
Pixel 10 Pro Fold 用ケースとの流用はおすすめしません。閉じたときの厚さが 0.7mm 薄く（10.1mm vs 10.8mm）、カメラバーのデザインも変わっているため、サイズが合わない・カメラ穴がずれる可能性があります（出典: 11 Pro Fold https://store.google.com/jp/product/pixel_11_pro_fold_specs?hl=ja 、10 Pro Fold https://store.google.com/jp/product/pixel_10_pro_fold_specs?hl=ja ）。Pixel 11 Pro Fold 専用を選び、閉じた状態と開いた状態の両方でヒンジ・画面端に干渉しないか、Pixelsnap／Qi2 充電を使うなら背面の厚みと磁石位置を確認してください。HiLight を使うならカメラバーの LED を覆わないケースを選んでください。カメラ穴や LED 開口の適合は商品ページで確認してください。'
WHERE id = 'dc2f1d0b-796b-4c1f-b88b-3fa4299a9ae5'
  AND name = 'Google Pixel 11 Pro Fold';

-- 確認用:
-- SELECT id, name,
--        CASE WHEN description IS NULL OR trim(description) = '' THEN '未設定' ELSE '設定済' END AS status
-- FROM phones
-- WHERE name IN (
--   'Galaxy Z Fold8 Ultra',
--   'Galaxy Z Fold8',
--   'Galaxy Z Flip8',
--   'Google Pixel 11 Pro Fold'
-- );
