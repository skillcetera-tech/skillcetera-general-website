---
name: skillcetera-review
description: Rà soát kế hoạch hoặc website Skillcetera về độ đúng nội dung, nhận diện, thao tác cuộn, mobile và khả năng tiếp cận bằng bằng chứng phù hợp.
---

# Skillcetera review

Read repo-root `AGENTS.md`, the user's acceptance scope, and the relevant plan/content records. Identify the actual artifact: plan, code, local preview or published page. Choose checks that can establish something about that artifact.

## Project-specific checks

- White/black remains the shared identity; ESC blue and TEDx red stay recognizable and similarly prominent. Official logos are preserved.
- The three missions and seven projects remain reachable. Event themes retain their years; claims, numbers and CTA states agree with their source periods. Known source contradictions are not silently promoted into current facts.
- Content reads in logical order. Each scene has a stable reading state and reachable CTA; anchors, Tab, reverse scroll and fast scroll do not leave users on hidden or blocked content.
- Mobile and low-height screens grow with content. Reduced motion and the unenhanced page retain the same essential content and actions.
- Inspect the changed controls, focus, contrast, images and responsive behavior. Suggested viewports include 1366×768, 390×844 and a low-height/landscape case; adapt to the actual change.

## Evidence rules

Use the browser, screenshots, console/network inspection, build checks or focused tests that are actually available and relevant. Report each important check as passed, failed, or not run, with its environment/evidence. Source inspection is not browser execution.

LCP/INP/CLS in the plan are targets. A Lighthouse lab run is not field-user evidence; it cannot establish real-user INP by itself. Report measured metrics with their method and mark unmeasured targets as such.

For each finding give impact, location, reproduction or source evidence, expected behavior and the responsible role. Separate publication blockers (such as a false live CTA or unreadable content) from improvements. If a tool or live artifact is absent, complete the review possible from available inputs and state the narrow remaining gap.

## Work boundaries

Default to review and evidence output. Do not edit application files simultaneously with their owners. If asked to fix, have the lead assign specific files, then verify the affected behavior after the change. Avoid broad test rewrites or preference-only redesigns for a small patch.

For a request to design agents, skills or plans, review that material only. Do not scaffold an app just to obtain a browser target. Deliver the findings and checks actually performed; approval or deployment is a separate action governed by existing user authorization.
