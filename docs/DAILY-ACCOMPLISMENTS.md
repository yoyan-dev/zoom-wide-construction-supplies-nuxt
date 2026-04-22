Weekly (from Thursday - wednesday but without sunday)
note: day 1 should start from Thursday and end on Wednesday (not Sunday) then proceed to week 2 and so on

week 5 (March 12 - 18)
Day 1: Thursday, March 12

Focused on improving the admin side of the system so it is easier to manage daily business data. I cleaned up the page structure, organized important records such as products, categories, suppliers, and orders, and improved the main dashboard so it gives a clearer summary of sales, deliveries, low stock items, and top products. I also improved supplier and product management so updates can be made more smoothly.

Day 2: Friday, March 13

Improved navigation in the admin panel so users can move around the system more easily. I added a clearer menu and sidebar, and improved the way long lists are shown by splitting them into smaller pages. This made the admin area more organized and easier to use, especially when handling large amounts of information.

Day 3: Saturday, March 14

Worked on the product management section and added more complete tools for creating, updating, and reviewing product information. I also started building a dedicated area for staff users so they can access the parts of the system relevant to their work, such as customers, deliveries, orders, products, and reports. This helped separate admin functions from staff functions more clearly.

Day 4: Monday, March 16

Improved the way information is viewed and edited across the admin pages by making the pop-up forms and dialogs more flexible and consistent. I added easier ways to create, view, edit, and remove records for categories, suppliers, products, and inventory. I also improved the search function so users can find records faster, and added confirmation steps for bulk deletion to help prevent mistakes.

Day 5: Tuesday, March 17

Expanded the management tools for orders, payments, deliveries, products, categories, suppliers, and inventory so each record now has clearer actions for viewing details, making updates, and handling related tasks. I also built major parts of the warehouse management area, including pages for inventory, stock adjustments, transfers, deliveries, users, and reports. This made the system more complete for day-to-day operations and stock monitoring.

Day 6: Wednesday, March 18

Focused on improving both the admin and customer-facing sides of the system. I fixed issues in the warehouse section that were causing errors, then enhanced the product and category pages by adding richer details, clearer descriptions, and better organization of information. I also improved how stock is tracked by linking product quantities more closely with warehouse inventory and by automating stock deductions and returns during the delivery process. On the customer side, I built a more complete shop landing page with product sections, category shortcuts, and a simple cart experience to make browsing and shopping easier.

Week 6 (March 19 - 25)

Day 1: Thursday, March 19

Started the day by joining a meeting with Sir Jealmar together with the team, followed by a short team small talk that helped us align on the current progress, priorities, and next tasks for the system. After that, I built the main staff dashboard page for the frontend and turned it into a more complete operational workspace instead of a simple placeholder. I organized the page into smaller local dashboard components and added realistic sections for quick stats, task shortcuts, recent orders, pending follow-ups, stock alerts, delivery monitoring, customer concerns, and recent activity. I then refined the dashboard so its main preview sections pull from the existing frontend stores, allowing the staff overview to stay modular while reflecting the project's current seeded operational data. I also expanded the rest of the staff module by turning the orders, products, customers, deliveries, and reports pages into real store-backed workspaces with their own local page components. After scanning the role navigation wiring, I added the missing admin, staff, and warehouse help/settings pages so the existing sidebar links no longer lead to dead routes.

Day 2: Friday, March 20

Focused heavily on the backend foundation for the construction supplies system. I built the first full set of Nitro API endpoints for key catalog and warehouse modules, including categories, products, suppliers, warehouses, and inventory. I also added the initial database schema and shared types so the frontend and backend can follow the same data structure. Alongside that, I improved common backend helpers for authentication, pagination, and response handling to make the API layer more organized and easier to extend in the next phases.

Day 3: Saturday, March 21

Worked on strengthening both the backend architecture and the frontend admin experience. On the backend, I fixed CORS-related blockers, added support for multipart form-data uploads, switched important create flows to UUID-based ids, and refactored the repository, service, and route layers into a more consistent pattern. I also improved shared validation, error handling, and response utilities so future modules can follow a cleaner structure. On the frontend, I refined admin modals, row actions, toast handling, and API integration patterns so category, product, supplier, and warehouse workflows feel more consistent and maintainable.

Day 4: Monday, March 23

Completed a major functional expansion across the system. On the backend, I finished the repository, service, and API flows for categories, suppliers, products, customers, cart, orders, deliveries, and inventory, then added business workflows for checkout, order approval and rejection, delivery updates, payment processing, and inventory logging. I also introduced authentication, role-based access control, ownership rules, dashboard summary endpoints, reporting filters, and operational insights so the system is not only CRUD-based but also ready for real workflow tracking. On the frontend, I continued simplifying admin screens by removing redundant edit pages, tightening row action behavior, and aligning supplier and category flows with the improved backend structure.

Day 5: Tuesday, March 24

Focused on frontend data flow cleanup and integration readiness. I refined the category store, updated shared response and pagination typings, and adjusted supporting frontend types so store actions and API responses are more predictable and easier to reuse across admin pages. This helped prepare the frontend for the larger CRUD and management improvements that followed, while keeping the project structure cleaner and reducing inconsistencies between backend responses and frontend state handling.

Day 6: Wednesday, March 25

Wrapped up the week with a strong admin module upgrade on both frontend and backend. On the frontend, I refactored the admin CRUD foundation across categories, suppliers, and products by introducing reusable page headers, table states, action menus, load-state helpers, and delete feedback handling. I also added a full customer management module with filters, detail views, summary cards, table actions, and a dedicated store so customer records can be managed more effectively from the admin panel. On the backend, I improved product create and update flows, added storage utilities for resource handling, aligned schema changes through new migrations, added an RPC fallback for product creation, and relaxed some role checks for testing so development and integration could move faster.

Week 7 (March 26 - April 1)

Day 1: Thursday, March 26

Started by planning the delivery workflow first, including what the admin team needs to monitor and what customers need to see. After planning, I built the delivery management foundation so the team can track fulfillment clearly and customers can view delivery progress better.

Day 2: Friday, March 27

Started by planning the priority backend fixes that would improve daily operations immediately. After that, I implemented stock visibility and stock adjustment support for warehouse work, added payment-status foundations for finance tracking, improved refresh token and logout behavior for safer sessions, and completed missing admin and cart API actions so key website actions work more reliably.

Day 3: Saturday, March 28

Started by planning access control and user management needs before building the screens. After planning, I expanded admin capabilities by adding full management tools for users and drivers, plus account settings flows, giving the team better control of accounts and permissions.

Day 4: Monday, March 30

Started by reviewing and planning how new features should connect across pages so there are no broken user flows. Then I handled integration and cleanup between frontend and backend modules, aligned delivery, inventory, payment, and account features, and improved overall consistency of day-to-day website actions.

Day 5: Tuesday, March 31

Started by planning simplification steps to remove pages that no longer match the current business process. Then I removed the supplier module from the active flow, reduced unnecessary screens, and made admin navigation cleaner and easier to follow.

Day 6: Wednesday, April 1

Started by planning the storefront redesign direction, including layout flow, customer journey, and conversion goals. Then I completed a full redesign of the Zoom Wide e-commerce storefront, upgraded the customer shopping experience, and polished the website with better session/auth flow stability and product-page refinements so browsing and ordering feel smoother and more engaging.

Week 8 (April 2 - 8)

Day 1: Thursday, April 2

Day off.

Day 2: Friday, April 3

Day off.

Day 3: Saturday, April 4

Focused on improving role-specific operations and visual consistency. I built the driver delivery dashboard so drivers can view assigned deliveries, track completed orders, and handle their workflow more clearly. I also updated the Nuxt UI theme base for the logo so the application branding feels more aligned with the rest of the system.

Day 4: Monday, April 6

Continued strengthening the customer shopping experience by building the account hub and improving storefront navigation. I converted the shop navigation into a cleaner Nuxt UI header and footer structure, then connected account-related pages so customers have a more organized place to manage their profile, security, and settings.

Day 5: Tuesday, April 7

Polished the admin interface by aligning card radius, spacing, and background styling across the admin pages. This helped make the admin screens feel more consistent, cleaner, and easier to scan while keeping the interface closer to the updated visual direction of the project.

Day 6: Wednesday, April 8

Improved account personalization and user access flows by adding image upload support and refining the user dropdown experience. I updated account-related components and shared storefront UI pieces so users can manage their profile more smoothly while keeping the navigation and account actions easier to access across roles.

Week 9 (April 9 - 15)

Day 1: Thursday, April 9

Worked only during the morning because the afternoon was used for a meeting with Sir Jealmar. In the morning, I reviewed the current project progress, checked the remaining admin completion tasks, and prepared notes for the next admin workflow.

Day 2: Friday, April 10

Continued organizing the remaining admin readiness tasks. I reviewed the checklist for reports, settings, role-based access, workflow hardening, and production checks, then prepared the work plan for the next implementation pass. This helped clarify which parts of the admin system still needed cleanup, testing, and final polishing before moving into the larger completion work.

Day 3: Saturday, April 11

Audited the admin completion checklist and production readiness state. I confirmed the completed navigation, warehouse, dashboard, and server-side pagination work, ran the production build successfully, and reviewed the admin pages for existing loading, empty, API error, invalid-detail, and role-redirect handling. I also documented the remaining readiness blockers, especially the unfinished reports, settings, role-based behavior, and workflow hardening phases that must be completed before final admin QA can be fully signed off. I then completed the admin reports page with sales, payment, inventory, low-stock, delivery performance, and customer order history sections, including date and status filters plus a CSV download option. After that, I finished the admin settings phase by reviewing the real account and password flows, making notification settings clearly display-only, documenting current business defaults, and aligning the settings pages with the shared admin header and error-state patterns. I also completed the role-based admin behavior phase by centralizing admin permission checks, hiding user and driver management from managers, restricting payment and warehouse mutation actions to authorized roles, improving role redirects, and making access-denied errors clearer. I continued with workflow hardening by re-checking the main admin CRUD and operations flows, tightening delivery status editing, payment status access, inventory movement handling, and stock adjustment safeguards. I also continued production-readiness cleanup by removing leftover debug output, confirming the admin sidebar routes resolve, and re-running the production build successfully.

Day 4: Monday, April 13

Focused on authentication and admin workflow stability so the system can behave more reliably across roles and sessions. I migrated the frontend auth session handling, added backend login, logout, and refresh API routes, and introduced a shared backend API helper to keep server communication cleaner. I also removed the older admin permissions composable and moved permission behavior closer to the auth store and page logic, then updated the admin dashboard, users, drivers, payments, and warehouse pages so restricted actions and role-based controls remain consistent after the session changes.

Day 5: Tuesday, April 14

Refactored large admin pages into smaller, focused components to make the project easier to maintain and continue improving. I reorganized the admin dashboard into dedicated hero, KPI, revenue, status summary, top products, and activity feed components, then split the product detail page into clearer sections for product information, media stats, specifications, descriptions, handbook details, and the detail header. I also cleaned up the admin reports page by moving report sections, status grids, low-stock cards, customer report cards, and amount lists into reusable components, while improving shared formatting helpers and report utilities for cleaner reporting logic.

Day 6: Wednesday, April 15

Started preparing the React Native mobile application foundation for the Zoom Wide system using the workspace at `C:\Development\ZOOM-ZBN-BRYS-APP\Zoom-wide-React-Native`. I reviewed the Expo Router project structure, confirmed the main app configuration, and prepared the dependency setup needed for upcoming mobile integration work. I added API communication support with Axios, image handling support with Expo Image, and validation support with Zod, then refreshed the lockfiles so the project dependencies stay aligned. I also cleaned up the Expo plugin configuration and kept the app ready for the next phase of mobile features, including authentication, product browsing, ordering flows, and connection to the existing construction supplies backend.
