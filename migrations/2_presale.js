const ERC20Token = artifacts.require("ERC20Token");
const Presale = artifacts.require("Presale");

module.exports = (deployer) => {
    deployer.deploy(Presale, ERC20Token.address, web3.utils.toWei("0.00125", "ether"));
};