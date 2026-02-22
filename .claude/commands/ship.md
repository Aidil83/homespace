---
allowed-tools: Bash(npx eslint:*), Bash(git add:*), Bash(git status:*), Bash(git diff:*), Bash(git commit:*), Bash(git push:*), Bash(git branch:*), Bash(git ls-files:*), Bash(git log:*), Bash(git rev-parse:*), Read, Glob, Grep
description: Lint, review, commit, and push changes
---

## Pre-flight

- Current branch: !`git branch --show-current`
- Git status: !`git status --short`
- Changed files (unstaged): !`git diff --name-only`
- Changed files (staged): !`git diff --cached --name-only`
- Untracked files: !`git ls-files --others --exclude-standard`
- Recent commits (for message style): !`git log --oneline -5`
- Remote tracking: !`git rev-parse --abbrev-ref --symbolic-full-name @{u} 2>/dev/null || echo "no upstream"`

User arguments: $ARGUMENTS

## Your task

Follow these steps IN ORDER. Do not skip steps. Stop and ask the user if any step fails or if the review finds issues.

### Step 1: Check for changes

Collect ALL changed files from the pre-flight output (unstaged + staged + untracked).
If there are NO changed files at all, tell the user "Nothing to ship — no changes detected." and stop.

### Step 2: ESLint --fix

From the changed files, filter to only lintable extensions: `.ts`, `.tsx`, `.js`, `.jsx`, `.mjs`.
Exclude files in `node_modules/`, `.next/`, `src/generated/`.

If there are lintable files, run:
```
npx eslint --fix <file1> <file2> ...
```

Pass all files in a single command. If ESLint returns errors that `--fix` cannot auto-resolve, report them to the user and ask: "ESLint found errors that can't be auto-fixed. Should I fix them, or ship anyway?"

If there are no lintable files (e.g., only `.md` or `.json` changed), skip this step silently.

### Step 3: Code review

Read the full diff of what will be committed:
- `git diff` (unstaged changes including ESLint fixes)
- `git diff --cached` (already staged changes)
- Read any new untracked files

Review for:
- Obvious bugs or logic errors
- Hardcoded secrets, API keys, or credentials
- `console.log` statements that should be removed
- Unused imports or variables
- Missing error handling for critical paths
- Type safety issues (`any` types that should be specific)

If issues are found, list them with file names and line numbers. Ask: "I found these issues. Should I fix them before shipping, or proceed as-is?"

If no issues, state "Code review passed." and continue.

### Step 4: Stage files

Stage all changed and new files by name. Rules:
- NEVER use `git add -A` or `git add .`
- NEVER stage `.env` files or anything that looks like credentials
- Stage each file explicitly by path

### Step 5: Commit

Write a commit message following the project's style:
- Imperative mood ("Add", "Fix", "Update", not "Added" or "Adds")
- First line under 72 characters, descriptive of WHAT and WHY
- No conventional commit prefixes (no "feat:", "fix:" etc.)
- If changes are complex, add a blank line then a short body paragraph
- Always end with: `Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>`

Use a HEREDOC:
```bash
git commit -m "$(cat <<'EOF'
Commit message here

Co-Authored-By: Claude Opus 4.6 <noreply@anthropic.com>
EOF
)"
```

### Step 6: Push

If the branch has no upstream (pre-flight shows "no upstream"), push with:
```bash
git push -u origin <branch-name>
```

Otherwise:
```bash
git push
```

### Done

Summarize what was shipped:
- Files changed (count)
- Lint issues fixed (if any)
- Review issues found (if any)
- Commit message used
- Branch pushed to
