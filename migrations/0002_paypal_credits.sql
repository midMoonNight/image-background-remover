CREATE TABLE IF NOT EXISTS paypal_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  paypal_order_id TEXT UNIQUE,
  paypal_capture_id TEXT UNIQUE,
  amount_usd TEXT NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  credits INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  captured_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS paypal_orders_user_id_idx ON paypal_orders(user_id);

CREATE TABLE IF NOT EXISTS credit_grants (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  order_id TEXT UNIQUE,
  source TEXT NOT NULL,
  credits_total INTEGER NOT NULL,
  credits_used INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL,
  expires_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (order_id) REFERENCES paypal_orders(id) ON DELETE CASCADE,
  CHECK (credits_total > 0),
  CHECK (credits_used >= 0 AND credits_used <= credits_total)
);

CREATE UNIQUE INDEX IF NOT EXISTS credit_grants_free_trial_idx
  ON credit_grants(user_id, source) WHERE source = 'free_trial';
CREATE INDEX IF NOT EXISTS credit_grants_balance_idx
  ON credit_grants(user_id, expires_at, credits_used);

CREATE TABLE IF NOT EXISTS credit_reservations (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  grant_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (grant_id) REFERENCES credit_grants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS credit_ledger (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  grant_id TEXT NOT NULL,
  event_type TEXT NOT NULL,
  delta INTEGER NOT NULL,
  reference_id TEXT NOT NULL UNIQUE,
  created_at TEXT NOT NULL,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (grant_id) REFERENCES credit_grants(id) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS paypal_webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
