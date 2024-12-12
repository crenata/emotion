const ERC20Token = artifacts.require("ERC20Token");
const Staking = artifacts.require("Staking");

module.exports = (deployer) => {
    deployer.deploy(Staking, ERC20Token.address, ERC20Token.address);
};