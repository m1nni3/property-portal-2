import { Env, getDb } from './db';

async function markOverdueInvoices(db: D1Database) {
  await db.prepare(`
    UPDATE invoices
    SET status = 'overdue'
    WHERE status = 'pending'
      AND date(due_date) < date('now')
  `).run();
}

async function findUpcomingInvoices(db: D1Database) {
  return db.prepare(`
    SELECT *
    FROM invoices
    WHERE status = 'pending'
      AND date(due_date) BETWEEN date('now') AND date('now', '+7 day')
  `).all();
}

async function findMissingDocuments(db: D1Database) {
  return db.prepare(`
    SELECT *
    FROM invoices
    WHERE doc_url IS NULL OR doc_url = ''
  `).all();
}

async function generateInvoiceJournalEntries(db: D1Database) {
  return db.prepare(`
    SELECT *
    FROM invoices
    WHERE status = 'paid'
      AND date(created_at) >= date('now', '-30 day')
  `).all();
}

export async function scheduled(
  controller: ScheduledController,
  env: Env,
  ctx: ExecutionContext
): Promise<void> {
  const db = getDb(env);

  try {
    switch (controller.cron) {
      case '0 0 * * *':
        await markOverdueInvoices(db as any);
        console.log('Overdue invoice check completed');
        break;

      case '0 6 * * *': {
        const upcoming = await findUpcomingInvoices(db as any);
        console.log('Upcoming invoices:', upcoming);
        break;
      }

      case '0 7 * * *': {
        const missing = await findMissingDocuments(db as any);
        console.log('Invoices missing documents:', missing);
        break;
      }

      case '0 1 1 * *': {
        const journals = await generateInvoiceJournalEntries(db as any);
        console.log('Monthly journal batch:', journals);
        break;
      }
    }
  } catch (error) {
    console.error('Scheduled invoice worker failed:', error);
  }
}
