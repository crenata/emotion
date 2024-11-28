const BEP20Token = artifacts.require("BEP20Token");
const Presale = artifacts.require("Presale");

module.exports = (deployer) => {
    deployer.deploy(Presale, BEP20Token.address, web3.utils.toWei("0.00001", "ether"));
};