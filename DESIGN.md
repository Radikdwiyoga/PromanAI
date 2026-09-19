---
name: Obsidian Sentinel
colors:
  surface: '#0f131c'
  surface-dim: '#0f131c'
  surface-bright: '#353943'
  surface-container-lowest: '#0a0e17'
  surface-container-low: '#181b25'
  surface-container: '#1c1f29'
  surface-container-high: '#262a34'
  surface-container-highest: '#31353f'
  on-surface: '#dfe2ef'
  on-surface-variant: '#bbcabf'
  inverse-surface: '#dfe2ef'
  inverse-on-surface: '#2c303a'
  outline: '#86948a'
  outline-variant: '#3c4a42'
  surface-tint: '#4edea3'
  primary: '#4edea3'
  on-primary: '#003824'
  primary-container: '#10b981'
  on-primary-container: '#00422b'
  inverse-primary: '#006c49'
  secondary: '#45dfa4'
  on-secondary: '#003825'
  secondary-container: '#00bd85'
  on-secondary-container: '#00452e'
  tertiary: '#68dba9'
  on-tertiary: '#003825'
  tertiary-container: '#3eb686'
  on-tertiary-container: '#00422c'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#6ffbbe'
  primary-fixed-dim: '#4edea3'
  on-primary-fixed: '#002113'
  on-primary-fixed-variant: '#005236'
  secondary-fixed: '#68fcbf'
  secondary-fixed-dim: '#45dfa4'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#005137'
  tertiary-fixed: '#85f8c4'
  tertiary-fixed-dim: '#68dba9'
  on-tertiary-fixed: '#002114'
  on-tertiary-fixed-variant: '#005137'
  background: '#0f131c'
  on-background: '#dfe2ef'
  surface-variant: '#31353f'
typography:
  headline-xl:
    fontFamily: Inter
    fontSize: 40px
    fontWeight: '700'
    lineHeight: 48px
    letterSpacing: -0.02em
  headline-xl-mobile:
    fontFamily: Inter
    fontSize: 30px
    fontWeight: '700'
    lineHeight: 38px
    letterSpacing: -0.015em
  headline-lg:
    fontFamily: Inter
    fontSize: 32px
    fontWeight: '600'
    lineHeight: 40px
    letterSpacing: -0.02em
  headline-lg-mobile:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.01em
  headline-md:
    fontFamily: Inter
    fontSize: 24px
    fontWeight: '600'
    lineHeight: 32px
    letterSpacing: -0.015em
  headline-sm:
    fontFamily: Inter
    fontSize: 20px
    fontWeight: '600'
    lineHeight: 28px
    letterSpacing: -0.01em
  body-lg:
    fontFamily: Inter
    fontSize: 16px
    fontWeight: '400'
    lineHeight: 24px
    letterSpacing: -0.005em
  body-md:
    fontFamily: Inter
    fontSize: 14px
    fontWeight: '400'
    lineHeight: 20px
    letterSpacing: 0em
  body-sm:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '400'
    lineHeight: 18px
    letterSpacing: 0.005em
  code-lg:
    fontFamily: JetBrains Mono
    fontSize: 14px
    fontWeight: '500'
    lineHeight: 20px
    letterSpacing: 0em
  code-md:
    fontFamily: JetBrains Mono
    fontSize: 12px
    fontWeight: '500'
    lineHeight: 16px
    letterSpacing: 0.01em
  code-sm:
    fontFamily: JetBrains Mono
    fontSize: 10px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.02em
  label-md:
    fontFamily: Inter
    fontSize: 12px
    fontWeight: '600'
    lineHeight: 16px
    letterSpacing: 0.02em
  label-sm:
    fontFamily: JetBrains Mono
    fontSize: 11px
    fontWeight: '600'
    lineHeight: 14px
    letterSpacing: 0.04em
rounded:
  sm: 0.125rem
  DEFAULT: 0.25rem
  md: 0.375rem
  lg: 0.5rem
  xl: 0.75rem
  full: 9999px
spacing:
  gutter: 1rem
  gutter-desktop: 1.5rem
  margin: 1rem
  margin-desktop: 2rem
  space-xs: 0.25rem
  space-sm: 0.5rem
  space-md: 1rem
  space-lg: 1.5rem
  space-xl: 2.5rem
---

## Brand & Style

This design system establishes a high-precision, mission-critical operations environment tailored for enterprise SecOps, SREs, and cloud infrastructure engineers. The interface pairs industrial-grade telemetry with an authoritative cyber-command presence. It bridges high-density data visualization with executive clarity, communicating absolute uptime, deterministic latency, and impenetrable defense.

### Visual Movement: Cyber-Tactical Precision
The aesthetic blends technical brutalism's rigid functionalism with refined dark-mode glassmorphism and targeted tactical luminescence. Key characteristics:
- **Foundational Darkness:** Deep void slate backgrounds eliminate visual fatigue across extended shifts in low-light Network Operations Centers (NOCs) and Security Operations Centers (SOCs).
- **Sub-surface Radiance:** Targeted neon emerald glows highlight primary execution points, healthy telemetry states, and anomalous system behavior without washing out surrounding context.
- **Micro-Structured Layering:** Translucent frosted boundaries and razor-thin metallic strokes replace heavy drop shadows, producing a lightweight, cockpit-grade layout.
- **Engineered Legibility:** Strict distinction between natural language directives and raw telemetry/hex logs ensures zero cognitive ambiguity during incident response.

## Colors

The palette leverages a calibrated dark-spectrum gradient with precise, signal-driven emerald interventions. Every color tier satisfies WCAG 2.1 AAA or AA requirements against slate canvases.

### Palette Architecture
- **Base Canvas (`#090D16`):** The primary view-layer background; grounds telemetry without pure-black clipping.
- **Surface Elevation (`#0F172A`):** Standard container surface for monitoring panels, tabular grids, and node matrices.
- **Elevated Overlay (`#1E293B`):** Modal surfaces, popovers, segmented control trays, and floating command palettes.
- **Signal Primary (`#10B981`):** System normal, verified enterprise identities, active deployment pipelines, and primary operational triggers.
- **Signal Active/Highlight (`#34D399`):** Hover states, glow sources, active switch thumbs, and telemetry peaks.
- **Signal Deep Anchor (`#059669`):** Selected segmented tabs, active pill fills, and pressed interactions.
- **Structural Framing (`rgba(255, 255, 255, 0.08)` / `#1E293B`):** Ghost borders and frosted container perimeters providing crisp division under multi-window density.

### Operational State Tokens
- **Critical / Threat Alert:** `#F43F5E` (High-visibility crimson; strictly reserved for security breaches, hardware failures, and destructive operations).
- **Warning / Degraded:** `#F59E0B` (Amber alert; node throttling, impending certificate expirations).
- **Informational / Discovery:** `#38BDF8` (Cyan/sky blue; cluster reassignment, cloud-native auto-scaling events).
- **Muted Structural Text:** `#94A3B8` (Secondary metadata, inactive tabs, port indices).
- **High-Readability Text:** `#F8FAFC` (Primary titles, core telemetry metrics, high-priority system alerts).

## Typography

The type system splits functional workloads between **Inter** for operational interfaces, executive summaries, and navigational commands, and **JetBrains Mono** for all immutable infrastructure artifacts: IP addresses, cryptographic hashes, cluster UUIDs, raw metrics, and terminal streams.

### Scaling & Legibility Guidelines
- **Tabular Figures:** Configure all instances of Inter within telemetry and metric displays to enforce `font-feature-settings: "tnum" 1` to prevent jitter during live data re-renders.
- **Monospaced Enforcement:** JetBrains Mono is mandatory for all system badges, micro telemetry badges, port indicators, and code snippets. Never substitute body typography into command traces.
- **Visual Weight Distribution:** Avoid weights below `400` in dark themes to prevent optical thinning caused by light text halation on dark canvas backdrops.

## Layout & Spacing

The layout model is anchored to an ultra-dense, responsive 12-column fluid workbench grid backed by an 8px base rhythm (with 4px micro-steps for compact data rows).

### Screen Breakpoints & Viewport Adaptations
- **Desktop / Operations Console (1440px and above):** 12-column grid. Dynamic multi-pane layout featuring an expandable tactical rail (64px collapsed, 240px expanded), persistent real-time topology panel, and split data inspection view.
- **Tablet / Field Terminal (768px - 1439px):** 8-column layout. Navigational rails collapse into floating utility drawers. Dual-column telemetry feeds stack into singular chronological streams.
- **Mobile Handheld (<768px):** 4-column layout. Focuses purely on incident containment: single-column alerts, critical actions, and hardware heartbeat indicators. Non-essential graphs collapse into raw numeric status metrics.

### Grid Constraints
Canvas margins adjust from `1rem` on mobile field setups to `2rem` across continuous command-center display setups, maximizing information density without visual crowding.

## Elevation & Depth

This design system repudiates traditional blurry black drop shadows in favor of **structural light boundaries** and **focused emerald glow fields**. Depth is communicated through luminosity levels and surface transience.

### Elevation Hierarchy
1. **Base Floor (Z0 - `#090D16`):** The primary chassis. Receives no borders or reflections.
2. **Standard Surface (Z1 - `#0F172A`):** Telemetry cards and infrastructure tiles. Framed by a crisp `1px solid rgba(255, 255, 255, 0.08)` border. Backdrop filters are configured with `backdrop-filter: blur(12px)`.
3. **Elevated Tray / Popover (Z2 - `#1E293B`):** Dropdowns, context menus, and active segmented controls. Enhanced with a razor-thin internal edge highlight: `box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.1)`.
4. **Focused / Critical Overlays (Z3):** Modals, credential verification, SSO authentication panels, and root-access dialogues. Framed by a subtle emerald luminescence: `box-shadow: 0 0 24px rgba(16, 185, 129, 0.12), 0 12px 32px rgba(0, 0, 0, 0.6)`.

### Ambient Glow Implementation
Apply ambient illumination exclusively to actionable signals and healthy execution states:
- Active nodes and primary execution levers feature a focused emerald perimeter emission: `box-shadow: 0 0 16px -2px rgba(16, 185, 129, 0.4)`.
- Never use unconstrained glow radii larger than 32px to avoid interface haze and maintain precise target boundaries.

## Shapes

The interface employs a disciplined, micro-radiused shape profile (`roundedness: 1` / `0.25rem` base, with maximum card curvatures capping at `0.5rem`). This geometric discipline reflects the industrial, rack-mounted nature of enterprise hardware and network routing logic.

### Geometry Rules
- **Base Components (Inputs, Segmented Controls, Badges, Buttons):** `0.25rem` (4px). Delivers crisp, compact boundaries that maximize vertical screen real estate.
- **Structural Containers (Panels, Diagnostic Cards, SSO Containers):** `0.5rem` (8px). Softens panel groupings while retaining architectural structure.
- **Micro-Indicators & Badges:** `2px` border-radius or pure pill formats where status continuity must be immediately parsed.

## Components

### Buttons & Trigger Levers
- **Primary Operational Button:** Solid emerald background (`#10B981`) with rich slate text (`#090D16`, bold 600). Top edge features a subtle `1px` translucent white highlight. Hover triggers a shift to `#34D399` coupled with an emerald ambient glow (`0 0 16px rgba(16, 185, 129, 0.35)`).
- **Secondary Ghost Trigger:** Background transparent, stroke `1px solid rgba(255, 255, 255, 0.12)`, text `#F8FAFC`. On hover: surface transitions to `rgba(255, 255, 255, 0.05)` and border transitions to `#10B981`.
- **Destructive/Containment Button:** Background `rgba(244, 63, 94, 0.1)`, border `1px solid #F43F5E`, text `#F43F5E`. On hover: solid `#F43F5E` fill with `#FFFFFF` text and crimson glow.

### Segmented Control Tabs
- **Tray:** Enclosed capsule in `#090D16` with a `1px solid rgba(255, 255, 255, 0.06)` border and `4px` internal padding.
- **Tab Target:** Sleek low-profile toggle using `label-md`. Inactive: text `#94A3B8`, no background.
- **Active Segment:** Elevated slate background (`#1E293B`), text `#F8FAFC`, framed by an ultra-thin `1px solid rgba(255, 255, 255, 0.15)` border and an inner hairline emerald indicator (`#10B981`) at the base or active edge.

### System Telemetry Badges & Chips
- Set in **JetBrains Mono** (`code-sm`, uppercase).
- Constructed using low-opacity status fills:
  - **Healthy:** Fill `rgba(16, 185, 129, 0.1)`, border `1px solid rgba(16, 185, 129, 0.4)`, text `#34D399`. Accompanied by a pulsing 6px neon dot.
  - **Warning:** Fill `rgba(245, 158, 11, 0.1)`, border `1px solid rgba(245, 158, 11, 0.4)`, text `#FBBF24`.
  - **Severed/Down:** Fill `rgba(244, 63, 94, 0.1)`, border `1px solid rgba(244, 63, 94, 0.4)`, text `#FB7185`.

### Enterprise SSO Authentication Hub
- Contained in an elevated card (`#0F172A`) backed by `backdrop-filter: blur(16px)` and an ambient emerald aura.
- **SSO Provider Selectors (Okta, Azure AD, Ping Identity, SAML 2.0):** Dark matte buttons (`#1E293B`) with `1px solid rgba(255, 255, 255, 0.08)` borders, containing high-contrast vector badges and mono-spaced domain confirmations (`user@organization.corp`).
- Focus and authentication lock states transition borders directly to `#10B981` with an interior verified checkmark.

### Input Fields & Search Bars
- Background: `#090D16` with inset framing.
- Border: `1px solid rgba(255, 255, 255, 0.1)`.
- Typography: Body Inter (`body-md`), with system arguments and query syntax highlighted in JetBrains Mono.
- Active Focus: Zero default browser ring; replaced by `border-color: #10B981` and `box-shadow: 0 0 0 1px #10B981, 0 0 12px rgba(16, 185, 129, 0.2)`.

### Checkboxes & Binary Radios
- Size: 16px × 16px square (2px border radius) or 16px circular radio.
- Inactive: Background `#090D16`, stroke `1px solid #475569`.
- Checked: Background `#10B981`, stroke `#10B981`, containing an SVG sharp micro-check in `#090D16`. Includes a localized neon glow tick.

### Cards & Diagnostic Panels
- Background: Translucent slate (`#0F172A` with 90% opacity).
- Framing: Frosted glass stroke `1px solid rgba(255, 255, 255, 0.08)`.
- Header: Separated by a `1px solid rgba(255, 255, 255, 0.04)` baseline, featuring an Inter title on the left and a JetBrains Mono node metric on the right.
- Visual Hover: Border shifts from neutral glass to `rgba(16, 185, 129, 0.3)` across a 150ms ease-out transition.