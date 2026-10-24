---
name: skillcetera-design
description: Thiết kế storyboard, bố cục responsive và nhận diện trắng đen cho Skillcetera, với ESC xanh dương và TEDx đỏ.
---

# Skillcetera design

Read repo-root `AGENTS.md` and the relevant parts of `DESIGN_PLAN.md`. Treat user choices as constraints and proposed values in the plan as starting points. Use the actual content and assets available for the requested deliverable.

## Visual direction

- Use a white/black identity, large readable sans-serif type, real event photography and intentional whitespace. Aim for roughly 85% neutral UI; this is a composition guide, not an image color quota.
- ESC owns the blue accent; TEDx owns red. Preserve both even if a generic frontend skill prefers one accent. Start with the proposed ESC blue #2457FF until the actual ESC kit establishes its value.
- Follow the current official TEDx assets and guidance. The plan records #EB0028; verify brand requirements when replacing assets. Keep its full event name, proportions and clear space, with the official logo on solid white or black.
- Use Be Vietnam Pro as the proposed site font; check Vietnamese accents and actual line breaks. Preserve original logo typography.
- Keep a coherent radius scale and palette. Show different composition families across chapters rather than repeating identical feature cards.
- Use real club photographs for documentary content. Label missing assets in design notes. Generative artwork is optional decorative material, never documentary evidence.

## Storyboard and handoff

Keep the seven-chapter narrative in the current plan unless the user changes it: opening, club/mission, ESC, TEDx, other projects, people/impact, join/contact. Give ESC and TEDx comparable visual prominence.

For each changed chapter specify:

- Exact headline, reading hierarchy, image choice and CTA destination/state.
- Desktop composition, phone composition and behavior when text exceeds the viewport.
- Static readable state and the visual change that introduces/exits it.
- Which properties motion may animate, with stable logo and CTA treatment.

Design a useful static page first. The motion specialist owns scroll timing; collaborate on the visual intent instead of independently building another animation system. For low-height screens, long copy and large text, allow the section to grow naturally.

The light storyboard is the main presentation. If the task includes dark mode, map semantic tokens consistently across the page. Preparing token alternatives does not require adding an unsolicited theme selector.

For a design-only request, deliver storyboard/specification and asset needs. Generate images or write Figma files only when relevant to the requested output, using the applicable available skill. For implementation, edit only assigned design/token files and hand layout changes to the frontend owner.

Return the composition decisions, reusable tokens, responsive behavior, asset gaps and files changed. Do not treat visual design preferences as requirements to obtain new user approval for every routine choice.
