# Email Config & Activity — Frontend Action Plan

Admin screens for managing and observing triggered/transactional emails (Mandrill/Mailchimp-style):

1. **Email Config** — the template registry: list all email events, view/edit template content, preview with sample data, send test emails.
2. **Email Activity** — the "Outbound" log: every actual send, with delivery/open/bounce/reject status, sourced from a Mailchimp webhook.

Backend is already live in `MetGo-BE` (`src/modules/email-config/` and `src/modules/email-activity/`). This plan covers the Workspace (React + Vite admin panel) side only.

## Backend API reference — Email Config (template registry)

All routes are admin-only (JWT + role guard). Response envelope: `{ statusCode, message, datas, error, token }` — every RTK Query endpoint must unwrap `response.datas`, since no shared unwrapping helper exists yet in this repo.

| Method | Path                               | Purpose                                                                   |
| ------ | ---------------------------------- | ------------------------------------------------------------------------- |
| GET    | `admin/email-config`               | List, paginated. Query: `search`, `category`, `language`, `page`, `limit` |
| GET    | `admin/email-config/:id`           | Detail (includes `htmlContent`, `subject`)                                |
| POST   | `admin/email-config`               | Create                                                                    |
| PUT    | `admin/email-config/:id`           | Update                                                                    |
| DELETE | `admin/email-config/:id`           | Soft delete                                                               |
| POST   | `admin/email-config/:id/preview`   | Body `{ mergeVars }` → rendered HTML via Mailchimp                        |
| POST   | `admin/email-config/:id/test-send` | Body `{ to, mergeVars }` → sends real test email                          |
| POST   | `admin/email-config/sync`          | One-time: seeds DB from existing hardcoded template list                  |

`EmailConfig` fields: `eventKey`, `label`, `category`, `language` (`'en' | 'he'`), `mailchimpTemplateName`, `subject`, `htmlContent`, `isActive`, `lastSyncedAt`, plus audit fields (`createdAt`, `updatedAt`, `isDeleted`, `createdBy`, `updatedBy`).

List response shape (from backend's `queryhandler`): `{ data: EmailConfig[], totalData: number, meta: { page, limit, data, pageCount, hasPreviousPage, hasNextPage } }`.

## Backend API reference — Email Activity (outbound log)

Admin-only (JWT + role guard). Same response envelope as above.

| Method | Path                   | Purpose                                                                                       |
| ------ | ---------------------- | --------------------------------------------------------------------------------------------- |
| GET    | `admin/email-activity` | List, paginated. Query: `search`, `status`, `eventKey`, `fromDate`, `toDate`, `page`, `limit` |

`EmailActivity` fields: `mandrillMessageId`, `eventKey`, `templateName`, `email` (recipient), `subject`, `status` (`sent \| delivered \| opened \| clicked \| bounced \| rejected \| deferred \| spam \| unsub`), `rejectReason`, `bounceDescription`, `tsSent`, `lastEventAt`.

Same list response shape as Email Config (`{ data, totalData, meta }`).

This list is populated by a Mailchimp webhook that MetGo-BE receives — there is no create/edit/delete from the frontend, it's read-only activity. Rows only exist once the webhook is configured and has received at least one event (see Open Items).

## Conventions this plan follows (from exploring the Workspace repo)

- **Stack**: React 19 + Vite, Redux Toolkit + RTK Query (no TanStack Query), Tailwind v4 + shadcn/radix components, `react-router-dom` v7, `react-i18next`, `sonner` for toasts.
- **No form library** (no RHF/Formik/Zod/Yup) — forms use plain `useState` + manual validation, matching e.g. `CreateVoucherWizard.tsx`.
- **Page pattern**: `src/pages/<name>-mgmt/` (see `vouchers-mgmt`, `promotions-mgmt`), not the empty `src/features/` folder.
- **API pattern**: RTK Query slices split into `src/store/api/<domain>QueryApi.ts` (reads) and `<domain>MutationApi.ts` (writes), built on the shared `axiosBaseQuery` (`src/store/api/axiosBaseQuery.ts`) and axios instance (`src/lib/axios.ts`, attaches `Authorization` from `sessionStorage.access_token`).
- **Routing**: central path registry `src/lib/routes.ts`, wired into `createBrowserRouter` config in `src/App.tsx`, nav entry in `src/components/sidebar/index.tsx`'s `menuItems`.
- **Table**: reuse `src/components/reordable-data-table/index.tsx` (`ReordableDataTable<T>`) — supports sort, row-select, infinite scroll, skeleton/empty states, dark mode + RTL.
- **HTML editor**: reuse `src/components/wrapper/EmailEditorWrapper.tsx` — already purpose-built for email templates (CKEditor 5, `{{ Variable }}` merge-tag toolbar via its `VariablesPlugin`, `sanitizeEmailHTML()` via DOMPurify, live preview pane). This is the single biggest reuse win — avoids building a new editor.

## Implementation steps

### 1. API layer

- Add to `src/lib/endpoints.ts`: `emailConfig: "/admin/email-config"`, `emailActivity: "/admin/email-activity"`.
- `src/store/api/emailConfigQueryApi.ts`:
  - `getEmailConfigs(params: { search?, category?, language?, page?, limit? })`
  - `getEmailConfigById(id: string)`
- `src/store/api/emailConfigMutationApi.ts`:
  - `createEmailConfig(dto)`
  - `updateEmailConfig({ id, dto })`
  - `deleteEmailConfig(id)`
  - `previewEmailConfig({ id, mergeVars })`
  - `testSendEmailConfig({ id, to, mergeVars })`
  - `syncEmailConfigs()`
- `src/store/api/emailActivityQueryApi.ts`:
  - `getEmailActivity(params: { search?, status?, eventKey?, fromDate?, toDate?, page?, limit? })` — read-only, no mutation file needed.
- Define TS types in `src/store/api/types/emailConfig.types.ts` and `emailActivity.types.ts` mirroring the backend schemas + the list response envelope.
- Register all slices' reducers/middleware in the store setup (wherever other `*QueryApi`/`*MutationApi` slices are combined).

### 2. Routing & navigation

- `src/lib/routes.ts`: add `emailConfigMgmt: "/email-config-management"` and `emailActivityMgmt: "/email-activity"`.
- `src/App.tsx`: add both `{ path, element }` entries to the route tree, barrel-import the pages.
- `src/components/sidebar/index.tsx`: add two `menuItems` entries under a shared "Email" group if the sidebar supports grouping (otherwise two flat items) — suggest `Mail` icon for Email Config and `Activity` or `Send` icon (from `lucide-react`) for Email Activity. Gate both the same way other admin-only items are (check existing `isEnabled`/role-check pattern on a neighboring item).

### 3. Page: `src/pages/email-config-mgmt/`

```
email-config-mgmt/
  index.tsx                          # page shell: filters + table + modals
  components/
    EmailConfigList.tsx              # ReordableDataTable wrapper, columns: label, eventKey, category, language, isActive, lastSyncedAt, actions
    EmailConfigFormModal.tsx         # create/edit modal (reuses EmailEditorWrapper for htmlContent)
    EmailConfigPreviewModal.tsx      # renders preview via previewEmailConfig, shows iframe/sandboxed HTML
    EmailConfigTestSendModal.tsx     # "to" input + mergeVars key/value rows + send button
    index.ts                         # barrel
```

**index.tsx**

- Local state: `search`, `category`, `language`, `page`.
- `useGetEmailConfigsQuery({ search, category, language, page, limit })`.
- Top bar: `SearchInput` (reuse `src/components/shared/SearchInput.tsx`), category/language filter selects (reuse `FilterButton`/`filter-fields` components), a "Sync from Mailchimp" button calling `syncEmailConfigs` mutation (one-off action, confirm-before-run since it writes many rows), a "New Template" button opening `EmailConfigFormModal` in create mode.
- Renders `EmailConfigList`.

**EmailConfigList.tsx**

- `ReordableDataTable<EmailConfig>` columns:
  - `label` (+ `eventKey` as subtext)
  - `category` (badge)
  - `language` (badge: EN/HE)
  - `isActive` (toggle switch — calls `updateEmailConfig` with `{ isActive: !current }` on change)
  - `lastSyncedAt` (relative date or "Never synced")
  - actions column: View/Edit (opens `EmailConfigFormModal` in edit mode), Preview, Test Send, Delete (confirm dialog)
- `rowKey="_id"`, `onRowClick` opens edit modal.
- Given backend list is page-number based (not infinite scroll), either (a) pass fixed `data`/no `next` to `ReordableDataTable` and add simple prev/next buttons driven by `meta.hasPreviousPage`/`hasNextPage`, or (b) confirm with the table component's author whether pager controls already exist outside the infinite-scroll path — check before assuming infinite scroll is mandatory.

**EmailConfigFormModal.tsx**

- Fields: `label`, `eventKey` (readonly when editing — it's the unique lookup key), `category` (select or free text), `language` (select en/he), `mailchimpTemplateName`, `subject`, `isActive` (switch).
- `htmlContent`: `EmailEditorWrapper`. Note from the explore report: `EmailEditorWrapper`'s `EMAIL_VARIABLES` list is currently hardcoded — generalize it to accept a `variables` prop so each email-config entry can define its own merge-tag list (or default to a generic set like `{{Name}}`, `{{Email}}` if no per-template variable metadata exists yet; the backend doesn't currently model which merge vars a template needs — flag this as a possible backend follow-up, not something to fake client-side).
- Submit → `createEmailConfig` or `updateEmailConfig`; show `sonner` success/error toast; close modal + refetch list (RTK Query cache invalidation via tag, or explicit `refetch()`).
- Manual validation (no Zod/RHF, per repo convention): required `label`, `eventKey`, `category`, `language`, `mailchimpTemplateName` on create.

**EmailConfigPreviewModal.tsx**

- Simple key/value rows for sample merge vars (add/remove rows), "Render Preview" button → `previewEmailConfig` → render result HTML in a sandboxed `<iframe srcDoc="...">` (don't `dangerouslySetInnerHTML` arbitrary remote HTML directly into the page DOM — sandbox it, consistent with the backend already sending this through Mailchimp, not user-authored-and-trusted content).

**EmailConfigTestSendModal.tsx**

- `to` email input, same merge-var key/value rows as preview modal, "Send Test" button → `testSendEmailConfig` → toast on success/failure.

### 4. Page: `src/pages/email-activity-mgmt/`

```
email-activity-mgmt/
  index.tsx                          # page shell: filters + table (read-only)
  components/
    EmailActivityList.tsx            # ReordableDataTable wrapper
    index.ts                         # barrel
```

**index.tsx**

- Local state: `search`, `status`, `eventKey`, `fromDate`, `toDate`, `page`.
- `useGetEmailActivityQuery({ search, status, eventKey, fromDate, toDate, page, limit })`.
- Top bar: `SearchInput` (searches `email`/`subject`/`templateName`), a status filter select (sent/delivered/opened/clicked/bounced/rejected/deferred/spam/unsub), a date-range picker for `fromDate`/`toDate`. No create/edit/delete actions — this screen is observational only.
- Renders `EmailActivityList`.

**EmailActivityList.tsx**

- `ReordableDataTable<EmailActivity>` columns:
  - `email` (recipient)
  - `subject` / `templateName`
  - `status` (colored badge: green=delivered/opened/clicked, red=bounced/rejected, yellow=deferred/spam/unsub, gray=sent)
  - `tsSent` (formatted date/time)
  - `lastEventAt` (relative time, e.g. "opened 2h ago")
  - row click → side panel or modal showing `rejectReason`/`bounceDescription` when present, and the raw event if useful for debugging (consider gating raw-payload visibility to superadmin only)
- `rowKey="_id"`, same pagination approach as `EmailConfigList` (page-number based — see Open Items).
- Empty state should explicitly explain _why_ it might be empty: "No activity yet — this list populates once the Mailchimp webhook is configured and has received events," since early on (or in environments where the webhook isn't set up) this table will legitimately show nothing.

### 5. i18n

- Add Hebrew + English strings for all new labels/buttons/toasts to the existing `react-i18next` resource files, following whatever file layout the rest of the app's admin pages use (not inspected in this plan — check an existing `-mgmt` page's `t('...')` keys and mirror the namespace).

### 6. Permissions

- Gate both new sidebar items and routes the same way other admin/superadmin-only screens are gated in this repo (check the exact mechanism used by a neighboring protected route in `App.tsx` — e.g. a `ProtectedRoute` wrapper or role check — and reuse it, don't invent a new one).

## Open items to confirm before/while building

1. **Pagination style** — confirm whether `ReordableDataTable` truly requires infinite-scroll (`next`/`hasMore`) or can run in simple page mode; this affects whether both pages' `index.tsx` drive `page` state with buttons or an `IntersectionObserver`.
2. **Per-template merge variables** — there's no backend concept of "which variables does this template accept." Decide whether to (a) ship a generic default variable set for now, or (b) add an optional `availableMergeVars: string[]` field to the backend `EmailConfig` schema so the editor's variable-insert toolbar and the preview/test-send forms can be driven dynamically. Recommend (b) as a small backend follow-up since it meaningfully improves the editing UX.
3. **Sync button safety** — `POST admin/email-config/sync` creates DB rows for ~90 hardcoded templates; it's idempotent (skips existing `eventKey`+`language` pairs) but still worth a confirm-dialog in the UI since it calls Mailchimp's `templates.info` ~90 times.
4. **Webhook must be configured for Email Activity to show anything** — `MAILCHIMP_WEBHOOK_KEY` needs to be set in MetGo-BE's env, and the webhook URL (`{BASE_URL}/public/email-activity/webhook`) needs to be registered in the Mailchimp Transactional dashboard, before any rows will appear. This is an infra/ops step, not a frontend blocker, but worth confirming is done before QA-ing this screen — otherwise an empty table will look like a bug.
5. **Raw payload visibility** — `EmailActivity.rawPayload` (full webhook event) is available from the detail if you choose to expose it; decide whether to surface it at all in the UI (useful for debugging delivery issues) and if so, whether to restrict it to superadmin.
