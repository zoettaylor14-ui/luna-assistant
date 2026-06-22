-- plaid_items
create table if not exists plaid_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  plaid_item_id text not null unique,
  access_token text not null,
  institution_id text,
  institution_name text,
  cursor text,
  products text[],
  status text default 'active',
  last_synced_at timestamptz,
  error_code text,
  error_message text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- plaid_accounts
create table if not exists plaid_accounts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  plaid_item_id uuid references plaid_items(id) on delete cascade,
  plaid_account_id text not null unique,
  name text,
  official_name text,
  type text,
  subtype text,
  mask text,
  current_balance numeric,
  available_balance numeric,
  iso_currency_code text default 'USD',
  hidden boolean default false,
  account_label text,
  account_purpose text,
  last_balance_update timestamptz,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- money_transactions
create table if not exists money_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  plaid_item_id uuid references plaid_items(id) on delete cascade,
  plaid_account_id text,
  plaid_transaction_id text unique not null,
  account_name text,
  amount numeric not null,
  transaction_date date not null,
  authorized_date date,
  merchant_name text,
  name text,
  payment_channel text,
  pending boolean default false,
  category_primary text,
  category_detailed text,
  personal_finance_category jsonb,
  custom_category text,
  transaction_type text,
  expense_type text,
  is_income boolean default false,
  is_bill boolean default false,
  is_subscription boolean default false,
  is_business_expense boolean default false,
  is_personal_expense boolean default true,
  needs_review boolean default false,
  notes text,
  tags text[],
  raw jsonb,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- money_categories
create table if not exists money_categories (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text not null,
  parent_category text,
  color text,
  icon text,
  budget_amount numeric,
  monthly_limit numeric,
  created_at timestamptz default now()
);

-- money_budgets
create table if not exists money_budgets (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  month date not null,
  category text,
  planned_amount numeric,
  actual_amount numeric,
  status text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- money_bills
create table if not exists money_bills (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  name text,
  merchant_name text,
  amount_estimate numeric,
  due_day integer,
  due_date date,
  frequency text,
  category text,
  autopay boolean,
  source_transaction_ids text[],
  status text default 'active',
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- money_subscriptions
create table if not exists money_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  merchant_name text,
  amount_estimate numeric,
  frequency text,
  last_charge_date date,
  next_expected_charge date,
  category text,
  status text default 'active',
  cancel_url text,
  source_transaction_ids text[],
  notes text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- money_alerts
create table if not exists money_alerts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  alert_type text,
  title text,
  body text,
  severity text default 'normal',
  source_transaction_id text,
  status text default 'pending',
  created_at timestamptz default now()
);

-- money_rules
create table if not exists money_rules (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  rule_name text,
  match_type text,
  merchant_contains text,
  category_equals text,
  amount_min numeric,
  amount_max numeric,
  set_category text,
  set_business_expense boolean,
  set_subscription boolean,
  set_bill boolean,
  set_tags text[],
  active boolean default true,
  created_at timestamptz default now()
);

-- RLS
alter table plaid_items enable row level security;
alter table plaid_accounts enable row level security;
alter table money_transactions enable row level security;
alter table money_categories enable row level security;
alter table money_budgets enable row level security;
alter table money_bills enable row level security;
alter table money_subscriptions enable row level security;
alter table money_alerts enable row level security;
alter table money_rules enable row level security;

create policy "users own plaid_items" on plaid_items for all using (auth.uid() = user_id);
create policy "users own plaid_accounts" on plaid_accounts for all using (auth.uid() = user_id);
create policy "users own money_transactions" on money_transactions for all using (auth.uid() = user_id);
create policy "users own money_categories" on money_categories for all using (auth.uid() = user_id);
create policy "users own money_budgets" on money_budgets for all using (auth.uid() = user_id);
create policy "users own money_bills" on money_bills for all using (auth.uid() = user_id);
create policy "users own money_subscriptions" on money_subscriptions for all using (auth.uid() = user_id);
create policy "users own money_alerts" on money_alerts for all using (auth.uid() = user_id);
create policy "users own money_rules" on money_rules for all using (auth.uid() = user_id);

-- money_imports
create table if not exists money_imports (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  file_name text,
  import_type text,
  source_period text,
  uploaded_at timestamptz default now(),
  status text default 'pending',
  notes text,
  total_rows integer,
  matched_rows integer
);

-- money_import_rows
create table if not exists money_import_rows (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  import_id uuid references money_imports(id) on delete cascade,
  merchant text,
  category text,
  amount numeric,
  frequency text,
  notes text,
  status text default 'pending',
  matched_subscription_id uuid,
  matched_transaction_id uuid,
  result_status text,
  created_at timestamptz default now()
);

-- money_reviews (for unknown charge review sessions)
create table if not exists money_reviews (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  transaction_id text,
  merchant text,
  amount numeric,
  review_action text,
  review_note text,
  reviewed_at timestamptz default now()
);

alter table money_imports enable row level security;
alter table money_import_rows enable row level security;
alter table money_reviews enable row level security;
create policy if not exists "users own money_imports" on money_imports for all using (auth.uid() = user_id);
create policy if not exists "users own money_import_rows" on money_import_rows for all using (auth.uid() = user_id);
create policy if not exists "users own money_reviews" on money_reviews for all using (auth.uid() = user_id);
