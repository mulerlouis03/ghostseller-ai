create table if not exists tiktok_generations (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  niche text default '',
  mode text default '',
  topic text default '',
  payload jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);
create index if not exists idx_tiktok_generations_user_id on tiktok_generations(user_id);
create index if not exists idx_tiktok_generations_created_at on tiktok_generations(created_at);
