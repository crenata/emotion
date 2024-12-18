// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./Context.sol";
import "./IERC20.sol";
import "./IERC20Lock.sol";
import "./Ownable.sol";
import "./SafeMath.sol";

contract ERC20Lock is Context, IERC20Lock, Ownable {
    using SafeMath for uint256;

    IERC20 private _token;
    Lock[] private _lockedTokens;

    /**
     * @param token_ Token contract address.
     */
    constructor(address token_) {
        _token = IERC20(token_);
    }

    /**
     * @dev Returns the token being held.
     */
    function token() external view returns(IERC20) {
        return _token;
    }

    /**
     * @dev Returns list of tokens locked.
     */
    function lockedTokens() external view returns(Lock[] memory) {
        Lock[] memory results = new Lock[](_lockedTokens.length);
        for (uint256 i; i < _lockedTokens.length; i++) {
            results[i] = _lockedTokens[i];
        }
        return results;
    }

    /**
     * @dev Transfers tokens to be held in period of time.
     *
     * @param beneficiary Beneficiary's address.
     * @param name Name of locked tokens.
     * @param description Description of locked tokens.
     * @param amount Amount of token to be staked.
     * @param releaseTime Release timestamp.
     */
    function lock(
        address beneficiary,
        string calldata name,
        string calldata description,
        uint256 amount,
        uint256 releaseTime
    ) external onlyOwner returns(bool) {
        _lock(beneficiary, name, description, amount, releaseTime);
        return true;
    }

    /**
     * @dev Transfers tokens held by the time lock to the beneficiary. Will only succeed if invoked after the release time.
     *
     * @param id Index of locked tokens.
     */
    function release(uint256 id) external onlyOwner returns(bool) {
        _release(id);
        return true;
    }

    /**
     * @dev Transfers tokens to be held in period of time.
     *
     * @param beneficiary Beneficiary's address.
     * @param name Name of locked tokens.
     * @param description Description of locked tokens.
     * @param amount Amount of token to be staked.
     * @param releaseTime Release timestamp.
     */
    function _lock(
        address beneficiary,
        string memory name,
        string memory description,
        uint256 amount,
        uint256 releaseTime
    ) internal onlyOwner {
        require(beneficiary != address(0), "ERC20Lock: Beneficiary is the zero address");
        require(amount > 0, "ERC20Lock: Amount is equal or less than zero.");
        require(releaseTime >= block.timestamp, "ERC20Lock: Release time is before current time");
        require(_token.transferFrom(_msgSender(), address(this), amount), "ERC20Lock: Failed transfer token to ERC20Lock contract.");
        _lockedTokens.push(
            Lock({
                owner: _msgSender(),
                beneficiary: beneficiary,
                name: name,
                description: description,
                amount: amount,
                releaseTime: releaseTime
            })
        );
        emit LockAdded(
            _msgSender(),
            beneficiary,
            name,
            description,
            amount,
            releaseTime,
            block.timestamp
        );
    }

    /**
     * @dev Transfers tokens held by the time lock to the beneficiary. Will only succeed if invoked after the release time.
     *
     * @param id Index of locked tokens.
     */
    function _release(uint256 id) internal onlyOwner {
        Lock storage locked = _lockedTokens[id];
        require(locked.owner == _msgSender(), "ERC20Lock: Caller is not the owner");
        require(block.timestamp >= locked.releaseTime, "ERC20Lock: Current time is before release time");
        require(_token.balanceOf(address(this)) > 0, "ERC20Lock: No tokens to release");
        require(_token.transfer(locked.beneficiary, locked.amount), "ERC20Lock: Failed transfer token to beneficiary.");
        emit LockRemoved(
            locked.owner,
            locked.beneficiary,
            locked.name,
            locked.description,
            locked.amount,
            locked.releaseTime,
            block.timestamp
        );
        delete _lockedTokens[id];
    }
}
