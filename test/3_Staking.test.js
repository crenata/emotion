const ERC20 = artifacts.require("ERC20");
const Staking = artifacts.require("Staking");
const Revert = require("./helpers/Revert");
contract(Staking.contractName, (accounts) => {
    before(async () => {
        this.owner = accounts[0];
        this.buyer = accounts[1];
        this.token = await ERC20.deployed();
        this.staking = await Staking.deployed();
        this.tokenAddress = await this.token.address;
        this.stakingAddress = await this.staking.address;
        let totalSupply = await this.token.totalSupply();
        this.totalSupply = web3.utils.fromWei(totalSupply, "ether");
        this.tokensAvailable = this.totalSupply * 20 / 100;
        this.duration = 157700000 /* in seconds */;
        this.tokensBought = 10;
    });

    describe("Init", () => {
        before(() => {
            this.receipt = null;
        });
        it("Contract has been deployed successfully", async () => {
            let address = await this.staking.address;
            assert.notEqual(address, 0x0);
        });
        it("Has the correct staking token address", async () => {
            let tokenAddress = await this.staking.stakingToken();
            assert.equal(tokenAddress, this.tokenAddress);
        });
        it("Has the correct reward token address", async () => {
            let tokenAddress = await this.staking.rewardToken();
            assert.equal(tokenAddress, this.tokenAddress);
        });
        it("Set reward duration", async () => {
            this.receipt = await this.staking.setRewardDuration(this.duration, {
                from: this.owner
            });
            let duration = await this.staking.duration();
            assert.equal(duration, this.duration);
        });
        it("Transfer tokens to staking contract", async () => {
            this.receipt = await this.token.transfer(this.stakingAddress, web3.utils.toWei(this.tokensAvailable.toString(), "ether"), {
                from: this.owner
            });
            let balance = await this.token.balanceOf(this.stakingAddress);
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
                assert.equal(this.receipt.logs[0].args.to, this.stakingAddress);
            });
            it("Has the correct `value` argument", async () => {
                assert.equal(this.receipt.logs[0].args.value, web3.utils.toWei(this.tokensAvailable.toString(), "ether"));
            });
        });
        describe("Send free token to buyer for testing purpose", () => {
            it("Transfer tokens to buyer for testing", async () => {
                this.receipt = await this.token.transfer(this.buyer, web3.utils.toWei(this.tokensBought.toString(), "ether"), {
                    from: this.owner
                });
                let balance = await this.token.balanceOf(this.buyer);
                assert.equal(web3.utils.fromWei(balance, "ether"), this.tokensBought);
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
                    assert.equal(this.receipt.logs[0].args.to, this.buyer);
                });
                it("Has the correct `value` argument", async () => {
                    assert.equal(this.receipt.logs[0].args.value, web3.utils.toWei(this.tokensBought.toString(), "ether"));
                });
            });
        });
    });

    describe("Token Staking", () => {
        before(async () => {
            this.receipt = null;
        });
        it("Has the correct tokens available", async () => {
            let balance = await this.token.balanceOf(this.buyer);
            assert.equal(web3.utils.fromWei(balance, "ether"), this.tokensBought);
        });
        it("Can't stake without approve token first", async () => {
            await Revert(async () => {
                await this.staking.stake(web3.utils.toWei(this.tokensBought.toString(), "ether"), {
                    from: this.buyer
                });
            });
        });
        it("Approve tokens", async () => {
            this.receipt = await this.token.approve(this.stakingAddress, web3.utils.toWei(this.tokensBought.toString(), "ether"), {
                from: this.buyer
            });
            let balance = await this.token.allowance(this.buyer, this.stakingAddress, {
                from: this.buyer
            });
            assert.equal(web3.utils.fromWei(balance, "ether"), this.tokensBought);
        });
        it("Can't stake more tokens than available", async () => {
            await Revert(async () => {
                await this.staking.stake(web3.utils.toWei((this.tokensBought + 1).toString(), "ether"), {
                    from: this.buyer
                });
            });
        });
        it("Stake tokens", async () => {
            this.receipt = await this.staking.stake(web3.utils.toWei(this.tokensBought.toString(), "ether"), {
                from: this.buyer
            });
            let balance = await this.staking.balanceOf(this.buyer);
            assert.equal(web3.utils.fromWei(balance, "ether"), this.tokensBought);
        });
        describe("Event check", () => {
            it("Triggers one event", async () => {
                assert.equal(this.receipt.logs.length, 1);
            });
            it("Should be the `Stake` event", async () => {
                assert.equal(this.receipt.logs[0].event, "Stake");
            });
            it("Has the correct `sender` argument", async () => {
                assert.equal(this.receipt.logs[0].args.sender, this.buyer);
            });
            it("Has the correct `amount` argument", async () => {
                assert.equal(web3.utils.fromWei(this.receipt.logs[0].args.amount, "ether"), this.tokensBought);
            });
        });
        describe("Should buyer's token decreased", () => {
            it("Has the correct tokens amount", async () => {
                let balance = await this.token.balanceOf(this.buyer);
                assert.equal(web3.utils.fromWei(balance, "ether"), 0);
            });
        });
        describe("Should total staked increased", () => {
            it("Has the correct total staked", async () => {
                let totalStaked = await this.staking.totalStaked();
                assert.equal(web3.utils.fromWei(totalStaked, "ether"), this.tokensBought);
            });
        });
        describe("Should tokens available increased", () => {
            it("Has the correct tokens available", async () => {
                let balance = await this.token.balanceOf(this.stakingAddress);
                assert.equal(web3.utils.fromWei(balance, "ether"), this.tokensAvailable + this.tokensBought);
            });
        });
    });

    describe("Withdraw Staking", () => {
        before(async () => {
            this.receipt = null;
        });
        it("Withdraw tokens", async () => {
            this.receipt = await this.staking.withdraw(web3.utils.toWei(this.tokensBought.toString(), "ether"), {
                from: this.buyer
            });
            let balance = await this.token.balanceOf(this.buyer);
            assert.equal(web3.utils.fromWei(balance, "ether"), this.tokensBought);
        });
        describe("Event check", () => {
            it("Triggers one event", async () => {
                assert.equal(this.receipt.logs.length, 1);
            });
            it("Should be the `Withdraw` event", async () => {
                assert.equal(this.receipt.logs[0].event, "Withdraw");
            });
            it("Has the correct `sender` argument", async () => {
                assert.equal(this.receipt.logs[0].args.sender, this.buyer);
            });
            it("Has the correct `amount` argument", async () => {
                assert.equal(web3.utils.fromWei(this.receipt.logs[0].args.amount, "ether"), this.tokensBought);
            });
        });
        describe("Should buyer's token increased", () => {
            it("Has the correct tokens amount", async () => {
                let balance = await this.token.balanceOf(this.buyer);
                assert.equal(web3.utils.fromWei(balance, "ether"), this.tokensBought);
            });
        });
        describe("Should total staked decreased", () => {
            it("Has the correct total staked", async () => {
                let totalStaked = await this.staking.totalStaked();
                assert.equal(web3.utils.fromWei(totalStaked, "ether"), 0);
            });
        });
        describe("Should tokens available decreased", () => {
            it("Has the correct tokens available", async () => {
                let balance = await this.token.balanceOf(this.stakingAddress);
                assert.equal(web3.utils.fromWei(balance, "ether"), this.tokensAvailable);
            });
        });
    });
});