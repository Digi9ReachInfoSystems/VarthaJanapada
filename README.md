# DIPR New Backend

Node.js / Express API for the Karnataka DIPR public website and admin apps. MongoDB for content, Azure Blob for uploads, Firebase Admin where needed, JWT auth for users.

**Related apps:** `karnatakadipr` (public frontend) · `admin-varthaownership/dipradmin` (admin)

---

## Stack

- Node.js + Express
- MongoDB (Mongoose)
- Azure Blob Storage
- Firebase Admin
- JWT (access + refresh)
- Helmet + CORS

---

## Run locally

```bash
npm install
```

Create a `.env` file in this folder (see **Environment variables** below). **Do not commit `.env` or paste secrets into README or git.**

```bash
npm run dev    # frees port if busy, then starts server
# or
npm start
```

Default port: `PORT` from `.env`, or `3000`.

Health check: `GET /` → `Server running securely!`

---

## Environment variables

Configure in `.env` only (never in README or source control):

| Variable | Purpose |
|----------|---------|
| `PORT` | HTTP port |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Legacy JWT (some user flows) |
| `JWT_ACCESS_SECRET` | Access token signing |
| `JWT_REFRESH_SECRET` | Refresh token signing |
| `FIREBASE_SERVICE_ACCOUNT_BASE64` | Firebase Admin (base64 JSON) |
| `AZURE_STORAGE_CONNECTION_STRING` | Azure Blob uploads |
| `YOUTUBE_API_KEY` | YouTube feed |
| `YOUTUBE_CHANNEL_ID` | YouTube channel |
| `INSTAGRAM_ACCESS_TOKEN` | Instagram Graph API |
| `INSTAGRAM_USER_ID` | Instagram user id |
| `INSTAGRAM_CACHE_TTL_MS` | Optional reels/media cache TTL |
| `NODE_ENV` | `production` for secure cookies |

---

## API overview

Base URL example: `http://localhost:7000`

### News (used by public site — `news-new`)

| Method | Path | Notes |
|--------|------|--------|
| GET | `/api/news-new/getNewsByNewsType/:newsType` | `statenews`, `districtnews`, `specialnews`, `articles`, `combinedlatestnews` |
| GET | `/api/news-new/getStateNews` | Paginated state news |
| GET | `/api/news-new/getArticles` | Paginated articles |
| GET | `/api/news-new/getLatestCombinedNews` | Combined latest |
| GET | `/api/news-new/getAllLatestNews` | All latest |
| GET | `/api/news-new/trending` | Trending news |

**Query params (news):**

- `homepage=true` — latest 10 for homepage sections
- `page`, `limit` — pagination (limit max 50)
- `magazineType` — optional: `magazine` (Vartha Janapada) or `magazine2` (March of Karnataka). **Omit** to return both magazines combined (used on homepage State/District news after frontend update)
- `date` — filter `YYYY-MM-DD`

### Districts

| Method | Path |
|--------|------|
| GET | `/api/districts-new/...` | District list + district news (see routes) |

### Media & homepage extras

| Prefix | Purpose |
|--------|---------|
| `/api/youtube` | Latest videos / shorts |
| `/api/instagram` | Media + reels |
| `/api/live-tv` | Live TV panel |
| `/api/newarticles` | Our Services list |
| `/api/latestnotifications` | Latest notifications |
| `/api/photos`, `/api/photos-new` | Photo gallery |
| `/api/video-new`, `/api/longVideo-new` | Short / long video listings |

### Magazines

| Prefix | Magazine |
|--------|----------|
| `/api/magazine` | Vartha Janapada (`magazine`) |
| `/api/magazine2` | March of Karnataka (`magazine2`) |

### Auth & admin

| Prefix | Purpose |
|--------|---------|
| `/api/auth` | Login, refresh, logout |
| `/api/users` | User management |
| `/api/category`, `/api/tags` | Categories / tags |
| `/api/banner`, `/api/static` | Banners, static pages |
| `/api/search` | Search |
| `/visitors` | Visitor counter |

Legacy routes under `/api/news`, `/api/video`, `/api/longVideo` remain for older clients.

---

## Magazine types

| `magazineType` | Product |
|----------------|---------|
| `magazine` | Vartha Janapada |
| `magazine2` | March of Karnataka |

Homepage sections on the public site now call news APIs **without** `magazineType` for combined State/District feeds. Hero “Latest News” may still pass `magazineType=magazine` only.

---

## CORS

Allowed origins are configured in `index.js` (localhost Vite ports, production DIPR / Vartha domains). Add new frontend URLs there when deploying.

---

## Project layout

```
diprnewbackend/
├── index.js                 # App entry, routes, CORS, Helmet
├── .env                     # Secrets (local only — not in git)
├── package.json
└── src/
    ├── config/              # MongoDB, Azure, Firebase
    ├── controller/
    ├── middleware/          # Auth, roles
    ├── models/
    ├── routes/
    └── services/            # Instagram, YouTube, etc.
```

---

## Security notes

- **README must not contain credentials.** If secrets were ever pasted here, rotate JWT keys, MongoDB password, Azure keys, and Firebase service account immediately.
- Keep `.env` in `.gitignore`.
- Production: set `NODE_ENV=production` and use HTTPS-only cookies for auth.

---

## Project review — 28 Jul 2026

- Public frontend (`karnatakadipr`) uses **`/api/news-new`** for homepage news with optional `magazineType`; combined feeds omit the filter.
- Instagram reels: **`GET /api/instagram/reels`**
- Live TV + services: **`/api/live-tv`**, **`/api/newarticles`**
- Admin uploads typically go through Azure via `src/config/azureService.js`

---

## Scripts

| Command | Description |
|---------|-------------|
| `npm start` | Start server |
| `npm run dev` | Free port + start |
| `npm run free-port` | Kill process on configured port |
