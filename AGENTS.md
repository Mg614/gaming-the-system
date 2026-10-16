# Repository collaboration rules

- This is a collaborative repository. Preserve collaborator changes.
- Never force-push, rewrite Git history, or silently revert unfamiliar changes.
- Never discard unknown work. Report merge conflicts rather than resolving them
  destructively.
- Read `docs/collaboration/INTEGRATION_CONTRACT.md`, `SOURCE_OF_TRUTH.md`, and
  `WORKFLOW.md` in that directory before changing system boundaries.
- Do not duplicate gameplay rules in cinematic code or cinematic implementation
  in gameplay code. Communicate through `src/shared/contracts/`.
- Do not modify completed scenes unless required by the current task. Keep the
  existing opening in place unless an agreed task requires a safe migration.
- Run relevant checks before committing. Push only the current feature branch;
  never automatically merge into `main`.
- Explain the plan before code changes. Afterwards show the diff, list changed
  files, explain why each changed, and report validation.
- The user is a coding beginner: explain technical terms in plain language.
  When asking them to run a command, explain its purpose, expected success output,
  and which error text to send back. Prefer small, simple, stable steps.
