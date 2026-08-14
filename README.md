# Marc Mendoza Portfolio Stack

A TypeScript, React, and Vite-powered one-page portfolio with a private Supabase project studio.

## Local setup

1. Install dependencies with `npm install`.
2. Start the local site with `npm run dev`.
3. Open `http://localhost:3000` for the portfolio and `/admin` for the studio.

The public portfolio uses the eight included projects when Supabase is not configured.

## Connect Supabase

1. Create a Supabase project.
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL Editor.
3. Create your private admin in Authentication → Users.
4. Run the final commented allowlist query in `supabase/schema.sql`, replacing `YOUR_ADMIN_EMAIL` with that user’s email.
5. Copy `.env.example` to `.env.local` and add the project URL and anon key.
6. Restart the local development server, sign in at `/admin`, and click **Load starter projects**.

The anon key is designed to be public. Security comes from the included Row Level Security policies: visitors can only read published projects, while only explicitly allowlisted admin users can manage content and preview files.
