const ERC20 = artifacts.require("ERC20");
const Locks = artifacts.require("Locks");

module.exports = (deployer) => {
    deployer.deploy(Locks, ERC20.address);
};