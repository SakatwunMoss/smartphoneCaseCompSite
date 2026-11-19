-- 折りたたみ機種の追加 + is_foldable フラグ
-- Supabase SQL Editor 等で実行してください。
--
-- 内容:
--   1. phones.is_foldable カラム追加（default false）
--   2. 既存 iPhone Duo を is_foldable = true に更新
--   3. Galaxy Z Fold8 Ultra / Fold8 / Flip8 / Pixel 11 Pro Fold を INSERT
--      （id は DB 自動生成。同名機種が既にあればスキップ）
--
-- 実行後の確認例:
--   SELECT id, name, maker, released_year, is_foldable
--   FROM phones
--   WHERE is_foldable = true
--   ORDER BY name;
--
-- 続けて:
--   npm run sync:offers -- --phone="Galaxy Z"
--   npm run sync:offers -- --phone="Pixel 11 Pro Fold"
--   npm run export:catalog
--
-- description は scripts/sql/foldable-phone-descriptions.sql で投入する。

-- ============================================================
-- 1. is_foldable カラム
-- ============================================================

ALTER TABLE phones
  ADD COLUMN IF NOT EXISTS is_foldable boolean NOT NULL DEFAULT false;

COMMENT ON COLUMN phones.is_foldable IS
  '折りたたみ機種フラグ。一覧の「折りたたみ」絞り込みに使用。';

-- ============================================================
-- 2. 既存の iPhone Duo を折りたたみ扱いへ
-- ============================================================

UPDATE phones
SET is_foldable = true
WHERE name = 'iPhone Duo';

-- ============================================================
-- 3. 新規4機種（同名が無ければ INSERT。id は gen_random_uuid()）
-- ============================================================

INSERT INTO phones (name, maker, released_year, is_foldable, description, image_url)
SELECT v.name, v.maker, v.released_year, true, NULL, NULL
FROM (
  VALUES
    ('Galaxy Z Fold8 Ultra', 'Samsung', 2026),
    ('Galaxy Z Fold8', 'Samsung', 2026),
    ('Galaxy Z Flip8', 'Samsung', 2026),
    ('Google Pixel 11 Pro Fold', 'Google', 2026)
) AS v(name, maker, released_year)
WHERE NOT EXISTS (
  SELECT 1 FROM phones p WHERE p.name = v.name
);
