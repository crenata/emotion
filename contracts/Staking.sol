pragma solidity ^0.5.16;

import "./Context.sol";
import "./IERC20.sol";
import "./Ownable.sol";
import "./SafeMath.sol";

contract Staking is Context, Ownable {
    using SafeMath for uint256;

    IERC20 public stakingToken;
    IERC20 public rewardToken;

    address public ownerAddress;

    uint256 public duration;
    uint256 public finishedAt;
    uint256 public updatedAt;
    uint256 public rewardRate;
    uint256 public rewardPerTokenStored;
    uint256 public totalStaked;

    mapping(address => uint256) public userRewardPerTokenPaid;
    mapping(address => uint256) public rewards;
    mapping(address => uint256) public balanceOf;

    /**
     * @param _sender Sender's address.
     * @param _amount Amount of token.
     * @param _timestamp Block timestamp.
     */
    event Stake(address indexed _sender, uint256 _amount, uint256 _timestamp);

    /**
     * @param _sender Sender's address.
     * @param _amount Amount of token.
     * @param _timestamp Block timestamp.
     */
    event Withdraw(address indexed _sender, uint256 _amount, uint256 _timestamp);

    /**
     * @param _stakingToken Staking token contract address.
     * @param _rewardToken Reward token contract address.
     */
    constructor(address _stakingToken, address _rewardToken) public {
        ownerAddress = _msgSender();
        stakingToken = IERC20(_stakingToken);
        rewardToken = IERC20(_rewardToken);
    }

    /**
     * @param _account address.
     */
    modifier updateReward(address _account) {
        rewardPerTokenStored = rewardPerToken();
        updatedAt = lastTimeRewardApplicable();

        if (_account != address(0)) {
            rewards[_account] = earned();
            userRewardPerTokenPaid[_account] = rewardPerTokenStored;
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
     * @return uint256 Returns min value between finished at and block timestamp.
     */
    function lastTimeRewardApplicable() public view returns (uint256) {
        return _min(finishedAt, block.timestamp);
    }

    /**
     * @dev Amount of reward per token staked.
     * @return uint256 Returns calculated reward per token.
     */
    function rewardPerToken() public view returns (uint256) {
        if (totalStaked == 0) return rewardPerTokenStored;

        return rewardPerTokenStored + (
            rewardRate * (
                lastTimeRewardApplicable().sub(updatedAt)
            ) * 1e18
        ) / totalStaked;
    }

    /**
     * @param _amount Amount of token to be staked.
     */
    function stake(uint256 _amount) external updateReward(_msgSender()) {
        require(_amount > 0, "Amount is equal or less than zero.");
        require(stakingToken.transferFrom(_msgSender(), address(this), _amount), "Failed transfer token to staking contract.");
        balanceOf[_msgSender()] += _amount;
        totalStaked += _amount;
        emit Stake(_msgSender(), _amount, block.timestamp);
    }

    /**
     * @param _amount Amount of token to be withdrawal.
     */
    function withdraw(uint256 _amount) external updateReward(_msgSender()) {
        require(_amount > 0, "Amount is equal or less than zero.");
        require(_amount <= balanceOf[_msgSender()], "Amount is greater than available balance.");
        require(stakingToken.transfer(_msgSender(), _amount), "Failed transfer token to sender.");
        balanceOf[_msgSender()] -= _amount;
        totalStaked -= _amount;
        emit Withdraw(_msgSender(), _amount, block.timestamp);
    }

    /**
     * @dev Total token has been earned.
     * @return uint256 Returns sender total earned.
     */
    function earned() public view returns (uint256) {
        return (
            (
                balanceOf[_msgSender()] * (
                    rewardPerToken().sub(userRewardPerTokenPaid[_msgSender()])
                )
            ) / 1e18
        ) + rewards[_msgSender()];
    }

    /**
     * @dev Claim the token rewards.
     */
    function claim() external updateReward(_msgSender()) {
        uint256 reward = rewards[_msgSender()];
        if (reward > 0) {
            require(rewardToken.transfer(_msgSender(), reward));
            rewards[_msgSender()] = 0;
        }
    }

    /**
     * @param _duration Duration of rewards to be paid out in seconds.
     */
    function setRewardDuration(uint256 _duration) external onlyOwner {
        require(finishedAt < block.timestamp, "Reward duration is not finished.");
        duration = _duration;
    }

    /**
     * @param _amount Amount of token to be set as reward.
     */
    function notifyRewardAmount(uint256 _amount) external onlyOwner updateReward(address(0)) {
        if (block.timestamp > finishedAt) {
            rewardRate = _amount.div(duration);
        } else {
            uint256 remainingRewards = (finishedAt.sub(block.timestamp)).mul(rewardRate);
            rewardRate = (_amount.add(remainingRewards)).div(duration);
        }

        require(rewardRate > 0, "Reward rate is equal or less than zero.");
        require(rewardRate.mul(duration) <= rewardToken.balanceOf(address(this)), "Reward amount is greater than available staking contract balance.");

        finishedAt = block.timestamp.add(duration);
        updatedAt = block.timestamp;
    }
}
