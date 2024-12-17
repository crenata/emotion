const ERC20 = artifacts.require("ERC20");
const Presale = artifacts.require("Presale");

module.exports = (deployer) => {
    deployer.deploy(Presale, ERC20.address, web3.utils.toWei("0.00125", "ether"));
};