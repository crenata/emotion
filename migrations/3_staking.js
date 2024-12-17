const ERC20 = artifacts.require("ERC20");
const Staking = artifacts.require("Staking");

module.exports = (deployer) => {
    deployer.deploy(Staking, ERC20.address, ERC20.address);
};