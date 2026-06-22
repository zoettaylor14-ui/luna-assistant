-- Check-in sessions (morning, midday, night)
create table if not exists public.check_ins (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  type            text not null check (type in ('morning', 'midday', 'night')),
  date            date not null default current_date,
  -- Form data
  wake_time       text,
  sleep_rating    smallint,
  energy_rating   smallint,
  mood_rating     smallint,
  had_dream       boolean default false,
  dream_text      text,
  feeling         text,
  on_mind         text,
  support_need    text,
  pride_goal      text,
  -- AI response stored as JSON
  ai_response     jsonb,
  created_at      timestamptz default now()
);

alter table public.check_ins enable row level security;
create policy "Users manage own check-ins" on public.check_ins for all using (auth.uid() = user_id);
create index idx_check_ins_user_date on public.check_ins(user_id, date desc);
