-- Step 1: persistent tables for Fortune Loop MVP

create table if not exists user_draws (
  id bigserial primary key,
  user_id text not null,
  date_key date not null,
  fortune_id text not null,
  created_at timestamptz not null default now(),
  unique (user_id, date_key)
);

create index if not exists idx_user_draws_user_date on user_draws(user_id, date_key desc);

create table if not exists entitlements (
  id bigserial primary key,
  user_id text not null,
  date_key date not null,
  type text not null,
  status text not null,
  payment_tx_id text not null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (user_id, date_key, type)
);

create index if not exists idx_entitlements_user_date on entitlements(user_id, date_key desc);
