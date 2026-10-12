---
name: 芈仙居
description: A personal site of cool paper, Songti titles, and one teal accent.
colors:
  site-bg: "#f0f4f3"
  site-surface: "#faf9f7"
  site-ink: "#2c3330"
  site-muted: "#6b736f"
  site-border: "rgba(44, 51, 48, 0.1)"
  site-accent: "#1f9d8a"
  site-accent-light: "#2f8f68"
  site-accent-wash: "rgba(31, 157, 138, 0.12)"
  site-bg-dark: "#151a18"
  site-surface-dark: "#1c2421"
  site-ink-dark: "#e5ebe8"
  site-muted-dark: "#93a099"
  site-border-dark: "rgba(229, 235, 232, 0.1)"
  site-danger: "#b85c4b"
typography:
  display:
    fontFamily: '"Noto Serif SC", "Songti SC", "STSong", "SimSun", serif'
    fontSize: "52px"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0.28em"
  headline:
    fontFamily: '"Noto Serif SC", "Songti SC", "STSong", "SimSun", serif'
    fontSize: "2rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "0.06em"
  title:
    fontFamily: '"Noto Serif SC", "Songti SC", "STSong", "SimSun", serif'
    fontSize: "1.15rem"
    fontWeight: 700
    lineHeight: 1.5
    letterSpacing: "normal"
  body:
    fontFamily: '"Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
    lineHeight: 1.5
  label:
    fontFamily: '"Segoe UI", "PingFang SC", "Microsoft YaHei", sans-serif'
    fontSize: "0.85rem"
    lineHeight: 1.5
    letterSpacing: "normal"
rounded:
  site-radius: "12px"
  rail: "10px"
  header-pill: "16px"
  home-action: "21px"
  mark: "50%"
components:
  button-action:
    backgroundColor: "linear-gradient(90deg, #1f9d8a 0%, #2f8f68 100%)"
    textColor: "#ffffff"
    rounded: "{rounded.home-action}"
    padding: "0 22px"
    height: "42px"
  button-quiet:
    backgroundColor: "{colors.site-surface}"
    textColor: "{colors.site-ink}"
    rounded: "{rounded.home-action}"
    padding: "0 22px"
    height: "42px"
  button-theme:
    backgroundColor: "transparent"
    textColor: "{colors.site-ink}"
    rounded: "{rounded.header-pill}"
    padding: "0 12px"
    height: "32px"
  button-save:
    backgroundColor: "{colors.site-accent}"
    textColor: "#ffffff"
    rounded: "{rounded.rail}"
    padding: "8px 14px"
  button-danger:
    backgroundColor: "transparent"
    textColor: "{colors.site-danger}"
    rounded: "{rounded.rail}"
    padding: "8px 10px"
  input-search:
    backgroundColor: "{colors.site-surface}"
    textColor: "{colors.site-ink}"
    rounded: "{rounded.site-radius}"
    padding: "12px 14px"
    width: "min(100%, 36rem)"
  input-field:
    backgroundColor: "{colors.site-bg}"
    textColor: "{colors.site-ink}"
    rounded: "{rounded.rail}"
    padding: "10px 12px"
    width: "100%"
  rail-category:
    backgroundColor: "transparent"
    textColor: "{colors.site-ink}"
    rounded: "{rounded.rail}"
    padding: "10px 12px"
    width: "100%"
  rail-category-current:
    backgroundColor: "{colors.site-accent-wash}"
    textColor: "{colors.site-accent}"
    rounded: "{rounded.rail}"
    padding: "10px 12px"
    width: "100%"
  card-home:
    backgroundColor: "{colors.site-surface}"
    textColor: "{colors.site-ink}"
    rounded: "{rounded.site-radius}"
    padding: "28px 24px"
  bookmark-card:
    backgroundColor: "{colors.site-surface}"
    textColor: "{colors.site-ink}"
    rounded: "{rounded.site-radius}"
    padding: "22px 20px"
  nav-link:
    textColor: "{colors.site-ink}"
    typography: "{typography.body}"
  nav-link-active:
    textColor: "{colors.site-accent}"
    typography: "{typography.body}"
  chip-banner:
    backgroundColor: "{colors.site-surface}"
    textColor: "{colors.site-muted}"
    rounded: "{rounded.header-pill}"
    padding: "0 14px"
    height: "32px"
---

# Design System: 芈仙居

## Overview

**Creative North Star: "Songti on Cool Paper"**

芈仙居 sits on cool paper: a gray-green ground, warm sheets, and pine ink. Titles use a self-hosted Songti, Noto Serif SC at weight 700. Body text, navigation, and controls use the system gothic stack. One teal accent marks what is current or actionable.

The homepage centers a circular portrait, a widely tracked name, and paper cards over an ink wash. Pages that extend this world keep those tokens. The bookmark page is a category rail on the sheet color and a grid of the same paper cards: title, muted host, and description. The admin reuses the same paper, hairline, radius, and accent for its panels and save actions.

Dark mode reassigns the ground, sheet, ink, muted text, hairline, and the two shadows. The accent stays the same teal.

**Key Characteristics:**

- Cool paper ground, warm sheet surfaces, pine ink text
- Self-hosted Noto Serif SC 700 for titles; system gothic for body
- One teal accent for the active category, the current nav item, and explicit actions
- Bookmark hosts in muted ink; a hovered card title turns Active Teal
- Homepage cards and bookmark cards both lift off the paper
- Dark theme reassigns the same custom properties

## Colors

The palette is a cool ground, a warmer sheet, pine ink, and one teal. Dark mode is the same set of custom properties with new values. The accent is not redefined in the dark theme.

### Primary

- **Active Teal** (`site-accent`, #1f9d8a): the active category, the current navigation item, the text caret, the focus outline, and explicit actions. Homepage card titles and banner links also turn this teal on hover.
- **Gradient Leaf** (`site-accent-light`, #2f8f68): the right-hand stop of the homepage action gradient, `linear-gradient(90deg, Active Teal, Gradient Leaf)`.
- **Teal Wash** (`site-accent-wash`, rgba(31, 157, 138, 0.12)): the fill behind the active category. It is Active Teal at 12% opacity.

### Tertiary

- **Brick Alert** (`site-danger`, #b85c4b): admin delete labels and admin error text.

### Neutral

- **Cool Paper** (`site-bg`, #f0f4f3): the page ground. In the dark theme the same property is **Night Ground** (`site-bg-dark`, #151a18).
- **Warm Sheet** (`site-surface`, #faf9f7): the category rail, homepage cards, the bookmark search, quiet pills, and banner chips. Dark: **Night Sheet** (`site-surface-dark`, #1c2421).
- **Pine Ink** (`site-ink`, #2c3330): text and quiet controls. Dark: **Mist Ink** (`site-ink-dark`, #e5ebe8).
- **Muted Ink** (`site-muted`, #6b736f): bookmark hosts, descriptions, placeholders, and meta. Dark: **Ash Muted** (`site-muted-dark`, #93a099).
- **Ink Hairline** (`site-border`, rgba(44, 51, 48, 0.1)): panel borders, field borders, and bookmark card edges. Dark: **Mist Hairline** (`site-border-dark`, rgba(229, 235, 232, 0.1)).

### Named Rules

**The Teal Marks State Rule.** Use Active Teal for the active category, the current navigation item, focus and the text caret, and explicit actions. A homepage card title, a bookmark card title, and a banner link turn this teal on hover. Bookmark hosts stay Muted Ink.

## Typography

**Display Font:** Noto Serif SC (with Songti SC, STSong, SimSun, serif)
**Body Font:** Segoe UI (with PingFang SC, Microsoft YaHei, sans-serif)

**Character:** Titles are a heavy Songti, self-hosted at weight 700 with `font-display: swap` and exposed as `--site-font-title`. Body, navigation, fields, and buttons stay on the system gothic stack declared on the root, at a line-height of 1.5. The root does not set a body size.

### Hierarchy

- **Display** (700, 52px, line-height 1.5, tracking 0.28em): the homepage name, in the title face, with a 1px paper highlight (`0 1px 0 rgba(255, 252, 245, 0.8)`). Under 768px it is 36px with tracking 0.12em. The header wordmark is the same face at 20px, weight 700, tracking 0.12em (16px under 720px). The homepage poem line is the title face at 15px, tracking 0.18em, line-height 2 (13px and tracking 0.06em under 768px).
- **Headline** (700, 2rem, line-height 1.5, tracking 0.06em): the bookmark page title, the active category name, in the title face. Admin page titles use the same size and tracking.
- **Title** (700, 17px, line-height 1.4, tracking 0.04em): homepage card titles and bookmark card titles, in the title face.
- **Body** (line-height 1.5): navigation and homepage actions at 15px; card descriptions at 14px, line-height 1.65, tracking 0.02em. Bookmark descriptions inherit the root stack and the user-agent size.
- **Label** (0.85rem, line-height 1.5): bookmark hosts and admin field labels, in Muted Ink. Homepage version meta is 13px with tracking 0.04em. Banner chips are 13px.

### Named Rules

**The Title Face Rule.** The header wordmark, the homepage name, the poem line, page titles, and bookmark card titles use the title face: self-hosted Noto Serif SC at 700, then Songti SC, STSong, SimSun, serif. Body, navigation, fields, and buttons stay on the system gothic stack.

## Layout

The shell is a fixed header, 60px tall, with the page starting beneath it. Light header padding is 18px horizontal; under 720px it is 12px, the wordmark margin shrinks from 28px to 12px, and the header's external brand links hide.

The homepage is a centered column (padding 48px 24px 32px) over a fixed ink wash, then a card grid. The grid is 3 columns, max width 1200px, gap 30px, padding 40px 80px 64px. It becomes 2 columns under 992px and 1 column under 768px, with padding 24px 20px 48px.

The bookmark page is a 220px sheet rail plus a fluid column, at least the height below the header. The column padding is 36px 40px 64px. Cards fill the column at a minimum of 320px, with a 20px gap. Under 720px the rail becomes one horizontal scrolling row (padding 12px, gap 8px) and the column padding becomes 24px 16px 48px.

The admin page is a centered column, max width 960px, padding 36px 24px 64px. Inside it, a 240px column and a fluid column sit 28px apart. They stack under 720px.

### Named Rules

**The Shared Shell Rule.** Pages sit under a fixed 60px header, and the main column starts below it. The shell, the bookmark rail, and the admin columns collapse at 720px.

## Elevation & Depth

The shell is flat. Depth on the homepage and the bookmark cards comes from a soft ink shadow, a short lift, and, on the homepage, the ink-wash background. The header's depth is a dotted veil and a 4px backdrop blur at 50% saturation, with no drop shadow.

Homepage cards and the large pills use a 0.3s ease transition. Banner chips use 0.25s ease. The portrait and the name rise 12px over 0.6s ease; the name is delayed 0.12s.

### Shadow Vocabulary

- **Rest** (`box-shadow: 0 2px 12px rgba(44, 51, 48, 0.06)`): homepage cards and the large pills at rest. Dark theme: `0 2px 16px rgba(0, 0, 0, 0.35)`.
- **Hover** (`box-shadow: 0 8px 24px rgba(44, 51, 48, 0.1)`): those same surfaces on hover. Dark theme: `0 8px 28px rgba(0, 0, 0, 0.45)`.
- **Portrait** (`box-shadow: 0 8px 32px rgba(44, 51, 48, 0.12)`): the homepage portrait only.

### Named Rules

**The Paper Card Rule.** Bookmark links use the homepage card: Warm Sheet, 12px radius, Ink Hairline, the rest shadow, and a 4px lift into the hover shadow. The title turns Active Teal. The host stays Muted Ink.

## Shapes

Panels, homepage cards, and the bookmark search use the 12px radius (`site-radius`). Rail buttons and admin fields use 10px. Circular marks — the header logo at 36px and the homepage portrait at 168px — are full circles. The portrait has a 4px Warm Sheet border.

Pills take their radius from half their height.

### Named Rules

**The Half-Height Pill Rule.** A fully rounded control uses half its height as its radius: 42px actions are 21px, 32px chips are 16px. Panels and the bookmark search use 12px. Rail buttons and admin fields use 10px.

## Components

### Buttons

Large actions are pills. Quiet controls are sheet-colored with an ink hairline. Explicit saves are a flat Active Teal fill with white text.

- **Shape:** 21px radius on the 42px homepage actions (padding 0 22px). Admin form buttons are 10px radius, padding 8px 14px.
- **Primary:** the homepage lead action. Fill is the accent gradient, text is white, weight 500, size 15px, tracking 0.06em. Rest shadow. Hover lifts 2px and uses the hover shadow.
- **Quiet:** the paired homepage action. Warm Sheet, Pine Ink, hairline, same size and lift as the primary pill.
- **Theme:** header control. Transparent, Pine Ink, hairline, height 32px, radius 16px, padding 0 12px. It inherits the gothic stack.
- **Save:** buttons in the admin form. Active Teal, white text, hairline removed, padding 8px 14px, radius 10px.
- **Delete:** the quiet admin row button with Brick Alert text, padding 8px 10px, radius 10px, hairline kept.
- **Focus:** bookmark and admin buttons use a 2px Active Teal outline, 2px outside the control.

### Chips

- **Style:** banner links are Warm Sheet, Muted Ink, a hairline, height 32px, radius 16px, padding 0 14px, size 13px, with 6px between the mark and the word.
- **State:** hover turns the label Active Teal and lifts the chip 1px.

### Cards / Containers

Homepage cards and bookmark cards are the lifted cards.

- **Corner Style:** 12px.
- **Background:** Warm Sheet.
- **Shadow Strategy:** rest shadow, hover shadow, and a 4px upward move. A 3px band of the accent gradient fades in along the top edge.
- **Border:** Ink Hairline.
- **Internal Padding:** 28px 24px. The title is the title face at 17px, weight 600, line-height 1.4, tracking 0.04em, and turns Active Teal on hover. The description is 14px Muted Ink, line-height 1.65, tracking 0.02em, 10px below the title.
- **Grid:** 3 columns, gap 30px, collapsing as described in Layout.

Admin panels are flat sheets: 12px radius, Ink Hairline, padding 18px. Panel titles are the title face at 1.25rem.

### Inputs / Fields

- **Search:** Warm Sheet, Pine Ink, Ink Hairline, 12px radius, padding 12px 14px, width up to 36rem. The caret is Active Teal. The placeholder is Muted Ink. The face is the gothic stack.
- **Admin fields:** Cool Paper, Pine Ink, Ink Hairline, 10px radius, padding 10px 12px, full width of the panel. The caret is Active Teal. Labels are 0.85rem Muted Ink.
- **Focus:** 2px Active Teal outline, 2px offset, on bookmark and admin fields.

### Navigation

The header is fixed, 60px, and shared. In the light theme its bottom edge is a `#eeeeee` hairline and its fill is a white dotted veil (1px clear dot on white, tiled at 4px). In the dark theme the dots use Night Sheet and the hairline uses Mist Hairline. Links inherit Pine Ink, sit 22px apart, and are 15px (14px and 12px apart under 720px). The current item is Active Teal, with no underline and no weight change.

### Bookmark cards

A bookmark card is a title, a host, and an optional description, stacked with an 8px gap and 22px 20px of padding. The title is the title face at 17px, weight 700, tracking 0.04em. The host is Muted Ink at 0.85rem. The description is 14px Muted Ink, line-height 1.65. Hover lifts the card 4px and turns the title Active Teal. Selected text on the bookmark page is Active Teal at 28% opacity (`rgba(31, 157, 138, 0.28)`).

The rail button is full width, radius 10px, padding 10px 12px, stacked with 4px between. The current category uses Teal Wash and Active Teal. Under 720px the buttons shrink to their text and sit in one scrolling row.

### Portrait

The homepage portrait is a 168px circle with a 4px Warm Sheet border and the portrait shadow. The header logo is a 36px circle.

## Do's and Don'ts

### Do:

- **Do** Set titles, the header wordmark, and the homepage name in `--site-font-title` (Noto Serif SC 700, then Songti SC, STSong, SimSun, serif).
- **Do** Keep body copy, navigation, fields, and buttons on the system gothic stack: Segoe UI, PingFang SC, Microsoft YaHei, sans-serif.
- **Do** Use Active Teal for the active category, the current navigation item, and explicit actions.
- **Do** Keep bookmark hosts in Muted Ink, and turn the card title Active Teal on hover.
- **Do** Paint the category rail, the search field, homepage cards, bookmark cards, and quiet pills with Warm Sheet.
- **Do** Lift a bookmark card with the homepage rest shadow and hover shadow.
- **Do** Switch to dark by reassigning the same custom properties.

### Don't:

- **Don't** Draw bookmark links as flat hairline rows.
- **Don't** Color a bookmark host, description, or resting card title with Active Teal.
- **Don't** Add a second accent hue.
- **Don't** Load another display face for titles. The shipped title file is weight 700.
- **Don't** Underline navigation or card titles. Hover color and the lift mark the card.
