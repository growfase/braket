-- Cup Predict — sweep: consolidate per-prediction deposits into the pool wallet.
-- swept_at is set once the deposit has been moved to pool.pool_wallet.
alter table predictions add column if not exists swept_at timestamptz;
alter table predictions add column if not exists sweep_sig text;
