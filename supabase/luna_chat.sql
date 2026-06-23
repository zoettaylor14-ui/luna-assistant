-- LUNA conversational message history
create table if not exists luna_messages (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null,
  session_id    text not null default 'default',
  role          text not null check (role in ('user', 'assistant')),
  content       text not null,
  time_period   text,
  created_at    timestamptz default now()
);

create index if not exists luna_messages_user_session on luna_messages (user_id, session_id, created_at desc);

alter table luna_messages enable row level security;

create policy "users own messages" on luna_messages
  for all using (auth.uid() = user_id);
