create table if not exists waitlist (
  id uuid primary key,
  name text,
  email text unique not null,
  business text,
  created_at timestamptz default now()
);

create index if not exists idx_waitlist_email
on waitlist(email);
