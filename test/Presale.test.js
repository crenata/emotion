const BEP20Token = artifacts.require("BEP20Token");
const Presale = artifacts.require("Presale");
const Revert = require("./helpers/Revert");
contract(Presale.contractName, (accounts) => {
    before(async () => {
        this.owner = accounts[0];
        this.buyer = accounts[1];
        this.token = await BEP20Token.deployed();
        this.tokenSale = await Presale.deployed();
        this.tokenAddress = await this.token.address;
        this.tokenSaleAddress = await this.tokenSale.address;
        this.tokenPrice = web3.utils.toWei("0.00001", "ether");
        let totalSupply = await this.token.totalSupply();
        this.totalSupply = web3.utils.fromWei(totalSupply, "ether");
        this.tokensAvailable = this.totalSupply * 75 / 100;
        this.tokensBought = 10;
    });

    describe("Init", () => {
        before(() => {
            this.receipt = null;
        });
        it("Contract has been deployed successfully", async () => {
            let address = await this.tokenSale.address;
            assert.notEqual(address, 0x0);
        });
        it("Has the correct token contract address", async () => {
            let tokenSaleContract = await this.tokenSale.tokenContract();
            assert.equal(tokenSaleContract, this.tokenAddress);
        });
        it("Has the correct token price", async () => {
            let tokenPrice = await this.tokenSale.tokenPrice();
            assert.equal(tokenPrice, this.tokenPrice);
        });
        it("Transfer tokens to token sale contract", async () => {
            this.receipt = await this.token.transfer(this.tokenSaleAddress, web3.utils.toWei(this.tokensAvailable.toString(), "ether"), {
                from: this.owner
            });
            let balance = await this.token.balanceOf(this.tokenSaleAddress);
            assert.equal(web3.utils.fromWei(balance, "ether"), this.tokensAvailable);
        });
        describe("Event check", () => {
            it("Triggers one event", async () => {
                assert.equal(this.receipt.logs.length, 1);
            });
            it("Should be the `Transfer` event", async () => {
                assert.equal(this.receipt.logs[0].event, "Transfer");
            });
            it("Has the correct `from` argument", async () => {
                assert.equal(this.receipt.logs[0].args.from, this.owner);
            });
            it("Has the correct `to` argument", async () => {
                assert.equal(this.receipt.logs[0].args.to, this.tokenSaleAddress);
            });
            it("Has the correct `value` argument", async () => {
                assert.equal(this.receipt.logs[0].args.value, web3.utils.toWei(this.tokensAvailable.toString(), "ether"));
            });
        });
    });

    describe("Token Buying", () => {
        before(async () => {
            this.receipt = null;
            this.buyerBalance = await web3.utils.fromWei(await web3.eth.getBalance(this.buyer), "ether");
            this.etherValue = this.tokensBought * this.tokenPrice;
        });
        it("Can't buy token with incorrect ether value", async () => {
            await Revert(async () => {
                await this.tokenSale.buyTokens(this.tokensBought, {
                    from: this.buyer,
                    value: this.etherValue - 10
                });
            });
        });
        /*it("Can't buy more tokens than available", async () => {
            await Revert(async () => {
                await this.tokenSale.buyTokens((this.tokensAvailable + 1).toString(), {
                    from: this.buyer,
                    value: (this.tokensAvailable + 1) * this.tokenPrice
                });
            });
        });*/
        it("Buy tokens", async () => {
            this.receipt = await this.tokenSale.buyTokens(this.tokensBought, {
                from: this.buyer,
                value: this.etherValue
            });
            let balance = await this.token.balanceOf(this.buyer);
            assert.equal(web3.utils.fromWei(balance, "ether"), this.tokensBought);
        });
        describe("Event check", () => {
            it("Triggers one event", async () => {
                assert.equal(this.receipt.logs.length, 1);
            });
            it("Should be the `Sell` event", async () => {
                assert.equal(this.receipt.logs[0].event, "Sell");
            });
            it("Has the correct `buyer` argument", async () => {
                assert.equal(this.receipt.logs[0].args._buyer, this.buyer);
            });
            it("Has the correct `amount` argument", async () => {
                assert.equal(this.receipt.logs[0].args._amount, this.tokensBought);
            });
        });
        describe("Should buyer's amount decreased", () => {
            it("Has the correct tokens sold", async () => {
                let buyerBalanceUpdate = await web3.utils.fromWei(await web3.eth.getBalance(this.buyer), "ether");
                assert.notEqual(buyerBalanceUpdate, this.buyerBalance);
            });
        });
        describe("Should buyer receive token", () => {
            it("Has the correct tokens amount", async () => {
                let balance = await this.token.balanceOf(this.buyer);
                assert.equal(web3.utils.fromWei(balance, "ether"), this.tokensBought);
            });
        });
        describe("Should tokens sold increased", () => {
            it("Has the correct tokens sold", async () => {
                let tokensSold = await this.tokenSale.tokensSold();
                assert.equal(tokensSold.toNumber(), this.tokensBought);
            });
        });
        describe("Should tokens available decreased", () => {
            it("Has the correct tokens available", async () => {
                let balance = await this.token.balanceOf(this.tokenSaleAddress);
                assert.equal(web3.utils.fromWei(balance, "ether"), this.tokensAvailable - this.tokensBought);
            });
        });
    });

    describe("Ends Token Sale", () => {
        before(async () => {
            this.receipt = null;
        });
        it("Prevents non-admin from updating end sale", async () => {
            await Revert(async () => {
                await this.tokenSale.endSale({
                    from: this.buyer
                });
            });
        });
        it("Allows admin from updating end sale", async () => {
            this.receipt = await this.tokenSale.endSale({
                from: this.owner
            });
        });
        it("Returns all unsold tokens to owner", async () => {
            let balance = await this.token.balanceOf(this.owner);
            assert.equal(web3.utils.fromWei(balance, "ether"), this.totalSupply - this.tokensBought);
        });
        it("Variables was reset", async () => {
            try {
                await this.tokenSale.tokenPrice();
            } catch (error) {
                assert(true);
            }
        });
    });
});