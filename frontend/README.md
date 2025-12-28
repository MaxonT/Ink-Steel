# Frontend

This directory contains all frontend code for the Ink & Steel application.

## Directory Structure

```
frontend/
├── assets/
│   ├── styles/
│   │   ├── tokens.css      # Design tokens (spacing, colors, typography, etc.)
│   │   ├── states.css      # State styles (hover, focus, disabled, etc.)
│   │   └── main.css        # Main stylesheet
│   └── scripts/
│       ├── components/     # Web Components
│       ├── utils/          # Utility functions
│       └── main.js         # Main application script
├── data/                   # JSON data files
├── public/                 # Public assets (manifest, robots.txt, etc.)
└── *.html                  # HTML pages
```

## Development

All HTML pages should:
- Import `tokens.css`, `states.css`, and `main.css` in order
- Use assets from `assets/scripts/` and `assets/styles/`
- Reference data files from `data/`

