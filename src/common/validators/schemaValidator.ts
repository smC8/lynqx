import Ajv, { JSONSchemaType } from "ajv";

const ajv = new Ajv();

export function validateSchema<T>(schema: JSONSchemaType<T>, data: any): { valid: boolean; errors?: any } {
  const validate = ajv.compile(schema);
  const valid = validate(data);
  return { valid: !!valid, errors: validate.errors };
}
