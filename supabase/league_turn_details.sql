create table if not exists public.league_turn_details (
  turn_number bigint primary key,
  turn_state jsonb not null,
  saved_at timestamptz not null default now()
);

alter table public.league_turn_details enable row level security;

drop policy if exists "anon can read league_turn_details" on public.league_turn_details;

create policy "anon can read league_turn_details"
on public.league_turn_details
for select
to anon
using (true);

drop policy if exists "anon can insert league_turn_details" on public.league_turn_details;

create policy "anon can insert league_turn_details"
on public.league_turn_details
for insert
to anon
with check (true);

drop policy if exists "anon can update league_turn_details" on public.league_turn_details;

create policy "anon can update league_turn_details"
on public.league_turn_details
for update
to anon
using (true)
with check (true);

drop policy if exists "anon can delete league_turn_details" on public.league_turn_details;

create policy "anon can delete league_turn_details"
on public.league_turn_details
for delete
to anon
using (true);
