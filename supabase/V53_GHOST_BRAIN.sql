create table if not exists content_history (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  type text default 'content',
  niche text default '',
  platform text default '',
  prompt text default '',
  result jsonb default '{}'::jsonb,
  favorite boolean default false,
  created_at timestamptz default now()
);
create index if not exists idx_content_history_user_id on content_history(user_id);
create index if not exists idx_content_history_created_at on content_history(created_at);
create index if not exists idx_content_history_favorite on content_history(favorite);
