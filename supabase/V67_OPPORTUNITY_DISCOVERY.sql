create table if not exists opportunity_scans (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  scan_type text default 'global',
  results jsonb default '[]'::jsonb,
  created_at timestamptz default now()
);

create table if not exists opportunity_items (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  niche text default '',
  market text default '',
  score integer default 0,
  analysis jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists opportunity_campaigns (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  niche text default '',
  campaign jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_opportunity_scans_user_id on opportunity_scans(user_id);
create index if not exists idx_opportunity_items_user_id on opportunity_items(user_id);
create index if not exists idx_opportunity_items_score on opportunity_items(score);
create index if not exists idx_opportunity_campaigns_user_id on opportunity_campaigns(user_id);
