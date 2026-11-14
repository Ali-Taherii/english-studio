// Fills {placeholders} in a message: fill("{count} lessons", { count: "۸" }).
export const fill = (template: string, values: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (match, key: string) => (key in values ? String(values[key]) : match));
