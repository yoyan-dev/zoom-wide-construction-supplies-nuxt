Backend API Guide
Base path: /api

Protected routes use: Authorization: Bearer <access_token>

After login, use data.user.role for frontend routing. For customer-owned routes, use data.customer.id.

Examples
POST /api/auth/register
Content-Type: application/json

{
"email": "customer@example.com",
"password": "strong-password",
"company_name": "ABC Trading",
"contact_name": "Jane Doe",
"phone": "+63 900 000 0000",
"billing_address": "Billing address",
"shipping_address": "Shipping address"
}
POST /api/auth/login
Content-Type: application/json

{
"email": "user@example.com",
"password": "your-password"
}
{
"status": "ok",
"statusCode": 200,
"statusMessage": "ok",
"data": {},
"total": 1,
"meta": {
"total": 10,
"page": 1,
"limit": 10,
"totalPages": 1
}
}
{
"status": "error",
"statusCode": 401,
"statusMessage": "unauthorized",
"data": null,
"message": "Invalid email or password",
"error": {
"code": "unauthorized",
"message": "Invalid email or password"
}
}

System
GET /api
access: public
note: This guide.
GET /api/health
access: public
note: Health check.

Auth
POST /api/auth/register
access: public
input: json: email, password, company_name, contact_name, phone?, billing_address?, shipping_address?
note: Customer-only signup. Call login after register.
POST /api/auth/login
access: public
input: json: email, password
note: Use data.user.role for frontend routing. Use data.customer.id for customer-owned flows.

Categories
GET /api/categories
access: public
input: query: q?, page?, limit?
GET /api/categories/:id
access: public
POST /api/categories
access: bearer: admin, manager
input: multipart/form-data: name, description, overview?, typical_uses[], buying_considerations[], featured_specs(json array)
PATCH /api/categories/:id
access: bearer: admin, manager
input: json partial category fields
DELETE /api/categories/:id
access: bearer: admin, manager

Products
GET /api/products
access: public
input: query: q?, category_id?, supplier_id?, page?, limit?
GET /api/products/:id
access: public
POST /api/products
access: bearer: admin, manager, warehouse_manager
input: multipart/form-data: category_id, supplier_id?, warehouse_id?, sku, name, description?, image_url? or image file, unit, price, stock_quantity?, minimum_stock_quantity?, handbook(json), is_active?
PATCH /api/products/:id
access: bearer: admin, manager, warehouse_manager
input: multipart/form-data partial product fields, optional image file
DELETE /api/products/:id
access: bearer: admin, manager, warehouse_manager
GET /api/products/insights
access: bearer: admin, manager, warehouse_manager
input: query: limit?

Suppliers
GET /api/suppliers
access: public
input: query: q?, page?, limit?
GET /api/suppliers/:id
access: public
POST /api/suppliers
access: bearer: admin, manager
input: multipart/form-data: name, contact_name?, phone?, email?, address?
PATCH /api/suppliers/:id
access: bearer: admin, manager
input: json partial supplier fields
DELETE /api/suppliers/:id
access: bearer: admin, manager

Warehouses
GET /api/warehouses
access: public
input: query: q?, status?, page?, limit?
GET /api/warehouses/:id
access: public
POST /api/warehouses
access: no explicit route auth check
input: multipart/form-data: name, address, manager_id?, capacity, status?
PATCH /api/warehouses/:id
access: no explicit route auth check
input: json partial warehouse fields
DELETE /api/warehouses/:id
access: no explicit route auth check

Customers
GET /api/customers
access: bearer: admin, manager, staff, finance, auditor
input: query: q?, page?, limit?
POST /api/customers
access: bearer: admin, manager, staff
input: json: user_id?, company_name, contact_name, phone?, email, billing_address?, shipping_address?
note: For public signup, use POST /api/auth/register.
GET /api/customers/:id
access: bearer: owner or customers:read
PATCH /api/customers/:id
access: bearer: owner or customers:write
input: json partial customer fields
DELETE /api/customers/:id
access: bearer: admin, manager, staff

Cart
GET /api/cart
access: bearer: owner or cart:read
input: query: customer_id
POST /api/cart/items
access: bearer: owner or cart:write
input: json: customer_id, product_id, quantity
DELETE /api/cart/items/:id
access: bearer: owner or cart:write
input: query: customer_id
DELETE /api/cart
access: bearer: owner or cart:write
input: query: customer_id
POST /api/cart/checkout
access: bearer: owner or cart:write
input: json: customer_id, notes?

Orders
GET /api/orders
access: bearer: report roles, or owner when filtering by customer_id
input: query: q?, customer_id?, status?, from?, to?, page?, limit?
GET /api/orders/summary
access: bearer: report roles, or owner when filtering by customer_id
input: query: q?, customer_id?, status?, from?, to?
GET /api/orders/:id
access: bearer: owner or orders:read
POST /api/orders
access: bearer: owner or orders:write
input: json: customer_id, notes?, items[{ product_id, quantity }]
POST /api/orders/:id/approve
access: bearer: admin, manager
input: json: approved_by?
POST /api/orders/:id/reject
access: bearer: admin, manager
input: json: rejection_reason

Deliveries
GET /api/deliveries
access: bearer: report roles, order owner by order_id, or driver owner by driver_id
input: query: q?, order_id?, driver_id?, status?, from?, to?, page?, limit?
GET /api/deliveries/summary
access: bearer: report roles, order owner by order_id, or driver owner by driver_id
input: query: q?, order_id?, driver_id?, status?, from?, to?
POST /api/deliveries
access: bearer: admin, manager
input: json: order_id, driver_id?, vehicle_number?, status?, scheduled_at?, delivered_at?
PATCH /api/deliveries/:id
access: bearer: admin, manager, driver
input: json: status, delivered_at?
note: Drivers can only update deliveries assigned to them.

Inventory
GET /api/inventory
access: bearer: admin, manager, warehouse_manager, auditor
input: query: q?, product_id?, stock_status?, page?, limit?
GET /api/inventory/summary
access: bearer: admin, manager, warehouse_manager, auditor
input: query: q?, product_id?
GET /api/inventory/movements
access: bearer: admin, manager, warehouse_manager, auditor
input: query: q?, product_id?, movement_type?, from?, to?, page?, limit?
GET /api/inventory/movements/summary
access: bearer: admin, manager, warehouse_manager, auditor
input: query: q?, product_id?, movement_type?, from?, to?
POST /api/inventory
access: bearer: admin, manager, warehouse_manager
input: json: product_id, movement_type, quantity_change, reference_type?, reference_id?, note?, created_by?
note: reference_type and reference_id must be paired.

Payments
GET /api/payments
access: bearer: admin, finance, auditor, or order owner by order_id
input: query: q?, order_id?, status?, method?, from?, to?, page?, limit?
GET /api/payments/summary
access: bearer: admin, finance, auditor, or order owner by order_id
input: query: q?, order_id?, status?, method?, from?, to?
POST /api/payments
access: bearer: admin, finance, or order owner
input: json: order_id, amount, method, status?, transaction_ref?, paid_at?
PATCH /api/payments/:id
access: bearer: admin, finance
input: json: status, transaction_ref?, paid_at?

Dashboard
GET /api/dashboard/summary
access: bearer: admin, manager
GET /api/dashboard/recent-activity
access: bearer: admin, manager
input: query: limit?
