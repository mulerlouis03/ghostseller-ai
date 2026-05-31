create table if not exists persistent_memory (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  niche text default '',
  platform text default '',
  hook text default '',
  cta text default '',
  strategy text default '',
  campaign_name text default '',
  metrics jsonb default '{}'::jsonb,
  performance_score integer default 0,
  created_at timestamptz default now()
);

create index if not exists idx_persistent_memory_user_id on persistent_memory(user_id);
create index if not exists idx_persistent_memory_score on persistent_memory(performance_score);
create index if not exists idx_persistent_memory_platform on persistent_memory(platform);
create index if not exists idx_persistent_memory_niche on persistent_memory(niche);
