-- Cup Predict — payments: unique deposit wallet per prediction + detection.
-- Run in the Supabase SQL editor (or applied via the Management API).

-- ── predictions: payment columns ──
alter table predictions add column if not exists deposit_wallet text;
alter table predictions add column if not exists amount_sol      numeric;
alter table predictions add column if not exists payment_status  text not null default 'awaiting';
alter table predictions add column if not exists tx_sig          text;

do $$ begin
  alter table predictions add constraint predictions_payment_status_chk
    check (payment_status in ('awaiting','paid','expired'));
exception when duplicate_object then null; end $$;

-- ── deposit secrets: server-only (RLS on, NO policies → only service_role) ──
create table if not exists deposit_secrets (
  prediction_id uuid primary key references predictions(id) on delete cascade,
  secret        text not null,
  created_at    timestamptz not null default now()
);
alter table deposit_secrets enable row level security;

-- Predictions are now created ONLY server-side (edge function / service_role).
drop policy if exists predictions_insert on predictions;
-- (predictions_read stays: anyone can view predictions.)
