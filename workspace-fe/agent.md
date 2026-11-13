# Dashboard UI Implementation Guide — `agent.md`

## 1. Objective

Build a modern, responsive, role-based dashboard for the MetGo platform using **dummy data only**.

The dashboard should provide useful insights, performance metrics, trends, alerts, rankings, and quick actions based on the logged-in user's role.

The goal is to create a realistic, interactive frontend prototype that demonstrates how each role can monitor its responsibilities and take action directly from the dashboard.

### Primary requirements

- Support Superadmin, DMO, Authority, and Traveler/Vendor dashboards.
- Use realistic, centralized mock data.
- Reuse dashboard components wherever possible.
- Provide functional filters, charts, tables, dropdowns, and quick actions.
- Display different metrics and datasets according to the user's role and access scope.
- Follow the existing application's design system and architecture.
- Do not implement backend APIs, database changes, or real analytics integrations.
- Do not redesign unrelated pages or modify existing functionality unnecessarily.

## 2. Before Implementation

Inspect the existing project before writing code.

1. Identify the frontend framework, routing setup, current dashboard page, layout, authentication context, and role management.
2. Inspect existing UI components, design tokens, theme support, charting libraries, icon libraries, and table implementations.
3. Review the existing translation system and follow its established conventions.
4. Reuse existing components and dependencies whenever possible.
5. Identify the current role values and map them to the dashboard roles defined in this document.
6. Review the existing responsive layout and navigation before making changes.

### Implementation constraints

- Preserve the existing application layout, sidebar, header, navigation, and theme behavior.
- Use the existing React/Vite, TypeScript, shadcn/ui, Tailwind CSS, and other project conventions where already available.
- Reuse existing charting and table libraries. Add dependencies only when a necessary capability is missing.
- Do not replace existing shared components with new implementations without a clear reason.
- Do not introduce unnecessary architectural changes or modify unrelated files.
- Keep the implementation consistent with the existing codebase rather than creating a separate application.

## 3. Dashboard Roles and Access Scope

The dashboard must support the following roles.

| Role            | Data scope                                            | Primary objective                                                    |
| --------------- | ----------------------------------------------------- | -------------------------------------------------------------------- |
| Superadmin      | Entire platform                                       | Monitor platform performance, revenue, operations, and system health |
| DMO             | Its associated Authorities and regional businesses    | Monitor regional performance and Authority-level results             |
| Authority       | Its associated businesses, products, POIs, and events | Monitor local business performance and regional operations           |
| Traveler/Vendor | The selected business owned by the vendor             | Manage orders, revenue, listings, and business performance           |

### Role-based rendering

- Render dashboard content according to the current user's role.
- Never display platform-wide financial or operational information to a vendor unless explicitly permitted by the existing authorization model.
- DMO and Authority dashboards must use their respective regional data.
- A vendor who owns multiple businesses must be able to switch between businesses.
- Changing the selected business must update the relevant metrics, charts, orders, products, alerts, and performance information.
- Use the existing authentication and role context if available.
- For development and demonstration, provide a temporary role switcher if needed to preview every dashboard. Keep it clearly marked as a development/demo control.
- The role switcher must not replace or weaken existing authorization logic.

## 4. Shared Dashboard Layout

Every dashboard should use a consistent visual structure.

### Recommended page hierarchy

1. Dashboard title and contextual description.
2. Role-specific context, such as selected region, Authority, or business.
3. Global time-period filter.
4. Key performance indicator (KPI) cards.
5. Trend charts and performance visualizations.
6. Role-specific breakdowns, rankings, and tables.
7. Alerts, upcoming events, and actionable items.

The exact order may vary by role to prioritize the most important information.

### Header controls

Include:

- Dashboard title.
- Contextual subtitle.
- Period filter: Daily, Weekly, Monthly, Yearly, All Time.
- Optional business selector for Traveler/Vendor.
- Optional region or Authority selector when appropriate and consistent with the access scope.
- A refresh/demo-data action if useful.

Avoid adding redundant filters or controls that make the dashboard unnecessarily complicated.

### Shared KPI cards

Each KPI card should support:

- Clear metric label.
- Prominent formatted value.
- Optional currency or unit.
- Percentage or absolute change versus the previous comparable period.
- Trend direction indicator.
- Short contextual description or comparison label.
- Optional icon.
- Click-through action when a meaningful detail view exists.

Examples:

- Total Businesses
- Total Orders
- Total Revenue
- Website Sessions
- Voucher Redemptions
- Pending Approvals

Do not show arbitrary trend percentages for metrics where a comparison is not meaningful. Use neutral states when data is unavailable.

## 5. Superadmin Dashboard

### Objective

Provide a platform-wide overview of growth, traffic, revenue, operations, and high-performing entities.

### A. Platform overview

Display KPI cards for:

- Total DMOs.
- Total Authorities.
- Total Businesses.
- Total Vendors.
- Growth trends for the selected period.

Include a trend visualization showing business, vendor, or Authority growth over time.

### B. Website traffic overview

Display:

- Total users.
- Sessions.
- Page views.
- Conversions.
- Conversion rate.

Include a time-series chart comparing traffic and conversions.

Clearly label metrics and avoid mixing users, sessions, and page views into a single measure.

### C. Revenue overview

Display:

- Total platform revenue.
- Platform fees collected.
- Vendor payouts.
- Pending payouts, if relevant to the mock data.

Use separate values for gross order value, platform fees, and vendor payouts. Do not treat them as interchangeable.

Include a revenue trend chart.

### D. Order and voucher trends

Display:

- Orders over time.
- Voucher sales over time.
- Voucher redemption trends.
- Order status distribution.

Use appropriate line, bar, or stacked charts.

### E. System health

Display operational status cards or alerts for:

- Pending approvals.
- Email delivery failures.
- Website crashes or errors.
- Recent operational incidents.

Use clearly differentiated status indicators such as Healthy, Warning, and Critical.

These statuses are simulated demo values, not real infrastructure monitoring.

### F. Top-performing DMOs and Authorities

Create a sortable table or ranked list showing:

- Name.
- Region.
- Business count.
- Revenue.
- Growth percentage.
- Performance indicator.

Provide a meaningful default sort and a view-all action.

### G. Top businesses, products, and events

Display the top five items in each category:

- Businesses.
- Products.
- Events.

Each item should show its name, relevant performance metric, and status where applicable.

Use tabs or compact sections to keep the layout manageable.

### H. Top-earning businesses

Display a ranked table containing:

- Business name.
- Vendor.
- Orders.
- Revenue.
- Change versus the previous period.

### I. Upcoming events

Show upcoming platform-wide events with:

- Event name.
- Organizer.
- Date and time.
- Location.
- Registration or booking count.
- Capacity and remaining availability.

## 6. DMO Dashboard

### Objective

Help a DMO understand the performance of its Authorities and the businesses within its region.

All regional metrics must be scoped to the selected DMO.

### A. Regional overview

Display:

- Total Authorities.
- Total businesses.
- Total products.
- Total POIs.
- Regional revenue.
- Website users or sessions.

Include appropriate growth comparisons.

### B. Authority performance

Create a table showing:

- Authority name.
- Number of businesses.
- Revenue.
- Order count.
- Growth trend.
- Pending approvals.

Include a clickable Authority name to inspect its regional performance or details.

### C. Website traffic

Show regional users, sessions, page views, and conversions over time.

### D. Business, product, and POI breakdown

Use compact cards, charts, or tabs to show the distribution and status of:

- Businesses.
- Products.
- Points of interest.

Include active, inactive, pending, or other relevant statuses when available in the existing domain model.

### E. Regional revenue and payments

Display:

- Combined regional revenue.
- Platform fees where visible to the DMO.
- Vendor payouts.
- Pending payments, where relevant.

Keep gross revenue and payout values separate.

### F. Order and voucher trends

Show order volume, voucher sales, and voucher redemption trends over the selected period.

### G. Business approvals

Display newly added businesses and pending approvals.

Include quick actions such as View, Approve, or Reject where the current role is authorized to perform those actions.

For the mock implementation, actions should update local demo state and show clear feedback.

### H. Campaign performance

Show:

- Mini-site visits.
- Mini-site conversion rate.
- Voucher redemption rate.
- Campaign performance trend.

Use clearly defined mock denominators and metrics.

### I. Visitor origin

Display the top source regions or visitor origins using a horizontal bar chart or ranked list.

Label this as visitor origin or traffic source region, depending on the mock data represented. Do not confuse geographic origin with marketing attribution.

### J. Popular and top-earning entities

Display:

- Popular businesses.
- Popular products.
- Top-earning businesses.

Provide a relevant metric such as views, orders, redemptions, or revenue.

### K. Upcoming events and capacity

Show regional events with:

- Name.
- Date.
- Organizer.
- Registration count.
- Capacity.
- Remaining availability.

### L. Business performance alerts

Include a dedicated alert section for businesses whose performance scores are declining.

Each alert should show:

- Business name.
- Current score.
- Previous score.
- Score change.
- Main contributing factors.
- Suggested follow-up action.

Example demo scenario: A business score falls from 82 to 68 because listing views and voucher redemptions have decreased.

Use this only as sample data, not as a claim about real businesses.

### M. Regional mini-site health

Display:

- Published/live mini-sites.
- Draft mini-sites.
- Recent crashes or errors.
- Last reported incident.
- Current simulated health status.

Provide a way to inspect the affected mini-site or its error details.

## 7. Authority Dashboard

### Objective

Help an Authority manage local businesses, understand area-level performance, and identify issues requiring attention.

All data must be scoped to the selected Authority.

### A. Area overview

Display:

- Website users or sessions.
- Total businesses.
- Total products.
- Total POIs.
- Revenue.
- Orders.

### B. Business, product, and POI breakdown

Provide a breakdown of entities within the Authority's area, including relevant statuses.

### C. Revenue snapshot

Display:

- Total business revenue.
- Order volume.
- Average order value.
- Payout or payment summaries where relevant to the existing role permissions.

### D. Business health

Show:

- Active businesses.
- Inactive businesses.
- Pending approvals.
- Businesses requiring attention.

Include performance decline alerts with contributing factors and recommended follow-up actions.

### E. Campaign performance

Show:

- Mini-site visits.
- Conversion rate.
- Voucher redemption rate.
- Performance trends.

### F. Popular and top-earning entities

Display popular businesses, popular products, and top-earning businesses within the Authority's area.

### G. Events and points of interest

Display events and POIs with relevant information, including:

- Name and type.
- Location.
- Publication status.
- Event date, where applicable.
- Registration or booking count.
- Capacity and remaining availability, where applicable.

POIs should not be assigned event capacity unless that concept exists in the domain model.

### H. Purchase trends

Display order volume, sales trends, average order value, and voucher activity over the selected period.

### I. Actionable items

Include pending approvals, inactive listings, performance alerts, and upcoming events that require attention.

Only display actions permitted for the Authority role.

## 8. Traveler/Vendor Dashboard

### Objective

Help vendors manage their business operations and understand their sales performance.

Vendors may own multiple businesses. Include a **business switcher** at the top of the dashboard.

### A. Business switcher

Display:

- Business name.
- Business status.
- Optional business logo or avatar.

When the selection changes, all business-specific content must update to match the selected business.

The mock dataset should include at least two businesses for one vendor to demonstrate this functionality.

### B. Orders overview

Display:

- Total orders.
- Pending orders.
- Completed orders.
- Cancelled orders.
- Average order value.
- Pickup versus delivery distribution.

Use only order statuses and fulfillment methods supported by the existing application. Do not invent new production enum values.

Provide an order table with:

- Order number.
- Date.
- Product or item summary.
- Order amount.
- Status.
- Fulfillment method.
- Relevant action.

### C. Revenue and payouts

Display:

- Gross sales.
- Platform fees.
- Net earnings.
- Paid-out amount.
- Pending payout amount.

Use consistent mock calculations so that totals and chart values agree.

### D. Top-selling products

Display a ranked product list or table showing:

- Product name.
- Units sold.
- Revenue.
- Optional change versus the previous period.
- Listing status.

### E. Payments and disputes

Provide a compact history table containing:

- Transaction or reference ID.
- Date.
- Amount.
- Payment or payout status.
- Dispute status, where relevant.

Include empty states if the selected business has no disputes.

### F. Business performance score

Display:

- Current score.
- Previous score.
- Score trend.
- Main positive and negative contributing factors.
- Recommended actions.

Example factors:

- Positive: completed orders, listing completeness, customer engagement.
- Negative: falling listing views, low conversion, reduced voucher redemptions.

The score and factors must be clearly identified as simulated data.

### G. Listing status

Display approved, pending, and rejected listings where relevant.

Provide contextual actions such as editing a rejected listing or viewing a pending listing.

Do not allow the vendor to approve their own listings.

### H. Profile completion

Show a progress indicator for the selected business.

Include a short list of missing setup items and a relevant action to complete the profile.

Calculate the displayed percentage consistently from the mock completion data.

### I. Platform updates

Show relevant announcements such as:

- Platform fee changes.
- Policy updates.
- Vendor-related announcements.

Use realistic sample announcements and relative or absolute dates.

### J. Upcoming events and sessions

Display upcoming events and sessions associated with the selected business, where applicable.

Show the name, date, participation or booking count, status, and a link to the relevant detail page or demo view.

### Excluded vendor metrics

Do not display:

- Platform-wide analytics.
- Platform-wide revenue.
- Platform-wide inventory counts.
- Other vendors' private business information.

The vendor dashboard should focus on the selected business.

## 9. Global Time Filter

Every dashboard must provide the following options:

- Daily.
- Weekly.
- Monthly.
- Yearly.
- All Time.

### Behavior

- The selected filter must update relevant KPI values, charts, trend comparisons, and tables.
- Use consistent date boundaries for the selected period.
- Compare Daily against the previous day, Weekly against the previous week, Monthly against the previous month, and Yearly against the previous year.
- All Time should display the complete available mock history. Trend comparisons should be labeled appropriately or omitted when no meaningful comparison exists.
- Do not simply change the selected label while leaving all metrics unchanged.
- Keep filter state consistent throughout the dashboard.
- If some metrics are not meaningfully time-dependent, explain their behavior or keep them unchanged.

A custom date-range filter is optional and should only be added if it improves the existing UI.

## 10. Charts and Data Visualization

Use the chart library already available in the project.

If no suitable charting library exists, select a lightweight library compatible with the current frontend stack.

### Recommended chart types

| Data                      | Recommended visualization           |
| ------------------------- | ----------------------------------- |
| Revenue over time         | Line or area chart                  |
| Traffic over time         | Line chart                          |
| Orders over time          | Bar or line chart                   |
| Order status distribution | Donut chart                         |
| Pickup vs delivery        | Donut or stacked bar chart          |
| Business growth           | Line or bar chart                   |
| Authority performance     | Horizontal bar chart                |
| Top products              | Horizontal bar chart or ranked list |
| Visitor source regions    | Horizontal bar chart                |
| Event capacity            | Progress indicator                  |
| Revenue composition       | Stacked bar or grouped chart        |

### Chart requirements

- Include readable labels, legends, and tooltips.
- Use consistent formatting for currency, percentages, and counts.
- Provide sensible empty states when there is no data.
- Ensure charts remain readable on mobile screens.
- Avoid excessive chart types, unnecessary decoration, and redundant visualizations.
- Use the existing theme and design tokens.
- Ensure the chart values match the associated KPI cards and tables.

## 11. Shared Interaction Requirements

### Click-through KPIs

Clicking a KPI should open an appropriate detail view.

Examples:

- Pending Approvals → approval list.
- Total Businesses → business list.
- Total Orders → order list.
- Total Revenue → revenue breakdown.
- Pending Payouts → payout list.

Use existing routes when available. If a suitable route does not exist, implement a local detail drawer or modal with mock data rather than creating unnecessary application pages.

### Trend indicators

Every meaningful trend indicator should include:

- Direction.
- Magnitude of change.
- Comparison period.

Use arrows or icons with accessible text. Do not rely on color alone.

For metrics where a decrease is positive, such as failed deliveries or error counts, reflect the correct interpretation of the trend.

### Quick actions

Provide appropriate role-specific actions, including:

- Approve or reject a pending business.
- View a business.
- Inspect a performance alert.
- View an order.
- Inspect a payout.
- Open an event.
- Review a mini-site issue.

Actions must be functional within the prototype. Use local state, modals, drawers, or existing routes as appropriate.

### Notifications and feedback

- Show a toast or inline confirmation after a successful demo action.
- Confirm destructive actions before changing state.
- Update the relevant table or KPI after a local state change when appropriate.
- Clearly identify simulated actions where users could mistake them for real production operations.

## 12. Mock Data Architecture

Create a centralized mock-data layer instead of hardcoding values inside individual components.

Suggested structure, adapted to the existing repository:

```text
src/
  features/
    dashboard/
      components/
        DashboardHeader.tsx
        DashboardFilters.tsx
        DashboardKpiCard.tsx
        DashboardKpiGrid.tsx
        DashboardChartCard.tsx
        DashboardDataTable.tsx
        DashboardEmptyState.tsx
        DashboardLoadingState.tsx
        DashboardAlertCard.tsx
        DashboardSectionHeader.tsx
        BusinessSwitcher.tsx
        DashboardDetailDrawer.tsx
      pages/
        SuperadminDashboard.tsx
        DmoDashboard.tsx
        AuthorityDashboard.tsx
        VendorDashboard.tsx
      hooks/
        useDashboardFilters.ts
        useDashboardData.ts
      data/
        mockDashboardData.ts
        mockDashboardHelpers.ts
      types/
        dashboard.types.ts
```

This structure is a suggestion, not a requirement to reorganize the project. Follow its existing feature-folder and naming conventions if they differ.

### Mock data requirements

Include coherent datasets for:

- DMOs and Authorities.
- Businesses and vendors.
- Products and orders.
- Revenue, fees, and payouts.
- Website traffic and conversions.
- Voucher sales and redemptions.
- Events and sessions.
- POIs.
- Pending approvals.
- Business performance scores and alerts.
- Mini-site status and incidents.
- Payments and disputes.
- Platform announcements.

Provide enough records to populate charts, tables, and rankings with realistic examples.

Suggested minimums:

- 3 DMOs.
- 5 Authorities.
- 10 businesses.
- 8 products.
- 20 orders.
- 6 upcoming events or sessions.
- 6 months of historical time-series data.
- Several pending approvals and performance alerts.

Create additional data if needed to demonstrate all dashboard states.

### Data consistency

- Use stable IDs to link related entities.
- Associate each business with the correct vendor, Authority, and DMO.
- Ensure that regional totals equal the sum of their underlying mock records where applicable.
- Ensure revenue, fees, and payouts are internally consistent.
- Use realistic dates, statuses, and currency formatting.
- Avoid random values that change on every render.
- Use deterministic mock data so the dashboard is reproducible and testable.
- Include both positive and negative trends, as well as records with no activity.

### Data helpers

Implement reusable helpers for:

- Filtering data by selected time period.
- Calculating percentage changes.
- Grouping records by date.
- Aggregating revenue and order metrics.
- Sorting ranked entities.
- Calculating capacity and remaining availability.
- Deriving business performance indicators.
- Calculating profile completion.
- Filtering by DMO, Authority, or business.

Use appropriate types and handle missing or zero-valued data safely.

## 13. Loading, Empty, and Error States

Every major dashboard section must handle the following states.

### Loading state

- Display skeleton cards and chart placeholders.
- Avoid showing a completely blank page.
- Keep the overall layout stable while loading.

For a static prototype, implement a controllable demo loading state or a lightweight simulated delay only if it helps demonstrate the UI.

Do not add artificial delays to every normal render.

### Empty state

When a dataset is empty:

- Show a short explanatory message.
- Use a relevant icon or illustration if available.
- Provide an action when one makes sense.
- Avoid misleading zeros or empty chart axes.

Examples:

- No pending approvals.
- No orders in this period.
- No upcoming events.
- No payment disputes.
- No recent system incidents.

A genuine zero is valid when the metric is known to be zero. Distinguish that from unavailable data.

### Error state

Provide a reusable error state for failed data sections.

Since the dashboard uses mock data, this is primarily for demonstrating the component and supporting future API integration.

## 14. UI and Visual Design

The dashboard should look like a production-ready business analytics interface rather than a basic collection of cards.

### Design principles

- Clean, modern, enterprise-grade interface.
- Strong visual hierarchy.
- Consistent spacing, typography, borders, and radii.
- Restrained use of accent colors.
- Clear separation between primary metrics, charts, and operational lists.
- Compact but readable information density.
- Consistent alignment across KPI cards.
- Responsive layouts that adapt naturally to different screen sizes.
- Consistent treatment of status labels, trend indicators, and actions.

### KPI card design

Each card should have:

- A clear label.
- A prominent value.
- A compact comparison indicator.
- Optional supporting text or icon.

Avoid excessive shadows, gradients, decorative icons, and oversized cards that waste screen space.

### Tables

- Use the existing table component.
- Provide consistent column alignment and formatting.
- Support sorting where useful.
- Include clear status badges.
- Keep action menus compact.
- Handle overflow on mobile.
- Provide pagination or a sensible row limit for longer lists.

### Responsive behavior

Desktop:

- Use a multi-column KPI grid.
- Arrange charts in balanced two-column sections when appropriate.
- Keep tables readable and avoid unnecessarily wide layouts.

Tablet:

- Reduce the KPI column count.
- Stack chart panels when necessary.

Mobile:

- Use a one- or two-column KPI grid depending on available width.
- Stack chart panels.
- Keep important actions accessible.
- Use horizontally scrollable tables or a compact mobile presentation where appropriate.
- Prevent horizontal overflow at the page level.

### Theme support

Follow the existing theme configuration, including dark mode if supported.

Do not introduce a separate theme system.

## 15. Internationalization and Accessibility

### Internationalization

- Use the project's existing translation system.
- Do not hardcode user-facing strings when the project convention requires translation keys.
- Follow existing snake_case translation-key conventions where applicable.
- Include appropriate labels for dashboard titles, filters, cards, tables, statuses, and empty states.
- Keep formatting logic separate from translated text.

### Accessibility

- Use semantic headings and landmarks.
- Ensure keyboard access to dropdowns, tabs, buttons, and modals.
- Add accessible labels to icon-only actions.
- Provide sufficient contrast.
- Do not use color as the only indication of status or trend.
- Ensure charts have accessible summaries or equivalent textual information.
- Ensure dialogs and drawers have appropriate focus and keyboard behavior.

## 16. TypeScript and Code Quality

- Use TypeScript types for dashboard metrics, time filters, mock entities, chart data, and table rows.
- Reuse shared types rather than duplicating interfaces.
- Avoid `any` unless there is a specific, justified reason.
- Separate data transformation logic from UI components.
- Keep components focused and reusable.
- Avoid deeply nested conditional JSX.
- Avoid duplicating similar dashboard sections across roles.
- Use shared components with role-specific data configuration where appropriate.
- Follow the project's existing linting, formatting, and naming conventions.

Do not build a generic dashboard framework so abstract that it becomes harder to understand than four straightforward role-specific dashboards.

## 17. Suggested Implementation Phases

### Phase 1 — Inspect and plan

- Inspect the existing project and its current dashboard.
- Identify reusable components and libraries.
- Confirm role values and navigation patterns.
- Establish the smallest reasonable implementation plan.

### Phase 2 — Shared dashboard foundation

- Implement shared headers and filters.
- Implement KPI cards and grids.
- Implement reusable chart panels and tables.
- Implement empty, loading, and error states.
- Define the mock data types and helpers.

### Phase 3 — Role-specific dashboards

Implement in this order:

1. Superadmin.
2. DMO.
3. Authority.
4. Traveler/Vendor.

Verify that each role displays the correct scope and relevant metrics.

### Phase 4 — Interactions

Implement:

- Time-period filtering.
- Business switching.
- KPI click-through behavior.
- Table sorting and relevant row actions.
- Approval and rejection demo actions.
- Performance alert details.
- Toasts and confirmation dialogs.

### Phase 5 — Visual refinement

- Verify layout consistency.
- Improve chart readability.
- Check empty and loading states.
- Test responsiveness.
- Validate dark mode if supported.
- Remove redundant or low-value content.

### Phase 6 — Validation

- Run the project's existing lint and type-check commands.
- Run the relevant tests.
- Build the application.
- Fix any regressions introduced by the implementation.

## 18. Acceptance Criteria

The task is complete when all the following are satisfied.

### Dashboard functionality

- [ ] All four role dashboards are implemented.
- [ ] Each role displays the correct metrics and data scope.
- [ ] The global period filter changes relevant metrics and charts.
- [ ] Vendor business switching updates business-specific content.
- [ ] KPI cards navigate to relevant details or open a working detail view.
- [ ] Tables show coherent mock records and useful status indicators.
- [ ] Relevant quick actions work with local demo state.
- [ ] Performance decline alerts show score changes and contributing factors.
- [ ] Upcoming events show meaningful dates and capacity information.
- [ ] Revenue, fees, payouts, and orders remain internally consistent.

### UI quality

- [ ] The dashboard follows the existing application design system.
- [ ] Layouts work on desktop, tablet, and mobile.
- [ ] Loading, empty, and error states are implemented.
- [ ] Charts include readable labels and tooltips.
- [ ] Trend indicators are accessible and correctly interpreted.
- [ ] No major horizontal overflow or layout-breaking issues exist.
- [ ] Existing navigation, themes, and shared components remain functional.

### Technical quality

- [ ] Mock data is centralized and deterministic.
- [ ] Shared components are reused where appropriate.
- [ ] TypeScript types are defined for the main dashboard entities and metrics.
- [ ] No backend integration is required.
- [ ] No real analytics, payment, or system-monitoring calls are made.
- [ ] Existing lint, type-check, and build commands pass, where configured.
- [ ] Unrelated pages and functionality have not been unnecessarily modified.

## 19. Final Instructions to Claude Code

Prioritize a polished, functional UI with realistic dummy data over adding more metrics than the layout can communicate effectively.

Start by inspecting the repository. Then implement the dashboard using the existing application structure, conventions, and shared components.

Do not stop after creating a static visual mockup. The filters, business switcher, detail views, tables, and quick actions should behave meaningfully using local mock data.

Do not implement backend APIs or change the database schema.

When implementation is complete, provide a concise summary of:

1. Files created or modified.
2. Dashboards and reusable components implemented.
3. Interactions that are functional.
4. Commands run and their results.
5. Any remaining limitations or assumptions.

**Definition of done:** A developer or stakeholder can run the application, switch between the four demo roles, explore each dashboard, change time periods, inspect records, switch vendor businesses, and test the main actions without requiring a backend.
