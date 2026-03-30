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
- Section headings (Work, Now, Craft, Connect) are Geist Mono, uppercase,
  `text-[11px]`, `tracking-widest`, `text-muted-foreground`. They are labels,
  not titles.
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
/                  The identity. Headline, work list, now, craft, connect.
/projects/[slug]   Individual project detail. Problem, approach, outcome.
/craft             Index of interaction experiments and animation demos.
/craft/[slug]      Individual craft piece. Live demo + optional writeup.
/writing           Index of posts (if/when you write).
/writing/[slug]    Individual post.
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

### Status Bar

- Fixed to bottom, full width
- `bg-muted/60 backdrop-blur-sm`
- Height: `h-6`
- Left: ▪ mark + "james courson"
- Right: "auburn, al · 2026"
- All in Geist Mono at `text-[11px]`

### Content Width

- `max-w-xl` (36rem / 576px) — narrower than typical, forces concision

---

## Content Hierarchy

Every page follows this reading order:

1. **Who** — your name, small, always at the top
2. **What** — the headline idea, in Canon
3. **Context** — one sentence of bio
4. **Work** — the list
5. **Now** — what you're thinking about
6. **Craft** — the playground
7. **Connect** — how to reach you
8. **Status bar** — persistent identity at the bottom

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
- **Content:** MDX for writing and project pages
- **Deployment:** Vercel
- **Performance targets:**
  - Lighthouse: 100 across all categories
  - First Contentful Paint: < 500ms
  - Total Blocking Time: 0ms
  - Cumulative Layout Shift: 0
  - Bundle size: < 50KB first load JS
- **No client JS on the homepage** unless the mascot requires it

---

## Decisions Made

- [x] Typefaces: GT Canon (display), Inter (body), Geist Mono (system)
- [x] GT Canon is reserved — headline only, once per page max
- [x] Section headings are mono labels, not display type
- [x] Mascot: squared Unicode glyphs (⊞ ⊟ ⊠ ⊡ ▪)
- [x] Glyphs are rare — one on the homepage (▪ in status bar)
- [x] Status bar at bottom, inspired by VS Code/Cursor
- [x] Name is quiet (text-sm, muted), headline is the star
- [x] Content width: max-w-xl

## Open Questions

- [ ] What is the final headline? (Current: "I build software and care about how it feels.")
- [ ] Which projects to feature? (Current placeholders: Magnus, Skills, Compute SDK, Payload CMS)
- [ ] What does the "Now" section actually say?
- [ ] What does the `/craft` section contain at launch?
- [ ] Domain name?
- [ ] Favicon — ▪ solid square?

---

*This manifesto is a living document. Update it as decisions are made.
Delete options as they're rejected. The goal is to narrow, not to expand.*
