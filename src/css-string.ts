/**
 * A CSS string for `content`, the form Plate's word and number properties take: quotes and backslashes escaped,
 * line breaks as `\a`, control characters dropped. Used by the embed and the workbench, so both write the same.
 */
export const cssString = (value: string): string =>
  `"${value
    .replace(/[\\"]/g, '\\$&')
    .replace(/\r\n?|\n/g, '\\a ')
    // eslint-disable-next-line no-control-regex
    .replace(/[\u0000-\u001f\u007f]/g, '')}"`;
