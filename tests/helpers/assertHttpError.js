const assert = require("node:assert/strict");
const HttpError = require("../../src/utils/httpError");

function assertHttpError(execute, expected) {
  let capturedError;

  assert.throws(
    () => {
      try {
        execute();
      } catch (error) {
        capturedError = error;
        throw error;
      }
    },
    (error) => error instanceof HttpError
  );

  assert.ok(capturedError);

  if (expected.status !== undefined) {
    assert.strictEqual(capturedError.status, expected.status);
  }

  if (expected.code !== undefined) {
    assert.strictEqual(capturedError.code, expected.code);
  }

  if (expected.message !== undefined) {
    assert.strictEqual(capturedError.message, expected.message);
  }

  if (expected.details !== undefined) {
    assert.deepStrictEqual(capturedError.details, expected.details);
  }

  return capturedError;
}

module.exports = {
  assertHttpError
};
