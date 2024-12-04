const BEP20Token = artifacts.require("BEP20Token");
const Staking = artifacts.require("Staking");

module.exports = (deployer) => {
    deployer.deploy(Staking, BEP20Token.address, BEP20Token.address);
};