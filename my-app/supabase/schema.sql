create table if not exists public.quiz_participants (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete set null,
  name text not null,
  mobile_phone text not null,
  department text not null,
  score integer,
  total_questions integer,
  completed_at timestamptz,
  created_at timestamptz not null default now()
);

alter table public.quiz_participants add column if not exists score integer;
alter table public.quiz_participants add column if not exists total_questions integer;
alter table public.quiz_participants add column if not exists completed_at timestamptz;
alter table public.quiz_participants add column if not exists name text;
alter table public.quiz_participants enable row level security;

drop policy if exists "Participants can submit their details" on public.quiz_participants;
create policy "Participants can submit their details"
on public.quiz_participants
for insert
to anon, authenticated
with check (user_id is null or user_id = (select auth.uid()));

drop policy if exists "Users can view their own submissions" on public.quiz_participants;
drop policy if exists "Authenticated users can update quiz results" on public.quiz_participants;
create policy "Authenticated users can update quiz results"
on public.quiz_participants
for update
to anon, authenticated
using (user_id is null or user_id = (select auth.uid()))
with check (user_id is null or user_id = (select auth.uid()));

drop policy if exists "Authenticated users can view quiz results" on public.quiz_participants;
create policy "Authenticated users can view quiz results"
on public.quiz_participants
for select
to authenticated
using (true);
