import {
  bigint,
  bigserial,
  check,
  integer,
  jsonb,
  pgTable,
  text,
  timestamp,
  unique,
  uuid,
} from 'drizzle-orm/pg-core';
import { sql } from 'drizzle-orm';

export const users = pgTable('users', {
  userId: uuid('user_id').primaryKey().defaultRandom(),
  displayName: text('display_name').notNull(),
  email: text('email').notNull().unique(),
  subscriptionPlan: text('subscription_plan').notNull(),
  credits: integer('credits').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
}, (table) => {
  return [
    check(
      'users_subscription_plan_check',
      sql`${table.subscriptionPlan} IN ('standard', 'plus', 'pro')`,
    ),
    check('users_credits_check', sql`${table.credits} >= 0`),
  ];
});

export const reports = pgTable('reports', {
  reportId: uuid('report_id').primaryKey().defaultRandom(),
  userId: uuid('user_id')
    .notNull()
    .references(() => users.userId, { onDelete: 'cascade' }),
  title: text('title').notNull(),
  content: jsonb('content').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
});

export const userAuthIdentities = pgTable(
  'user_auth_identities',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => users.userId, { onDelete: 'cascade' }),
    authProvider: text('auth_provider').notNull(),
    authSubject: text('auth_subject').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
  },
  (table) => {
    return [
      unique('user_auth_identities_provider_subject_unique').on(
        table.authProvider,
        table.authSubject,
      ),
      unique('user_auth_identities_user_provider_unique').on(
        table.userId,
        table.authProvider,
      ),
      check(
        'user_auth_identities_auth_provider_check',
        sql`${table.authProvider} IN ('cognito')`,
      ),
    ];
  },
);

export const quotes = pgTable(
  'quotes',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    text: text('text').notNull(),
    source: text('source').notNull(),
    page: text('page'),
    referenceType: text('reference_type'),
    authors: text('authors'),
    title: text('title'),
    year: text('year'),
    publisher: text('publisher'),
    journal: text('journal'),
    volume: text('volume'),
    issue: text('issue'),
    pages: text('pages'),
    url: text('url'),
    accessDate: text('access_date'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  },
  (table) => {
    return [
      check(
        'quotes_reference_type_check',
        sql`${table.referenceType} IS NULL OR ${table.referenceType} IN ('book', 'article', 'website')`,
      ),
    ];
  },
);

export const references = pgTable(
  'references',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    reportId: uuid('report_id')
      .notNull()
      .references(() => reports.reportId, { onDelete: 'cascade' }),
    quoteId: bigint('quote_id', { mode: 'number' })
      .notNull()
      .references(() => quotes.id, { onDelete: 'restrict' }),
    content: text('content').notNull(),
    objectUrl: text('object_url'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull(),
  },
  (table) => {
    return [unique('references_quote_id_unique').on(table.quoteId)];
  },
);
