# Agent Instructions for Jules

## Core Directives
1. **Target Scope Discipline:** Only modify or create files specified in the task scope. Never create catch-all bucket files (`utils`, `helpers`, `common`).
2. **Preserve Interfaces:** Public signatures, exports, and component props are immutable unless explicitly requested.
3. **Regression Guardrails:** All pre-existing unit and integration tests must pass unmodified. Never edit, weaken, or delete existing test files.

## Frontend Verification & Visual Acceptance Criteria (VAC)
1. **Prohibition of Generic Screenshots:**
   - Under NO circumstances is a screenshot of the root landing page (`/`), welcome screen, or top-level lobby considered valid visual confirmation for a component, game, or state task.
   - Do not claim visual completion based solely on the absence of dev server crash errors.
2. **Direct State Navigation:**
   - Always navigate directly to the specific route, query parameter, or component harness specified in the task's **Visual Acceptance Criteria (VAC)**.
   - If user interaction or timer delay is required (e.g., clicking Start, waiting for mole popup, toggling language), execute the interaction to achieve the target state before capturing the verification frame.
3. **Deterministic DOM & Style Verification:**
   - In addition to any visual capture, verify visual and interactive states deterministically via unit/DOM tests (e.g., asserting Tailwind classes, accessibility attributes, or computed styles).
4. **Visual Evidence in Pull Requests:**
   - When submitting a PR for a frontend task, confirm the exact visual state in the PR description, referencing the elements matched against the task's VAC.
