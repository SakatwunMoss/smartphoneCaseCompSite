-- iPhone 17 の発売年修正
-- iPhone 17 / 17 Pro / 17 Air は2025年9月発売、17e のみ2026年3月発売
-- 意図: iPhone 17 が 2026 になっていたデータ不整合を修正

UPDATE phones
SET released_year = 2025
WHERE name = 'iPhone 17';
