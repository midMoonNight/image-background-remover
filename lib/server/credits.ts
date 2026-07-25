import type { AuthDatabase } from "@/lib/server/auth";

const FREE_TRIAL_CREDITS = 2;
const FREE_TRIAL_DAYS = 30;

type CreditGrant = {
  id: string;
};

export type CreditReservation = {
  id: string;
  grantId: string;
};

function addDays(date: Date, days: number): string {
  return new Date(date.getTime() + days * 24 * 60 * 60 * 1000).toISOString();
}

export async function grantFreeTrial(database: AuthDatabase, userId: string): Promise<void> {
  const now = new Date();
  await database
    .prepare(
      `INSERT OR IGNORE INTO credit_grants
        (id, user_id, order_id, source, credits_total, credits_used, created_at, expires_at)
       VALUES (?, ?, NULL, 'free_trial', ?, 0, ?, ?)`,
    )
    .bind(crypto.randomUUID(), userId, FREE_TRIAL_CREDITS, now.toISOString(), addDays(now, FREE_TRIAL_DAYS))
    .run();
}

export async function getCreditBalance(database: AuthDatabase, userId: string): Promise<number> {
  const row = await database
    .prepare(
      `SELECT COALESCE(SUM(credits_total - credits_used), 0) AS balance
       FROM credit_grants
       WHERE user_id = ? AND expires_at > ? AND credits_used < credits_total`,
    )
    .bind(userId, new Date().toISOString())
    .first<{ balance: number }>();
  return Number(row?.balance ?? 0);
}

export async function reserveCredit(
  database: AuthDatabase,
  userId: string,
): Promise<CreditReservation | null> {
  const grants = await database
    .prepare(
      `SELECT id FROM credit_grants
       WHERE user_id = ? AND expires_at > ? AND credits_used < credits_total
       ORDER BY expires_at ASC, created_at ASC
       LIMIT 5`,
    )
    .bind(userId, new Date().toISOString())
    .all<CreditGrant>();

  for (const grant of grants.results) {
    const reservationId = crypto.randomUUID();
    const now = new Date().toISOString();
    const results = await database.batch([
      database
        .prepare(
          `UPDATE credit_grants SET credits_used = credits_used + 1
           WHERE id = ? AND user_id = ? AND expires_at > ? AND credits_used < credits_total`,
        )
        .bind(grant.id, userId, now),
      database
        .prepare(
          `INSERT INTO credit_reservations (id, user_id, grant_id, status, created_at, updated_at)
           SELECT ?, ?, ?, 'pending', ?, ? WHERE changes() = 1`,
        )
        .bind(reservationId, userId, grant.id, now, now),
    ]);

    if ((results[0]?.meta?.changes ?? 0) === 1) {
      return { id: reservationId, grantId: grant.id };
    }
  }
  return null;
}

export async function commitCredit(
  database: AuthDatabase,
  userId: string,
  reservation: CreditReservation,
): Promise<void> {
  const now = new Date().toISOString();
  await database.batch([
    database
      .prepare(
        `INSERT OR IGNORE INTO credit_ledger
          (id, user_id, grant_id, event_type, delta, reference_id, created_at)
         SELECT ?, ?, ?, 'image_processed', -1, ?, ?
         FROM credit_reservations WHERE id = ? AND user_id = ? AND status = 'pending'`,
      )
      .bind(
        crypto.randomUUID(),
        userId,
        reservation.grantId,
        reservation.id,
        now,
        reservation.id,
        userId,
      ),
    database
      .prepare(
        `UPDATE credit_reservations SET status = 'committed', updated_at = ?
         WHERE id = ? AND user_id = ? AND status = 'pending'`,
      )
      .bind(now, reservation.id, userId),
  ]);
}

export async function refundCredit(
  database: AuthDatabase,
  userId: string,
  reservation: CreditReservation,
): Promise<void> {
  const now = new Date().toISOString();
  await database.batch([
    database
      .prepare(
        `UPDATE credit_grants SET credits_used = MAX(0, credits_used - 1)
         WHERE id = ? AND user_id = ? AND EXISTS (
           SELECT 1 FROM credit_reservations
           WHERE id = ? AND user_id = ? AND status = 'pending'
         )`,
      )
      .bind(reservation.grantId, userId, reservation.id, userId),
    database
      .prepare(
        `UPDATE credit_reservations SET status = 'refunded', updated_at = ?
         WHERE id = ? AND user_id = ? AND status = 'pending'`,
      )
      .bind(now, reservation.id, userId),
  ]);
}
