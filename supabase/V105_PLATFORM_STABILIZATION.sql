create table if not exists feedback (
  id uuid primary key,
  name text default '',
  email text default '',
  rating text default 'Retour général',
  message text not null,
  page text default 'dashboard',
  created_at timestamptz default now()
);
create index if not exists idx_feedback_created_at on feedback(created_at desc);

create table if not exists content_generations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text default '',
  type text default 'content',
  prompt text default '',
  created_at timestamptz default now()
);
create index if not exists idx_content_generations_created_at on content_generations(created_at desc);

create table if not exists leads (
  id uuid primary key default gen_random_uuid(),
  user_id uuid,
  email text default '',
  name text default '',
  source text default '',
  status text default 'new',
  created_at timestamptz default now()
);
create index if not exists idx_leads_created_at on leads(created_at desc);
