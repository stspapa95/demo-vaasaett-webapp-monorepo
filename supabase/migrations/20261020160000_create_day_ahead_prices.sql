create table public.day_ahead_prices (
  id bigint generated always as identity primary key,
  bidding_zone text not null,
  occurred_at timestamptz not null,
  price numeric(12, 4) not null,
  unit text not null default 'EUR / MWh',
  source text not null default 'energy-charts',
  ingestion_run_id uuid references public.ingestion_runs (id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint day_ahead_prices_bidding_zone_occurred_at_key
    unique (bidding_zone, occurred_at)
);

create table public.ingestion_runs (
  id uuid primary key default gen_random_uuid(),
  source text not null default 'energy-charts',
  bidding_zone text not null,
  status text not null,
  started_at timestamptz not null default now(),
  finished_at timestamptz,
  request_start timestamptz,
  request_end timestamptz,
  fetched_count integer not null default 0,
  upserted_count integer not null default 0,
  skipped_null_count integer not null default 0,
  skipped_duplicate_count integer not null default 0,
  skipped_unrealistic_count integer not null default 0,
  error_message text,
  constraint ingestion_runs_status_check
    check (status in ('running', 'succeeded', 'failed')),
  constraint ingestion_runs_fetched_count_check check (fetched_count >= 0),
  constraint ingestion_runs_upserted_count_check check (upserted_count >= 0),
  constraint ingestion_runs_skipped_null_count_check check (skipped_null_count >= 0),
  constraint ingestion_runs_skipped_duplicate_count_check check (skipped_duplicate_count >= 0),
  constraint ingestion_runs_skipped_unrealistic_count_check check (skipped_unrealistic_count >= 0)
);

create index ingestion_runs_started_at_idx
  on public.ingestion_runs (started_at desc);

create index day_ahead_prices_occurred_at_idx
  on public.day_ahead_prices (bidding_zone, occurred_at);

create function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger day_ahead_prices_set_updated_at
  before update on public.day_ahead_prices
  for each row
  execute function public.set_updated_at();

alter table public.ingestion_runs enable row level security;
alter table public.day_ahead_prices enable row level security;

comment on table public.ingestion_runs is
  'Each worker pull from energy-charts. Re-runs are allowed; duplicate timestamps upsert.';

comment on column public.ingestion_runs.skipped_duplicate_count is
  'Duplicate unix_seconds inside a single API payload. Re-runs of the worker upsert and are not counted here.';

comment on table public.day_ahead_prices is
  'Day-ahead spot prices. One row per bidding zone and interval. Unique (bidding_zone, occurred_at) makes upserts idempotent.';
