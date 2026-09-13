const UUIDV7_REGEX =
  /^[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-7[0-9a-fA-F]{3}-[89aAbB][0-9a-fA-F]{3}-[0-9a-fA-F]{12}$/i;

export function isUUIDv7(str: string): boolean {
  return UUIDV7_REGEX.test(str);
}
