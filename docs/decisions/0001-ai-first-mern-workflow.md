# ADR 0001: AI-First MERN Workflow

## Status

Accepted

## Context

The project will be built as a large full-stack university club management product through AI-assisted development. To make that reliable, the repository needs durable context that agents can read before making changes.

## Decision

Use a TypeScript MERN workspace with:

- `frontend/` and `backend/` as sibling apps.
- Bit CRM-inspired frontend page slices.
- Module-first Express/Mongoose backend boundaries.
- Tailwind CSS plus custom utility components for UI.
- Project docs that define roadmap, domain model, API contract, UI system, demo data, and AI workflow.
- Quality checks through TypeScript, ESLint, Prettier, and Vitest.

## Consequences

- Future work should start by reading the project docs, not by guessing product behavior.
- Features should be built as vertical slices instead of disconnected frontend/backend fragments.
- Docs must be updated when product or architecture decisions change.
