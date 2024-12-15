pragma solidity ^0.5.16;

import "./IERC20.sol";

interface IStaking {
    /**
     * @dev Returns the erc staking token address.
     */
    function stakingToken() external view returns(IERC20);

    /**
     * @dev Returns the erc reward token address.
     */
    function rewardToken() external view returns(IERC20);

    /**
     * @dev Returns the staking duration.
     */
    function duration() external view returns(uint256);

    /**
     * @dev Returns the finish timestamp.
     */
    function finishedAt() external view returns(uint256);

    /**
     * @dev Returns the updated at timestamp.
     */
    function updatedAt() external view returns(uint256);

    /**
     * @dev Returns the reward rate in wei.
     */
    function rewardRate() external view returns(uint256);

    /**
     * @dev Returns the reward rate per token stored in wei.
     */
    function rewardPerTokenStored() external view returns(uint256);

    /**
     * @dev Returns the total staked tokens in wei.
     */
    function totalStaked() external view returns(uint256);

    /**
     * @dev Returns the amount of tokens owned by `account`.
     */
    function balanceOf(address account) external view returns(uint256);

    /**
     * @dev Last time reward applicable.
     */
    function lastTimeRewardApplicable() external view returns(uint256);

    /**
     * @dev Amount of reward per token staked.
     */
    function rewardPerToken() external view returns(uint256);

    /**
     * @dev Total token has been earned.
     */
    function earned() external view returns(uint256);

    /**
     * @dev Transfers tokens from `buyer` to `staking` contract.
     *
     * @param amount Amount of token to stake.
     */
    function stake(uint256 amount) external returns(bool);

    /**
     * @dev Transfers tokens from `staking` contract to `buyer`.
     *
     * @param amount Amount of token to withdraw.
     */
    function withdraw(uint256 amount) external returns(bool);

    /**
     * @dev Claim the token rewards.
     */
    function claim() external returns(bool);

    /**
     * @dev Set staking reward duration.
     *
     * @param duration_ Duration of rewards to be paid out in seconds.
     */
    function setRewardDuration(uint256 duration_) external returns(bool);

    /**
     * @dev Start the rewards.
     *
     * @param amount Amount of token to be set as reward.
     */
    function notifyRewardAmount(uint256 amount) external returns(bool);

    /**
     * @dev Emitted when buyer stake the tokens.
     *
     * @param sender Sender's address.
     * @param amount Amount of token.
     * @param timestamp Block timestamp.
     */
    event Stake(address indexed sender, uint256 amount, uint256 timestamp);

    /**
     * @dev Emitted when buyer withdraw the tokens.
     *
     * @param sender Sender's address.
     * @param amount Amount of token.
     * @param timestamp Block timestamp.
     */
    event Withdraw(address indexed sender, uint256 amount, uint256 timestamp);

    /**
     * @dev Emitted when buyer claim the token rewards.
     *
     * @param sender Sender's address.
     * @param amount Amount of token.
     * @param timestamp Block timestamp.
     */
    event Claim(address indexed sender, uint256 amount, uint256 timestamp);
}