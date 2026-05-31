create table if not exists tiktok_scripts (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  niche text default '',
  topic text default '',
  mode text default '',
  script jsonb default '{}'::jsonb,
  created_at timestamptz default now()
);

create table if not exists tiktok_scheduled_posts (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  niche text default '',
  topic text default '',
  mode text default '',
  caption text default '',
  media_url text default '',
  script jsonb default '{}'::jsonb,
  scheduled_at timestamptz,
  status text default 'queued',
  result jsonb default '{}'::jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create index if not exists idx_tiktok_scripts_user_id on tiktok_scripts(user_id);
create index if not exists idx_tiktok_scheduled_posts_user_id on tiktok_scheduled_posts(user_id);
create index if not exists idx_tiktok_scheduled_posts_status on tiktok_scheduled_posts(status);
create index if not exists idx_tiktok_scheduled_posts_scheduled_at on tiktok_scheduled_posts(scheduled_at);
