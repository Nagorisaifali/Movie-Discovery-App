# cinepick

A database-free movie discovery app built with React and an Express API.

## Run locally

1. Start the API: `cd Backend && npm install && npm run dev`
2. Start the client in another terminal: `cd Frontend && npm install && npm run dev`
3. Open the Vite URL shown in the terminal.

The app ships with a curated demo catalog, so it works immediately without credentials. For live movie data, set `TMDB_API_KEY` before starting the backend. Wishlist items are persisted in browser localStorage, so no database is required.

## Product features

- Debounced movie search with genre, mood, and sort controls
- Paginated discovery with a load-more flow for large result sets
- Movie details with cast, director, ratings, private notes, and browsing history
- Persistent wishlist, ratings, and notes stored in browser localStorage
- Mood matcher and watch-party planner backed by Express memory storage
- Loading skeletons, empty states, offline demo fallback, request cancellation, and API error feedback
- Responsive layout for desktop and mobile screens

## Architecture decisions
Wishlist data belongs to the user rather than the movie service, so it is stored in localStorage under separate keys for saved movies, ratings, notes, and history. Watch parties are intentionally memory-only because the assignment requested no database; restarting the backend clears them.

## API routes

- `GET /api/genres`, `GET /api/moods`, `GET /api/stats` - discovery metadata
- `POST /api/recommendations` - ranked local recommendations
- `GET|POST|DELETE /api/watch-parties` - in-memory planner data
- `GET /api/health` - service health check

## AI transparency

AI was used to help understand the third-party API shape, generate initial Express and React scaffolding, troubleshoot build issues, and review edge cases. The application structure, no-database persistence model, API boundary, caching strategy, fallback behavior, and user-facing features were selected and reviewed for this assignment.

cd Backend
npm run dev
```

The key is read only by Express and is never sent to the browser. Do not commit it to the repository.

## Data flow

React debounces search and filter changes, cancels stale requests with `AbortController`, and requests later pages only when **Load more films** is selected. Express validates the page range, translates genre names to TMDB IDs, normalizes external records, applies an eight-second timeout, and caches identical TMDB responses for five minutes.

When TMDB is unavailable, the client displays the local catalog with an explanatory notice. Wishlist, ratings, notes, and recently opened movies are persisted in localStorage. Watch parties are held in backend memory and reset when the server restarts.

## Verification

Run from the project root:

```powershell
Push-Location Frontend; npm run lint; npm run build; Pop-Location
Push-Location Backend; node --check index.js; Pop-Location
```

Useful smoke-test URLs while the backend is running:

- `http://localhost:5000/api/health`
- `http://localhost:5000/api/movies?page=1`
- `http://localhost:5000/api/genres`

The remaining sections below are the original Vite reference notes and are not required to run cinepick.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react) uses [Oxc](https://oxc.rs)
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react-swc) uses [SWC](https://swc.rs/)

## React Compiler

The React Compiler is not enabled on this template because of its impact on dev & build performances. To add it, see [this documentation](https://react.dev/learn/react-compiler/installation).

## Expanding the Oxlint configuration

If you are developing a production application, we recommend using TypeScript with type-aware lint rules enabled. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) for information on how to integrate TypeScript and Oxlint's TypeScript related rules in your project.
