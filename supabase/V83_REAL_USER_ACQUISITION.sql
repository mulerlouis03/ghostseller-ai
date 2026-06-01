create table if not exists waitlist (
  id uuid primary key,
  email text unique,
  source text default 'organic',
  referral_code text default '',
  created_at timestamptz default now()
);

create index if not exists idx_waitlist_email on waitlist(email);
create index if not exists idx_waitlist_source on waitlist(source);
