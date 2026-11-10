# Vendor onboarding

How a local business joins the site and gets its business page (mini-site) generated.

```
docs/spec.md                 process spec: flow, six-question interview, taxonomy, agent I/O, metrics
docs/agent-prompts.md        system prompts for the WhatsApp interviewer and the generator
web/vendor-onboarding.html   standalone Hebrew (RTL) web form: details, location, 4 questions, products
agent/profile_generator_agent.py   form/WhatsApp submission JSON in -> business profile JSON out
agent/tests/                 offline tests (fake API client, no key needed)
```

## Run

```bash
cd vendor-onboarding/agent
pip install -r requirements.txt
python -m unittest discover tests            # offline
export ANTHROPIC_API_KEY=...
python profile_generator_agent.py submission.json > profile.json
```

The model defaults to `claude-sonnet-5-5`; override with `PROFILE_AGENT_MODEL`.

The web form is a single static file. Set `CONFIG.WEBHOOK_URL` in it to post submissions to a backend; with it empty, the form opens a `mailto:` to support instead.

## Review notes

Changes made to the uploaded files:

- **Generator would fail on every call.** It prefilled the assistant turn with `{`, which current Claude models reject with a 400. It now asks for JSON through a response schema (`output_config.format`) that also restricts category, tags, audience and image tags to the taxonomy. The code-side taxonomy check stays as a safety net.
- **Refusals and truncation** are now detected (`stop_reason`) instead of being parsed as JSON. Server-side refusal fallbacks (`fallbacks: "default"`) are on.
- **Product prices went through the model.** The docstring promises vendor facts are copied verbatim, but prices, names and booking flags were taken from the model's output. For web-form products they are now copied from the vendor's input; only the tidied description comes from the model. Free-text products (WhatsApp) are still parsed by the model and flagged for QA.
- **WhatsApp answers didn't fit the generator.** The interviewer emits `q1`-`q6` (with `q5a`/`q5b`); the generator expected `q_offer`/`q_edge`/`q_fit`/`q_reco`. `normalize_answers()` maps one onto the other (q1+q3 -> q_edge, q5 -> q_practical).
- **Model id** updated from `claude-sonnet-5` to `claude-sonnet-5-5`.
- **Image tags** in the spec used spaces (`jeep tour`); the prompts and code use hyphens (`jeep-tour`). The spec now matches the code.
- **Form:** product fields restored from autosave broke on a double quote (`value="${...}"` unescaped). Values are now escaped.

Open questions, not changed:

1. **Six questions or four?** The spec and interviewer ask six (story, offer, edge, fit, practical, recommendation). The web form and generator use four: story is folded into "edge", and the practical question (when to come, parking, accessibility) is dropped, so `practical` is usually empty for web-form vendors.
2. **Pre-fill, image shortlist and approval loop** (spec 3.3, 3.6-3.8) are not implemented anywhere yet. The generator outputs image tags but nothing picks images.
3. **Uploaded photos** are resized in the browser but only their file names reach the profile; the image data has no storage yet.
4. **`mailto:` fallback** shows the "received" screen even if the vendor never sends the email, and long submissions can exceed mail-client URL limits. A webhook is needed before launch.
5. **Interviewer email forwarding** to support requires the interviewer agent to have an email tool.
