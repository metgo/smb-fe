"""Offline tests: a fake client stands in for the API, so no key or network is needed.

Run from vendor-onboarding/agent:  python -m unittest discover tests
"""

import json
import os
import sys
import unittest
from types import SimpleNamespace

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

import profile_generator_agent as pga  # noqa: E402

GOOD_AI = {
    "category": "טיולים",
    "tags": ["קיץ", "חניה", "לא-בטקסונומיה"],
    "audience": ["משפחות"],
    "image_type_tags": ["jeep-tour", "crater-view"],
    "image_mood_tags": ["sunset", "adventure"],
    "short_desc": "ג'יפים בשקיעה מעל המכתש",
    "full_desc": "פסקה 1\n\nפסקה 2\n\nפסקה 3",
    "highlights": ["תצפית 360° על המכתש"],
    "practical": {"best_time": "", "accessibility": "", "parking": "", "booking": "", "bring": ""},
    "products": [{"name": "סיור", "desc": "סיור שקיעה של שעתיים", "price_ils": 999,
                  "duration": "", "booking_required": False}],
    "confidence_flags": [],
}


class FakeClient:
    def __init__(self, payloads):
        self.payloads = list(payloads)
        self.calls = []
        self.beta = SimpleNamespace(messages=SimpleNamespace(create=self._create))

    def _create(self, **kwargs):
        self.calls.append(kwargs)
        stop, text = self.payloads.pop(0)
        return SimpleNamespace(stop_reason=stop, content=[SimpleNamespace(type="text", text=text)])


def form_submission():
    return {
        "basic_fields": {"business_name": "ג'יפים במכתש", "phone": "050-1234567",
                         "email": "a@b.co", "contact_person": "דנה"},
        "business": {"address": "מצפה רמון", "website": ""},
        "answers": {"q_offer": "x " * 30, "q_edge": "y " * 20, "q_fit": "z " * 10, "q_reco": "w"},
        "products_raw": [{"name": "סיור שקיעה", "desc": "סיור", "price": "250",
                          "duration": "שעתיים", "booking": True}],
        "images": [], "channel": "web_form", "submitted_at": "2026-11-10T00:00:00Z",
    }


class GenerateProfileTests(unittest.TestCase):
    def test_no_prefill_and_schema_sent(self):
        client = FakeClient([("end_turn", json.dumps(GOOD_AI))])
        pga.generate_profile(form_submission(), client=client)
        call = client.calls[0]
        self.assertEqual([m["role"] for m in call["messages"]], ["user"])
        self.assertEqual(call["output_config"]["format"]["type"], "json_schema")

    def test_vendor_product_facts_win_over_model(self):
        client = FakeClient([("end_turn", json.dumps(GOOD_AI))])
        profile = pga.generate_profile(form_submission(), client=client)
        prod = profile["products"][0]
        self.assertEqual(prod["name"], "סיור שקיעה")
        self.assertEqual(prod["price_ils"], 250.0)
        self.assertTrue(prod["booking_required"])
        self.assertEqual(prod["desc"], "סיור שקיעה של שעתיים")

    def test_taxonomy_enforced_and_flagged(self):
        client = FakeClient([("end_turn", json.dumps(GOOD_AI))])
        profile = pga.generate_profile(form_submission(), client=client)
        self.assertNotIn("לא-בטקסונומיה", profile["tags"])
        self.assertTrue(profile["needs_human_qa"])

    def test_retries_after_bad_json(self):
        client = FakeClient([("end_turn", "not json"), ("end_turn", json.dumps(GOOD_AI))])
        profile = pga.generate_profile(form_submission(), client=client)
        self.assertEqual(len(client.calls), 2)
        self.assertEqual(profile["category"], "טיולים")

    def test_refusal_raises(self):
        client = FakeClient([("refusal", "")])
        with self.assertRaises(RuntimeError):
            pga.generate_profile(form_submission(), client=client)


class NormalizeAnswersTests(unittest.TestCase):
    def test_form_shape_untouched(self):
        a = {"q_offer": "a", "q_edge": "b", "q_fit": "c", "q_reco": "d"}
        self.assertEqual(pga.normalize_answers(a), a)

    def test_whatsapp_shape_mapped(self):
        a = {"q1": "story", "q2": "offer", "q3": "edge", "q4": "fit",
             "q5a": "winter", "q5b": "parking", "q6": "reco"}
        out = pga.normalize_answers(a)
        self.assertEqual(out["q_offer"], "offer")
        self.assertEqual(out["q_edge"], "story\n\nedge")
        self.assertEqual(out["q_fit"], "fit")
        self.assertEqual(out["q_reco"], "reco")
        self.assertEqual(out["q_practical"], "winter\n\nparking")


if __name__ == "__main__":
    unittest.main()
