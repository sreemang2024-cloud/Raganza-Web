# Raganza RAG (Frontend + API)

This app provides:
- A landing page + navigation
- User authentication (Credentials via NextAuth + local SQLite)
- Document management (upload + scan/index)
- Q&A that answers **only from retrieved snippets**, with **citations** and a **confidence** level
- Mandatory “not found” behavior:
  > “I could not find this in the provided documents. Can you share the relevant document?”

## Setup

1) Create an env file:

```bash
copy .env.example .env.local
```

2) Start the dev server:

```bash
npm run dev
```

Open `http://localhost:3000`.

## Documents

- Put documents in `docs/` (supported: `.txt`, `.md`, `.pdf`), or upload from the **Documents** page.
- Go to **Dashboard** → **Scan & index now** (or **Documents** → **Scan & index**).

## Q&A API

- **POST** `/api/ask`

Body:

```json
{ "question": "your question here" }
```

Response:

```json
{
  "answer": "short paragraph (built only from retrieved snippets)",
  "sources": [
    { "document": "somefile.pdf", "snippet": "…", "score": 3.14 }
  ],
  "confidence": "high"
}
```

If retrieval is insufficient, the API returns the mandatory message above with `sources: []` and `confidence: "low"`.

