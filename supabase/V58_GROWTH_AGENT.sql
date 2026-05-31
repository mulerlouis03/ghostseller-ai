create table if not exists growth_plans (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  product text default '',
  target text default '',
  goal text default '',
  market text default '',
  plan jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create index if not exists idx_growth_plans_user_id on growth_plans(user_id);
create index if not exists idx_growth_plans_created_at on growth_plans(created_at);
