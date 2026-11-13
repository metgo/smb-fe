# smb-fe

Frontend for the regional SMB directory site: a Pinterest-style grid of local businesses, favorites, and a mini-site for each business.

## Imported code

The three earlier metgo codebases are nested here, each imported from its `main` branch with full git history:

| Folder | Source |
| --- | --- |
| `travel-fe/` | metgodev/Travel-FE (Next.js) |
| `workspace-fe/` | metgodev/Workspace-FE (Vite + React) |
| `marketplace-be/` | metgodev/Marketplace-BE (NestJS) |

Each folder keeps its own `package.json` and lockfile; run commands from inside the folder. Their `.github/` workflows are not active here because GitHub only reads workflows from the repo root.
