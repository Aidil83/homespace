---
allowed-tools: Bash(npx tsc:*), Bash(npx eslint:*), Bash(npx next build:*), Bash(npx prisma migrate:*), Bash(npx prisma db:*), Bash(vercel:*), Bash(git status:*), Bash(git diff:*), Bash(git log:*), Bash(git rev-parse:*), Bash(grep:*), Read, Glob, Grep
description: Run pre-deployment checks and deploy to Vercel production
---

## Pre-flight

- Current branch: !`git branch --show-current`
- Git status: !`git status --short`
- Remote tracking: !`git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "no upstream"`
- Last commit: !`git log --oneline -1`
- Local vs remote: !`git rev-list --left-right --count HEAD...@{u} 2>/dev/null || echo "unknown"`

User arguments: $ARGUMENTS

## Your task

Run ALL pre-deployment checks in order. Stop and report to the user if any step fails.

### Step 1: Git cleanliness

Check pre-flight output. Fail if:
- There are uncommitted changes (staged, unstaged, or untracked source files)
- Local branch is ahead of remote (unpushed commits)

If dirty, tell the user: "Working tree is not clean. Run `/ship` first, then `/deploy`." and stop.

### Step 2: Type check

Run:
```
npx tsc --noEmit
```

If there are type errors, list them and stop. Ask: "Type errors found. Fix before deploying?"

### Step 3: Lint

Run:
```
npx eslint src/
```

If there are lint errors (not warnings), list them and stop. Ask: "Lint errors found. Fix before deploying?"

### Step 4: Production build

Run:
```
npx next build --webpack
```

This is the most important check — it catches SSR errors, missing imports, and build-time failures that dev mode hides.

If the build fails, show the error output and stop. Ask: "Build failed. Want me to investigate?"

### Step 5: Environment variable check

**5a. Check for missing env vars:**

Scan the codebase for required env vars:
```
grep -roh 'process\.env\.\w\+' src/ | sort -u
```

Then check which of those are set in Vercel production:
```
vercel env ls production 2>/dev/null
```

Compare the two lists. If any required env vars are missing from Vercel production, warn the user with the list of missing vars. Ask: "These env vars are missing in Vercel production. Deploy anyway?"

If the `vercel env ls` command fails, note it as a warning but don't block.

**5b. Validate env var values:**

Pull production env vars and check for malformed values:
```
vercel env pull .env.prod-validate --environment production 2>/dev/null
```

Inspect each value for common issues:
- Extra quotes wrapping the value (e.g., `""value"`)
- Trailing `\n` or whitespace
- Empty values for required vars
- URLs that don't start with `http://` or `https://`
- `DATABASE_URL` should use port `6543` (Supabase pooler) not `5432` (direct) for serverless

If any malformed values are found, list them and stop. Ask: "These env vars have malformed values. Fix before deploying?"

Clean up the temp file:
```
rm -f .env.prod-validate
```

### Step 6: Prisma migration check

Run:
```
npx prisma migrate status
```

If there are pending migrations that haven't been applied, warn the user: "There are pending database migrations. Deploy anyway, or apply them first?"

If the command fails (e.g., no DB connection), note it as a warning but don't block.

### Step 7: Deploy

All checks passed. Deploy to production:
```
vercel --prod
```

Wait for it to complete. If it fails, show the error output.

### Done

Summarize:
- Type check: ✓/✗
- Lint: ✓/✗
- Build: ✓/✗
- Env vars (presence): ✓/⚠/✗
- Env vars (validation): ✓/⚠/✗
- Migrations: ✓/⚠/✗
- Deploy URL: (from vercel output)
- Status: Deployed / Failed
