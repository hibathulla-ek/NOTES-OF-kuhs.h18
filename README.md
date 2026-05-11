# Rizvan got acccess
# KUHS BSc MLT Notes Portal

KUHS BSc MLT Notes Portal is a React, Vite, Tailwind CSS, and Supabase app for publishing and searching BSc MLT study notes by topic, subject, year, and paper. It includes a public search experience plus a lightweight admin panel for adding, editing, hiding, and deleting note records that link to Google Drive files.

## Prerequisites

- Node.js 18 or newer
- Supabase account
- Google account for hosting note files in Google Drive

## Environment Variables

Create a `.env.local` file in the project root:

| Variable | Description | Example |
| --- | --- | --- |
| `VITE_SUPABASE_URL` | Supabase project URL | `https://your-project.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anon public key | `your_anon_key` |
| `ADMIN_PASSWORD` | Server-only password used by the admin login API | `change_this_password` |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only Supabase key used by Vercel API functions for admin reads and writes | `your_service_role_key` |
| `VITE_ADMIN_API_BASE_URL` | Optional local-only API base URL when using Vite without Vercel functions | `https://your-app.vercel.app` |

## Supabase Setup

1. Create a new Supabase project.
2. Open the SQL Editor in Supabase.
3. Run the contents of `schema.sql`.
4. Confirm Row Level Security is enabled on the `notes` table.
5. Run `seed.sql` if you want to load the sample note records.
6. Keep the public RLS policy limited to active-note reads. Admin reads and writes go through Vercel API functions using `SUPABASE_SERVICE_ROLE_KEY`, which must never be exposed in browser code.

## Local Development

```bash
npm install
npm run dev
```

Then open the local URL printed by Vite.

## Deployment

1. Push the project to GitHub.
2. Import the repository in Vercel.
3. Add `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`, `ADMIN_PASSWORD`, and `SUPABASE_SERVICE_ROLE_KEY` in Vercel project environment variables.
4. Deploy.

## Adding Notes

1. Open `/admin`.
2. Log in with `ADMIN_PASSWORD`.
3. Choose Add Note.
4. Fill the note details.
5. Paste a Google Drive shareable link that starts with `https://drive.google.com`.
6. Save the note.
