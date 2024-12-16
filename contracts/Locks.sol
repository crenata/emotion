pragma solidity ^0.5.16;

import "./Context.sol";
import "./IERC20.sol";
import "./ILocks.sol";
import "./Ownable.sol";
import "./SafeMath.sol";

contract Locks is Context, ILocks, Ownable {
    using SafeMath for uint256;

    struct Locked {
        address beneficiary;
        uint256 amount;
        uint256 releaseTime;
    }

    IERC20 private _token;
    mapping(address => Locked) public locked;

    /**
     * @param token_ Token contract address.
     */
    constructor(address token_) public {
        _token = IERC20(token_);
    }

    /**
     * @dev Returns the token being held.
     */
    function token() external view returns(IERC20) {
        return _token;
    }

    /**
     * @dev Transfers tokens to be held in period of time.
     *
     * @param beneficiary Beneficiary's address.
     * @param amount Amount of token to be staked.
     * @param releaseTime Release timestamp.
     */
    function lock(address beneficiary, uint256 amount, uint256 releaseTime) external onlyOwner returns(bool) {
        _lock(beneficiary, amount, releaseTime);
        return true;
    }

    /**
     * @dev Transfers tokens held by the time lock to the beneficiary. Will only succeed if invoked after the release time.
     *
     * @param beneficiary Beneficiary's address.
     */
    function release(address beneficiary) external onlyOwner returns(bool) {
        _release(beneficiary);
        return true;
    }

    /**
     * @dev Transfers tokens to be held in period of time.
     *
     * @param beneficiary Beneficiary's address.
     * @param amount Amount of token to be staked.
     * @param releaseTime Release timestamp.
     */
    function _lock(address beneficiary, uint256 amount, uint256 releaseTime) internal onlyOwner {
        require(beneficiary != address(0), "Locks: Beneficiary is the zero address");
        require(amount > 0, "Locks: Amount is equal or less than zero.");
        require(releaseTime >= block.timestamp, "Locks: Release time is before current time");
        require(locked[beneficiary].amount == 0, "Locks: Beneficiary is already exists.");
        require(_token.transferFrom(_msgSender(), address(this), amount), "Locks: Failed transfer token to locks contract.");
        locked[beneficiary] = Locked(beneficiary, amount, releaseTime);
        emit Lock(beneficiary, amount, releaseTime, block.timestamp);
    }

    /**
     * @dev Transfers tokens held by the time lock to the beneficiary. Will only succeed if invoked after the release time.
     *
     * @param beneficiary Beneficiary's address.
     */
    function _release(address beneficiary) internal onlyOwner {
        require(beneficiary != address(0), "Locks: Beneficiary is the zero address");
        Locked storage _locked = locked[beneficiary];
        require(block.timestamp >= _locked.releaseTime, "Locks: Current time is before release time");
        require(_token.balanceOf(address(this)) > 0, "Locks: No tokens to release");
        require(_token.transfer(beneficiary, _locked.amount), "Locks: Failed transfer token to beneficiary.");
        emit Release(beneficiary, _locked.amount, _locked.releaseTime, block.timestamp);
        delete locked[beneficiary];
    }
}
