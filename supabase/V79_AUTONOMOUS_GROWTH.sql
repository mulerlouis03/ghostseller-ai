create table if not exists autonomous_growth_runs (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  run_type text default '',
  input jsonb default '{}'::jsonb,
  output jsonb default '{}'::jsonb,
  status text default 'generated',
  created_at timestamptz default now()
);

create table if not exists growth_loops (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  target text default '',
  niche text default '',
  platform text default '',
  loop jsonb default '{}'::jsonb,
  status text default 'ready',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_autonomous_growth_runs_user_id on autonomous_growth_runs(user_id);
create index if not exists idx_autonomous_growth_runs_created_at on autonomous_growth_runs(created_at);
create index if not exists idx_growth_loops_user_id on growth_loops(user_id);
create index if not exists idx_growth_loops_status on growth_loops(status);
