const ERC20Token = artifacts.require("ERC20Token");

module.exports = (deployer) => {
    deployer.deploy(ERC20Token);
};