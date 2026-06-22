-- ============================================================
-- LUNA Identity & Profile Schema
-- Run AFTER schema.sql in the Supabase SQL Editor
-- ============================================================

-- ─── Luna Identity Profile ───────────────────────────────────
create table if not exists public.luna_identity_profile (
  id                    uuid default uuid_generate_v4() primary key,
  user_id               uuid references auth.users(id) on delete cascade not null unique,
  full_name             text default 'Zoe Taylor Herstich',
  birth_date            date default '2000-11-14',
  birth_time            time default '19:04',
  birth_place           text default 'Sellersville, Pennsylvania, USA',
  birth_lat             numeric(10,6) default 40.3382,
  birth_lng             numeric(10,6) default -75.3077,
  timezone              text default 'America/New_York',
  personality_summary   text default 'Self-Projected Projector with Scorpio depth, Cancer emotional wisdom, and Gemini expressiveness. Builds meaning through voice, intuition, and genuine recognition.',
  strengths             text[] default ARRAY[
    'deep intuition','pattern recognition','emotional intelligence',
    'creativity','vision','brand instinct','style instinct',
    'communication when grounded','natural guide/mentor energy',
    'resilience','founder energy','ability to turn chaos into systems'
  ],
  shadow_patterns       text[] default ARRAY[
    'spiraling','overthinking texts','reacting from hurt','feeling behind',
    'carrying too many ideas','starting many projects at once',
    'forgetting food/water/body needs','overworking late',
    'trying to prove worth','forcing recognition',
    'saying yes too quickly','overwhelmed by cluttered dashboards'
  ],
  design_preferences    text[] default ARRAY[
    'state-based not task-based','apple-level clean','spiritually intelligent',
    'emotionally safe','fashion-aware','deeply personal','dark feminine but soft',
    'premium','calming','powerful'
  ],
  app_voice             text default 'soft, wise, direct, feminine, protective, emotionally intelligent, spiritual, practical — never fake, never corporate, never robotic, never judgmental',
  core_need             text default 'emotional safety first, then work, then visibility',
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);
alter table public.luna_identity_profile enable row level security;
create policy "Users manage own identity" on public.luna_identity_profile for all using (auth.uid() = user_id);

-- ─── Human Design Profile ────────────────────────────────────
create table if not exists public.human_design_profile (
  id                  uuid default uuid_generate_v4() primary key,
  user_id             uuid references auth.users(id) on delete cascade not null unique,
  type                text default 'Projector',
  authority           text default 'Self-Projected',
  profile             text default '4/6',
  strategy            text default 'Wait for recognition and invitation',
  not_self_theme      text default 'Bitterness',
  signature           text default 'Success',
  defined_centers     text[] default ARRAY['Throat','G Center','Head','Ajna'],
  undefined_centers   text[] default ARRAY['Heart/Will','Sacral','Spleen','Solar Plexus','Root'],
  open_center_notes   jsonb default '{
    "Heart": "Open heart center — themes of proving worth, overcommitting, self-worth pressure. Does not need to prove anything.",
    "Sacral": "Undefined sacral — not a generator. Energy is not consistent. Must rest and protect energy.",
    "Solar Plexus": "Undefined emotional center — may pick up others emotions as own."
  }'::jsonb,
  gates_json          jsonb default '[]'::jsonb,
  channels_json       jsonb default '[]'::jsonb,
  incarnation_cross   text,
  profile_line_4_notes text default 'Line 4: Opportunist. Builds through trusted network, friendships, relationships. Success comes through who you know and who knows you.',
  profile_line_6_notes text default 'Line 6: Role Model. Lives in 3 phases — trial/error (1-30), retreat (30-50), role model (50+). Now in the retreat/becoming phase.',
  voice_clarity_notes text default 'Clarity comes through speaking out loud. Must talk before deciding. Dictate first, organize second.',
  deconditioning_notes text default 'Unlearn: proving, forcing, chasing recognition, saying yes from the undefined heart. Learn: wait, speak, let recognition find you.',
  verified            boolean default true,
  notes               text,
  created_at          timestamptz default now(),
  updated_at          timestamptz default now()
);
alter table public.human_design_profile enable row level security;
create policy "Users manage own HD" on public.human_design_profile for all using (auth.uid() = user_id);

-- ─── Astrology Profile ───────────────────────────────────────
create table if not exists public.astrology_profiles (
  id                uuid default uuid_generate_v4() primary key,
  user_id           uuid references auth.users(id) on delete cascade not null unique,
  birth_date        date default '2000-11-14',
  birth_time        time default '19:04',
  birth_location    text default 'Sellersville, Pennsylvania, USA',
  -- Big 3
  sun_sign          text default 'Scorpio',
  moon_sign         text default 'Cancer',
  rising_sign       text default 'Gemini',
  -- Inner planets
  mercury_sign      text default 'Scorpio',
  venus_sign        text default 'Sagittarius',
  mars_sign         text default 'Libra',
  -- Outer planets (approximate — verify with full calc)
  jupiter_sign      text,
  saturn_sign       text default 'Taurus',
  uranus_sign       text,
  neptune_sign      text,
  pluto_sign        text,
  -- Nodes & angles
  north_node_sign   text default 'Cancer',
  south_node_sign   text default 'Capricorn',
  midheaven_sign    text default 'Virgo',
  chiron_sign       text,
  lilith_sign       text,
  vertex_sign       text,
  -- Houses (approximate — need full calculation)
  sun_house         integer,
  moon_house        integer,
  rising_house      integer default 1,
  mercury_house     integer,
  venus_house       integer,
  mars_house        integer,
  saturn_house      integer,
  north_node_house  integer,
  midheaven_house   integer default 10,
  -- Interpretation notes
  sun_notes         text default 'Scorpio Sun: depth, transformation, emotional truth, shadow work, intensity, magnetic presence, regeneration. Needs meaning not surface.',
  moon_notes        text default 'Cancer Moon: emotional safety is non-negotiable. Home, body, water, and nurturing must come before work. Cyclical energy. Needs to feel safe before being visible.',
  rising_notes      text default 'Gemini Rising: expressive, quick, witty, communicative, multi-interested. Appears light but is deep. Voice and words are the primary vehicle.',
  mercury_notes     text default 'Scorpio Mercury: thinks in depth, patterns, hidden truths. Communicates with precision and intensity. Research-driven. Never shallow.',
  venus_notes       text default 'Sagittarius Venus: loves freedom, adventure, philosophy, travel, expansion. Style is bold, creative, globally-inspired. Attracted to depth + fun.',
  mars_notes        text default 'Libra Mars: acts through beauty, balance, and communication. Conflict-avoidant but can be decisive when values are clear. Motivation through aesthetics and fairness.',
  saturn_notes      text default 'Taurus Saturn: slow wealth is the lesson. Body stability, discipline, savings, calm routines. Build slowly. Do not panic-spend or over-extend.',
  north_node_notes  text default 'Cancer North Node: soul growth is toward emotional intelligence, home, nurturing, receiving care, and trusting intuition. Away from Capricorn over-achieving.',
  midheaven_notes   text default 'Virgo Midheaven: public image is the analyst, helper, systems-builder, clarity-giver. Career through service, tools, workflows, health, and useful structure.',
  chart_data_json   jsonb default '{}'::jsonb,
  verified          boolean default true,
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
alter table public.astrology_profiles enable row level security;
create policy "Users manage own astrology" on public.astrology_profiles for all using (auth.uid() = user_id);

-- ─── Personality Patterns ────────────────────────────────────
create table if not exists public.personality_patterns (
  id              uuid default uuid_generate_v4() primary key,
  user_id         uuid references auth.users(id) on delete cascade not null,
  pattern_name    text not null,
  pattern_type    text check (pattern_type in ('shadow','strength','trigger','growth','body','relationship','work','spiritual')),
  trigger         text,
  how_it_shows_up text,
  support_needed  text,
  luna_response   text,
  chart_connection text,
  hd_connection   text,
  created_at      timestamptz default now(),
  updated_at      timestamptz default now()
);
alter table public.personality_patterns enable row level security;
create policy "Users manage own patterns" on public.personality_patterns for all using (auth.uid() = user_id);
create index if not exists idx_patterns_user on public.personality_patterns(user_id);

-- ─── Style Profile ───────────────────────────────────────────
create table if not exists public.style_profile (
  id                uuid default uuid_generate_v4() primary key,
  user_id           uuid references auth.users(id) on delete cascade not null unique,
  style_name        text default 'LUNA Street Fairy',
  style_lanes       text[] default ARRAY[
    'LUNA Street Fairy','Street Oracle','Moto Siren',
    'Jersey Siren','Soft Grunge Fairy','Resort Street',
    'Dark Founder','Night Spell'
  ],
  formula           text default 'sporty streetwear + spiritual fairy details + siren body shape + low-rise silhouettes + stacked jewelry + handmade custom pieces',
  core_colors       text[] default ARRAY[
    'deep navy','black','moon gray','pearl','lavender',
    'muted blush','silver','soft gold','cream','plum',
    'chocolate brown','olive green','dusty rose'
  ],
  atelier_colors    text[] default ARRAY[
    'burgundy','dirty denim','camo green','washed gray',
    'faded pink','red accents'
  ],
  must_include      text[] default ARRAY[
    'stacked jewelry','low-rise','siren silhouette',
    'one spiritual detail','one streetwear element'
  ],
  avoid             text[] default ARRAY[
    'corporate','plain basics without edge','overly modest',
    'all-black without texture','too matchy-matchy'
  ],
  venus_sign        text default 'Sagittarius',
  rising_sign       text default 'Gemini',
  moon_sign         text default 'Cancer',
  style_archetypes  text[] default ARRAY['Siren','Fairy','Oracle','Founder','Muse'],
  inspiration_notes text default 'Bold, free, spiritual, dark feminine with soft touches. Fashion is identity. Never boring. Always intentional.',
  created_at        timestamptz default now(),
  updated_at        timestamptz default now()
);
alter table public.style_profile enable row level security;
create policy "Users manage own style" on public.style_profile for all using (auth.uid() = user_id);

-- ─── Seed Zoe's Patterns ─────────────────────────────────────
-- Run this after creating the tables and after Zoe's user account exists
-- Replace 'ZOE_USER_ID' with her actual auth.users id

-- insert into public.personality_patterns (user_id, pattern_name, pattern_type, trigger, how_it_shows_up, support_needed, luna_response, chart_connection, hd_connection) values
-- ('ZOE_USER_ID', 'Spiraling', 'shadow', 'Feeling behind, unread messages, unclear priorities', 'Overthinking, checking everything at once, mental tabs open', 'One clear thread to pull', 'Your Scorpio mind wants to solve everything. Choose one thread.', 'Scorpio Mercury + Gemini Rising', 'Undefined Sacral — energy is not infinite'),
-- ('ZOE_USER_ID', 'Reacting from hurt', 'shadow', 'Feeling unseen, dismissed, or disrespected', 'Sends reactive message, overexplains, or goes cold', 'Pause + dictate before responding', 'Do not answer from the wound. Dictate it first.', 'Mars in Libra — conflict-avoidant but reactive when values crossed', 'Self-Projected — speak before deciding'),
-- ('ZOE_USER_ID', 'Forcing recognition', 'shadow', 'Work not gaining traction, feeling invisible', 'Overposting, overexplaining, overgiving in wrong direction', 'Recognition check — was this invited?', 'Recognition over chasing. Your gift finds you when you stop pushing.', 'North Node Cancer — receive, not prove', 'Projector strategy violated — invitation required'),
-- ('ZOE_USER_ID', 'Body neglect', 'shadow', 'Deep work mode, spiral mode, or rush mode', 'Forgetting food, water, movement, natural light', 'Body check before work check', 'Your Cancer Moon needs body safety before your mind can be clear.', 'Cancer Moon — emotional security through physical safety', 'Undefined Sacral — must rest to restore');
