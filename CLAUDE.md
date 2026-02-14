# Project Rules

## Search Tools
- Never use `find`, `grep`, or `rg` via Bash for file/content searches. Always use the dedicated Glob and Grep tools instead. This applies to all agents including subagents.

## Permissions
- Only prompt for permission on destructive or irreversible operations (deleting files, dropping data, force-pushing, etc.).
- Read-only and search operations should never require permission prompts.
