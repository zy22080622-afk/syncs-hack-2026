# TL Note — ACG Cultural Wiki

> Machine translation gives you the word. TL Note gives you what the word means to the people using it.

TL Note is a multilingual contextual dictionary for anime, comics, games, and online fandom culture. It helps people understand not only the literal translation of a term, but also its cultural meaning, tone, origin, and use across different communities.

Created for **SYNCS Hack 2026**, addressing the challenge of making information accessible across differences in age, language, and digital literacy.

## The problem

Fandom language changes quickly and often crosses Japanese, Chinese, and English-speaking communities. A literal translation may be technically correct while completely missing what a term means to the people using it.

This creates barriers for:

- people who are new to ACG and fandom communities;
- parents trying to understand their children's online posts;
- fans participating in communities outside their first language;
- anyone encountering unfamiliar slang, references, or community-specific meanings.

## What TL Note does

- Explains the difference between a machine translation and a term's real cultural meaning.
- Provides English, Chinese, and Japanese explanations.
- Offers both a concise beginner-friendly explanation and a more detailed cultural explanation.
- Searches across original terms, aliases, romanisation, translations, tags, and meanings.
- Decodes full sentences and highlights recognised fandom terminology.
- Compares how the same term is understood across different language communities.
- Supports category browsing, related terms, dark mode, and a family-friendly filtering mode.
- Clearly labels AI-generated entries as drafts rather than verified facts.

## How it works

The core dictionary runs locally in the browser. TL Note builds an index from every term and its aliases, then scans text from left to right using longest-match detection. This works with Chinese and Japanese text where words are not separated by spaces. Latin-script terms use word-boundary checks to avoid accidental partial matches.

Recognised terms are highlighted and linked to their dictionary entries. If the optional backend is available, unrecognised expressions can be sent to a language model to generate a clearly labelled draft for later review.

Because search, browsing, term pages, and local sentence decoding all run in the frontend, the core experience remains available even when the AI service is offline.

## Technology

### Frontend

- React 18
- Vite
- React Router
- Fuse.js

### Backend

- Python
- FastAPI
- Pydantic
- HTTPX
- Optional Anthropic or OpenAI-compatible language model

## Project structure

```text
.
├── frontend/
│   ├── src/
│   │   ├── components/   # Reusable interface components
│   │   ├── context/      # Language, display, and safety preferences
│   │   ├── data/         # Dictionary entries and categories
│   │   ├── lib/          # Search, matching, and API utilities
│   │   └── pages/        # Application pages
│   ├── package.json
│   └── vite.config.js
├── backend/
│   ├── main.py           # FastAPI application
│   ├── fixtures.json     # Optional offline AI responses
│   └── requirements.txt
└── README.md
```

## Run locally

### Frontend

The frontend contains the complete local dictionary experience and can run without the backend.

```bash
cd frontend
npm install
npm run dev
```

Open [http://localhost:5173](http://localhost:5173).

### Optional AI backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt
cp .env.example .env
uvicorn main:app --reload --port 8000
```

Add an Anthropic or OpenAI-compatible API key to `backend/.env`. During local development, Vite proxies `/api` requests to `http://127.0.0.1:8000`.

The backend exposes:

- `GET /api/health` — service status;
- `POST /api/draft` — generate a draft entry for an unfamiliar term;
- `POST /api/decode` — identify possible unfamiliar terms in a passage.

## Main routes

| Route | Purpose |
|---|---|
| `/` | Home, search, featured terms, and categories |
| `/decode` | Decode fandom terminology in a full sentence |
| `/search?q=` | Search results |
| `/term/:id` | Detailed term entry |
| `/explore` | Browse all categories |
| `/explore/:cat` | Browse one category |
| `/about` | Project approach and roadmap |

## Deployment

### Frontend

Deploy the `frontend` directory as a Vite project on Vercel. The included `vercel.json` supports client-side routing.

If the backend is deployed separately, configure:

```text
VITE_API_BASE=https://your-backend.example.com
```

### Backend

The FastAPI service can be deployed to platforms such as Render or Railway with:

```bash
uvicorn main:app --host 0.0.0.0 --port $PORT
```

Configure the environment variables described in `backend/.env.example` on the hosting platform.

## Content and AI transparency

TL Note separates reviewed dictionary content from AI-generated suggestions. Generated entries always receive the `ai-draft` status and are not presented as verified material. The project is designed around human review, visible confidence, and honest handling of uncertain meanings.

## Future development

- Community contribution and moderation workflows
- Sources and revision history for dictionary entries
- Additional languages and regional fandom communities
- Expanded accessibility and reading-level controls
- Improved contextual recognition for unfamiliar expressions

## Team

Built for **SYNCS Hack 2026**.
