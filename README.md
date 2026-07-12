# Muhammad Wajeeh — Portfolio Website

A personal portfolio site built with vanilla HTML5, CSS3, and JavaScript.

## Status

✅ Complete — all sections built.

- [x] Navigation
- [x] Hero
- [x] About
- [x] Skills
- [x] Projects
- [x] Certificates
- [x] Education
- [x] GitHub Statistics
- [x] Contact
- [x] Footer

## Structure

```
portfolio-website/
├── index.html
├── style.css
├── script.js
├── assets/
│   ├── images/
│   ├── icons/
│   └── resume/
└── README.md
```

## Tech

No frameworks — plain HTML/CSS/JS. Fonts loaded from Google Fonts
(Space Grotesk, Inter, JetBrains Mono).

## Running locally

Just open `index.html` in a browser, or serve the folder with any
static server, e.g. `npx serve .`

## Notes

- Design tokens (colors, type scale, spacing, radius) live at the top
  of `style.css` under `:root` — every new section should reuse these
  rather than introducing new one-off values.
- The hero background is a canvas graph-traversal animation
  (`initHeroGraph` in `script.js`) — a nod to the Data Structures &
  Algorithms skill listed further down the page. Respects
  `prefers-reduced-motion`.
- Replace `assets/resume/Muhammad_Wajeeh_Resume.pdf` with the real
  resume file before deploying.

## Before deploying — replace placeholder data

This is a template with realistic placeholder content, not fabricated
credentials. Swap these before publishing:

- **Email** — `muhammad.wajeeh@example.com` appears in `index.html`
  (Contact section, footer) and in `script.js` (`initContactForm`,
  the `mailto:` address). Update it in all three places.
- **GitHub username** — set the real one in `script.js` at
  `const GITHUB_USERNAME = "muhammadwajeeh"`. This powers the live
  repo count and top-languages panel in the GitHub Statistics section
  (public REST API, no token needed). If the username is invalid or
  the request fails, the panel falls back to a clearly-labeled
  placeholder instead of fabricating numbers.
- **GitHub / LinkedIn links** — update the `href`s in the Contact
  section and footer social icons.
- **Project repo / live demo links** — edit the `PROJECTS` array near
  the bottom of `script.js`; the project grid is generated from it,
  so links only need to change in one place.
- **Contribution graph** — the heatmap in GitHub Statistics is an
  illustrative pattern, not real data (GitHub's contribution calendar
  requires an authenticated GraphQL call, which can't safely run from
  client-side JS). If you want a live version, proxy it through a
  small backend or serverless function that holds the token.
- **Location** — update the text in the Contact section.

