# Office Manager

A web-based office management application built with Next.js 14, MongoDB, and NextAuth.

## Features

- **Dashboard** - KPI cards, weekly task completion chart, recent tasks table, announcements
- **Employees** - Live search, department filter, add/edit/delete with modal forms
- **Tasks** - Kanban board with Todo / In Progress / Done columns

## Tech Stack

- Next.js 14 (App Router)
- TypeScript
- TailwindCSS
- shadcn/ui components
- MongoDB Atlas + Mongoose
- NextAuth.js (credentials provider)
- Recharts

## Setup

### 1. Install dependencies

```bash
npm install
```

### 2. Configure environment variables

Copy `.env.local` and fill in your values:

```env
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/office-manager
NEXTAUTH_SECRET=<random-32-char-string>
NEXTAUTH_URL=http://localhost:3000
```

Generate a secret: `openssl rand -base64 32`

### 3. Seed the database

```bash
npx ts-node --project tsconfig.json -r dotenv/config scripts/seed.ts dotenv_config_path=.env.local
```

This creates:
- 10 employees across Engineering, Marketing, HR
- 15 tasks in various statuses
- 3 announcements
- Admin user: `admin@company.com` / `admin1234`

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## Deployment

### Vercel (recommended)

1. Push to GitHub
2. Import on [vercel.com](https://vercel.com)
3. Add environment variables in Vercel dashboard
4. Deploy

### Cloudflare Pages

The `next.config.mjs` has `output: 'standalone'` for standalone Node server.

For Cloudflare Pages with `@cloudflare/next-on-pages`:

```bash
npm install --save-dev @cloudflare/next-on-pages
npx @cloudflare/next-on-pages
```

Create `wrangler.toml`:

```toml
name = "office-manager"
compatibility_date = "2024-01-01"
compatibility_flags = ["nodejs_compat"]

pages_build_output_dir = ".vercel/output/static"

[vars]
NEXTAUTH_URL = "https://your-domain.pages.dev"
```

Add secrets via Cloudflare dashboard or `wrangler secret put MONGODB_URI`.

> Note: NextAuth with MongoDB requires Node.js runtime. Set `export const runtime = 'nodejs'` on API routes, or use Vercel for simpler deployment.
