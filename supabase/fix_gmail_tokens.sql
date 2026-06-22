-- Run this in Supabase Dashboard → SQL Editor
-- Fixes gmail_tokens table so LUNA can save Google OAuth tokens

drop table if exists public.gmail_tokens cascade;

create table public.gmail_tokens (
  id            uuid default uuid_generate_v4() primary key,
  email         text not null unique,
  access_token  text not null,
  refresh_token text,
  token_expiry  timestamptz,
  connected_at  timestamptz default now()
);

-- No RLS needed — accessed via service role key only
