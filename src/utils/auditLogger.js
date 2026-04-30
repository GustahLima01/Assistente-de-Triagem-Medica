function writeAuditLog(action, details = {}) {
  const payload = {
    timestamp: new Date().toISOString(),
    action,
    ...details
  };

  console.info("[AUDIT]", JSON.stringify(payload));
}

module.exports = {
  writeAuditLog
};
