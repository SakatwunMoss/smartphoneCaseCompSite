-- marketplace_offers: RLS は有効だが SELECT ポリシーが無く、
-- anon key からの取得が常に 0 件になっていた問題の修正。
-- phones / cases と同様に公開読み取りを許可する。

create policy "Public read access"
  on public.marketplace_offers
  for select
  to public
  using (true);
