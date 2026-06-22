-- ============================================================
-- LUNA Atelier — Fashion & Style Feature Schema
-- Run in Supabase SQL Editor after the main schema
-- ============================================================

create extension if not exists "uuid-ossp";

-- ─── 1. Style Profile ─────────────────────────────────────────
create table if not exists public.fashion_style_profile (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null unique,
  style_name    text default 'LUNA Street Fairy',
  core_formula  text,
  color_palette text[],
  style_lanes   text[],
  must_include  text[],
  avoid         text[],
  notes         text,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
alter table public.fashion_style_profile enable row level security;
create policy "Users own style profile" on public.fashion_style_profile for all using (auth.uid() = user_id);

-- ─── 2. Style References (Inspiration Board) ──────────────────
create table if not exists public.style_references (
  id                     uuid default uuid_generate_v4() primary key,
  user_id                uuid references auth.users(id) on delete cascade not null,
  image_url              text not null,
  source                 text,
  extracted_style_lane   text,
  extracted_colors       text[],
  extracted_silhouette   text,
  extracted_accessories  text[],
  extracted_notes        text,
  user_notes             text,
  is_preloaded           boolean default false,
  ref_number             integer,
  created_at             timestamptz default now()
);
alter table public.style_references enable row level security;
create policy "Users own style references" on public.style_references for all using (auth.uid() = user_id);

-- ─── 3. Wardrobe Items (Closet) ───────────────────────────────
create table if not exists public.wardrobe_items (
  id                    uuid default uuid_generate_v4() primary key,
  user_id               uuid references auth.users(id) on delete cascade not null,
  name                  text not null,
  category              text not null,
  color                 text,
  fit                   text,
  vibe_tags             text[],
  photo_url             text,
  clean_status          text default 'clean',
  last_worn_at          date,
  favorite_rating       integer default 0 check (favorite_rating between 0 and 5),
  customization_notes   text,
  pairs_well_with       text[],
  repair_notes          text,
  created_at            timestamptz default now(),
  updated_at            timestamptz default now()
);
alter table public.wardrobe_items enable row level security;
create policy "Users own wardrobe" on public.wardrobe_items for all using (auth.uid() = user_id);

-- ─── 4. Outfit Ideas ──────────────────────────────────────────
create table if not exists public.outfit_ideas (
  id             uuid default uuid_generate_v4() primary key,
  user_id        uuid references auth.users(id) on delete cascade not null,
  date           date,
  title          text,
  style_lane     text,
  mood_target    text,
  outfit_formula text,
  items          jsonb,
  jewelry        text,
  hair           text,
  makeup         text,
  shoes          text,
  bag            text,
  scent          text,
  reason         text,
  ai_prompt      text,
  status         text default 'generated',
  user_rating    integer default 0 check (user_rating between 0 and 5),
  created_at     timestamptz default now()
);
alter table public.outfit_ideas enable row level security;
create policy "Users own outfit ideas" on public.outfit_ideas for all using (auth.uid() = user_id);

-- ─── 5. Sewing Projects ───────────────────────────────────────
create table if not exists public.sewing_projects (
  id                        uuid default uuid_generate_v4() primary key,
  user_id                   uuid references auth.users(id) on delete cascade not null,
  title                     text not null,
  description               text,
  project_type              text,
  style_lane                text,
  skill_level               text default 'beginner',
  status                    text default 'idea',
  materials_needed          text[],
  steps                     jsonb,
  pattern_notes             text,
  estimated_time            text,
  inspiration_reference_ids uuid[],
  progress_notes            text,
  is_starter                boolean default false,
  sort_order                integer default 0,
  created_at                timestamptz default now(),
  updated_at                timestamptz default now()
);
alter table public.sewing_projects enable row level security;
create policy "Users own sewing projects" on public.sewing_projects for all using (auth.uid() = user_id);

-- ─── 6. Fashion Materials ─────────────────────────────────────
create table if not exists public.fashion_materials (
  id         uuid default uuid_generate_v4() primary key,
  user_id    uuid references auth.users(id) on delete cascade not null,
  name       text not null,
  category   text,
  quantity   text,
  color      text,
  source     text,
  cost       numeric(10,2),
  notes      text,
  created_at timestamptz default now()
);
alter table public.fashion_materials enable row level security;
create policy "Users own fashion materials" on public.fashion_materials for all using (auth.uid() = user_id);

-- ─── 7. Generated Looks ───────────────────────────────────────
create table if not exists public.generated_looks (
  id                   uuid default uuid_generate_v4() primary key,
  user_id              uuid references auth.users(id) on delete cascade not null,
  outfit_idea_id       uuid references public.outfit_ideas(id) on delete set null,
  provider             text default 'manual',
  prompt               text,
  negative_prompt      text,
  style_lane           text,
  outfit_formula       text,
  reference_image_ids  uuid[],
  output_url           text,
  status               text default 'prompt_ready',
  user_rating          integer default 0 check (user_rating between 0 and 5),
  notes                text,
  created_at           timestamptz default now()
);
alter table public.generated_looks enable row level security;
create policy "Users own generated looks" on public.generated_looks for all using (auth.uid() = user_id);

-- ─── 8. Style Feedback ────────────────────────────────────────
create table if not exists public.style_feedback (
  id                uuid default uuid_generate_v4() primary key,
  user_id           uuid references auth.users(id) on delete cascade not null,
  outfit_idea_id    uuid references public.outfit_ideas(id) on delete cascade,
  wore_it           boolean default false,
  felt_like         text,
  confidence_rating integer check (confidence_rating between 0 and 5),
  comfort_rating    integer check (comfort_rating between 0 and 5),
  compliments       boolean default false,
  what_worked       text,
  what_to_change    text,
  created_at        timestamptz default now()
);
alter table public.style_feedback enable row level security;
create policy "Users own style feedback" on public.style_feedback for all using (auth.uid() = user_id);

-- ─── 9. Style Avatar Profiles ─────────────────────────────────
create table if not exists public.style_avatar_profiles (
  id                      uuid default uuid_generate_v4() primary key,
  user_id                 uuid references auth.users(id) on delete cascade not null,
  avatar_name             text default 'Zoe',
  reference_image_urls    text[],
  feature_notes           text,
  hair_notes              text,
  makeup_notes            text,
  body_proportion_notes   text,
  style_boundaries        text,
  status                  text default 'pending_photos',
  created_at              timestamptz default now(),
  updated_at              timestamptz default now()
);
alter table public.style_avatar_profiles enable row level security;
create policy "Users own avatar profiles" on public.style_avatar_profiles for all using (auth.uid() = user_id);

-- ─── Fashion Line Vault (stored as JSON in outfit_ideas with type='vault') ──
-- Uses outfit_ideas table with status='vault' and style_lane='brand_concept'
-- Or create a dedicated view:

create table if not exists public.fashion_vault_concepts (
  id            uuid default uuid_generate_v4() primary key,
  user_id       uuid references auth.users(id) on delete cascade not null,
  brand_name    text,
  concept       text,
  description   text,
  category      text,
  style_notes   text,
  product_ideas jsonb,
  sourcing_notes text,
  status        text default 'idea',
  sort_order    integer default 0,
  created_at    timestamptz default now(),
  updated_at    timestamptz default now()
);
alter table public.fashion_vault_concepts enable row level security;
create policy "Users own vault concepts" on public.fashion_vault_concepts for all using (auth.uid() = user_id);
