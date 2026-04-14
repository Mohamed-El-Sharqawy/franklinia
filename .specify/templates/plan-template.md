# Implementation Plan: [FEATURE]

**Branch**: `[###-feature-name]` | **Date**: [DATE] | **Spec**: [link]
**Input**: Feature specification from `/specs/[###-feature-name]/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

[Extract from feature spec: primary requirement + technical approach from research]

## Technical Context

<!--
  ACTION REQUIRED: Replace the content in this section with the technical details
  for the project. The structure here is presented in advisory capacity to guide
  the iteration process.
-->

**Language/Version**: [e.g., Python 3.11, Swift 5.9, Rust 1.75 or NEEDS CLARIFICATION]  
**Primary Dependencies**: [e.g., FastAPI, UIKit, LLVM or NEEDS CLARIFICATION]  
**Storage**: [if applicable, e.g., PostgreSQL, CoreData, files or N/A]  
**Testing**: [e.g., pytest, XCTest, cargo test or NEEDS CLARIFICATION]  
**Target Platform**: [e.g., Linux server, iOS 15+, WASM or NEEDS CLARIFICATION]
**Project Type**: [e.g., library/cli/web-service/mobile-app/compiler/desktop-app or NEEDS CLARIFICATION]  
**Performance Goals**: [domain-specific, e.g., 1000 req/s, 10k lines/sec, 60 fps or NEEDS CLARIFICATION]  
**Constraints**: [domain-specific, e.g., <200ms p95, <100MB memory, offline-capable or NEEDS CLARIFICATION]  
**Scale/Scope**: [domain-specific, e.g., 10k users, 1M LOC, 50 screens or NEEDS CLARIFICATION]

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [ ] **I. Architectural Purity**: No direct inter-app imports; shared logic in `packages/`
- [ ] **II. Sub-System Consistency**: Backend modules follow `src/modules/[feature]`; frontend parity maintained; shared UI components extracted
- [ ] **III. Modest Fashion Domain Protocols**: AED currency only; AR/EN translations provided; Stripe standard only (no Connect); base categories constrained (Abaya/Jalabiya/Modest Dress); fashion attributes are mandatory structured data; occasions are first-class entity
- [ ] **IV. Fashion-First Data Architecture**: FashionAttributes entity exists (not flat on Product); Product-Occasion N:N via join entity; Collections support filter configs; Variants include fitAdjustment; narrative separated from structured attributes
- [ ] **V. Occasion-Driven Discovery**: Occasion entity with slug; occasion as primary filter dimension; occasion landing pages supported; browsing prioritizes style/occasion/fabric over SKU
- [ ] **VI. Media & Search**: Cloudinary for all media assets; fashion-aware search (fabric, occasion, style, silhouette); search analytics tracked in backend
- [ ] **VII. Structural Cleanliness**: Cross-app types/utils extracted to packages; no duplicated business logic

## Project Structure

### Documentation (this feature)

```text
specs/[###-feature]/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output (/speckit.plan command)
├── data-model.md        # Phase 1 output (/speckit.plan command)
├── quickstart.md        # Phase 1 output (/speckit.plan command)
├── contracts/           # Phase 1 output (/speckit.plan command)
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)
<!--
  ACTION REQUIRED: Replace the placeholder tree below with the concrete layout
  for this feature. Delete unused options and expand the chosen structure with
  real paths (e.g., apps/admin, packages/something). The delivered plan must
  not include Option labels.
-->

```text
# [REMOVE IF UNUSED] Option 1: Single project (DEFAULT)
src/
├── models/
├── services/
├── cli/
└── lib/

tests/
├── contract/
├── integration/
└── unit/

# [REMOVE IF UNUSED] Option 2: Web application (when "frontend" + "backend" detected)
backend/
├── src/
│   ├── models/
│   ├── services/
│   └── api/
└── tests/

frontend/
├── src/
│   ├── components/
│   ├── pages/
│   └── services/
└── tests/

# [REMOVE IF UNUSED] Option 3: Mobile + API (when "iOS/Android" detected)
api/
└── [same as backend above]

ios/ or android/
└── [platform-specific structure: feature modules, UI flows, platform tests]

# [REMOVE IF UNUSED] Option 4: Monorepo (apps/ + packages/ — Capella default)
apps/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   └── [feature]/
│   │   │       ├── routes.ts
│   │   │       ├── service.ts
│   │   │       └── ...
│   │   └── ...
│   └── prisma/
├── marketing/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   └── ...
│   └── ...
└── cms/
    ├── src/
    │   ├── components/
    │   ├── pages/
    │   └── ...
    └── ...

packages/
├── shared-types/       # Interfaces, enums, Zod schemas
└── shared-utils/       # Utility functions, constants, validators
```

**Structure Decision**: [Document the selected structure and reference the real
directories captured above]

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| [e.g., 4th project] | [current need] | [why 3 projects insufficient] |
| [e.g., Repository pattern] | [specific problem] | [why direct DB access insufficient] |
