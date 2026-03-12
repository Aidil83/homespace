# Project Rules

## Search Tools
- Never use `find`, `grep`, or `rg` via Bash for file/content searches. Always use the dedicated Glob and Grep tools instead. This applies to all agents including subagents.

## Permissions
- Only prompt for permission on destructive or irreversible operations (deleting files, dropping data, force-pushing, etc.).
- Read-only and search operations should never require permission prompts.

## Local Dev Database Setup
Local development uses a local PostgreSQL database to avoid touching production. If the local database is not set up yet on this machine, follow these steps:

1. **Install PostgreSQL:**
   - macOS: `brew install postgresql@17 && brew services start postgresql@17`
   - Windows: `winget install PostgreSQL.PostgreSQL.17` or download from https://www.postgresql.org/download/windows/
   - Linux: `sudo apt install postgresql && sudo systemctl start postgresql`

2. **Create the dev database:**
   - macOS/Linux: `createdb homespace_dev`
   - Windows: `createdb -U postgres homespace_dev`

3. **Create `.env.local`** (if it doesn't exist) with:
   ```
   DATABASE_URL="postgresql://<username>@localhost:5432/homespace_dev"
   ```
   - macOS: username is your system username (run `whoami`)
   - Windows: username is typically `postgres` with password set during install

4. **Apply migrations:** `npx prisma migrate deploy`

The `.env.local` file overrides `.env` so production credentials are never used locally. Vercel production deploys use their own env vars and are unaffected.
