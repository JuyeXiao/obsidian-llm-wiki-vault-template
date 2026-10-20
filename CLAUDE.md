# Claude Code entrypoint

@AGENTS.md

Read `AGENTS.md` for the shared vault rules and skill registry, then the requested skill. Claude discovers the generated mirror at `.claude/skills/`; edit only `.agents/skills/` and regenerate with `python SYSTEM/SCRIPTS/sync_agent_skills.py --write`.

`.claude/settings.json` configures the PostToolUse warning hook. It carries no permissions, credentials or model settings. Start Claude in this vault's Git working tree; see `SYSTEM/DOCS/agent-workflows.md` for dependencies, launch checks and the distinction between direct hook tests and actual agent delivery. Explicit session authorization remains valid; content changes never imply Git operations.
