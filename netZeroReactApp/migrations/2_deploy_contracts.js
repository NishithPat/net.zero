const DummyContractForSophia = artifacts.require("./DummyContractForSophia.sol");

module.exports = function (deployer) {
  deployer.deploy(DummyContractForSophia);
};
