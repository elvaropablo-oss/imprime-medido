---
name: ImprimeMedido Registration Desk
status: canonical
updated: 2026-09-11
---

# Design direction

**North star:** a compact prepress desk with registration marks, proof sheets and scale annotations. Every decorative choice should reinforce physical size, calibration or print production.

## Foundations

- Paper: `#f6f3eb`; sheet white: `#fffefa`; registration black: `#121212`
- Process accents: cyan `#00a7c7`, magenta `#df1267`, yellow `#ffd324`
- Display type: condensed system face in uppercase
- Body type: Arial/Helvetica; measurements and controls: Cascadia Mono/Consolas
- Corners stay square. Sheets use thin black rules and offset process-colour shadows.

## Composition

- Heroes pair a bold instruction with a slightly rotated proof sheet.
- Cards use changing column spans like pieces placed on a production table.
- Tool forms resemble job tickets; outputs resemble highlighted proofs.
- Registration marks and hard colour offsets create identity without stock imagery.
- Motion is limited to a small lift on actionable controls and respects reduced-motion settings.

## Accessibility and print

- Focus uses a thick magenta ring and controls keep a 48 px minimum height.
- Text never relies on process colours alone for meaning.
- Below 840 px all task and tool layouts become a single column.
- Existing millimetre-based print sheets and `@page` behavior remain isolated from screen styling.
