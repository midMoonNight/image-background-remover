ALTER TABLE credit_grants ADD COLUMN creem_order_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS credit_grants_creem_order_idx ON credit_grants(creem_order_id);

CREATE TABLE IF NOT EXISTS creem_orders (
  id TEXT PRIMARY KEY,
  user_id TEXT NOT NULL,
  plan_id TEXT NOT NULL,
  creem_product_id TEXT NOT NULL,
  creem_checkout_id TEXT UNIQUE,
  creem_order_id TEXT UNIQUE,
  creem_transaction_id TEXT UNIQUE,
  amount_cents INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'USD',
  credits INTEGER NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL,
  completed_at TEXT,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX IF NOT EXISTS creem_orders_user_id_idx ON creem_orders(user_id);

CREATE TABLE IF NOT EXISTS creem_webhook_events (
  id TEXT PRIMARY KEY,
  event_type TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TEXT NOT NULL,
  updated_at TEXT NOT NULL
);
