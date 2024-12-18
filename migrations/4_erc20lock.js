const ERC20 = artifacts.require("ERC20");
const ERC20Lock = artifacts.require("ERC20Lock");

module.exports = (deployer) => {
    deployer.deploy(ERC20Lock, ERC20.address);
};