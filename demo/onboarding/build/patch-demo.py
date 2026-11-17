"""Patches a copy of workspace-fe into the self-contained demo build.

Every patch asserts its anchor exists, so a change in the app fails loudly
instead of producing a silently broken demo.
"""
import pathlib
import sys

root = pathlib.Path(sys.argv[1])


def patch(rel, old, new):
    p = root / rel
    s = p.read_text()
    assert old in s, f"{rel}: anchor not found: {old[:60]!r}"
    p.write_text(s.replace(old, new, 1))


# Relative asset paths: the demo is served from a sub-path.
patch("src/i18n/index.ts", 'loadPath: "/assets/i18n/', 'loadPath: "./assets/i18n/')

# Memory router: the artifact viewer controls the URL, so always start at "/".
patch("src/App.tsx", "  createBrowserRouter,\n", "  createMemoryRouter,\n")
patch("src/App.tsx", "      createBrowserRouter([", "      createMemoryRouter([")
patch("src/App.tsx", """        // eslint-disable-next-line react-hooks/exhaustive-deps
      ]),""", """        // eslint-disable-next-line react-hooks/exhaustive-deps
      ], { initialEntries: ["/"] }),""")

# Expose the onboarding client so the fake backend can be installed on it.
patch("src/pages/onboarding/api.ts", "const onboardingClient = axios.create(",
      "export const onboardingClient = axios.create(")

# No Google Maps key in the demo: type the address instead of the map.
patch("src/pages/onboarding/VendorOnboarding.tsx", """                  <MarkerMap
                    geo={draft.geo}
                    setGeo={(geo) => {
                      clearError("address");
                      update({ geo });
                    }}
                    address={draft.address}
                    setAddress={(address) => update({ address })}
                    onAddressParts={(parts: ParsedAddressParts) =>
                      update({ addressParts: parts })
                    }
                  />""", """                  <TextInput
                    id="ob-address"
                    placeholder="למשל: מדרשת בן גוריון, שדה בוקר"
                    value={draft.address}
                    invalid={!!errors.address}
                    onChange={(e) => {
                      clearError("address");
                      const v = e.target.value;
                      const city = v.split(",").pop()?.trim() ?? "";
                      update({
                        address: v,
                        geo: v.trim()
                          ? { lat: "30.8746", long: "34.7943" }
                          : { lat: "", long: "" },
                        addressParts: { location: v, city, country: "ישראל" },
                      });
                    }}
                  />""")
patch("src/pages/onboarding/VendorOnboarding.tsx",
      'import { MarkerMap } from "@/components/maps";\n', "")
patch("src/pages/onboarding/VendorOnboarding.tsx",
      'import type { ParsedAddressParts } from "@/helpers";\n', "")

# Login screen: the two demo accounts, one click fills the form.
patch("src/pages/auth/Login.tsx", """          <form onSubmit={handleLogin} className="space-y-6">""", """          <div dir="rtl" className="mb-6 rounded-2xl border border-white/20 bg-white/10 p-4 text-white">
            <p className="mb-3 text-sm font-semibold">חשבונות לדוגמה (כל סיסמה עובדת)</p>
            <div className="grid gap-2 sm:grid-cols-2">
              {[
                { email: "new@demo.co", title: "ספק חדש", sub: "בלי עסקים, נכנס ישר לתהליך ההצטרפות" },
                { email: "owner@demo.co", title: "ספק עם עסקים", sub: "6 עסקים לדוגמה בנגב" },
              ].map((a) => (
                <button
                  key={a.email}
                  type="button"
                  onClick={() => {
                    setUsername(a.email);
                    setPassword("demo1234");
                  }}
                  className={`rounded-xl border px-3 py-2 text-start transition-colors hover:bg-white/20 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-yellow-300 ${username === a.email ? "border-yellow-300 bg-white/20" : "border-white/20"}`}
                >
                  <span className="block text-sm font-medium">{a.title}</span>
                  <span className="block text-xs text-white/80">{a.sub}</span>
                  <span dir="ltr" className="block text-xs text-yellow-200">{a.email}</span>
                </button>
              ))}
            </div>
          </div>

          <form onSubmit={handleLogin} className="space-y-6">""")

(root / "src/main.tsx").write_text('''import "./i18n";
import "./index.css";

import { Toaster } from "sonner";
import { StrictMode } from "react";
import { Provider } from "react-redux";
import { createRoot } from "react-dom/client";

import App from "./App.tsx";
import { store } from "./store/store.ts";
import { SocketProvider } from "./providers/SocketProvider.tsx";
import axiosInstance from "./lib/axios";
import { onboardingClient } from "./pages/onboarding/api";
import { installMockBackend } from "./demo/mockBackend";

// Every visit starts signed out.
try {
  sessionStorage.removeItem("access_token");
  sessionStorage.removeItem("user_info");
} catch {
  /* storage unavailable */
}
installMockBackend(axiosInstance);
installMockBackend(onboardingClient);

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Provider store={store}>
      <SocketProvider>
        <Toaster position="top-center" richColors />
        <App />
      </SocketProvider>
    </Provider>
  </StrictMode>,
);
''')

(root / "vite.demo.config.ts").write_text('''import path from "path";
import tailwindcss from "@tailwindcss/vite";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  base: "./",
  plugins: [react(), tailwindcss()],
  resolve: { alias: { "@": path.resolve(__dirname, "./src") } },
  define: {
    "import.meta.env.VITE_SERVER": JSON.stringify("https://demo.invalid"),
    "import.meta.env.VITE_ONBOARDING_SERVER": JSON.stringify("https://demo.invalid"),
  },
  build: { chunkSizeWarningLimit: 8000 },
});
''')

(root / "index.html").write_text('''<!doctype html>
<html lang="he" dir="rtl" translate="no">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Workspace Onboarding Demo</title>
    <link rel="icon" type="image/x-icon" href="./metgologo.ico" />
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
''')
print("patched", root)
