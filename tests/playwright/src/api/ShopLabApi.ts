import { APIRequestContext, APIResponse, expect } from '@playwright/test';
import type { Credentials } from '../config/env';

export type Address = { fullName: string; phone: string; line1: string; district: string; province: string; postcode: string };
export type Card = { number: string; expiry: string; cvv: string; name: string };
export type CheckoutInput = {
  address: Address;
  shippingMethod: 'standard' | 'express';
  paymentMethod: 'card' | 'cod';
  couponCode?: string;
  card?: Card;
};

/**
 * API client ("service object"). Tests use it to:
 *   1) test the API directly (api project)
 *   2) arrange data quickly for UI tests (login, fill cart) instead of clicking through the UI
 * Each method returns the raw APIResponse so callers can assert status codes themselves.
 */
export class ShopLabApi {
  private readonly request: APIRequestContext;
  private token: string | null = null;

  constructor(request: APIRequestContext) {
    this.request = request;
  }

  private headers(): Record<string, string> {
    return this.token ? { Authorization: `Bearer ${this.token}` } : {};
  }

  get authToken(): string | null {
    return this.token;
  }

  // ---------- test hooks ----------
  async reset(): Promise<void> {
    const res = await this.request.post('/api/test/reset');
    expect(res.ok(), 'reset ShopLab').toBeTruthy();
  }

  async setConfig(config: { bugMode?: boolean; latencyMs?: number; failureRate?: number }): Promise<APIResponse> {
    return this.request.post('/api/test/config', { data: config });
  }

  /** Test-data factory: a brand-new user per test keeps parallel tests independent. */
  async createUser(overrides: Partial<{ username: string; password: string; role: 'customer' | 'admin' }> = {}): Promise<Credentials & { id: number }> {
    const res = await this.request.post('/api/test/users', { data: overrides });
    expect(res.status(), await res.text()).toBe(201);
    return res.json();
  }

  // ---------- auth ----------
  async login(user: Credentials): Promise<APIResponse> {
    const res = await this.request.post('/api/auth/login', { data: user });
    if (res.ok()) this.token = (await res.json()).token;
    return res;
  }

  async loginOrFail(user: Credentials): Promise<string> {
    const res = await this.login(user);
    expect(res.status(), `login as ${user.username}`).toBe(200);
    return this.token as string;
  }

  logoutLocal(): void {
    this.token = null;
  }

  me(): Promise<APIResponse> {
    return this.request.get('/api/auth/me', { headers: this.headers() });
  }

  // ---------- products ----------
  products(query: Record<string, string | number | boolean> = {}): Promise<APIResponse> {
    return this.request.get('/api/products', { params: query });
  }

  product(id: number): Promise<APIResponse> {
    return this.request.get(`/api/products/${id}`);
  }

  async productIdBySku(sku: string): Promise<number> {
    const res = await this.products({ search: sku, pageSize: 50 });
    const body = await res.json();
    const p = body.items.find((x: { sku: string }) => x.sku === sku);
    expect(p, `product ${sku} exists`).toBeTruthy();
    return p.id;
  }

  createProduct(data: Record<string, unknown>): Promise<APIResponse> {
    return this.request.post('/api/products', { data, headers: this.headers() });
  }

  // ---------- cart ----------
  cart(): Promise<APIResponse> {
    return this.request.get('/api/cart', { headers: this.headers() });
  }

  addToCart(productId: number, qty = 1): Promise<APIResponse> {
    return this.request.post('/api/cart/items', { data: { productId, qty }, headers: this.headers() });
  }

  clearCart(): Promise<APIResponse> {
    return this.request.delete('/api/cart', { headers: this.headers() });
  }

  quote(couponCode?: string, shippingMethod: 'standard' | 'express' = 'standard'): Promise<APIResponse> {
    return this.request.post('/api/cart/quote', { data: { couponCode, shippingMethod }, headers: this.headers() });
  }

  // ---------- orders ----------
  checkout(input: CheckoutInput): Promise<APIResponse> {
    return this.request.post('/api/orders', { data: input, headers: this.headers() });
  }

  orders(): Promise<APIResponse> {
    return this.request.get('/api/orders', { headers: this.headers() });
  }

  order(id: number): Promise<APIResponse> {
    return this.request.get(`/api/orders/${id}`, { headers: this.headers() });
  }

  cancelOrder(id: number): Promise<APIResponse> {
    return this.request.post(`/api/orders/${id}/cancel`, { headers: this.headers() });
  }

  setOrderStatus(id: number, status: string): Promise<APIResponse> {
    return this.request.patch(`/api/admin/orders/${id}/status`, { data: { status }, headers: this.headers() });
  }
}
