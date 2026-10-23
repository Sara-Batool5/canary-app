# Canary

**Spot churn before it happens.**

Canary is a churn early-warning web app for SaaS teams. It scores every customer's health from simple warning signs, shows who needs attention, drafts a personal message with AI, and tracks how much revenue was saved.

> A portfolio project by Sara Batool. It runs on sample data and has no real customers.

**Live app:** [ADD YOUR VERCEL LINK]
**Demo login:** use the "Explore with the demo account" button on the login page.

<!-- Add 2 or 3 screenshots here, for example:
![Dashboard](docs/dashboard.png)
-->

## Features

- **Health scoring** from 0 to 100, with plain-language reasons such as "No login for 21 days". Scores are calculated live from the raw data every time a page loads.
- **Adjustable rules** in Settings: change the login tiers, the points for tickets and failed payments, the usage-drop threshold, and the health bands.
- **Dashboard** with revenue at risk, a health breakdown, and a "Needs attention now" list.
- **Customers** list with filters (healthy, at risk, critical, saved, churned), search, and a detail page for each account.
- **CSV import** with validation, a preview, and three modes: update existing customers (keeps outcomes and messages), replace everything, or add as new.
- **AI outreach**: a drafted email for each at-risk customer in a Friendly, Formal, or Short tone, with an edit and approve step. Canary never sends email by itself.
- **Outcomes and reports**: mark customers as saved or churned, see revenue saved, the save rate by message tone, and export a CSV.
- **Notification bell** that surfaces what needs attention.
- **Accounts** with sign-up and login, and row-level security so every user sees only their own data.
- **Demo data and a demo account** so anyone can explore in seconds.

## How scoring works

Every customer starts at 100 and loses points:

| Signal | Default rule |
| --- | --- |
| No login | 7, 14, or 21+ days removes 15, 30, or 40 points |
| Open support tickets | 8 points each, up to 24 |
| Failed payments | 15 points each, up to 30 |
| Usage drop | Down 20% or more removes 15 points |

A score of 70 or more is healthy, 40 to 69 is at risk, and below 40 is critical. All values can be changed in **Settings**.

## Tech stack

- [Next.js](https://nextjs.org) (App Router), React, TypeScript
- [Tailwind CSS](https://tailwindcss.com) and [shadcn/ui](https://ui.shadcn.com)
- [Supabase](https://supabase.com) for authentication and a Postgres database
- [Groq](https://groq.com) API for the AI-drafted messages (model: `openai/gpt-oss-120b`)
- [Vercel](https://vercel.com) for hosting

## Getting started

### Requirements

- Node.js 20.9 or newer
- A free Supabase project
- A free Groq API key

### 1. Install

```bash
npm install
```

The repository includes an `.npmrc` file with `legacy-peer-deps=true`, so the install does not stop on peer-dependency warnings.

### 2. Set up the database

In Supabase, open **SQL Editor**, create a new query, and run:

```sql
-- CUSTOMERS
create table public.customers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  name text not null,
  email text,
  plan text,
  monthly_revenue numeric(12,2) default 0,
  last_login date,
  open_tickets int default 0,
  failed_payments int default 0,
  usage_change_percent numeric(6,2) default 0,
  health_score int,
  health_status text check (health_status in ('green','amber','red')),
  risk_reasons text[] default '{}',
  created_at timestamptz default now()
);

-- OUTREACH MESSAGES
create table public.outreach (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  message text not null,
  tone text default 'friendly',
  status text not null default 'draft' check (status in ('draft','approved','sent')),
  created_at timestamptz default now()
);

-- OUTCOMES (saved or churned)
create table public.outcomes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null default auth.uid() references auth.users(id) on delete cascade,
  customer_id uuid not null references public.customers(id) on delete cascade,
  result text not null check (result in ('saved','churned')),
  outcome_date date default current_date,
  created_at timestamptz default now()
);

create index on public.customers (user_id);
create index on public.outreach (user_id, customer_id);
create index on public.outcomes (user_id, customer_id);

-- ROW LEVEL SECURITY: each user sees only their own rows
alter table public.customers enable row level security;
alter table public.outreach enable row level security;
alter table public.outcomes enable row level security;

create policy "own customers" on public.customers
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own outreach" on public.outreach
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy "own outcomes" on public.outcomes
  for all to authenticated
  using (user_id = auth.uid()) with check (user_id = auth.uid());
```

### 3. Add environment variables

Create a `.env.local` file (see `.env.example`):

| Variable | Required | Notes |
| --- | --- | --- |
| `NEXT_PUBLIC_SUPABASE_URL` | Yes | Your Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Yes | The anon or publishable key. Never use the `service_role` key. |
| `GROQ_API_KEY` | Yes, for AI drafts | Server-only. Do not prefix with `NEXT_PUBLIC_`. |
| `GROQ_MODEL` | No | Defaults to `openai/gpt-oss-120b` |
| `NEXT_PUBLIC_DEMO_EMAIL` | No | Enables the demo-account button on the login page |
| `NEXT_PUBLIC_DEMO_PASSWORD` | No | Use a throwaway password. It is public by design. |

### 4. Run it

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

### Deploy to Vercel

1. Push the code to GitHub.
2. Import the repository in Vercel.
3. Add the environment variables above, then deploy.
4. In Supabase, set **Authentication → URL Configuration → Site URL** to your Vercel link.

## Project structure

```
app/
  (app)/            Logged-in pages: dashboard, customers, outreach, upload, reports, settings
  actions/          Server actions: outreach (AI), outcomes, settings, demo data, sign out
  login/, signup/   Public auth pages
components/         UI components, grouped by feature
lib/
  scoring.ts        Health scoring and adjustable rules
  customers.ts      Live scoring helpers
  csv.ts            CSV parsing and validation
  notifications.ts  Notification bell logic
  supabase/         Browser, server and session clients
proxy.ts            Session refresh and route protection (Next.js 16)
```

## Notes

- **Emails are never sent automatically.** Drafts are copied or opened in your own email app after approval.
- **Email confirmation** is off in the demo setup, because Supabase's built-in email service only delivers to project team members. Before real users sign up, connect a custom SMTP provider and turn confirmation on.
- **Vercel's free plan** is for personal, non-commercial use.

## Roadmap

- A live connection so a product can report logins and payments automatically
- Sending approved emails from the app
- Trend charts for customer health over time
- Team accounts

## Author

Built by **Sara Batool**, a graphic designer, as a portfolio project. Designed end to end, from the brand and interface to the product flow, and built with AI-assisted "vibe coding".
