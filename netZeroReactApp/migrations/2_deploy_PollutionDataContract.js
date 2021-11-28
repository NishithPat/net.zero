const PollutionDataContract = artifacts.require("./PollutionDataContract.sol");

module.exports = function (deployer) {
    deployer.deploy(PollutionDataContract);
};
