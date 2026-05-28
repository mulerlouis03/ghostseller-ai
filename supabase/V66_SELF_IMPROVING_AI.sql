create table if not exists optimization_runs (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  type text default '',
  input jsonb default '{}'::jsonb,
  output jsonb default '{}'::jsonb,
  score integer default 0,
  created_at timestamptz default now()
);

create index if not exists idx_optimization_runs_user_id on optimization_runs(user_id);
create index if not exists idx_optimization_runs_type on optimization_runs(type);
create index if not exists idx_optimization_runs_score on optimization_runs(score);
create index if not exists idx_optimization_runs_created_at on optimization_runs(created_at);
