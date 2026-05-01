const assert = require("node:assert/strict");
const crypto = require("crypto");

const { comparePassword, hashPassword } = require("../../src/utils/password");

describe("password utils", () => {
  it("deve gerar um hash pbkdf2 que possa ser validado por comparePassword", () => {
    // Arrange
    const plainPassword = "Senha@123";

    // Act
    const hashedPassword = hashPassword(plainPassword);
    const matches = comparePassword(plainPassword, hashedPassword);

    // Assert
    assert.match(hashedPassword, /^pbkdf2\$100000\$[a-f0-9]{32}\$[a-f0-9]{128}$/);
    assert.strictEqual(matches, true);
  });

  it("deve gerar hashes diferentes para a mesma senha por causa do salt aleatorio", () => {
    // Arrange
    const plainPassword = "Senha@123";

    // Act
    const firstHash = hashPassword(plainPassword);
    const secondHash = hashPassword(plainPassword);

    // Assert
    assert.notStrictEqual(firstHash, secondHash);
    assert.strictEqual(comparePassword(plainPassword, firstHash), true);
    assert.strictEqual(comparePassword(plainPassword, secondHash), true);
  });

  it("deve retornar true para um hash legado em sha256", () => {
    // Arrange
    const plainPassword = "Senha@123";
    const legacyHash = crypto.createHash("sha256").update(plainPassword).digest("hex");

    // Act
    const matches = comparePassword(plainPassword, legacyHash);

    // Assert
    assert.strictEqual(matches, true);
  });

  it("deve retornar false quando a senha nao corresponder ao hash armazenado", () => {
    // Arrange
    const hashedPassword = hashPassword("Senha@123");

    // Act
    const matches = comparePassword("Senha@999", hashedPassword);

    // Assert
    assert.strictEqual(matches, false);
  });

  it("deve retornar false quando o hash da senha estiver vazio ou invalido", () => {
    // Arrange
    const plainPassword = "Senha@123";

    // Act
    const emptyHashResult = comparePassword(plainPassword, "");
    const invalidHashResult = comparePassword(plainPassword, null);

    // Assert
    assert.strictEqual(emptyHashResult, false);
    assert.strictEqual(invalidHashResult, false);
  });
});
