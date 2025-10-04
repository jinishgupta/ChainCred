const { buildModule } = require("@nomicfoundation/hardhat-ignition/modules");

const ChainCredModule = buildModule("ChainCredModule", (m) => {
  const chainCred = m.contract("ChainCred");

  return { chainCred };
});

module.exports = ChainCredModule;