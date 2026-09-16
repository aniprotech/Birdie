const rules = new Map([
  ["united kingdom", /^[A-Z]{1,2}\d[A-Z\d]? ?\d[A-Z]{2}$/i],
  ["india", /^[1-9]\d{5}$/],
  ["united states", /^\d{5}(?:-\d{4})?$/],
  ["canada", /^[A-Z]\d[A-Z] ?\d[A-Z]\d$/i],
  ["australia", /^\d{4}$/],
]);
export const postcodeValid = (country, postcode) => {
  const rule = rules.get(String(country || "").trim().toLowerCase());
  return !rule || rule.test(String(postcode || "").trim());
};
