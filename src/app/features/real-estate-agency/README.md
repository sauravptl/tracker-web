# NexusAI Real Estate — Angular Template

> **Dark Mode Studio · AI Automation Agency · Single-Page Template**  
> Built with Angular 19 Standalone Components · Plain CSS · No Tailwind

---

## What's Included

| Component | File path |
|---|---|
| Page shell | `src/app/features/real-estate-agency/real-estate-agency.component.*` |
| Hero section | `src/app/features/real-estate-agency/hero/hero.component.*` |
| Services grid | `src/app/features/real-estate-agency/services/services.component.*` |
| Showcase/portfolio | `src/app/features/real-estate-agency/showcase/showcase.component.*` |
| Footer + newsletter | `src/app/features/real-estate-agency/footer/footer.component.*` |

The template is wired to the Angular router at the `/real-estate` path.

---

## Quick Start

### Prerequisites

- Node.js ≥ 18
- Angular CLI ≥ 19 (`npm install -g @angular/cli`)

### Installation

```bash
# Install dependencies
npm install

# Start development server
npm start
```

Open `http://localhost:4200/real-estate` in your browser.

### Production Build

```bash
npm run build
```

The compiled output will be in `dist/`.

---

## Customising the Theme

Every visual token lives in CSS custom properties (variables) at the top of each
component's `.css` file inside a `:host { }` block. You only need to edit one
set of values — the rest of the component inherits them automatically.

### Colour Palette

Open any component's CSS file and look for the `:host { }` block at the top.
The key variables are:

```css
:host {
  /* ── Backgrounds ──────────────────────────────── */
  --color-bg-base:      #0a0a0a;   /* page background */
  --color-bg-surface:   #111111;   /* footer / cards  */
  --color-bg-elevated:  #181818;   /* raised surfaces */

  /* ── Brand accents ────────────────────────────── */
  --color-accent-gold:        #c9a84c;   /* primary accent  */
  --color-accent-gold-glow:   rgba(201, 168, 76, 0.25);
  --color-accent-gold-subtle: rgba(201, 168, 76, 0.10);
  --color-accent-blue:        #3b82f6;   /* secondary accent */
  --color-accent-blue-glow:   rgba(59, 130, 246, 0.25);

  /* ── Typography ───────────────────────────────── */
  --font-display: 'Playfair Display', 'Georgia', serif;
  --font-body:    'Inter', 'Helvetica Neue', sans-serif;

  /* ── Text colours ─────────────────────────────── */
  --color-text-primary:   #f0ece3;
  --color-text-secondary: #8a8070;
  --color-text-muted:     #504840;
}
```

**Common reskins:**

| Goal | Change |
|---|---|
| Blue-tech palette | Swap `--color-accent-gold` → `#3b82f6` and `--color-accent-blue` → `#8b5cf6` |
| Luxury green | Swap `--color-accent-gold` → `#22c55e` |
| Light mode | Change `--color-bg-base` → `#fafafa`, `--color-text-primary` → `#111` |

### Typography

The template ships with Google Fonts references baked into the CSS variable
fallback stacks. To load Playfair Display and Inter, add to your `index.html`:

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:wght@700&display=swap" rel="stylesheet">
```

---

## Adding Real Photography

Search for the `85mm cinematic` placeholder comment in any component's HTML.
Replace the entire `<div class="*__photo-placeholder">` block with a real
`<img>` tag:

```html
<!-- Before -->
<div class="hero__photo-placeholder" aria-label="...">
  ...
</div>

<!-- After -->
<img
  src="assets/images/hero-property.jpg"
  alt="Luxury penthouse overlooking the Manhattan skyline"
  class="hero__photo-real"
/>
```

Add a matching CSS rule in the component:

```css
.hero__photo-real {
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: inherit;
}
```

---

## File Structure

```
src/app/features/real-estate-agency/
├── real-estate-agency.component.ts   ← page shell
├── real-estate-agency.component.html
├── real-estate-agency.component.css  ← global tokens
│
├── hero/
│   ├── hero.component.ts
│   ├── hero.component.html
│   └── hero.component.css
│
├── services/
│   ├── services.component.ts
│   ├── services.component.html
│   └── services.component.css
│
├── showcase/
│   ├── showcase.component.ts
│   ├── showcase.component.html
│   └── showcase.component.css
│
└── footer/
    ├── footer.component.ts
    ├── footer.component.html
    └── footer.component.css
```

---

## Support

Found a bug or want a custom variant? Open an issue on the repository or reach
out via the contact details on your Gumroad purchase receipt.

---

*Template generated with Angular 19 Standalone Components. Plain CSS only —
no Tailwind, no utility classes, no external UI library dependencies.*
