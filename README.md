# oleinik.io

Personal portfolio site — static HTML/CSS/JS, deployed via GitHub Pages.

## Local development

The site uses `fetch()` to load content from `content.json`, so it must be served over HTTP (not opened as a `file://` URL directly).

Start a local server from the repo root:

```bash
python3 -m http.server 8080
```

Then open [http://localhost:8080](http://localhost:8080) in your browser.

## Editing content

All site text lives in [`content.json`](content.json). Edit it directly — no build step needed. Fields:

| Key | What it controls |
|---|---|
| `name` | Your name (sidebar, mobile header, about title) |
| `about` | About Me paragraphs (HTML allowed) |
| `services` | "What I Do" cards — `icon`, `title`, `description` |
| `experience` | Resume timeline entries |
| `education` | Education timeline entries |
| `codingSkills` | Engineering word cloud — `name` and `level` (0–100) |
| `languageSkills` | Language skill bars — `name` and `level` (0–100) |
| `contact` | `location` and `email` |

Reload the page after saving to see changes.
