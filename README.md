<div align="center">

![GitHub top language](https://img.shields.io/github/languages/top/crenata/emotion)
![GitHub all releases](https://img.shields.io/github/downloads/crenata/emotion/total)
![GitHub issues](https://img.shields.io/github/issues/crenata/emotion)
![GitHub](https://img.shields.io/github/license/crenata/emotion)
![GitHub release (latest by date including pre-releases)](https://img.shields.io/github/v/release/crenata/emotion?display_name=tag&include_prereleases)

</div>

# Emotion
A DeFi project related to pre-sale and staking.
Someone could buy tokens directly from the website at a price set during smart contract deployment,
and then you can stake them on the website.

The owner could execute the end-sale, and the amount of ETH (EVM) invested in the pre-sale smart contract would be transferred to owner's wallet.

The owner could also set the staking amount and duration,
and owner could lock the tokens for token reputation.

## Tech Stacks
- [Truffle](https://archive.trufflesuite.com/docs/truffle)
- [Web3](https://web3js.readthedocs.io)
- [React](https://react.dev)

## Features

### Token Creation & Deployment
Contents :
- Create a ERC20 Token (Using standard ERC20)
- Define Token Name
- Define Token Symbol
- Define Token Decimals
- Define Token Total Supply

References :
- [ERC20.sol](https://github.com/crenata/emotion/blob/master/contracts/ERC20.sol)
- [ERC20 Migration](https://github.com/crenata/emotion/blob/master/migrations/1_erc20.js)

---

### Presale Contract
Contents :
- Define Token Contract (Set token address for pre-sale)
- Define Token Price (Set pre-sale token price on deployment)
- Tokens Sold (Information of tokens sold)
- Buy Tokens (Someone could buy tokens with this contract)
- End Sale (Only owner could execute end-sale)

References :
- [Presale.sol](https://github.com/crenata/emotion/blob/master/contracts/Presale.sol)
- [Presale Migration](https://github.com/crenata/emotion/blob/master/migrations/2_presale.js)

---

### Staking Contract
Contents :
- Define Token Contract (Set token address for staking)
- Define Token Reward Contract (Set token address for staking reward)
- Set Reward Duration (Only owner can set the staking duration)
- Set Reward Amount (Only owner can set the amount of staking rewards)
- Stake (Someone can stake their tokens to contract)
- Withdraw (Staker can unstake/withdraw their tokens from contract)
- Claim (Staker can claim their rewards of staked tokens)

References :
- [Staking.sol](https://github.com/crenata/emotion/blob/master/contracts/Staking.sol)
- [Staking Migration](https://github.com/crenata/emotion/blob/master/migrations/3_staking.js)

---

### Token Locks
Contents :
- Define Token Contract (Set token address for token locks)
- Lock (Owner can lock some amount of token and the duration)
- Release (Owner can release the locked tokens to beneficiary after lock duration ended)

References :
- [ERC20Lock.sol](https://github.com/crenata/emotion/blob/master/contracts/ERC20Lock.sol)
- [ERC20Lock Migration](https://github.com/crenata/emotion/blob/master/migrations/4_erc20lock.js)

## Usage

### Installation
Install project dependencies.

```bash
npm install
```

If you don't have truffle installed, run :

```bash
npm install -g truffle
```

### Migrate / Deploy Smart Contract
It's optional, you don't have to execute this.
Because, when migrating the smart contracts automatically compile the smart contracts.
To compile your smart contracts, run :

```bash
truffle compile
```

To migrate or deploy smart contracts, run :

```bash
truffle migrate
```

To deploy specify networks :

```bash
truffle migrate --network <network name>
```

### Run the Project
To run the project, run :

```bash
npm start
```

### Build the Project
To build the project, run :

```bash
npm run build
```

## Authors
- [Crenata](mailto:acacia.malaccensis@gmail.com)