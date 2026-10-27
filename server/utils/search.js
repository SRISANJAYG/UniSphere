export const literalSearch = (value) => {
  const backslash = String.fromCharCode(92);
  const special = new Set([...".*+?^$(){}|[]", backslash]);
  return [...String(value).slice(0, 100)]
    .map((char) => (special.has(char) ? backslash + char : char))
    .join("");
};
