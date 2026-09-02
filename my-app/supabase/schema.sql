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

with ranked_participants as (
  select
    id,
    row_number() over (
      partition by trim(mobile_phone)
      order by (completed_at is not null) desc, completed_at desc nulls last, created_at desc, id desc
    ) as row_number
  from public.quiz_participants
)
delete from public.quiz_participants participants
using ranked_participants ranked
where participants.id = ranked.id
  and ranked.row_number > 1;

create unique index if not exists quiz_participants_mobile_phone_key
on public.quiz_participants ((trim(mobile_phone)));

create or replace function public.create_quiz_participant(
  p_name text,
  p_mobile_phone text,
  p_department text
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  participant_id uuid;
begin
  if exists (select 1 from public.quiz_participants where mobile_phone = trim(p_mobile_phone)) then
    raise exception 'PHONE_EXISTS';
  end if;

  insert into public.quiz_participants (user_id, name, mobile_phone, department)
  values ((select auth.uid()), trim(p_name), trim(p_mobile_phone), trim(p_department))
  returning id into participant_id;

  return participant_id;
exception
  when unique_violation then
    raise exception 'PHONE_EXISTS';
end;
$$;

grant execute on function public.create_quiz_participant(text, text, text) to anon, authenticated;

create or replace function public.complete_quiz_participant(
  p_participant_id uuid,
  p_score integer,
  p_total_questions integer
)
returns boolean
language plpgsql
security definer
set search_path = public
as $$
begin
  update public.quiz_participants
  set score = p_score,
      total_questions = p_total_questions,
      completed_at = now()
  where id = p_participant_id
    and (user_id is null or user_id = (select auth.uid()));

  return found;
end;
$$;

grant execute on function public.complete_quiz_participant(uuid, integer, integer) to anon, authenticated;

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
