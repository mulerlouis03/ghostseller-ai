create table if not exists referral_profiles (
  id uuid primary key,
  user_id uuid references users(id) on delete cascade,
  email text default '',
  referral_code text unique,
  total_clicks integer default 0,
  total_signups integer default 0,
  total_rewards integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists referral_clicks (
  id uuid primary key,
  referral_code text default '',
  referrer_user_id uuid references users(id) on delete set null,
  source text default '',
  path text default '',
  created_at timestamptz default now()
);

create table if not exists referral_signups (
  id uuid primary key,
  referral_code text default '',
  referrer_user_id uuid references users(id) on delete set null,
  referred_user_id uuid references users(id) on delete set null,
  referred_email text default '',
  reward_credits integer default 0,
  created_at timestamptz default now()
);

create table if not exists promo_codes (
  id uuid primary key,
  code text unique,
  credits integer default 0,
  plan_bonus text default '',
  max_uses integer default 100,
  used_count integer default 0,
  active boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists promo_redemptions (
  id uuid primary key,
  promo_code text default '',
  user_id uuid references users(id) on delete cascade,
  email text default '',
  credits integer default 0,
  created_at timestamptz default now()
);

create index if not exists idx_referral_profiles_user_id on referral_profiles(user_id);
create index if not exists idx_referral_profiles_code on referral_profiles(referral_code);
create index if not exists idx_referral_clicks_code on referral_clicks(referral_code);
create index if not exists idx_referral_signups_referrer on referral_signups(referrer_user_id);
create index if not exists idx_promo_codes_code on promo_codes(code);
create index if not exists idx_promo_redemptions_user on promo_redemptions(user_id);
