create table if not exists beta_feedback (
  id uuid primary key,
  user_id uuid references users(id) on delete set null,
  email text default '',
  rating integer default 5,
  category text default 'general',
  message text default '',
  created_at timestamptz default now()
);

create table if not exists beta_invites (
  id uuid primary key,
  email text default '',
  note text default '',
  status text default 'invited',
  created_at timestamptz default now()
);

create index if not exists idx_beta_feedback_user_id on beta_feedback(user_id);
create index if not exists idx_beta_feedback_rating on beta_feedback(rating);
create index if not exists idx_beta_invites_email on beta_invites(email);
create index if not exists idx_beta_invites_status on beta_invites(status);
