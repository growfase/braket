-- Cup Bracket — fingerprint identical brackets so we can group them
-- (count players + sum stakes for the proportional, stake-weighted split).
-- Computed server-side in the create-prediction edge function (sha256 of the
-- picks map with sorted keys).
alter table predictions add column if not exists picks_hash text;
create index if not exists predictions_picks_hash_idx on predictions(picks_hash);
