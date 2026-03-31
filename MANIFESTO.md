# Portfolio Manifesto

This document guides every design and engineering decision for the portfolio.
It is the source of truth. When in doubt, return here.

---

## Beliefs

1. **The site is the portfolio.** The code quality, performance, and restraint
   of the site itself demonstrate more than any case study ever could.

2. **Speed is respect.** Every millisecond of load time is a millisecond of
   someone's life. The site loads instantly or it has failed.

3. **Animations earn their place.** If you can remove an animation and the
   experience doesn't get worse, remove it. Motion exists to communicate,
   not to decorate.

4. **Typography carries the design.** Three typefaces, each with a role.
   The type is the interface.

5. **Restraint is confidence.** The decision to leave something out says more
   than the decision to put it in. Empty space is not wasted space.

6. **The work speaks.** No self-congratulatory copy, no inflated titles. Name
   the work. Show the work. Let people draw their own conclusions.

7. **Craft lives in a dedicated place.** The homepage is calm. The `/craft`
   section is where animation, interaction, and experimentation get full
   attention. Separation of concerns applies to design, not just code.

8. **Honesty over polish.** A genuine "Now" section beats a manicured "About"
   page. Say what you're actually thinking about, not what sounds impressive.

9. **Accessibility is not optional.** `prefers-reduced-motion`, semantic HTML,
   keyboard navigation, sufficient contrast. No exceptions, no excuses.

10. **View Source is a portfolio piece.** The markup should be clean enough that
    a hiring manager reading it learns something about you.

---

## Typography

Three typefaces. Each has a single job.

| Typeface | CSS Variable | Role | Used For |
|----------|-------------|------|----------|
| GT Canon (variable) | `--font-display` | Signature | The headline only. Reserved. Rare. |
| Inter | `--font-sans` | Voice | Body text, descriptions, paragraphs |
| Geist Mono | `--font-mono` | System | Section labels, status bar, metadata |

### Rules

- GT Canon appears **once per page** at most. It is the headline typeface.
  Using it on every heading dilutes it. The name "James Courson" is set in
  Inter (small, muted). The *idea* gets Canon.
- Section headings (Work, Sport, Present, Craft, Connect) are Inter,
  `font-medium text-foreground text-sm`. Clean and direct — they're headings,
  not decorative labels.
- Body text is Inter at `text-sm` with `leading-relaxed`.
- The status bar is Geist Mono at `text-[11px]`.

---

## The Glyph System (Mascot)

Five glyphs from the squared Unicode family. Used **sparingly** — the glyph
appears in the status bar and nowhere else on the homepage. It earns its
place through rarity.

| Glyph | Name | Meaning | Where It Appears |
|-------|------|---------|-----------------|
| ⊞ | plus | Work — additive, building | Project pages, work context |
| ⊟ | minus | Connect — reach out | Contact context |
| ⊠ | cross | Done — shipped, closed | Completed project markers |
| ⊡ | dot | Now — in progress | Active/current state |
| ▪ | solid | Identity — signature mark | Status bar (the one constant) |

### Rules

- The homepage uses **one glyph**: ▪ in the status bar. That's it.
- Project detail pages may use ⊞ or ⊠ to indicate status.
- The `/craft` section may use glyphs more freely as part of experiments.
- Never use a glyph as decoration. Every appearance communicates something.
- The `Glyph` component handles vertical alignment (these Unicode characters
  have inconsistent metrics).

---

## The Animation Budget

The site gets a fixed number of animated moments. Spend them deliberately.

| Slot | Where | What | Easing | Duration |
|------|-------|------|--------|----------|
| 1 | Links | Underline color shift on hover | `ease` | 150ms |
| 2 | Links | Color transition on hover | `ease` | 150ms |
| 3 | Page transitions | Crossfade between routes | `ease-out-quart` | 200ms |
| 4 | `/craft` demos | Unlimited — animation is the content | varies | varies |
| 5 | Tomo (walking character) | Pixel sprite walks bottom edge, responds to cursor, grabbable, speaks | linear | continuous |

Everything outside this budget is static. No scroll reveals, no staggered
entrances, no parallax, no loading animations.

### Rules

- Only animate `transform` and `opacity`
- Never exceed 300ms for UI transitions
- Exit animations are 20% faster than entrance
- Paired elements share easing and duration
- Every animation has a `prefers-reduced-motion: reduce` fallback

---

## Site Structure

```
/                  The identity. Headline, work list, present, craft, connect.
/projects/[slug]   Individual project detail. Problem, approach, outcome.
/craft             Index of interaction experiments and animation demos.
/craft/[slug]      Individual craft piece. Live demo + optional writeup.
/writing           Index of posts (if/when you write).
/writing/[slug]    Individual post.
/llms.txt          Auto-generated index of all pages for LLMs.
/*.md              Clean markdown version of any page (auto-derived from source).
```

No /about page. The homepage *is* the about page.

---

## Page Layout

### Header

- Name: `text-sm text-muted-foreground` — a label, not a headline
- Headline: GT Canon, `text-2xl sm:text-3xl font-light` — the one idea
- Bio: `text-sm text-muted-foreground` — one sentence, states a fact

### Sections

- Label: Geist Mono, `text-[11px] uppercase tracking-widest text-muted-foreground`
- Content: Inter, `text-sm leading-relaxed`
- Spacing: `mt-14` between sections, `mt-16` after header

### Footer

- Lives in root layout — persistent across all page navigations
- `bg-background`, height `h-6`
- Left: "James Courson" + sleeping Tomo sprite (clickable toggle)
- Right: "Inspiration" — clickable, opens popover with design inspiration links
- All in Geist Mono at `text-[11px]`

### Content Width

- `max-w-xl` (36rem / 576px) — narrower than typical, forces concision

---

## Content Hierarchy

Every page follows this reading order:

1. **What** — the headline idea, in Canon
2. **Context** — bio with role, employer, Magnus
3. **Work** — timeline with dates and links
4. **Sport** — athletic milestones and goals
5. **Present** — what you're thinking about
6. **Craft** — link to interaction experiments
7. **Connect** — email, GitHub, LinkedIn
8. **Footer** — name + sleeping Tomo toggle (left), inspiration popover (right)

---

## Voice

- First person, lowercase energy, no exclamation marks
- State facts, don't sell
- Short sentences. If a sentence has a comma, consider splitting it.
- No buzzwords: "passionate", "innovative", "cutting-edge", "synergy"
- Allowed words: build, craft, ship, think, care, try, learn, make

---

## Technical Constraints

- **Monorepo:** Turborepo with pnpm workspaces
- **App:** `apps/web` — Next.js (App Router)
- **UI library:** `packages/ui` — shared components (shadcn/ui foundation)
- **Styling:** Tailwind CSS v4
- **Animation:** CSS transitions for the main site. Motion library only on `/craft`.
- **Content:** MDX for writing and project pages (`@next/mdx`)
- **AI-ready:** `/llms.txt` index + per-page `.md` serving (auto-discovered, not manually maintained)
- **Deployment:** Vercel
- **Performance targets:**
  - Lighthouse: 100 across all categories
  - First Contentful Paint: < 500ms
  - Total Blocking Time: 0ms
  - Cumulative Layout Shift: 0
  - Bundle size: < 50KB first load JS
- **Minimal client JS** — Tomo is the one exception (tiny canvas, ~4KB, state persisted via localStorage)

---

## Decisions Made

- [x] Typefaces: GT Canon (display), Inter (body), Geist Mono (system)
- [x] GT Canon is reserved — headline only, once per page max
- [x] Section headings: Inter, `font-medium text-foreground text-sm` — headings, not labels
- [x] Mascot: squared Unicode glyphs (⊞ ⊟ ⊠ ⊡ ▪)
- [x] Footer at bottom with portrait popover + inspiration popover
- [x] Headline is the star — name appears only in footer
- [x] Content width: max-w-xl
- [x] Headline: "Currently building software that connect people and machines."
- [x] Work section: timeline format with dates and links (not case studies)
- [x] Sport section between Work and Now
- [x] Present section: agents, design systems, typography
- [x] Craft launches with unified dither studio at `/craft/dither` (generate + image)
- [x] Bio: role at Brasfield & Gorrie, mentions Magnus
- [x] Tomo: pixel-art desktop pet in root layout, persists across navigations
  - Sleeps inline next to "James Courson" in footer — click to wake
  - Walks bottom edge, looks at cursor, sits, sleeps if idle
  - Grabbable with drag-and-drop; deploys parachute on long falls
  - Click (not drag) triggers speech tooltips — random quips + context-aware lines
  - "zzz" indicator in footer when active — click to send Tomo home to sleep
  - Falls to ground before running if dismissed mid-air
  - Full state persisted to localStorage (position, behavior, parachute) across refresh
  - State machine: hidden → entering → walk/idle/look/sit/sleep/startled/held/falling → exiting → hidden
  - Canvas-based, ~4KB, zero deps beyond React
- [x] Footer: extracted to `SiteFooter` component, lives in root layout, shows on every page
- [x] Footer inspiration: popover linking to design inspirations (p.cv, paco.me, jakub.kr, etc.)
- [x] MDX support via `@next/mdx` — `.mdx` files work as pages in App Router
- [x] AI-ready: `/llms.txt` + `*.md` serving, auto-discovered from `app/` page files
- [x] Domain: jamescourson.com
- [x] Work section displays company names (not URLs)

## Open Questions

- [ ] Which projects to feature beyond work timeline?
- [ ] Favicon — ▪ solid square?

---

*This manifesto is a living document. Update it as decisions are made.
Delete options as they're rejected. The goal is to narrow, not to expand.*
