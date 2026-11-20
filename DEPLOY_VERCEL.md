# Vercel Deployment Guide for NEWS24 Platform

This application is ready to deploy on **Vercel** with a unified full-stack architecture:
- **Frontend**: React + Vite SPA (served from Vercel's global Edge CDN)
- **Backend**: Express API serverless functions (`/api/*`)
- **Database**: Cloud PostgreSQL (Neon / Supabase / Vercel Postgres) using Prisma ORM

---

## Prerequisites (2 Minutes Setup)

Because Vercel is a serverless environment (ephemeral file system), SQLite files on disk reset between cold starts. You need a free cloud PostgreSQL database:

### Recommended Free Options:
1. **[Neon.tech](https://neon.tech/)** *(Recommended - 1 Click & Free)*:
   - Create a free account at neon.tech.
   - Click **Create Project**.
   - Copy the `postgresql://...` connection string.
2. **[Supabase.com](https://supabase.com/)**:
   - Create a free project.
   - Go to Project Settings -> Database -> Connection String (URI with connection pooling).
3. **Vercel Postgres**:
   - In your Vercel Dashboard project, navigate to the **Storage** tab.
   - Click **Create Database** -> **Postgres** (Neon powered).

---

## Method 1: Deploy via GitHub (Recommended)

1. **Push your code to GitHub**:
   ```bash
   git init
   git add .
   git commit -m "feat: complete NEWS24 full-stack platform"
   git branch -M main
   git remote add origin https://github.com/<YOUR_USERNAME>/news24.git
   git push -u origin main
   ```

2. **Import to Vercel**:
   - Go to [vercel.com](https://vercel.com) and click **Add New...** -> **Project**.
   - Import your `news24` repository.
   - Vercel automatically detects `vercel.json` and configures:
     - **Build Command**: `npm run vercel-build`
     - **Output Directory**: `client/dist`

3. **Add Environment Variables in Vercel**:
   In the Vercel project configuration, add:
   | Variable | Value | Description |
   | :--- | :--- | :--- |
   | `DATABASE_URL` | `postgresql://...` | Your Cloud PostgreSQL connection string (Neon/Supabase) |
   | `NODE_ENV` | `production` | Production mode |
   | `JWT_SECRET` | *(Any random 32+ character string)* | Secret for auth tokens |
   | `RAZORPAY_KEY_ID` | `rzp_test_...` *(or leave dummy for test mode)* | Razorpay key |
   | `RAZORPAY_KEY_SECRET`| *(your razorpay secret)* | Razorpay secret |

4. **Click Deploy!**
   - Vercel will install dependencies, run `npm run vercel-build` (which configures Prisma for Postgres and builds the Vite frontend), and deploy!

5. **Initialize Database Tables & Demo Data**:
   After your cloud Postgres URL is ready, run this command locally with your cloud `DATABASE_URL` to create tables and seed 27 articles and demo accounts:
   ```bash
   # In your terminal (replace with your Neon/Supabase DATABASE_URL):
   $env:DATABASE_URL="postgresql://user:pass@ep-cool.neon.tech/neondb?sslmode=require"
   npm run db:push
   npm run db:seed
   ```
   *All 27 articles, 6 categories, and all 7 demo accounts will now be live in your cloud database!*

---

## Method 2: Deploy via Vercel CLI

If you have the `vercel` CLI installed:
1. Run in the project root:
   ```bash
   npm i -g vercel
   vercel
   ```
2. Follow the prompts:
   - Set up and deploy: **Yes**
   - Which scope: *(select your account)*
   - Link to existing project: **No**
   - Project name: `news24-network`
   - In which directory is your code located: `./`
3. Add environment variables:
   ```bash
   vercel env add DATABASE_URL
   vercel env add JWT_SECRET
   vercel env add NODE_ENV
   ```
4. Deploy to production:
   ```bash
   vercel --prod
   ```

---

## Verifying Deployment

Once deployed, visit your Vercel URL (e.g. `https://news24-network.vercel.app`):
- **Health Check**: `https://your-domain.vercel.app/api/health`
- **Homepage**: `https://your-domain.vercel.app`
- **Newsroom CMS**: `https://your-domain.vercel.app/admin`
- **Sign In**: `https://your-domain.vercel.app/login`
