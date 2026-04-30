function normalizeString(value) {
  return typeof value === "string" ? value.trim() : value;
}

function normalizeNullableString(value) {
  if (value === undefined) {
    return undefined;
  }

  if (value === null) {
    return null;
  }

  const normalizedValue = normalizeString(value);
  return normalizedValue === "" ? null : normalizedValue;
}

function normalizeEmail(value) {
  const normalizedValue = normalizeString(value);
  return typeof normalizedValue === "string" ? normalizedValue.toLowerCase() : normalizedValue;
}

function normalizeIsoDateTime(value) {
  return typeof value === "string" ? new Date(value).toISOString() : value;
}

function normalizeUniqueStringList(values) {
  if (!Array.isArray(values)) {
    return values;
  }

  return [...new Set(values.map((value) => normalizeString(value)))];
}

module.exports = {
  normalizeEmail,
  normalizeIsoDateTime,
  normalizeNullableString,
  normalizeString,
  normalizeUniqueStringList
};
