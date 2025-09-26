// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Context.sol";
import "./IERC20.sol";
import "./IStaking.sol";
import "./Ownable.sol";
import "./SafeMath.sol";

contract Staking is Context, IStaking, Ownable {
    using SafeMath for uint256;
    
    IERC20 private _stakingToken;
    IERC20 private _rewardToken;

    uint256 private _duration;
    uint256 private _finishedAt;
    uint256 private _updatedAt;
    uint256 private _rewardRate;
    uint256 private _rewardPerTokenStored;
    uint256 private _totalStaked;

    mapping(address => uint256) private _userRewardPerTokenPaid;
    mapping(address => uint256) private _rewards;
    mapping(address => uint256) private _balances;

    /**
     * @param stakingToken_ Staking token contract address.
     * @param rewardToken_ Reward token contract address.
     */
    constructor(address stakingToken_, address rewardToken_) {
        _stakingToken = IERC20(stakingToken_);
        _rewardToken = IERC20(rewardToken_);
    }

    /**
     * @dev Returns the erc staking token address.
     */
    function stakingToken() external view returns(IERC20) {
        return _stakingToken;
    }

    /**
     * @dev Returns the erc reward token address.
     */
    function rewardToken() external view returns(IERC20) {
        return _rewardToken;
    }

    /**
     * @dev Returns the staking duration.
     */
    function duration() external view returns(uint256) {
        return _duration;
    }

    /**
     * @dev Returns the finish timestamp.
     */
    function finishedAt() external view returns(uint256) {
        return _finishedAt;
    }

    /**
     * @dev Returns the updated at timestamp.
     */
    function updatedAt() external view returns(uint256) {
        return _updatedAt;
    }

    /**
     * @dev Returns the reward rate in wei.
     */
    function rewardRate() external view returns(uint256) {
        return _rewardRate;
    }

    /**
     * @dev Returns the reward rate per token stored in wei.
     */
    function rewardPerTokenStored() external view returns(uint256) {
        return _rewardPerTokenStored;
    }

    /**
     * @dev Returns the total staked tokens in wei.
     */
    function totalStaked() external view returns(uint256) {
        return _totalStaked;
    }

    /**
     * @dev See {ERC20-balanceOf}.
     */
    function balanceOf(address account) external view returns(uint256) {
        return _balances[account];
    }

    /**
     * @dev Update reward every contract called.
     *
     * @param _account address.
     */
    modifier updateReward(address _account) {
        _rewardPerTokenStored = rewardPerToken();
        _updatedAt = lastTimeRewardApplicable();

        if (_account != address(0)) {
            _rewards[_account] = earned();
            _userRewardPerTokenPaid[_account] = _rewardPerTokenStored;
        }

        _;
    }

    /**
     * @param x First param.
     * @param y Second param.
     * @return uint256 Returns min value.
     */
    function _min(uint256 x, uint256 y) private pure returns (uint256) {
        return x <= y ? x : y;
    }

    /**
     * @dev Last time reward applicable.
     *
     * @return uint256 Returns min value between finished at and block timestamp.
     */
    function lastTimeRewardApplicable() public view returns (uint256) {
        return _min(_finishedAt, block.timestamp);
    }

    /**
     * @dev Amount of reward per token staked.
     *
     * @return uint256 Returns calculated reward per token.
     */
    function rewardPerToken() public view returns (uint256) {
        if (_totalStaked == 0) return _rewardPerTokenStored;

        return _rewardPerTokenStored + (
            (
                _rewardRate.mul(
                    (
                        lastTimeRewardApplicable().sub(_updatedAt)
                    )
                )
            ).mul(1e18)
        ) / _totalStaked;
    }

    /**
     * @dev Total token has been earned.
     *
     * @return uint256 Returns sender total earned.
     */
    function earned() public view returns (uint256) {
        return (
            (
                _balances[_msgSender()].mul(
                    (
                        rewardPerToken().sub(_userRewardPerTokenPaid[_msgSender()])
                    )
                )
            ).div(1e18)
        ).add(_rewards[_msgSender()]);
    }

    /**
     * @dev Transfers tokens from `buyer` to `staking` contract.
     *
     * @param amount Amount of token to stake.
     */
    function stake(uint256 amount) external updateReward(_msgSender()) returns(bool) {
        _stake(amount);
        return true;
    }

    /**
     * @dev Transfers tokens from `staking` contract to `buyer`.
     *
     * @param amount Amount of token to withdraw.
     */
    function withdraw(uint256 amount) external updateReward(_msgSender()) returns(bool) {
        _withdraw(amount);
        return true;
    }

    /**
     * @dev Claim the token rewards.
     */
    function claim() external updateReward(_msgSender()) returns(bool) {
        _claim();
        return true;
    }

    /**
     * @dev Set staking reward duration.
     *
     * @param duration_ Duration of rewards to be paid out in seconds.
     */
    function setRewardDuration(uint256 duration_) external onlyOwner returns(bool) {
        _setRewardDuration(duration_);
        return true;
    }

    /**
     * @dev Start the rewards.
     *
     * @param amount Amount of token to be set as reward.
     */
    function notifyRewardAmount(uint256 amount) external onlyOwner updateReward(address(0)) returns(bool) {
        _notifyRewardAmount(amount);
        return true;
    }

    /**
     * @dev Transfers tokens from `buyer` to `staking` contract.
     *
     * @param amount Amount of token to stake.
     */
    function _stake(uint256 amount) internal updateReward(_msgSender()) {
        require(_msgSender() != address(0), "Staking: Sender is the zero address");
        require(amount > 0, "Staking: Amount is equal or less than zero.");
        require(_stakingToken.transferFrom(_msgSender(), address(this), amount), "Staking: Failed transfer token to staking contract.");
        _balances[_msgSender()] = _balances[_msgSender()].add(amount);
        _totalStaked = _totalStaked.add(amount);
        emit Stake(_msgSender(), amount, block.timestamp);
    }

    /**
     * @dev Transfers tokens from `staking` contract to `buyer`.
     *
     * @param amount Amount of token to withdraw.
     */
    function _withdraw(uint256 amount) internal updateReward(_msgSender()) {
        require(_msgSender() != address(0), "Staking: Sender is the zero address");
        require(amount > 0, "Staking: Amount is equal or less than zero.");
        require(amount <= _balances[_msgSender()], "Staking: Amount is greater than available balance.");
        require(_stakingToken.transfer(_msgSender(), amount), "Staking: Failed transfer token to sender.");
        _balances[_msgSender()] = _balances[_msgSender()].sub(amount);
        _totalStaked = _totalStaked.sub(amount);
        emit Withdraw(_msgSender(), amount, block.timestamp);
    }

    /**
     * @dev Claim the token rewards.
     */
    function _claim() internal updateReward(_msgSender()) {
        require(_msgSender() != address(0), "Staking: Sender is the zero address");
        uint256 reward = _rewards[_msgSender()];
        require(reward > 0, "Staking: Reward is equal or less than zero.");
        require(_rewardToken.transfer(_msgSender(), reward), "Staking: Failed transfer token to sender.");
        _rewards[_msgSender()] = 0;
        emit Claim(_msgSender(), reward, block.timestamp);
    }

    /**
     * @dev Set staking reward duration.
     *
     * @param duration_ Duration of rewards to be paid out in seconds.
     */
    function _setRewardDuration(uint256 duration_) internal onlyOwner {
        require(_finishedAt < block.timestamp, "Staking: Reward duration is not finished.");
        _duration = duration_;
    }

    /**
     * @dev Start the rewards.
     *
     * @param amount Amount of token to be set as reward.
     */
    function _notifyRewardAmount(uint256 amount) internal onlyOwner updateReward(address(0)) {
        if (block.timestamp > _finishedAt) {
            _rewardRate = amount.div(_duration);
        } else {
            uint256 remainingRewards = (_finishedAt.sub(block.timestamp)).mul(_rewardRate);
            _rewardRate = (amount.add(remainingRewards)).div(_duration);
        }

        require(_rewardRate > 0, "Staking: Reward rate is equal or less than zero.");
        require(_rewardRate.mul(_duration) <= _rewardToken.balanceOf(address(this)), "Staking: Reward amount is greater than available staking contract balance.");

        _finishedAt = block.timestamp.add(_duration);
        _updatedAt = block.timestamp;
    }
}
