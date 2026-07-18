# Luxurious Habbits — Design Brainstorm

## Three Stylistic Approaches

### 1. Dark Opulence
**Theme:** Deep forest green, aged gold, and rich black — a high-end apothecary aesthetic.
**Probability:** 0.08

### 2. Botanical Luxury
**Theme:** Warm ivory backgrounds with deep emerald accents, botanical line illustrations, and serif typography — refined, editorial, and nature-forward.
**Probability:** 0.07

### 3. Modern Noir
**Theme:** Near-black backgrounds with champagne gold type, stark geometric layouts, and minimal ornamentation — sleek, mysterious, and commanding.
**Probability:** 0.05

---

## Chosen Approach: Dark Opulence ✓

### Design Movement
Art Deco meets Modern Apothecary — structured geometry, rich materials, and botanical motifs fused with contemporary minimalism.

### Core Principles
1. **Richness through restraint** — deep, saturated backgrounds with selective gold accents; never gaudy
2. **Botanical authenticity** — hemp leaf motifs and natural textures ground the luxury in nature
3. **Editorial typography** — large, confident serif headlines contrast with refined sans-serif body text
4. **Purposeful asymmetry** — layouts that feel composed, not templated

### Color Philosophy
- **Primary:** Deep Forest Green `oklch(0.22 0.08 155)` — authority, nature, premium
- **Gold Accent:** Warm Antique Gold `oklch(0.72 0.12 75)` — luxury, trust, warmth
- **Background:** Near-Black `oklch(0.10 0.02 155)` — depth, mystery, sophistication
- **Surface:** Dark Charcoal `oklch(0.16 0.03 155)` — card backgrounds
- **Text:** Cream `oklch(0.93 0.02 80)` — warm, readable, premium
- **Muted Text:** Warm Gray `oklch(0.65 0.02 80)` — secondary content

### Layout Paradigm
Asymmetric editorial grid — full-bleed hero sections with offset text blocks, alternating image-text layouts, and generous vertical rhythm. Navigation is horizontal with gold underline accents.

### Signature Elements
1. **Gold horizontal rule dividers** — thin 1px gold lines separating sections
2. **Hemp leaf watermark motifs** — subtle, low-opacity botanical shapes in backgrounds
3. **Serif headline drop caps** — large initial letters on key section headings

### Interaction Philosophy
Deliberate and unhurried — hover states reveal gold underlines, buttons have a subtle press scale, and page transitions use gentle fade-ins. Nothing feels rushed; everything feels intentional.

### Animation
- Hero text: staggered fade-up on load (60ms delay per word)
- Section entrances: fade + translateY(20px) → translateY(0) at 400ms ease-out
- Nav hover: gold underline slides in from left at 200ms
- Button press: scale(0.97) at 160ms ease-out
- Age gate: fade-in overlay at 300ms, dismiss with fade-out

### Typography System
- **Display/Headlines:** Cormorant Garamond — elegant, high-contrast serif with editorial authority
- **Body:** DM Sans — clean, modern, highly readable at small sizes
- **Accent/Labels:** DM Sans Medium, letter-spacing 0.15em, uppercase
- **Hierarchy:** H1 at 4–6rem, H2 at 2.5–3rem, H3 at 1.5rem, body at 1rem/1.6 line-height

### Brand Essence
*The most refined hemp experience for those who demand more from nature.* — Sophisticated, Authentic, Elevated.

### Brand Voice
Headlines are declarative and confident: *"Nature, Perfected."* / *"The Standard for Premium Hemp."*
CTAs are inviting, never pushy: *"Explore the Collection"* / *"Discover Our Story"*
Banned phrases: "Welcome to our website", "Get started today", "Click here"

### Wordmark & Logo
A stylized hemp leaf enclosed within a thin gold octagonal frame — geometric, botanical, and unmistakably premium. The brand name "LUXURIOUS HABBITS" set in small-caps Cormorant Garamond below.

### Signature Brand Color
**Antique Gold** `oklch(0.72 0.12 75)` — the single ownable color that appears on every page as dividers, hover states, and accent elements.
