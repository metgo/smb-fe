# Vendor Onboarding — Process & Agent Spec

Platform: Negev Time marketplace · Channels: web form + WhatsApp · Vendor-facing language: Hebrew (RTL)

---

## 1. Goals

- A vendor goes from first contact to an approved, published business page in under 20 minutes of their own time.
- Every published page has: full description, short description (tagline), category, tags, audience segments, 3–4 curated images, 2–4 bookable products, verified contact details.
- All generated content is vendor-approved before going live.

## 2. Flow overview

**Invite → Pre-fill → Interview → Products → Generate + Images → Approve → QA → Publish → Refresh**

Vendor-input steps: basic details, interview answers, products, image selection, approval.
Automated steps: pre-fill research, follow-up probes, content generation, publishing, refresh pings.

## 3. Step-by-step

### 3.1 Invite
- Single WhatsApp link / QR code. Opening message shows a screenshot or link of a finished example business page: "ככה ייראה העמוד שלכם בעוד רבע שעה."
- Web form variant: same content on a landing page.

### 3.2 Basic details (vendor)
Collect four fields: business name, phone, email, contact person name.
Validate phone format (IL) and email before proceeding.

### 3.3 Pre-fill (agent)
- Agent searches public sources by business name + region (Google Maps listing, Facebook/Instagram page, existing tourism-site mentions).
- Produces a pre-filled draft: address, hours, category guess, existing photos/descriptions found.
- The interview then opens with: "מצאנו את זה עליכם — נכון? מה חסר?" Reviewing beats creating; vendor only corrects and adds.

### 3.4 Six-question interview (vendor)
Free text or **voice notes** (WhatsApp) — transcribe voice before processing. One question per message on WhatsApp; all six visible on the web form.

1. **איך הכל התחיל?** ספרו את הסיפור של העסק — מי הקים אותו, מתי, ומה החלום מאחוריו.
   → opening narrative of full description.
2. **מה אתם מציעים בפועל, ואיך נראה ביקור טיפוסי אצלכם מרגע ההגעה ועד העזיבה?**
   → category, activity image tags, description body.
3. **מה אתם עושים הכי טוב — הדבר שאתם גאים בו ושמבדיל אתכם מעסקים דומים?** (מתכון סודי, נוף שאין לאף אחד, יחס אישי, ידע ייחודי...)
   → differentiation paragraph, hero tagline.
4. **מי הלקוחות שהכי נהנים אצלכם, ולמי זה פחות מתאים? ספרו על רגע שבו ראיתם לקוח יוצא מאושר.**
   → audience segments, mood tags, concrete scene for the writer.
5. **מתי הכי שווה להגיע, ומה הלקוח צריך לדעת לפני?** (עונות, שעות, נגישות, חניה, מה להביא, הזמנה מראש)
   → season/accessibility/service tags, FAQ content. On WhatsApp split into two messages (when + what to know).
6. **אם לקוח מרוצה היה ממליץ עליכם לחבר במשפט אחד — מה הוא היה אומר?**
   → short description, almost verbatim.

**Follow-up rule:** if an answer is under ~10 words, ask exactly one probe ("ספרו עוד קצת — למשל...?" with a question-specific example). Never more than one probe per question.

### 3.5 Products step (vendor)
"מהם 2–4 הדברים שלקוח יכול להזמין או לקנות אצלכם, ובאיזה מחיר?"
Per product: name, one-line description, price (₪), duration if relevant, booking required y/n.

### 3.6 Generate (agent)
Agent merges pre-fill + interview + products into the **structured output** (schema in §5), drafts the page, and shortlists 6–8 images from the tagged image folder by matching `image_type_tags` + `image_mood_tags`.

### 3.7 Image selection (vendor)
Vendor picks 3–4 of the 6–8 shortlisted images (tap to select on WhatsApp / grid on web). Option to upload own photos — flagged for manual curation before use.

### 3.8 Preview & approve (vendor)
Send preview link: "זה העמוד שלכם — לאשר או לתקן?"
- Approve → continues to QA/publish. Approval is logged (content sign-off).
- Free-text correction → agent regenerates only the affected fields, re-sends preview. Max 3 cycles, then escalate to human.

### 3.9 Human QA
For the first ~30 vendors, review every generated page before publishing. Track recurring agent mistakes (wrong category, repeated phrases, over-claiming) and patch the agent prompt. Afterwards, spot-check 1 in 10.

### 3.10 Publish & refresh
- Publish page; send vendor the live link.
- Quarterly WhatsApp ping: "השעות עדיין נכונות? משהו חדש לעונה?" One-tap "הכל נכון" or free-text update → agent applies the diff, re-sends preview if descriptions changed.

## 4. Taxonomy (fixed — agent must map to these only)

- **Categories:** אוכל · לינה · אטרקציות · תרבות · טיולים · אירועים
- **Audience:** משפחות · זוגות · קבוצות · יחידים
- **Season tags:** קיץ · חורף · סתיו · אביב
- **Practical tags:** נגיש · נגיש לכיסאות גלגלים · ידידותי למשפחות · חניה · שירותים · מקום לפיקניק · הרפתקאות · רגיעה
- **Image type tags:** jeep-tour, hiking, winery, bnb, restaurant, stargazing, crater-view, workshop, camping, spa, farm, museum (extend to match image folder; hyphenated, matching the agent code)
- **Image mood tags:** sunset, night-sky, romantic, family-fun, adventure, calm, panorama

## 5. Agent I/O

**Input:** `{basic_fields, prefill_data, interview_answers[6], products[], taxonomy}`

**Output (fixed JSON):**
```json
{
  "category": "טיולים",
  "tags": ["קיץ", "נגיש", "חניה"],
  "audience": ["משפחות", "זוגות"],
  "image_type_tags": ["jeep-tour", "crater-view"],
  "image_mood_tags": ["sunset", "adventure"],
  "short_desc": "עד 60 תווים — ההמלצה של הלקוח, מזוקקת",
  "full_desc": "3-4 פסקאות: סיפור → חוויה → מה מייחד → למי מתאים",
  "highlights": ["3-4 בולטים קצרים"],
  "practical": {"best_time": "", "accessibility": "", "parking": "", "booking": "", "bring": ""},
  "products": [{"name": "", "desc": "", "price_ils": 0, "duration": "", "booking_required": false}],
  "confidence_flags": ["fields the agent was unsure about — for QA attention"]
}
```

**Writing rules for the agent:**
- Hebrew, warm but not salesy; no superlatives the vendor didn't claim.
- Never invent facts (prices, years, awards). Missing → leave empty + add confidence flag.
- Full description structure: story (Q1) → experience (Q2) → edge (Q3) → who it's for (Q4). Practical details (Q5) go to the practical block, not the prose.
- Short description ≤ 60 characters, derived from Q6.

## 6. Metrics to track

- Completion rate per step (find the drop-off question)
- Time from invite to approval
- % of answers that triggered a follow-up probe (question quality signal)
- Correction cycles per vendor (agent quality signal)
- % vendors choosing voice notes vs text
