'use strict';
/** OpenAPI 3.0 contract for the ShopLab REST API — used for contract/schema tests (Module 13). */
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const json = (schema) => ({ content: { 'application/json': { schema } } });
const err = (description) => ({ description, ...json(ref('Error')) });
const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'integer' } };
const secured = [{ bearerAuth: [] }, { cookieAuth: [] }];

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'ShopLab API',
    version: '1.0.0',
    description: 'Practice e-commerce API for learning test automation. Auth: POST /api/auth/login then send `Authorization: Bearer <token>` (or the sl_token cookie).',
  },
  servers: [{ url: '/api' }],
  components: {
    securitySchemes: {
      bearerAuth: { type: 'http', scheme: 'bearer' },
      cookieAuth: { type: 'apiKey', in: 'cookie', name: 'sl_token' },
    },
    schemas: {
      Error: {
        type: 'object', required: ['error'],
        properties: { error: { type: 'object', required: ['code', 'message'], properties: { code: { type: 'string' }, message: { type: 'string' }, details: { type: 'object' } } } },
      },
      User: {
        type: 'object', required: ['id', 'username', 'email', 'fullName', 'role', 'status'],
        properties: { id: { type: 'integer' }, username: { type: 'string' }, email: { type: 'string' }, fullName: { type: 'string' }, role: { type: 'string', enum: ['customer', 'admin'] }, status: { type: 'string', enum: ['active', 'locked'] } },
      },
      LoginRequest: { type: 'object', required: ['username', 'password'], properties: { username: { type: 'string' }, password: { type: 'string' } } },
      LoginResponse: { type: 'object', required: ['token', 'user'], properties: { token: { type: 'string' }, user: ref('User') } },
      Product: {
        type: 'object', required: ['id', 'sku', 'name', 'category', 'price', 'stock', 'inStock'],
        properties: {
          id: { type: 'integer' }, sku: { type: 'string', pattern: '^[A-Z]{4}-\\d{3}$' }, name: { type: 'string' }, nameTh: { type: 'string' },
          category: { type: 'string', enum: ['books', 'electronics', 'fashion', 'home', 'sports'] }, price: { type: 'number', minimum: 0 },
          stock: { type: 'integer', minimum: 0 }, inStock: { type: 'boolean' }, rating: { type: 'number' }, description: { type: 'string' }, image: { type: 'string' }, active: { type: 'boolean' },
        },
      },
      ProductInput: {
        type: 'object', required: ['sku', 'name', 'category', 'price', 'stock'],
        properties: { sku: { type: 'string' }, name: { type: 'string' }, nameTh: { type: 'string' }, category: { type: 'string' }, price: { type: 'number' }, stock: { type: 'integer' }, description: { type: 'string' } },
      },
      ProductList: {
        type: 'object', required: ['items', 'total', 'page', 'pageSize', 'totalPages'],
        properties: { items: { type: 'array', items: ref('Product') }, total: { type: 'integer' }, page: { type: 'integer' }, pageSize: { type: 'integer' }, totalPages: { type: 'integer' } },
      },
      CartItem: {
        type: 'object', required: ['productId', 'sku', 'name', 'price', 'qty', 'lineTotal'],
        properties: { productId: { type: 'integer' }, sku: { type: 'string' }, name: { type: 'string' }, price: { type: 'number' }, qty: { type: 'integer', minimum: 1, maximum: 10 }, lineTotal: { type: 'number' }, stock: { type: 'integer' } },
      },
      Cart: { type: 'object', required: ['items', 'count', 'subtotal'], properties: { items: { type: 'array', items: ref('CartItem') }, count: { type: 'integer' }, subtotal: { type: 'number' } } },
      Quote: {
        type: 'object', required: ['subtotal', 'discount', 'shipping', 'vat', 'total'],
        properties: { subtotal: { type: 'number' }, discount: { type: 'number' }, shipping: { type: 'number' }, vat: { type: 'number' }, total: { type: 'number' }, shippingMethod: { type: 'string' }, couponCode: { type: 'string', nullable: true }, couponError: { type: 'string', nullable: true } },
      },
      Address: {
        type: 'object', required: ['fullName', 'phone', 'line1', 'district', 'province', 'postcode'],
        properties: { fullName: { type: 'string' }, phone: { type: 'string' }, line1: { type: 'string' }, district: { type: 'string' }, province: { type: 'string' }, postcode: { type: 'string' } },
      },
      CheckoutRequest: {
        type: 'object', required: ['address', 'shippingMethod', 'paymentMethod'],
        properties: {
          address: ref('Address'), shippingMethod: { type: 'string', enum: ['standard', 'express'] }, paymentMethod: { type: 'string', enum: ['card', 'cod'] }, couponCode: { type: 'string' },
          card: { type: 'object', properties: { number: { type: 'string', example: '4242424242424242' }, expiry: { type: 'string', example: '12/30' }, cvv: { type: 'string' }, name: { type: 'string' } } },
        },
      },
      Order: {
        type: 'object', required: ['id', 'orderNo', 'status', 'subtotal', 'discount', 'shipping', 'vat', 'total', 'items'],
        properties: {
          id: { type: 'integer' }, orderNo: { type: 'string', pattern: '^SL-\\d{8}-\\d{4}$' }, userId: { type: 'integer' },
          status: { type: 'string', enum: ['PENDING', 'PAID', 'SHIPPED', 'DELIVERED', 'CANCELLED'] }, paymentMethod: { type: 'string' }, shippingMethod: { type: 'string' },
          subtotal: { type: 'number' }, discount: { type: 'number' }, shipping: { type: 'number' }, vat: { type: 'number' }, total: { type: 'number' },
          address: ref('Address'), createdAt: { type: 'string' }, items: { type: 'array', items: { type: 'object' } },
        },
      },
    },
  },
  paths: {
    '/health': { get: { tags: ['system'], summary: 'Health check', responses: { 200: { description: 'OK' } } } },
    '/auth/login': {
      post: {
        tags: ['auth'], summary: 'Login', requestBody: { required: true, ...json(ref('LoginRequest')) },
        responses: { 200: { description: 'Logged in', ...json(ref('LoginResponse')) }, 400: err('Validation error'), 401: err('Invalid credentials'), 423: err('Account locked') },
      },
    },
    '/auth/logout': { post: { tags: ['auth'], summary: 'Logout (revokes token)', security: secured, responses: { 204: { description: 'Logged out' } } } },
    '/auth/me': { get: { tags: ['auth'], summary: 'Current user', security: secured, responses: { 200: { description: 'User' }, 401: err('Not logged in') } } },
    '/users/register': {
      post: {
        tags: ['users'], summary: 'Register a customer (multipart/form-data or JSON; optional "avatar" PNG/JPEG ≤ 1MB)',
        responses: { 201: { description: 'Created' }, 400: err('Validation error'), 409: err('Username or email taken') },
      },
    },
    '/categories': { get: { tags: ['products'], summary: 'List categories with counts', responses: { 200: { description: 'OK' } } } },
    '/products': {
      get: {
        tags: ['products'], summary: 'Search products',
        parameters: [
          { name: 'search', in: 'query', schema: { type: 'string' } },
          { name: 'category', in: 'query', schema: { type: 'string', enum: ['books', 'electronics', 'fashion', 'home', 'sports'] } },
          { name: 'minPrice', in: 'query', schema: { type: 'number' } },
          { name: 'maxPrice', in: 'query', schema: { type: 'number' } },
          { name: 'inStock', in: 'query', schema: { type: 'string', enum: ['true'] } },
          { name: 'sort', in: 'query', schema: { type: 'string', enum: ['name_asc', 'name_desc', 'price_asc', 'price_desc', 'rating_desc', 'newest'], default: 'name_asc' } },
          { name: 'page', in: 'query', schema: { type: 'integer', minimum: 1, default: 1 } },
          { name: 'pageSize', in: 'query', schema: { type: 'integer', minimum: 1, maximum: 50, default: 8 } },
        ],
        responses: { 200: { description: 'Product page', ...json(ref('ProductList')) }, 400: err('Invalid query'), 503: err('Chaos failure') },
      },
      post: { tags: ['admin'], summary: 'Create product (admin)', security: secured, requestBody: { required: true, ...json(ref('ProductInput')) }, responses: { 201: { description: 'Created', ...json(ref('Product')) }, 400: err('Validation'), 401: err('Unauthorized'), 403: err('Forbidden'), 409: err('SKU taken') } },
    },
    '/products/{id}': {
      parameters: [idParam],
      get: { tags: ['products'], summary: 'Product detail with reviews', responses: { 200: { description: 'OK', ...json(ref('Product')) }, 404: err('Not found') } },
      put: { tags: ['admin'], summary: 'Update product (partial allowed)', security: secured, requestBody: json(ref('ProductInput')), responses: { 200: { description: 'Updated', ...json(ref('Product')) }, 404: err('Not found') } },
      delete: { tags: ['admin'], summary: 'Deactivate product (soft delete)', security: secured, responses: { 204: { description: 'Deleted' }, 404: err('Not found') } },
    },
    '/products/{id}/reviews': {
      parameters: [idParam],
      post: { tags: ['products'], summary: 'Add review', security: secured, requestBody: json({ type: 'object', required: ['rating', 'comment'], properties: { rating: { type: 'integer', minimum: 1, maximum: 5 }, comment: { type: 'string', maxLength: 500 } } }), responses: { 201: { description: 'Created' }, 400: err('Validation') } },
    },
    '/cart': {
      get: { tags: ['cart'], summary: 'Get my cart', security: secured, responses: { 200: { description: 'Cart', ...json(ref('Cart')) }, 401: err('Unauthorized') } },
      delete: { tags: ['cart'], summary: 'Empty my cart', security: secured, responses: { 204: { description: 'Emptied' } } },
    },
    '/cart/items': {
      post: { tags: ['cart'], summary: 'Add to cart (qty 1-10 total per product)', security: secured, requestBody: json({ type: 'object', required: ['productId'], properties: { productId: { type: 'integer' }, qty: { type: 'integer', default: 1 } } }), responses: { 201: { description: 'Cart', ...json(ref('Cart')) }, 400: err('Validation / QTY_LIMIT'), 404: err('Not found'), 409: err('Stock') } },
    },
    '/cart/items/{productId}': {
      parameters: [{ name: 'productId', in: 'path', required: true, schema: { type: 'integer' } }],
      patch: { tags: ['cart'], summary: 'Set quantity', security: secured, requestBody: json({ type: 'object', required: ['qty'], properties: { qty: { type: 'integer' } } }), responses: { 200: { description: 'Cart', ...json(ref('Cart')) } } },
      delete: { tags: ['cart'], summary: 'Remove item', security: secured, responses: { 200: { description: 'Cart', ...json(ref('Cart')) }, 404: err('Not in cart') } },
    },
    '/cart/quote': {
      post: { tags: ['cart'], summary: 'Price breakdown for my cart', security: secured, requestBody: json({ type: 'object', properties: { couponCode: { type: 'string' }, shippingMethod: { type: 'string', enum: ['standard', 'express'] } } }), responses: { 200: { description: 'Quote', ...json(ref('Quote')) } } },
    },
    '/orders': {
      get: { tags: ['orders'], summary: 'My orders (admin: ?all=1)', security: secured, parameters: [{ name: 'status', in: 'query', schema: { type: 'string' } }, { name: 'all', in: 'query', schema: { type: 'string', enum: ['1'] } }], responses: { 200: { description: 'Orders' } } },
      post: { tags: ['orders'], summary: 'Checkout my cart', security: secured, requestBody: { required: true, ...json(ref('CheckoutRequest')) }, responses: { 201: { description: 'Created', ...json(ref('Order')) }, 400: err('Validation / CART_EMPTY / COD_LIMIT / coupon'), 402: err('Payment declined'), 409: err('Stock') } },
    },
    '/orders/{id}': { parameters: [idParam], get: { tags: ['orders'], summary: 'Order detail', security: secured, responses: { 200: { description: 'Order', ...json(ref('Order')) }, 404: err('Not found') } } },
    '/orders/{id}/cancel': { parameters: [idParam], post: { tags: ['orders'], summary: 'Cancel (PENDING or PAID only)', security: secured, responses: { 200: { description: 'Cancelled', ...json(ref('Order')) }, 409: err('Invalid transition') } } },
    '/orders/{id}/invoice.csv': { parameters: [idParam], get: { tags: ['orders'], summary: 'Download invoice CSV', security: secured, responses: { 200: { description: 'CSV file' } } } },
    '/admin/stats': { get: { tags: ['admin'], summary: 'Dashboard numbers', security: secured, responses: { 200: { description: 'OK' } } } },
    '/admin/users': { get: { tags: ['admin'], summary: 'List users', security: secured, responses: { 200: { description: 'OK' }, 403: err('Forbidden') } } },
    '/admin/users/{id}': { parameters: [idParam], patch: { tags: ['admin'], summary: 'Lock/unlock user', security: secured, requestBody: json({ type: 'object', properties: { status: { type: 'string', enum: ['active', 'locked'] } } }), responses: { 200: { description: 'OK' } } } },
    '/admin/orders/{id}/status': { parameters: [idParam], patch: { tags: ['admin'], summary: 'Change order status (state machine)', security: secured, requestBody: json({ type: 'object', properties: { status: { type: 'string' } } }), responses: { 200: { description: 'OK' }, 409: err('Invalid transition') } } },
    '/admin/products/export.csv': { get: { tags: ['admin'], summary: 'Export products CSV', security: secured, responses: { 200: { description: 'CSV' } } } },
    '/admin/products/import': { post: { tags: ['admin'], summary: 'Import products CSV (multipart field "file")', security: secured, responses: { 200: { description: 'Import result' } } } },
    '/test/reset': { post: { tags: ['test-hooks'], summary: 'Reset database to seed data (non-production only)', responses: { 200: { description: 'OK' } } } },
    '/test/config': {
      get: { tags: ['test-hooks'], summary: 'Read runtime config (?reveal=1 lists bugs)', responses: { 200: { description: 'OK' } } },
      post: { tags: ['test-hooks'], summary: 'Set bugMode / latencyMs / failureRate', requestBody: json({ type: 'object', properties: { bugMode: { type: 'boolean' }, latencyMs: { type: 'integer' }, failureRate: { type: 'number' } } }), responses: { 200: { description: 'OK' } } },
    },
    '/test/users': { post: { tags: ['test-hooks'], summary: 'Create a unique test user', responses: { 201: { description: 'Created' } } } },
  },
};
