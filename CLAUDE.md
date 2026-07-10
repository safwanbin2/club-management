# Claude Project Instructions

Read these project files before substantial work:

@AGENTS.md
@docs/agent-instructions.md
@docs/ai-workflow.md
@docs/university-club-management-system.md
@docs/roadmap.md
@docs/domain-model.md
@docs/api-contract.md
@docs/ui-system.md
@docs/design/stitch-source.md
@docs/design/page-map.md
@docs/design/implementation-notes.md
@docs/feature-slices.md
@docs/feature-status.md
@.claude/skills/architecture/SKILL.md

For frontend work, also read:

@.claude/skills/architecture/references/frontend-structure.md

For backend work, also read:

@.claude/skills/architecture/references/backend-structure.md

For full-stack feature work, also read:

@.claude/skills/architecture/references/feature-blueprint.md

Build one meaningful vertical slice at a time. Use Ant Design plus Tailwind with shared theme tokens. Before frontend UI work, inspect the closest Stitch screenshots under `docs/design/stitch-export/` and derive missing screens from `docs/design/page-map.md`. Do not hard-code brand colors. Remove `.gitkeep` when adding real tracked files to a directory. Run `pnpm check` after meaningful changes and `pnpm build` after build-impacting changes.
