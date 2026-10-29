# Portfolio Website Generator

A beginner-friendly full-stack app that lets you create a portfolio preview, download it as HTML, and save/retrieve portfolios in Supabase PostgreSQL.

## Requirements
- Node.js (LTS)
- VS Code
- A Supabase project
- Git (optional, for GitHub)

## 1. Install dependencies
Open this folder in VS Code and run:

```bash
npm install
```

## 2. Configure Supabase
1. Create a project at https://supabase.com/
2. Open the SQL Editor and run the contents of `supabase/schema.sql`.
3. Find your Project URL and server-side secret key in the Supabase project settings.
4. Copy `.env.example` to a new file named `.env`.
5. Put your actual values in `.env`. Never share or commit `.env`.

Example:
```env
PORT=3000
SUPABASE_URL=https://YOUR_PROJECT_ID.supabase.co
SUPABASE_SECRET_KEY=YOUR_SECRET_KEY
```

The secret key must stay on the server and must never be added to frontend JavaScript.

## 3. Run the app
```bash
npm run dev
```
Open http://localhost:3000 in your browser.

If you change `app.js`, `node --watch` restarts the server. Press `Ctrl+C` to stop it.

## Features
- Form for personal information, skills, education, projects, and social links
- Portfolio preview
- Download generated portfolio as a standalone HTML file
- Save portfolio data to Supabase
- Load, open, and delete saved portfolio records

## Notes
- The preview and HTML download work without Supabase.
- Saving/loading/deleting requires correct Supabase credentials and the SQL schema.
- This starter app is for local learning. Before public deployment, add authentication, per-user authorization, rate limiting, and stronger validation. Do not expose the database secret key in frontend code.
- The starter API currently has no authentication. Do not deploy it publicly as-is.
