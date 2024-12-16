const ERC20Token = artifacts.require("ERC20Token");
const Locks = artifacts.require("Locks");
const Revert = require("./helpers/Revert");
const Sleep = require("./helpers/Sleep");
contract(Locks.contractName, (accounts) => {
    before(async () => {
        this.owner = accounts[0];
        this.beneficiary = accounts[1];
        this.developerWallet = accounts[2];
        this.token = await ERC20Token.deployed();
        this.locks = await Locks.deployed();
        this.tokenAddress = await this.token.address;
        this.locksAddress = await this.locks.address;
        let totalSupply = await this.token.totalSupply();
        this.totalSupply = web3.utils.fromWei(totalSupply, "ether");
        this.tokensLock = this.totalSupply * 20 / 100;
        this.tokensDeveloper = this.totalSupply * 10 / 100;
        this.timestamp = Math.floor(new Date().getTime() / 1000);
    });

    describe("Init", () => {
        it("Contract has been deployed successfully", async () => {
            let address = await this.locks.address;
            assert.notEqual(address, 0x0);
        });
        it("Has the correct locks token address", async () => {
            let token = await this.locks.token();
            assert.equal(token, this.tokenAddress);
        });
    });

    describe("Token Locks", () => {
        before(async () => {
            this.receipt = null;
        });
        it("Can't lock without approve token first", async () => {
            await Revert(async () => {
                await this.locks.lock(this.beneficiary, web3.utils.toWei(this.tokensLock.toString(), "ether"), this.timestamp + 3, {
                    from: this.owner
                });
            });
        });
        it("Approve tokens", async () => {
            this.receipt = await this.token.approve(this.locksAddress, web3.utils.toWei(this.tokensLock.toString(), "ether"), {
                from: this.owner
            });
            let balance = await this.token.allowance(this.owner, this.locksAddress, {
                from: this.owner
            });
            assert.equal(web3.utils.fromWei(balance, "ether"), this.tokensLock);
        });
        it("Can't lock more tokens than available", async () => {
            await Revert(async () => {
                await this.locks.lock(this.beneficiary, web3.utils.toWei((this.tokensLock + 1).toString(), "ether"), this.timestamp + 3, {
                    from: this.owner
                });
            });
        });
        it("Lock tokens", async () => {
            this.receipt = await this.locks.lock(this.beneficiary, web3.utils.toWei(this.tokensLock.toString(), "ether"), this.timestamp + 3, {
                from: this.owner
            });
            let locked = await this.locks.locked(this.beneficiary);
            assert.equal(web3.utils.fromWei(locked.amount, "ether"), this.tokensLock);
        });
        describe("Event check", () => {
            it("Triggers one event", async () => {
                assert.equal(this.receipt.logs.length, 1);
            });
            it("Should be the `Lock` event", async () => {
                assert.equal(this.receipt.logs[0].event, "Lock");
            });
            it("Has the correct `beneficiary` argument", async () => {
                assert.equal(this.receipt.logs[0].args.beneficiary, this.beneficiary);
            });
            it("Has the correct `amount` argument", async () => {
                assert.equal(web3.utils.fromWei(this.receipt.logs[0].args.amount, "ether"), this.tokensLock);
            });
            it("Has the correct `release time` argument", async () => {
                assert.equal(web3.utils.toNumber(this.receipt.logs[0].args.releaseTime), this.timestamp + 3);
            });
        });
        describe("Should owner's token decreased", () => {
            it("Has the correct tokens amount", async () => {
                let balance = await this.token.balanceOf(this.owner);
                assert.equal(web3.utils.fromWei(balance, "ether"), this.totalSupply - this.tokensLock);
            });
        });
        describe("Should locks contract's token increased", () => {
            it("Has the correct tokens amount", async () => {
                let balance = await this.token.balanceOf(this.locksAddress);
                assert.equal(web3.utils.fromWei(balance, "ether"), this.tokensLock);
            });
        });
    });

    describe("Release Locks", () => {
        before(async () => {
            this.receipt = null;
        });
        it("Can't release tokens before release time", async () => {
            await Revert(async () => {
                await this.locks.release(this.beneficiary, {
                    from: this.owner
                });
            });
        });
        it("Trigger any function to refresh block.timestamp, because there's no real-time current time in blockchain. but by every block updated", async () => {
            await Sleep(5000);
            await this.token.transfer(this.developerWallet, web3.utils.toWei(this.tokensDeveloper.toString(), "ether"), {
                from: this.owner
            });
            let balance = await this.token.balanceOf(this.developerWallet);
            assert.equal(web3.utils.fromWei(balance, "ether"), this.tokensDeveloper);
        });
        it("Release tokens", async () => {
            this.receipt = await this.locks.release(this.beneficiary, {
                from: this.owner
            });
            let balance = await this.token.balanceOf(this.beneficiary);
            assert.equal(web3.utils.fromWei(balance, "ether"), this.tokensLock);
        });
        describe("Event check", () => {
            it("Triggers one event", async () => {
                assert.equal(this.receipt.logs.length, 1);
            });
            it("Should be the `Release` event", async () => {
                assert.equal(this.receipt.logs[0].event, "Release");
            });
            it("Has the correct `beneficiary` argument", async () => {
                assert.equal(this.receipt.logs[0].args.beneficiary, this.beneficiary);
            });
            it("Has the correct `amount` argument", async () => {
                assert.equal(web3.utils.fromWei(this.receipt.logs[0].args.amount, "ether"), this.tokensLock);
            });
            it("Has the correct `release time` argument", async () => {
                assert.equal(web3.utils.toNumber(this.receipt.logs[0].args.releaseTime), this.timestamp + 3);
            });
        });
        describe("Should beneficiary's token increased", () => {
            it("Has the correct tokens amount", async () => {
                let balance = await this.token.balanceOf(this.beneficiary);
                assert.equal(web3.utils.fromWei(balance, "ether"), this.tokensLock);
            });
        });
        describe("Should lock contract's token decreased", () => {
            it("Has the correct tokens amount", async () => {
                let balance = await this.token.balanceOf(this.locksAddress);
                assert.equal(web3.utils.fromWei(balance, "ether"), 0);
            });
        });
    });
});