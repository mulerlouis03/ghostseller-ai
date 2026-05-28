-- V51 Owner + controlled launch limits

alter table users add column if not exists access_status text default 'approved';
alter table users add column if not exists onboarding_completed boolean default false;
alter table users add column if not exists business_type text default '';
alter table users add column if not exists main_goal text default '';
alter table users add column if not exists main_platform text default '';
alter table users add column if not exists max_projects integer default 1;
alter table users add column if not exists max_posts integer default 10;
alter table users add column if not exists max_leads integer default 10;

-- Owner
update users
set
  role='owner',
  access_status='approved',
  onboarding_completed=true,
  plan='Pro',
  credits=9999,
  max_projects=999,
  max_posts=9999,
  max_leads=9999
where email='ghostseller.ai@gmail.com';

-- New/free users limits
update users
set
  access_status=coalesce(access_status,'approved'),
  plan=coalesce(plan,'Free'),
  credits=coalesce(credits,20),
  max_projects=coalesce(max_projects,1),
  max_posts=coalesce(max_posts,10),
  max_leads=coalesce(max_leads,10)
where email <> 'ghostseller.ai@gmail.com';

select email, role, access_status, onboarding_completed, plan, credits, max_projects, max_posts, max_leads
from users
order by created_at desc;
