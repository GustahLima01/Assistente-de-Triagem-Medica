const { resetDatabase } = require("../../src/data/memoryDb");

exports.mochaHooks = {
  beforeEach() {
    resetDatabase();
  }
};
