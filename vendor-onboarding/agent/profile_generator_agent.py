"""
Negev Time — Profile Generator Agent
------------------------------------
Takes the vendor onboarding form submission (JSON produced by vendor-onboarding.html
or the WhatsApp interviewer) and produces the complete business profile JSON.

Design principles:
- Vendor-provided facts (name, phone, email, contact, raw answers, products) are copied
  verbatim in code — the model never rewrites them.
- The model only generates interpretive fields: descriptions, category, tags, audience,
  image tags, highlights, practical info.
- Closed taxonomy is enforced in code after generation; invalid values are dropped
  and flagged, never silently kept.
- Anything uncertain lands in confidence_flags → routes the profile to human QA.

Usage:
    export ANTHROPIC_API_KEY=sk-ant-...
    python profile_generator_agent.py submission.json > profile.json

    # or as a library:
    from profile_generator_agent import generate_profile
    profile = generate_profile(submission_dict)
"""

import json
import os
import re
import sys

import anthropic

MODEL = os.environ.get("PROFILE_AGENT_MODEL", "claude-sonnet-5-5")
MAX_RETRIES = 2
MAX_TOKENS = 16000

# ---------------------------------------------------------------- taxonomy ---

TAXONOMY = {
    "category": ["אוכל", "לינה", "אטרקציות", "תרבות", "טיולים", "אירועים"],
    "audience": ["משפחות", "זוגות", "קבוצות", "יחידים"],
    "season_tags": ["קיץ", "חורף", "סתיו", "אביב"],
    "practical_tags": [
        "נגיש", "נגיש לכיסאות גלגלים", "ידידותי למשפחות", "חניה",
        "שירותים", "מקום לפיקניק", "הרפתקאות", "רגיעה",
    ],
    "image_type_tags": [
        "jeep-tour", "hiking", "winery", "bnb", "restaurant", "stargazing",
        "crater-view", "workshop", "camping", "spa", "farm", "museum",
    ],
    "image_mood_tags": [
        "sunset", "night-sky", "romantic", "family-fun", "adventure",
        "calm", "panorama",
    ],
}
ALL_TAGS = TAXONOMY["season_tags"] + TAXONOMY["practical_tags"]

# ------------------------------------------------------------ system prompt ---

SYSTEM_PROMPT = f"""You turn a completed vendor interview into structured content for
Negev Time, a Hebrew-language (RTL) tourism marketplace for the Negev region.

You will receive the vendor's answers to four short interview questions
(q_offer: what they offer and a typical visit; q_edge: what sets them apart,
possibly including their founding story; q_fit: who enjoys it most and who it is
less suited for; q_reco: a one-sentence customer recommendation; and, when the
vendor came through WhatsApp, q_practical: when to visit and what to know before
arriving), plus their
address, an optional website, optionally scraped website content, and a product
list. Generate ONLY the interpretive fields below. Factual fields (name, phone,
email, address) are handled outside of you — do not include them.

Return a JSON object with these fields (the response format is enforced by a schema):

{{
  "category": "",           // exactly ONE of: {" · ".join(TAXONOMY["category"])}
  "tags": [],               // 2-6 values, ONLY from: {" · ".join(ALL_TAGS)}
  "audience": [],           // 1-3 values, ONLY from: {" · ".join(TAXONOMY["audience"])}
  "image_type_tags": [],    // 2-4 values, ONLY from: {" · ".join(TAXONOMY["image_type_tags"])}
  "image_mood_tags": [],    // 2-3 values, ONLY from: {" · ".join(TAXONOMY["image_mood_tags"])}
  "short_desc": "",         // Hebrew, max 60 characters, distilled from answer q_reco
  "full_desc": "",          // Hebrew, 3-4 paragraphs separated by \\n\\n
  "highlights": [],         // 3-4 Hebrew bullets, max 6 words each, concrete facts only
  "practical": {{"best_time": "", "accessibility": "", "parking": "", "booking": "", "bring": ""}},
  "products": [{{"name": "", "desc": "", "price_ils": 0, "duration": "", "booking_required": false}}],
  "confidence_flags": []    // English notes on every field you were unsure about
}}

## Writing full_desc — one paragraph per stage:
1. OPENING: if q_edge contains a founding story, open with the human story, not the
   business. Otherwise open with the place and what it offers.
2. EXPERIENCE (from q_offer): walk the reader through a visit chronologically.
   Concrete, sensory, present tense.
3. EDGE (from q_edge): what sets them apart. Sharpen the vendor's own claim, never
   inflate it.
4. FIT (from q_fit): who will love it. If the vendor said who it's NOT for, include
   it positively — honesty builds trust.
Practical details (hours, parking, what to bring) go ONLY into the "practical"
object, and only if explicitly stated in the answers or scraped website content —
otherwise leave them empty.

## Style rules (Hebrew):
- Warm, concrete, local — like a knowledgeable friend recommending a place.
- BANNED unless the vendor literally wrote it: "חוויה בלתי נשכחת", "פנינה חבויה",
  "אין כמו", "הטוב ביותר", "יחס חם ואישי".
- No superlative the vendor didn't claim. NEVER invent facts: no guessed prices,
  years, distances, hours, or addresses. Missing → empty string + confidence flag.
- highlights: concrete differentiating facts, not adjectives.
  Good: "תצפית 360° על המכתש". Bad: "אווירה קסומה".

## Mapping rules:
- category: infer from q_offer (the actual offering). Ambiguous → closest match + flag.
- audience: only segments supported by q_fit. If the vendor said "everyone", infer
  from the described experience and flag it.
- image_type_tags from q_offer (what they do); image_mood_tags from q_offer+q_fit
  (atmosphere).
- products: clean up the provided product list (fix obvious typos, tighten desc).
  Never change prices. Missing price → keep 0 and flag.
- Answers may contradict each other → prefer the more specific claim and flag it."""

# ------------------------------------------------------------ output schema ---


def _str_list(allowed=None):
    items = {"type": "string", "enum": allowed} if allowed else {"type": "string"}
    return {"type": "array", "items": items}


OUTPUT_SCHEMA = {
    "type": "object",
    "properties": {
        "category": {"type": "string", "enum": TAXONOMY["category"]},
        "tags": _str_list(ALL_TAGS),
        "audience": _str_list(TAXONOMY["audience"]),
        "image_type_tags": _str_list(TAXONOMY["image_type_tags"]),
        "image_mood_tags": _str_list(TAXONOMY["image_mood_tags"]),
        "short_desc": {"type": "string"},
        "full_desc": {"type": "string"},
        "highlights": _str_list(),
        "practical": {
            "type": "object",
            "properties": {
                k: {"type": "string"}
                for k in ("best_time", "accessibility", "parking", "booking", "bring")
            },
            "required": ["best_time", "accessibility", "parking", "booking", "bring"],
            "additionalProperties": False,
        },
        "products": {
            "type": "array",
            "items": {
                "type": "object",
                "properties": {
                    "name": {"type": "string"},
                    "desc": {"type": "string"},
                    "price_ils": {"type": "number"},
                    "duration": {"type": "string"},
                    "booking_required": {"type": "boolean"},
                },
                "required": ["name", "desc", "price_ils", "duration", "booking_required"],
                "additionalProperties": False,
            },
        },
        "confidence_flags": _str_list(),
    },
    "required": [
        "category", "tags", "audience", "image_type_tags", "image_mood_tags",
        "short_desc", "full_desc", "highlights", "practical", "products",
        "confidence_flags",
    ],
    "additionalProperties": False,
}

# ----------------------------------------------------------------- helpers ---


def normalize_answers(answers: dict) -> dict:
    """Map either answer shape onto the four keys the prompt expects.

    The web form sends q_offer / q_edge / q_fit / q_reco. The WhatsApp
    interviewer (docs/agent-prompts.md) sends q1-q6 with q5 split into q5a/q5b.
    Founding story (q1) and differentiator (q3) both feed q_edge; the practical
    question (q5) has no form equivalent, so it travels as q_practical.
    """
    answers = answers or {}
    if any(k in answers for k in ("q_offer", "q_edge", "q_fit", "q_reco")):
        return dict(answers)

    def join(*keys):
        return "\n\n".join(str(answers[k]).strip() for k in keys if str(answers.get(k, "")).strip())

    out = {
        "q_offer": join("q2"),
        "q_edge": join("q1", "q3"),
        "q_fit": join("q4"),
        "q_reco": join("q6"),
    }
    practical = join("q5", "q5a", "q5b")
    if practical:
        out["q_practical"] = practical
    return out


def _to_price(value):
    try:
        return float(value) if str(value).strip() != "" else 0
    except (TypeError, ValueError):
        return 0


def _merge_products(raw, generated: list) -> tuple:
    """Keep vendor-entered product facts verbatim; take only the tidied desc from the model.

    The web form sends a list of {name, desc, price, duration, booking}. The
    WhatsApp interviewer sends free text, which only the model can parse, so in
    that case the model's prices are kept but flagged for a human check.
    """
    flags = []
    if isinstance(raw, list) and raw:
        products = []
        for i, p in enumerate(raw):
            gen = generated[i] if i < len(generated) else {}
            products.append({
                "name": p.get("name", ""),
                "desc": gen.get("desc") or p.get("desc", ""),
                "price_ils": _to_price(p.get("price", p.get("price_ils"))),
                "duration": p.get("duration", ""),
                "booking_required": bool(p.get("booking", p.get("booking_required", False))),
            })
        return products, flags
    if isinstance(raw, str) and raw.strip() and generated:
        flags.append("products parsed from free text by the model — verify names and prices")
    return generated, flags



def _extract_json(text: str) -> dict:
    """Parse model output that should be a bare JSON object."""
    text = text.strip()
    text = re.sub(r"^```(?:json)?\s*|\s*```$", "", text)
    start, end = text.find("{"), text.rfind("}")
    if start == -1 or end == -1:
        raise ValueError("no JSON object in model output")
    return json.loads(text[start : end + 1])


def _enforce_taxonomy(ai: dict) -> list:
    """Drop values outside the closed lists. Returns flags for anything dropped."""
    flags = []

    if ai.get("category") not in TAXONOMY["category"]:
        flags.append(f"category '{ai.get('category')}' not in taxonomy — needs human review")
        ai["category"] = ""

    for field, allowed in [
        ("tags", ALL_TAGS),
        ("audience", TAXONOMY["audience"]),
        ("image_type_tags", TAXONOMY["image_type_tags"]),
        ("image_mood_tags", TAXONOMY["image_mood_tags"]),
    ]:
        vals = ai.get(field) or []
        kept = [v for v in vals if v in allowed]
        dropped = [v for v in vals if v not in allowed]
        if dropped:
            flags.append(f"{field}: dropped invalid values {dropped}")
        ai[field] = kept

    if len(ai.get("short_desc", "")) > 60:
        ai["short_desc"] = ai["short_desc"][:60].rstrip()
        flags.append("short_desc truncated to 60 chars")

    return flags


def _sanity_flags(submission: dict, ai: dict) -> list:
    """Cross-checks between vendor input and generated content."""
    flags = []
    answers = normalize_answers(submission.get("answers", {}))

    total_words = sum(len(str(a).split()) for a in answers.values())
    if total_words < 60:
        flags.append(f"thin interview ({total_words} words total) — description may be weak")

    if not ai.get("full_desc") or len(ai["full_desc"].split("\n\n")) < 3:
        flags.append("full_desc has fewer than 3 paragraphs")

    for p in ai.get("products", []):
        if not p.get("price_ils"):
            flags.append(f"product '{p.get('name', '?')}' has no price")

    if not submission.get("business", {}).get("address"):
        flags.append("no address — collect from vendor before publishing")

    return flags


# -------------------------------------------------------------------- main ---


def generate_profile(submission: dict, client: "anthropic.Anthropic | None" = None) -> dict:
    """Form submission JSON in → complete business profile JSON out."""
    client = client or anthropic.Anthropic()

    answers = normalize_answers(submission.get("answers", {}))
    user_msg = json.dumps(
        {
            "business_name": submission.get("basic_fields", {}).get("business_name", ""),
            "address": submission.get("business", {}).get("address", ""),
            "website": submission.get("business", {}).get("website", ""),
            "answers": answers,
            "products_raw": submission.get("products_raw", []),
            "scraped_website": submission.get("scraped_website", ""),
            "prefill_data": submission.get("prefill_data", {}),
        },
        ensure_ascii=False,
        indent=2,
    )

    # Newer Claude models reject assistant-turn prefill, so JSON is enforced
    # with a response schema instead. fallbacks="default" re-runs a request the
    # safety classifier declines on a fallback model inside the same call.
    last_err = None
    ai = None
    for _attempt in range(MAX_RETRIES + 1):
        response = client.beta.messages.create(
            model=MODEL,
            max_tokens=MAX_TOKENS,
            system=SYSTEM_PROMPT,
            messages=[{"role": "user", "content": user_msg}],
            output_config={"format": {"type": "json_schema", "schema": OUTPUT_SCHEMA}},
            betas=["server-side-fallback-2026-07-01"],
            fallbacks="default",
        )
        if response.stop_reason == "refusal":
            raise RuntimeError("model declined to generate this profile — route to human QA")
        if response.stop_reason == "max_tokens":
            last_err = ValueError("output hit max_tokens")
            continue
        raw = next((b.text for b in response.content if b.type == "text"), "")
        try:
            ai = _extract_json(raw)
            break
        except (ValueError, json.JSONDecodeError) as e:
            last_err = e
    if ai is None:
        raise RuntimeError(f"model returned invalid JSON after {MAX_RETRIES + 1} attempts: {last_err}")

    flags = list(ai.get("confidence_flags") or [])
    flags += _enforce_taxonomy(ai)
    ai["products"], product_flags = _merge_products(
        submission.get("products_raw", []), ai.get("products") or []
    )
    flags += product_flags
    flags += _sanity_flags(submission, ai)

    basic = submission.get("basic_fields", {})
    profile = {
        # --- vendor facts, copied verbatim (never model-generated) ---
        "business_name": basic.get("business_name", ""),
        "phone": basic.get("phone", ""),
        "email": basic.get("email", ""),
        "contact_person": basic.get("contact_person", ""),
        "address": submission.get("business", {}).get("address", "")
        or submission.get("prefill_data", {}).get("address", ""),
        "website": submission.get("business", {}).get("website", ""),
        "vendor_images": [img.get("name", "") for img in submission.get("images", [])],
        "answers": submission.get("answers", {}),  # raw, exactly as the vendor gave them
        "channel": submission.get("channel", ""),
        "submitted_at": submission.get("submitted_at", ""),
        # --- generated content ---
        "category": ai.get("category", ""),
        "tags": ai.get("tags", []),
        "audience": ai.get("audience", []),
        "image_type_tags": ai.get("image_type_tags", []),
        "image_mood_tags": ai.get("image_mood_tags", []),
        "short_desc": ai.get("short_desc", ""),
        "full_desc": ai.get("full_desc", ""),
        "highlights": ai.get("highlights", []),
        "practical": ai.get("practical", {}),
        "products": ai.get("products", []),
        # --- workflow ---
        "confidence_flags": flags,
        "needs_human_qa": bool(flags),
        "status": "draft",  # draft → vendor_approved → published
        "version": 1,
    }
    return profile


if __name__ == "__main__":
    if len(sys.argv) != 2:
        print("usage: python profile_generator_agent.py submission.json", file=sys.stderr)
        sys.exit(1)
    with open(sys.argv[1], encoding="utf-8") as f:
        submission = json.load(f)
    result = generate_profile(submission)
    print(json.dumps(result, ensure_ascii=False, indent=2))
