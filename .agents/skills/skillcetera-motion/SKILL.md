---
name: skillcetera-motion
description: Thiết kế hoặc triển khai slideshow theo cuộn cho Skillcetera, tập trung ESC/TEDx, có trạng thái đọc ổn định và fallback mobile/reduced motion.
---

# Skillcetera motion

Read repo-root `AGENTS.md`, `DESIGN_PLAN.md` section 4 and the actual section contract. Match a planning request with a motion specification; implement only when requested. Inspect installed libraries before using their APIs.

## Choreography

- Keep native vertical scrolling. Map scene progress to scroll so the user can stop, reverse, or jump using navigation.
- Concentrate pinning on ESC and TEDx. Begin with two states per event: introductory poster and readable information. Trial rhythm: 20% entrance, 60% reading, 20% exit across roughly 1.5–2 viewport heights of scroll. These are tuning values, not fixed waiting times.
- ESC can use a few blue bars to introduce the photo and suggest speech rhythm. TEDx can use red framing to lead toward the speaker. Keep official logos unchanged and CTAs stable in the reading phase.
- Use transform and opacity for the primary transitions; keep image scaling subtle. Prefer one dominant movement at a time. Other chapters need only light reveals.
- Distinguish scrub distance from the duration of hover/reveal animations. Do not force one wheel gesture to equal one slide or intercept wheel/touch to impose a slideshow.

## Integration

The frontend owner provides semantic content, IDs and wrappers/refs. Animate only the assigned elements. If a new wrapper is needed, request it or obtain a file handoff from the lead; do not build a second section tree.

If using GSAP, use ScrollTrigger timelines and scoped cleanup with matchMedia/context. Pin at the agreed viewport boundary, animate the inner content rather than moving the pin trigger, and refresh measurements after relevant font/image/viewport changes. Avoid reacting to every scroll frame through React state.

Anchor links must land in a readable state even inside a pinned chapter. Tab focus must never remain on hidden content: reveal it and bring it into view or use a layout that avoids that hidden focus state. Reversing scroll restores the previous scene without leaving overlays blocking controls. Integrate those behaviors with the frontend navigation owner.

## Fallbacks

- On narrow or low-height screens, use normal vertical flow and light reveal, with content height determined by its text. Test fit rather than using width as the only condition.
- For prefers-reduced-motion, remove pin/scrub/parallax and show the same complete content. Restore any styles or visibility modified by the animated version when the setting changes.
- Keep the unenhanced page readable if JavaScript is delayed or unavailable. Ensure the visible state exists before setting animation starting values.
- Users control video/audio playback. Idle looping effects are optional only when they serve a clear purpose and can be stopped where needed.

## Evidence and handoff

Check forward/backward scroll, fast scrolling, anchors, keyboard focus, resize, low-height layout and reduced motion with a browser when available. Without browser access, provide the timeline/code and a precise list of behavior still unverified; do not claim smoothness or device compatibility from static inspection.

Return the scene states, assigned files, integration needs and measurements actually made. Preserve palette and content decisions; resolve changes with their owners.

Primary API references when needed: [ScrollTrigger](https://gsap.com/docs/v3/Plugins/ScrollTrigger/) and [matchMedia](https://gsap.com/docs/v3/GSAP/gsap.matchMedia()/).
