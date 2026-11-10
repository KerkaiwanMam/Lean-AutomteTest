import Ajv, { ValidateFunction } from 'ajv';
import type { APIRequestContext } from '@playwright/test';

/**
 * Contract testing helper: validates responses against the schemas published in
 * GET /api/openapi.json, so the test suite fails when the API shape drifts from its contract.
 */
let ajv: Ajv | null = null;

export async function schemaValidator(request: APIRequestContext, name: string): Promise<ValidateFunction> {
  if (!ajv) {
    const spec = await (await request.get('/api/openapi.json')).json();
    ajv = new Ajv({ allErrors: true, strict: false });
    // Ajv 8 understands the OpenAPI 3.0 "nullable" keyword natively; strict:false ignores "example"
    ajv.addSchema({ $id: 'openapi', components: spec.components });
  }
  const validate = ajv.getSchema(`openapi#/components/schemas/${name}`);
  if (!validate) throw new Error(`Schema ${name} not found in openapi.json`);
  return validate;
}

export function formatErrors(validate: ValidateFunction): string {
  return (validate.errors ?? []).map((e) => `${e.instancePath || '/'} ${e.message}`).join('\n');
}
