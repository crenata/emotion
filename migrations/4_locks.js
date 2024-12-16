const ERC20Token = artifacts.require("ERC20Token");
const Locks = artifacts.require("Locks");

module.exports = (deployer) => {
    deployer.deploy(Locks, ERC20Token.address);
};