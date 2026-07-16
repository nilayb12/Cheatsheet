# Cheatsheets

A single GitHub Pages site that links out to every Cheatsheet from this repository. Add a subfolder with an `index.html`, update `projects.json`, and it appears on the hub automatically.

## Live site

```
https://nilayb12.github.io/Cheatsheet/
```

## Repo structure

```
Cheatsheet/
├── index.html                      # Hub page (structure only)
├── style.css                       # All styles and design tokens
├── main.js                         # Fetch, validate, render, search/filter
├── projects.json                   # Project list — edit this to add entries
├── projects.schema.json            # JSON Schema for editor validation
├── 404.html                        # Custom not-found page
├── README.md                       # This file
├── .github/
│   └── workflows/
│       └── update-projects.yml     # Auto-discovers new subfolders on push
└── my-project/
    └── index.html                  # Each project lives in its own subfolder
```

## Adding a Cheatsheet

**Option 1 — manually** (instant):

1. Create a subfolder with your project's `index.html`.
2. Add an entry to `projects.json`:

```json
{
  "name": "My Project",
  "path": "my-project",
  "desc": "A short description.",
  "icon": "✨",
  "tags": ["tool"],
  "status": "live"
}
```

3. Push. GitHub Pages deploys both the hub and the subfolder.

**Option 2 — automatically** (via GitHub Actions):

1. Push a subfolder containing an `index.html`.
2. The `update-projects.yml` workflow detects it, adds a placeholder entry to `projects.json`, validates the file, and commits it.
3. Fill in the `name`, `desc`, and `icon` fields in the committed `projects.json` afterwards.

## projects.json fields

| Field    | Required | Type             | Description |
|----------|----------|------------------|-------------|
| `name`   | ✅       | string           | Display name on the card |
| `path`   | ✅       | string           | Subfolder name — letters, numbers, hyphens, underscores only |
| `desc`   |          | string           | Short description shown below the name |
| `icon`   |          | string (emoji)   | Card icon — defaults to 📁 |
| `status` |          | `live` \| `wip` \| `archived` | Badge shown on the card — defaults to `live` |
| `tags`   |          | string[]         | Category labels — appear as filterable chips on the hub |

## Editor validation

`projects.json` references `projects.schema.json` via its `$schema` field. Editors that support JSON Schema (VS Code, JetBrains, etc.) will validate fields and autocomplete values automatically with no plugin required.

## Customisation

All visual tokens (colours, fonts) are CSS variables at the top of `style.css`:

```css
:root {
  --bg:      #0e0e0f;
  --accent:  #c8f060;   /* ← change this to re-theme the whole hub */
  /* … */
}
```

Update the `<p class="eyebrow">` in `index.html` and the Open Graph `<meta>` tags to match your actual repo URL.

## GitHub Actions workflow

The `update-projects.yml` workflow runs on every push to `main` that touches an `index.html` or `projects.json`. It:

1. Scans all subfolders for an `index.html`
2. Adds placeholder entries for new subfolders
3. Removes entries whose folder has been deleted
4. Validates the result against `projects.schema.json` using [ajv](https://ajv.js.org/) — the push fails if validation errors are found
5. Commits the updated `projects.json` with `[skip ci]` to avoid a loop

The workflow can also be triggered manually from the **Actions** tab via "Run workflow".
