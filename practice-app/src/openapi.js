'use strict';
/** OpenAPI 3.0 contract for the ShopLab REST API — used for contract/schema tests (Module 13). */
const ref = (name) => ({ $ref: `#/components/schemas/${name}` });
const json = (schema) => ({ content: { 'application/json': { schema } } });
const err = (description) => ({ description, ...json(ref('Error')) });
const idParam = { name: 'id', in: 'path', required: true, schema: { type: 'integer' } };
const secured = [{ bearerAuth: [] }, { cookieAuth: [] }];
const money = { type: 'number', minimum: 0, description: 'THB, at most 2 decimals' };
const isoDate = { type: 'string', pattern: '^\\d{4}-\\d{2}-\\d{2}$' };

module.exports = {
  openapi: '3.0.3',
  info: {
    title: 'ShopLab API',
    version: '1.0.0',
    description: 'Practice e-commerce API for learning test automation. Auth: POST /api/auth/login then send `Authorization: Bearer <token>` (or the sl_token cookie). '
      + 'Paths under /loanlab belong to LoanLab, a fictional retail lending & payment module (see REQUIREMENTS-LOANLAB.md).',
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
      // ---------- LoanLab ----------
      Loan: {
        type: 'object', required: ['id', 'loanNo', 'accountId', 'accountNo', 'accountStatus', 'principal', 'outstanding', 'minimumPayment', 'status'],
        properties: {
          id: { type: 'integer' }, loanNo: { type: 'string', pattern: '^LN-\\d{6}$' }, accountId: { type: 'integer' }, accountNo: { type: 'string', pattern: '^LA-\\d{6}$' },
          accountStatus: { type: 'string', enum: ['PENDING', 'ACTIVE', 'FROZEN', 'CLOSED'] }, principal: money, outstanding: money, minimumPayment: money,
          status: { type: 'string', enum: ['ACTIVE', 'CLOSED'] }, createdAt: { type: 'string' }, updatedAt: { type: 'string' },
        },
      },
      LoanAccount: {
        type: 'object', required: ['id', 'accountNo', 'userId', 'holderName', 'status', 'loans'],
        properties: {
          id: { type: 'integer' }, accountNo: { type: 'string', pattern: '^LA-\\d{6}$' }, userId: { type: 'integer' }, username: { type: 'string' }, holderName: { type: 'string' },
          status: { type: 'string', enum: ['PENDING', 'ACTIVE', 'FROZEN', 'CLOSED'] }, createdAt: { type: 'string' }, updatedAt: { type: 'string' },
          loans: { type: 'array', items: ref('Loan') },
        },
      },
      LoanAccountList: { type: 'object', required: ['businessDate', 'items'], properties: { businessDate: isoDate, items: { type: 'array', items: ref('LoanAccount') } } },
      LoanTransaction: {
        type: 'object', required: ['id', 'ref', 'type', 'loanId', 'loanNo', 'amount', 'status', 'businessDate', 'settlementDate', 'balanceAfter'],
        properties: {
          id: { type: 'integer' }, ref: { type: 'string', pattern: '^(PM|RV)-\\d{8}-\\d{6}$' }, type: { type: 'string', enum: ['PAYMENT', 'REVERSAL'] },
          loanId: { type: 'integer' }, loanNo: { type: 'string' }, amount: { type: 'number', exclusiveMinimum: 0 },
          status: { type: 'string', enum: ['POSTED', 'PARTIALLY_REVERSED', 'REVERSED'] },
          reversedAmount: { type: 'number', nullable: true }, reversibleAmount: { type: 'number', nullable: true },
          originalTransactionId: { type: 'integer', nullable: true }, originalRef: { type: 'string', nullable: true },
          reference: { type: 'string', nullable: true }, reason: { type: 'string', nullable: true },
          businessDate: isoDate, settlementDate: { ...isoDate, nullable: true }, balanceAfter: money, createdAt: { type: 'string' },
          reversals: { type: 'array', items: { type: 'object' } }, reversibleToday: { type: 'boolean' },
        },
      },
      LoanTransactionList: { type: 'object', required: ['items'], properties: { loan: ref('Loan'), items: { type: 'array', items: ref('LoanTransaction') } } },
      PaymentRequest: { type: 'object', required: ['amount'], properties: { amount: { type: 'number', example: 500 } } },
      PaymentResponse: { type: 'object', required: ['transaction', 'loan'], properties: { transaction: ref('LoanTransaction'), loan: ref('Loan') } },
      ReversalRequest: {
        type: 'object', required: ['originalTransactionId', 'reference', 'reason'],
        properties: {
          originalTransactionId: { type: 'integer' }, reference: { type: 'string', pattern: '^[A-Za-z0-9_-]{4,40}$' }, reason: { type: 'string', minLength: 5, maxLength: 200 },
          amount: { type: 'number', description: 'Optional. Omit to reverse everything that is left.' },
        },
      },
      ReversalResponse: { type: 'object', required: ['reversal', 'original', 'loan'], properties: { reversal: ref('LoanTransaction'), original: ref('LoanTransaction'), loan: ref('Loan') } },
      EodRun: {
        type: 'object', required: ['id', 'businessDate', 'nextBusinessDate', 'settledCount', 'paymentsTotal', 'reversalsTotal', 'netTotal', 'status', 'breaks'],
        properties: {
          id: { type: 'integer' }, businessDate: isoDate, nextBusinessDate: isoDate, settledCount: { type: 'integer', minimum: 0 },
          paymentsTotal: money, reversalsTotal: money, netTotal: { type: 'number' }, status: { type: 'string', enum: ['BALANCED', 'OUT_OF_BALANCE'] },
          breaks: {
            type: 'array',
            items: { type: 'object', required: ['loanId', 'loanNo', 'expected', 'actual', 'difference'], properties: { loanId: { type: 'integer' }, loanNo: { type: 'string' }, expected: { type: 'number' }, actual: { type: 'number' }, difference: { type: 'number' } } },
          },
          runAt: { type: 'string' },
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
    // ---------- LoanLab (officer = admin role) ----------
    '/loanlab/business-date': { get: { tags: ['loanlab'], summary: 'Current system business date', security: secured, responses: { 200: { description: 'OK' }, 401: err('Unauthorized') } } },
    '/loanlab/accounts': {
      get: { tags: ['loanlab'], summary: 'My lending accounts with loans (officer: ?all=1)', security: secured, parameters: [{ name: 'all', in: 'query', schema: { type: 'string', enum: ['1'] } }], responses: { 200: { description: 'Accounts', ...json(ref('LoanAccountList')) }, 401: err('Unauthorized'), 403: err('Forbidden') } },
      post: { tags: ['loanlab-officer'], summary: 'Create an account for a customer (starts PENDING)', security: secured, requestBody: { required: true, ...json({ type: 'object', required: ['username', 'holderName'], properties: { username: { type: 'string' }, holderName: { type: 'string', minLength: 2, maxLength: 100 } } }) }, responses: { 201: { description: 'Created', ...json(ref('LoanAccount')) }, 400: err('Validation'), 403: err('Forbidden'), 404: err('CUSTOMER_NOT_FOUND') } },
    },
    '/loanlab/accounts/{id}': { parameters: [idParam], get: { tags: ['loanlab'], summary: 'Account detail', security: secured, responses: { 200: { description: 'Account', ...json(ref('LoanAccount')) }, 404: err('Not found') } } },
    '/loanlab/accounts/{id}/status': { parameters: [idParam], patch: { tags: ['loanlab-officer'], summary: 'Change account status (state machine)', security: secured, requestBody: json({ type: 'object', required: ['status'], properties: { status: { type: 'string', enum: ['ACTIVE', 'FROZEN', 'CLOSED'] } } }), responses: { 200: { description: 'Account', ...json(ref('LoanAccount')) }, 403: err('Forbidden'), 409: err('INVALID_TRANSITION / ACCOUNT_HAS_BALANCE') } } },
    '/loanlab/loans': { post: { tags: ['loanlab-officer'], summary: 'Open a loan under an ACTIVE account', security: secured, requestBody: { required: true, ...json({ type: 'object', required: ['accountId', 'principal'], properties: { accountId: { type: 'integer' }, principal: { type: 'number', minimum: 1000, maximum: 1000000 } } }) }, responses: { 201: { description: 'Created', ...json(ref('Loan')) }, 400: err('Validation'), 403: err('Forbidden'), 409: err('ACCOUNT_NOT_ACTIVE') } } },
    '/loanlab/loans/{id}': { parameters: [idParam], get: { tags: ['loanlab'], summary: 'Loan detail with outstanding balance', security: secured, responses: { 200: { description: 'Loan', ...json(ref('Loan')) }, 404: err('Not found') } } },
    '/loanlab/loans/{id}/payments': { parameters: [idParam], post: { tags: ['loanlab'], summary: 'Pay a loan (minimum 500 or the pay-off amount; no overpayment)', security: secured, requestBody: { required: true, ...json(ref('PaymentRequest')) }, responses: { 201: { description: 'Posted', ...json(ref('PaymentResponse')) }, 400: err('VALIDATION_ERROR / OVERPAYMENT / BELOW_MINIMUM'), 404: err('Not found'), 409: err('ACCOUNT_NOT_ACTIVE / LOAN_CLOSED') } } },
    '/loanlab/loans/{id}/transactions': {
      parameters: [idParam],
      get: { tags: ['loanlab'], summary: 'Transaction history of a loan (newest first)', security: secured, parameters: [{ name: 'type', in: 'query', schema: { type: 'string', enum: ['PAYMENT', 'REVERSAL'] } }, { name: 'status', in: 'query', schema: { type: 'string', enum: ['POSTED', 'PARTIALLY_REVERSED', 'REVERSED'] } }], responses: { 200: { description: 'History', ...json(ref('LoanTransactionList')) }, 404: err('Not found') } },
    },
    '/loanlab/transactions': { get: { tags: ['loanlab'], summary: 'My transactions across loans (officer: ?all=1)', security: secured, responses: { 200: { description: 'Transactions', ...json(ref('LoanTransactionList')) } } } },
    '/loanlab/transactions/{id}': { parameters: [idParam], get: { tags: ['loanlab'], summary: 'Transaction detail (a payment lists its reversals)', security: secured, responses: { 200: { description: 'Transaction', ...json(ref('LoanTransaction')) }, 404: err('Not found') } } },
    '/loanlab/reversals': { post: { tags: ['loanlab-officer'], summary: 'Reverse a payment, fully or partly (same business date only)', security: secured, requestBody: { required: true, ...json(ref('ReversalRequest')) }, responses: { 201: { description: 'Reversed', ...json(ref('ReversalResponse')) }, 400: err('VALIDATION_ERROR / EXCEEDS_REVERSIBLE_AMOUNT'), 403: err('Forbidden'), 404: err('TRANSACTION_NOT_FOUND'), 409: err('NOT_REVERSIBLE / DUPLICATE_REVERSAL / ALREADY_REVERSED / REVERSAL_WINDOW_CLOSED / ACCOUNT_NOT_ELIGIBLE') } } },
    '/loanlab/eod': { post: { tags: ['loanlab-officer'], summary: 'Run end-of-day: T+1 settlement, reconciliation, roll the business date', security: secured, responses: { 201: { description: 'EOD run', ...json(ref('EodRun')) }, 403: err('Forbidden') } } },
    '/loanlab/eod-runs': { get: { tags: ['loanlab-officer'], summary: 'EOD run history with reconciliation breaks', security: secured, responses: { 200: { description: 'Runs' }, 403: err('Forbidden') } } },
    '/test/loanlab/reset': { post: { tags: ['test-hooks'], summary: 'Reset LoanLab data only', responses: { 200: { description: 'OK' } } } },
    '/test/loanlab/accounts': { post: { tags: ['test-hooks'], summary: 'Create an account and loan in a given status and balance', requestBody: json({ type: 'object', required: ['username'], properties: { username: { type: 'string' }, accountStatus: { type: 'string', enum: ['PENDING', 'ACTIVE', 'FROZEN', 'CLOSED'] }, outstanding: { type: 'number' }, principal: { type: 'number' }, holderName: { type: 'string' }, noLoan: { type: 'boolean' } } }), responses: { 201: { description: 'Created' } } } },
    '/test/loanlab/loans/{id}': { parameters: [idParam], patch: { tags: ['test-hooks'], summary: 'Force the outstanding balance without a ledger entry (reconciliation break)', requestBody: json({ type: 'object', required: ['outstanding'], properties: { outstanding: { type: 'number' } } }), responses: { 200: { description: 'Loan', ...json(ref('Loan')) } } } },
    '/test/loanlab/business-date': {
      get: { tags: ['test-hooks'], summary: 'Read the system business date', responses: { 200: { description: 'OK' } } },
      post: { tags: ['test-hooks'], summary: 'Set the system business date (Monday-Friday)', requestBody: json({ type: 'object', required: ['date'], properties: { date: isoDate } }), responses: { 200: { description: 'OK' }, 400: err('Not a business day') } },
    },
    '/test/loanlab/eod': { post: { tags: ['test-hooks'], summary: 'Run end-of-day for the current business date', responses: { 201: { description: 'EOD run', ...json(ref('EodRun')) } } } },
  },
};
