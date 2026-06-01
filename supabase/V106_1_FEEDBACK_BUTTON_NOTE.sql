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
