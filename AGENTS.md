# KUHS MLT Notes Portal — Agent Instructions

## Stack
- React 18 + Vite + Tailwind CSS (utility classes only, no custom CSS files)
- Supabase JS v2 client for all database operations
- react-router-dom v6 for routing
- lucide-react for icons

## Rules
- Never use inline styles. Tailwind classes only.
- All Supabase calls must handle loading and error states.
- All forms must disable the submit button during submission.
- Environment variables are prefixed VITE_ and read via import.meta.env
- Mobile-first. Every component must work on a 375px screen.
- After every file creation or edit, run: npm run build
- If the build fails, fix all errors before proceeding.

## File structure
src/
  lib/supabase.js       ← Supabase client init
  lib/constants.js      ← shared arrays: SUBJECTS, YEARS, PAPERS, SUBJECT_COLORS
  components/           ← shared UI components (Navbar, NoteCard, Badge, etc.)
  pages/                ← one file per route
  context/AdminAuth.jsx ← admin auth context
  App.jsx               ← router setup
