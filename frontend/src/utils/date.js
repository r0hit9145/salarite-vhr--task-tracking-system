// The server sends naive UTC timestamps (no "Z"). Without one, JS would treat them
// as local time and show the wrong hour. Append "Z" so they parse as UTC.
export function parseServerDate(value) {
  if (!value) return null;
  const hasZone = /(Z|[+-]\d{2}:?\d{2})$/.test(value);
  return new Date(hasZone ? value : value + "Z");
}

export function formatDateTime(value) {
  const d = parseServerDate(value);
  return d ? d.toLocaleString("en-IN", { dateStyle: "medium", timeStyle: "short" }) : "";
}