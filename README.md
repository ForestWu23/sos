# SOS — Save Our Secrets

A collection of developer tools that run **entirely in your browser** — no data ever leaves your machine. Stop pasting sensitive tokens, JSON, and credentials into third-party websites.

## Tools

| Tool | Description |
|---|---|
| **JsonFormatter** | Beautify / minify JSON with syntax highlighting, line numbers, and copy to clipboard |
| **EpochConverter** | Convert epoch timestamps (s / ms / μs / ns) to human-readable dates; side-by-side comparison with time diff |
| **DiffChecker** | Side-by-side text comparison with line-level and word-level highlighting, synced scrolling |
| **UrlDecoder** | URL encode & decode with one-click swap and copy |
| **Base64** | Base64 encode & decode with full Unicode support |
| **JwtDecoder** | Decode JWT header & payload with syntax highlighting and expiration check |
| **YamlValidator** | Validate, reformat, and convert YAML to JSON |

## Tech Stack

- **React 18** + **TypeScript**
- **Vite** — fast build and dev server
- **Tailwind CSS** — utility-first styling
- **React Router** (HashRouter) — client-side routing compatible with GitHub Pages
- **lucide-react** — icons
- **js-yaml** — YAML parsing
- No backend, no analytics, no external requests

## Local Development

### Prerequisites

- Node.js 18 or higher
- npm

### Setup

```bash
# Clone the repo
git clone https://github.com/<your-username>/sos.git
cd sos

# Install dependencies
npm install

# Start the dev server
npm run dev
```

The app will be available at **http://localhost:5173/sos/**

Hot-reload is enabled — any file change is reflected instantly in the browser.

### Other Commands

```bash
# Production build (output to dist/)
npm run build

# Preview the production build locally
npm run preview

# Type-check without building
npm run typecheck
```

## Deployment

This project deploys automatically to **GitHub Pages** via GitHub Actions on every push to `main`.

To enable it on your fork:
1. Go to **Settings → Pages → Build and deployment → Source**
2. Select **GitHub Actions**
3. Push to `main` — the workflow at `.github/workflows/deploy.yml` handles the rest

The live site will be at `https://<your-username>.github.io/sos/`

## License

MIT
