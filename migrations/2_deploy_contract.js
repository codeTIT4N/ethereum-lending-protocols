const LendingSupply = artifacts.require("LendingSupply");
module.exports = function (deployer) {
    deployer.deploy(LendingSupply);
};
