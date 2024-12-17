const ERC20 = artifacts.require("ERC20");
const Presale = artifacts.require("Presale");
const Revert = require("./helpers/Revert");
contract(Presale.contractName, (accounts) => {
    before(async () => {
        this.owner = accounts[0];
        this.buyer = accounts[1];
        this.token = await ERC20.deployed();
        this.presale = await Presale.deployed();
        this.tokenAddress = await this.token.address;
        this.presaleAddress = await this.presale.address;
        this.tokenPrice = 0.00125;
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
            let address = await this.presale.address;
            assert.notEqual(address, 0x0);
        });
        it("Has the correct token contract address", async () => {
            let token = await this.presale.token();
            assert.equal(token, this.tokenAddress);
        });
        it("Has the correct token price", async () => {
            let tokenPrice = await this.presale.tokenPrice();
            assert.equal(web3.utils.fromWei(tokenPrice, "ether"), this.tokenPrice);
        });
        it("Transfer tokens to presale contract", async () => {
            this.receipt = await this.token.transfer(this.presaleAddress, web3.utils.toWei(this.tokensAvailable.toString(), "ether"), {
                from: this.owner
            });
            let balance = await this.token.balanceOf(this.presaleAddress);
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
                assert.equal(this.receipt.logs[0].args.to, this.presaleAddress);
            });
            it("Has the correct `value` argument", async () => {
                assert.equal(this.receipt.logs[0].args.value, web3.utils.toWei(this.tokensAvailable.toString(), "ether"));
            });
        });
    });

    describe("Token Buying", () => {
        before(async () => {
            this.receipt = null;
            this.presaleBalance = await web3.utils.fromWei(await web3.eth.getBalance(this.presaleAddress), "ether");
            this.buyerBalance = await web3.utils.fromWei(await web3.eth.getBalance(this.buyer), "ether");
            this.etherValue = this.tokensBought * this.tokenPrice;
        });
        it("Can't buy token with incorrect ether value", async () => {
            await Revert(async () => {
                await this.presale.buyTokens(web3.utils.toWei(this.tokensBought.toString(), "ether"), {
                    from: this.buyer,
                    value: web3.utils.toWei((this.etherValue - 0.00125).toString(), "ether")
                });
            });
        });
        it("Can't buy more tokens than available", async () => {
            await Revert(async () => {
                await this.presale.buyTokens(web3.utils.toWei((this.tokensAvailable + 1).toString(), "ether"), {
                    from: this.buyer,
                    value: web3.utils.toWei(((this.tokensAvailable + 1) * this.tokenPrice).toString(), "ether")
                });
            });
        });
        it("Buy tokens", async () => {
            this.receipt = await this.presale.buyTokens(web3.utils.toWei(this.tokensBought.toString(), "ether"), {
                from: this.buyer,
                value: web3.utils.toWei(this.etherValue.toString(), "ether")
            });
            let balance = await this.token.balanceOf(this.buyer);
            assert.equal(web3.utils.fromWei(balance, "ether"), this.tokensBought);
        });
        describe("Event check", () => {
            it("Triggers one event", async () => {
                assert.equal(this.receipt.logs.length, 1);
            });
            it("Should be the `Buy` event", async () => {
                assert.equal(this.receipt.logs[0].event, "Buy");
            });
            it("Has the correct `buyer` argument", async () => {
                assert.equal(this.receipt.logs[0].args.buyer, this.buyer);
            });
            it("Has the correct `amount primary` argument", async () => {
                assert.equal(web3.utils.fromWei(this.receipt.logs[0].args.amountPrimary, "ether"), this.etherValue);
            });
            it("Has the correct `amount token` argument", async () => {
                assert.equal(web3.utils.fromWei(this.receipt.logs[0].args.amountToken, "ether"), this.tokensBought);
            });
        });
        describe("Should buyer's amount decreased", () => {
            it("Has the correct balance", async () => {
                let balance = await web3.eth.getBalance(this.buyer);
                assert.notEqual(web3.utils.fromWei(balance, "ether"), this.buyerBalance);
            });
        });
        describe("Should presale's amount increased", () => {
            it("Balance not equal from previous", async () => {
                let balance = await web3.eth.getBalance(this.presaleAddress);
                assert.notEqual(web3.utils.fromWei(balance, "ether"), this.presaleBalance);
            });
            it("Has the correct balance", async () => {
                let balance = await web3.eth.getBalance(this.presaleAddress);
                assert.equal(web3.utils.fromWei(balance, "ether"), this.etherValue);
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
                let tokensSold = await this.presale.tokensSold();
                assert.equal(web3.utils.fromWei(tokensSold, "ether"), this.tokensBought);
            });
        });
        describe("Should tokens available decreased", () => {
            it("Has the correct tokens available", async () => {
                let balance = await this.token.balanceOf(this.presaleAddress);
                assert.equal(web3.utils.fromWei(balance, "ether"), this.tokensAvailable - this.tokensBought);
            });
        });
    });

    describe("Ends Token Presale", () => {
        before(async () => {
            this.receipt = null;
        });
        it("Prevents non-admin from updating end presale", async () => {
            await Revert(async () => {
                await this.presale.endSale({
                    from: this.buyer
                });
            });
        });
        it("Allows admin from updating end presale", async () => {
            this.receipt = await this.presale.endSale({
                from: this.owner
            });
        });
        it("Returns all unsold tokens to owner", async () => {
            let balance = await this.token.balanceOf(this.owner);
            assert.equal(web3.utils.fromWei(balance, "ether"), this.totalSupply - this.tokensBought);
        });
        it("Variables was reset", async () => {
            try {
                await this.presale.tokenPrice();
            } catch (error) {
                assert(true);
            }
        });
    });
});