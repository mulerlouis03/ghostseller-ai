-- V76 uses existing content_history, persistent_memory, opportunity_items and usage_counters tables.
-- This file is safe to run.

create table if not exists ai_generation_logs (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete set null,
  provider text default '',
  model text default '',
  input jsonb default '{}'::jsonb,
  output jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_ai_generation_logs_user_id on ai_generation_logs(user_id);
create index if not exists idx_ai_generation_logs_provider on ai_generation_logs(provider);
