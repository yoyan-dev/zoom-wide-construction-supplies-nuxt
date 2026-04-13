# Admin Completion TODO

## Phase 1: Fix Navigation and Missing Routes

- [x] Check all admin sidebar links.
- [x] Create or remove `/admin/warehouse`.
- [x] remove `/admin/reports`.
- [x] remove `/admin/help`.
- [x] Confirm every admin menu item opens a valid page.
- [x] Confirm dashboard search links point to real routes.

## Phase 2: Complete Warehouse Management

- [x] Decide if warehouse management belongs inside `/admin` or only `/warehouse`.
- [x] Add admin warehouse list page if needed.
- [x] Add warehouse detail page if needed.
- [x] Add create warehouse action.
- [x] Add edit warehouse action.
- [x] Add delete/deactivate warehouse action.
- [x] Connect warehouse forms to the `/api/warehouses` endpoints.
- [x] Add warehouse filters for search and status.

## Phase 3: Improve Admin Dashboard Data

- [x] Replace page-1 store calculations with `/api/dashboard/summary`.
- [x] Add `/api/dashboard/recent-activity` integration.
- [x] Use `/api/orders/summary` for order metrics.
- [x] Use `/api/deliveries/summary` for delivery metrics.
- [x] Use `/api/payments/summary` for payment and revenue metrics.
- [x] Use `/api/inventory/summary` for stock and low-stock metrics.
- [x] Use `/api/products/insights` for top product signals.
- [x] Restore or rebuild the recent activity feed.

## Phase 4: Server-Side Pagination and Filtering

- [x] Wire admin products table pagination to API pagination.
- [x] Wire admin categories table pagination to API pagination.
- [x] Wire admin customers table pagination to API pagination.
- [x] Wire admin orders table pagination to API pagination.
- [x] Wire admin deliveries table pagination to API pagination.
- [x] Wire admin inventory table pagination to API pagination.
- [x] Wire admin payments table pagination to API pagination.
- [x] Wire admin drivers table pagination to API pagination.
- [x] Wire admin users table pagination to API pagination.
- [x] Make search, status filters, method filters, and category filters preserve pagination state correctly.

## Phase 5: Build Admin Reports

- [x] Create `/admin/reports` page.
- [x] Add sales report section.
- [x] Add payment report section.
- [x] Add inventory report section.
- [x] Add low-stock report section.
- [x] Add delivery performance report section.
- [x] Add customer order history report section.
- [x] Add date range filters.
- [x] Add status filters.
- [x] Add export/download option if required.

## Phase 6: Finish Settings

- [x] Review current account settings flow.
- [x] Review current password/security settings flow.
- [x] Connect notification settings to real backend data, or mark them as display-only.
- [x] Add save/update behavior for notification preferences if needed.
- [x] Add system/business settings if required, such as company info, contact info, or operational defaults.
- [x] Confirm settings pages use consistent admin layout and error states.

## Phase 7: Role-Based Admin Behavior

- [x] Review admin permissions for `admin`.
- [x] Review admin permissions for `manager`.
- [x] Hide user-management actions from roles that cannot use them.
- [x] Hide finance-only actions from non-finance roles if needed.
- [x] Hide warehouse actions from roles without warehouse permissions.
- [x] Add clear disabled states or empty states for restricted actions.
- [x] Confirm route middleware matches backend permissions.
- [x] Confirm API errors are shown cleanly when access is denied.

## Phase 8: Workflow Hardening

- [x] Test product create/edit/delete.
- [x] Test category create/edit/delete/bulk delete.
- [x] Test customer create/edit/delete/detail.
- [x] Test user create/edit/delete/activate/deactivate.
- [x] Test driver create/edit/delete/activate/deactivate.
- [x] Test order approval.
- [x] Test order rejection with reason.
- [x] Test delivery creation.
- [x] Test delivery driver assignment/reassignment.
- [x] Test delivery status updates.
- [x] Test payment creation.
- [x] Test payment status updates.
- [x] Test inventory movement creation.
- [x] Test stock adjustment behavior.
- [ ] Confirm stock values stay consistent after checkout, approval, delivery, cancellation, or failure flows.

## Phase 9: QA and Production Readiness

- [x] Run `npm run build`.
- [ ] Test all admin pages on desktop.
- [ ] Test all admin pages on mobile/tablet widths.
- [ ] Test loading states.
- [ ] Test empty states.
- [ ] Test API error states.
- [ ] Test invalid detail IDs.
- [ ] Test expired session behavior.
- [ ] Test unauthorized role redirects.
- [ ] Test with admin account.
- [ ] Test with manager account.
- [ ] Test with warehouse manager account.
- [ ] Test with finance account.
- [ ] Test with auditor account.
- [x] Remove unused files and dead imports.
- [x] Update `docs/DAILY-ACCOMPLISMENTS.md`.
- [x] Final review of admin sidebar, dashboard, CRUD pages, reports, and settings.
