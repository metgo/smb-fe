# Website Registration Guide

This guide walks you through the complete process of registering a new website on the platform. Follow each step in order — each entity you create builds on the previous one.

---

## Overview

Registering a website requires completing **4 setup stages** in this exact sequence:

```
1. Create a DMO  →  2. Create an Authority  →  3. Create / Select Campaigns  →  4. Configure Website
```

Navigate to **Website Config** in the sidebar to access all four stages.

---

## Stage 1 — Create a DMO

**Sidebar:** Website Config > DMOs

A DMO (Destination Management Organization) is the top-level entity. Everything else belongs to a DMO.

### Steps

1. Click **Create DMO**.
2. Fill in the **General** tab:

   | Field       | Required | Notes                               |
   | ----------- | -------- | ----------------------------------- |
   | Name        | Yes      | Max 80 characters                   |
   | Description | No       | Max 300 characters                  |
   | Logo        | No       | Upload a file or paste an image URL |
   | Active      | —        | Enabled by default                  |

3. _(Optional)_ Switch to the **Boundary** tab to draw a geographic area on the map. You can set:
   - A polygon boundary (region outline)
   - A center point (coordinates)

4. Click **Save**.

> Once saved, the DMO name cannot be changed. Choose it carefully.

---

## Stage 2 — Create an Authority

**Sidebar:** Website Config > Authorities

An Authority is a subdivision within a DMO (e.g., a city, district, or regional body). You must have at least one DMO before creating an Authority.

### Steps

1. The page shows tabs for each DMO. Select the DMO you created in Stage 1, or use the URL parameter `?dmoId={id}`.
2. Click **Create Authority**.
3. Fill in the **General** tab:

   | Field       | Required | Notes                                           |
   | ----------- | -------- | ----------------------------------------------- |
   | Name        | Yes      | Max 80 characters                               |
   | DMO         | Yes      | Select the parent DMO — cannot be changed later |
   | Description | No       | Max 300 characters                              |
   | Logo        | No       | Upload a file or paste an image URL             |
   | Active      | —        | Enabled by default                              |

4. _(Optional)_ Switch to the **Boundary** tab to define the authority's geographic area on the map.
5. Click **Save**.

> The parent DMO is locked after the authority is created. Make sure you select the correct one.

---

## Stage 3 — Campaigns

**Sidebar:** Website Config > Campaigns

Campaigns are promotional entities you can create directly from this page or browse existing ones to assign to your website in the next stage.

### Creating a new campaign

Click **Create Campaign** and fill in the details. Each campaign has a name, type, code, and optional description and logo.

### What to note before moving on

- Browse campaigns by name, type, and code (shown as `#CODE`).
- Decide which campaigns you want to assign to your website:
  - **Primary Campaign** — the main campaign for the website (one only).
  - **Additional Campaigns** — supplementary campaigns (multiple allowed).

You will select these in Step 2 of the Website Configuration form.

---

## Stage 4 — Configure the Website

**Sidebar:** Website Config > Websites

This is a **10-step form**. Complete the steps in order. Required fields are marked with `*`.

---

### Step 1 — General Settings

| Field                  | Required | Notes                                                  |
| ---------------------- | -------- | ------------------------------------------------------ |
| Website Name (English) | Yes      |                                                        |
| Website Name (Hebrew)  | Yes      |                                                        |
| Website Name (Arabic)  | Yes      |                                                        |
| Slogan (English)       | Yes      |                                                        |
| Slogan (Hebrew)        | Yes      |                                                        |
| Slogan (Arabic)        | Yes      |                                                        |
| Website URL            | Yes      | Full URL including `https://`                          |
| Identifier ID          | Yes      | Unique slug — cannot be changed after creation         |
| Purpose                | No       | Marketplace / Traveling / Other (default: Marketplace) |
| GA Property ID         | No       | Google Analytics property ID                           |
| Platform Charge        | No       | Percentage value (0–100)                               |

---

### Step 2 — Campaigns

Assign campaigns you identified in Stage 3.

| Field                | Notes                                    |
| -------------------- | ---------------------------------------- |
| Primary Campaign     | Select one campaign as the main campaign |
| Additional Campaigns | Select one or more secondary campaigns   |

Click a campaign card to select it. A checkmark appears on selected items.

---

### Step 3 — Branding & Media

Upload visual assets for the website.

| Field            | Accepted Formats | Notes                      |
| ---------------- | ---------------- | -------------------------- |
| Logo             | PNG, SVG, WebP   | Main website logo          |
| Favicon          | ICO, PNG         | Browser tab icon           |
| Special Symbol   | PNG, SVG, WebP   | Optional decorative symbol |
| Background Image | ICO, PNG         | Homepage background        |

Each field supports drag-and-drop upload or URL input. Upload progress is shown inline.

---

### Step 4 — Homepage Videos

Upload videos shown on the homepage.

| Field          | Notes                             |
| -------------- | --------------------------------- |
| Desktop Videos | Video files + optional thumbnails |
| Mobile Videos  | Video files + optional thumbnails |

You can upload multiple videos per device type and set each one as active or inactive.

---

### Step 5 — Theme & Appearance

Customize the visual style of the website.

| Field            | Default   | Notes                                                                |
| ---------------- | --------- | -------------------------------------------------------------------- |
| Primary Color    | `#0d9488` | Hex color or color picker                                            |
| Secondary Color  | `#6366f1` | Hex color or color picker                                            |
| Background Color | `#ffffff` | Hex color or color picker                                            |
| Font Family      | Inter     | Inter, Roboto, Open Sans, Poppins, Montserrat, Lato, Nunito, Raleway |
| Font Source URL  | —         | URL to a custom font (optional)                                      |
| Button Style     | —         | Rounded (pill), Square, or Custom radius (0–24px)                    |
| Dark Mode        | Off       | Toggle to enable dark mode                                           |

---

### Step 6 — Social Media

| Field                 | Notes            |
| --------------------- | ---------------- |
| Facebook URL          | Full page URL    |
| Instagram URL         | Full profile URL |
| Twitter / X URL       | Full profile URL |
| YouTube URL           | Channel URL      |
| LinkedIn URL          | Company page URL |
| TikTok URL            | Profile URL      |
| Show Social Icons     | Toggle on/off    |
| Open Links in New Tab | Toggle on/off    |

All fields are optional.

---

### Step 7 — Contact Details

| Field                 | Required | Notes                    |
| --------------------- | -------- | ------------------------ |
| Phone Number          | Yes      |                          |
| Email                 | Yes      |                          |
| WhatsApp Number       | No       |                          |
| Support Email         | No       |                          |
| Physical Address      | No       |                          |
| Google Maps Embed URL | No       |                          |
| WhatsApp Message (EN) | No       | Default message template |
| WhatsApp Message (HE) | No       | Default message template |
| WhatsApp Message (AR) | No       | Default message template |
| Enable Click-to-Call  | —        | Toggle                   |
| Enable WhatsApp Chat  | —        | Toggle                   |

---

### Step 8 — SEO & Meta Tags

| Field                    | Required | Notes                                   |
| ------------------------ | -------- | --------------------------------------- |
| Meta Title               | Yes      | Max 60 characters                       |
| Meta Description         | No       |                                         |
| Meta Keywords            | No       |                                         |
| OG Title                 | No       | Social sharing title                    |
| OG Description           | No       | Social sharing description              |
| OG Image                 | No       | Image shown when shared on social media |
| Twitter Card Title       | No       |                                         |
| Twitter Card Description | No       |                                         |
| Twitter Card Image       | No       |                                         |
| Canonical URL            | No       |                                         |
| Robots.txt               | No       | Default: `User-agent: * / Allow: /`     |
| Sitemap URL              | No       |                                         |

---

### Step 9 — Analytics & Tracking

| Field                 | Format         | Notes                              |
| --------------------- | -------------- | ---------------------------------- |
| Google Analytics ID   | `G-XXXXXXXXXX` |                                    |
| Google Tag Manager ID | `GTM-XXXXXXX`  |                                    |
| Facebook Pixel ID     | —              |                                    |
| Header Scripts        | —              | Custom code injected in `<head>`   |
| Footer Scripts        | —              | Custom code injected in `<footer>` |

All fields are optional.

---

### Step 10 — Localization

| Field                  | Options                                                                                                                                          |
| ---------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------ |
| Default Language       | English, Hebrew, Arabic, French, Spanish, German, Italian, Portuguese, Russian, Chinese, Japanese                                                |
| Timezone               | UTC, America/New_York, America/Los_Angeles, Europe/London, Europe/Paris, Asia/Dubai, Asia/Jerusalem, Asia/Tokyo, Asia/Shanghai, Australia/Sydney |
| Currency               | USD, EUR, GBP, ILS, AED, SAR, JPY, CNY, CAD, AUD                                                                                                 |
| Date Format            | MM/DD/YYYY, DD/MM/YYYY, YYYY-MM-DD, DD-MM-YYYY, MMM DD YYYY                                                                                      |
| Multi-language Support | Toggle on/off                                                                                                                                    |

---

## Completion Checklist

Use this checklist before going live:

- [ ] DMO created with name and logo
- [ ] Authority created and linked to the correct DMO
- [ ] Campaigns reviewed and target campaigns noted
- [ ] Website name and slogan provided in all three languages (EN, HE, AR)
- [ ] Website URL and Identifier ID set
- [ ] Primary campaign assigned
- [ ] Logo, favicon, and background image uploaded
- [ ] Homepage videos uploaded (desktop and mobile)
- [ ] Brand colors and font selected
- [ ] Phone number and email filled in (required)
- [ ] Meta title filled in (required for SEO)
- [ ] Analytics IDs entered (if applicable)
- [ ] Default language, timezone, and currency set

---

## Quick Reference — Required Fields

| Stage            | Required Fields                                                        |
| ---------------- | ---------------------------------------------------------------------- |
| DMO              | Name                                                                   |
| Authority        | Name, Parent DMO                                                       |
| Website — Step 1 | Name (×3 languages), Slogan (×3 languages), Website URL, Identifier ID |
| Website — Step 7 | Phone Number, Email                                                    |
| Website — Step 8 | Meta Title                                                             |

---

## Notes

- **Identifier ID** is permanent once a website is created. Plan this value carefully (e.g., use a short, URL-safe slug).
- **DMO** and **Authority parent** cannot be reassigned after creation.
- The website form tracks an overall **completion score** based on how many fields are filled. Aim for 100% before launch.
- A website can be deactivated from the Websites list page without deleting it.
