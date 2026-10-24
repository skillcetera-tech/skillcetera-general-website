---
name: skillcetera-frontend
description: Xây hoặc sửa giao diện Skillcetera với section ngữ nghĩa, điều hướng, dữ liệu sự kiện và bố cục responsive sẵn sàng cho motion.
---

# Skillcetera frontend

Read repo-root `AGENTS.md`, the relevant storyboard in `DESIGN_PLAN.md` and any completed design/content handoff. Inspect the real app structure and dependencies before choosing code paths. The proposed Next.js/React stack is a starting point; preserve a suitable existing stack.

## Section and data contract

Agree stable section IDs, data fields and motion wrappers/refs with the lead. Use one content source and one semantic rendering tree. Keep all seven projects reachable; render normal document flow before adding animations.

Own section markup, responsive layout, navigation and controls. Expose explicit hooks to the motion owner without duplicating visible content into inaccessible slideshow layers. Keep a stable content anchor for each chapter that can land at its readable state.

Consume the design tokens rather than scattering hex colors. Consume event status and source-aware content instead of calculating a new season from the current date. Never render a misleading registration link from an unknown state. A missing destination should not become a dead button.

## Implementation choices

- For Next.js, keep static content server-rendered and scope client code to interactive leaves. Load local font files or the framework's supported font path, keeping Vietnamese glyphs.
- Give images explicit dimensions/aspect ratios and descriptive alt text where meaningful. Load the main image promptly; defer below-fold images and video embeds.
- Navigation, year selection and CTA controls work with keyboard and touch. Preserve focus visibility, semantic headings, menu close behavior and meaningful link text.
- Allow document height to grow for mobile, low-height displays and zoom. A viewport-sized composition must not crop its copy or CTA.
- Keep content accessible before JavaScript and when reduced motion is enabled. Coordinate focus/visibility and anchor behavior with motion; never hide an entire content section as the permanent default.
- Use existing packages and component conventions. Send new dependency or shared-type proposals to the lead if those files belong to someone else.

## Validate the requested change

Use existing build, type and lint commands when available. Check the relevant interactive flow and changed breakpoints with actual browser tools when available. Add focused tests for meaningful behavior such as event-state CTA rules or menu interaction when warranted, rather than tests that only mirror markup.

For a plan-only task, produce the component/data contract without scaffolding the application. For implementation, return assigned file changes, integration hooks, checks actually run, and remaining runtime gaps.
