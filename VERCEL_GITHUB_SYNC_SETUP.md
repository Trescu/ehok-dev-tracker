# eHÖK Dev Tracker – Vercel + GitHub CSV Sync + Login

Ez a verzió egy minimális, biztonságosabb serverless megoldást használ:

```txt
Frontend → Vercel Function → GitHub API → data/tracker.csv
```

A GitHub token és az admin jelszó nem kerül a publikus frontend kódba. Ezeket a Vercel Environment Variables alatt kell beállítani.

## API-k

- `POST /api/auth-check`
  - body: `{ "password": "..." }`
  - helyes jelszó esetén rövid élettartamú, szerveroldalon aláírt session tokent ad vissza.

- `GET /api/auth-check`
  - ellenőrzi a session tokent.

- `GET /api/load-tracker-csv`
  - GitHubból beolvassa a CSV-t.

- `POST /api/save-tracker-csv`
  - GitHubba commitolja az új CSV-t.

## Vercel Environment Variables

Állítsd be a Vercel projektben:

```txt
GITHUB_OWNER=rescu
GITHUB_REPO=ehok-dev-tracker
GITHUB_BRANCH=main
GITHUB_CSV_PATH=data/tracker.csv
GITHUB_TOKEN=github_fine_grained_pat
ADMIN_KEY=sajat_hosszu_admin_jelszo
AUTH_TOKEN_SECRET=sajat_hosszu_random_secret
AUTH_SESSION_TTL_SECONDS=604800
```

Az `AUTH_TOKEN_SECRET` opcionális, de ajánlott. Ha nincs megadva, a rendszer az `ADMIN_KEY` értékét használja aláírási kulcsként.

## GitHub token jogosultság

Fine-grained Personal Access Token ajánlott:

- Repository access: csak az `ehok-dev-tracker` repo
- Permissions:
  - Contents: Read and write
  - Metadata: Read

## Fontos

Ne tedd bele a következőket a frontend kódba vagy a repóba:

```txt
GITHUB_TOKEN
ADMIN_KEY
AUTH_TOKEN_SECRET
```

Ezek kizárólag Vercel Environment Variable-ként legyenek tárolva.
