const crypto = require("crypto");

const HASH_PREFIX = "pbkdf2";
const HASH_DIGEST = "sha512";
const HASH_KEY_LENGTH = 64;
const HASH_ITERATIONS = 100000;

function legacyHashPassword(password) {
  return crypto.createHash("sha256").update(password).digest("hex");
}

function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  const passwordHash = crypto
    .pbkdf2Sync(password, salt, HASH_ITERATIONS, HASH_KEY_LENGTH, HASH_DIGEST)
    .toString("hex");

  return [HASH_PREFIX, HASH_ITERATIONS, salt, passwordHash].join("$");
}

function safeCompare(left, right) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);

  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }

  return crypto.timingSafeEqual(leftBuffer, rightBuffer);
}

function comparePassword(password, hashedPassword) {
  if (typeof hashedPassword !== "string" || hashedPassword.length === 0) {
    return false;
  }

  if (hashedPassword.startsWith(`${HASH_PREFIX}$`)) {
    const [, iterations, salt, storedHash] = hashedPassword.split("$");
    const passwordHash = crypto.pbkdf2Sync(
      password,
      salt,
      Number(iterations),
      HASH_KEY_LENGTH,
      HASH_DIGEST
    ).toString("hex");

    return safeCompare(passwordHash, storedHash);
  }

  return safeCompare(legacyHashPassword(password), hashedPassword);
}

module.exports = {
  hashPassword,
  comparePassword
};
