# Site demo

`site-demo.html` is a self-contained, clickable demo of the public SMB site (no backend, no build):

- Home: Pinterest-style masonry wall of sample Ramat Negev businesses, with image, title, short description, location and a heart to mark favorites (saved in the browser). Filters by town and by taxonomy area, plus search.
- Favorites view (`#favorites`).
- A mini-site per business (`#b-<id>`): photo gallery with lightbox, about, the owner's recommendation, products and services, contact details, opening hours with "open now", directions (Waze / Google Maps), similar businesses nearby.

Businesses, photos and contact details are samples. Photos are drawn at runtime on a canvas so the page needs no image hosting. Categories use the Hebrew names of the taxonomy CSV (`workspace-fe/src/lib/businessTaxonomy.ts`).

Published as a Claude artifact: https://claude.ai/artifact/736W4YjyjzAyvg4ffmxn5C. The "for businesses" link points to the Workspace onboarding demo: https://claude.ai/artifact/Esyeh3uuGSgcJEKULPDt3G.

The file is an artifact body (no `<html>`/`<head>`); to open it locally, wrap it in a basic HTML document or just open it in a browser, which tolerates the missing tags.
