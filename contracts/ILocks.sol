pragma solidity ^0.5.16;

import "./IERC20.sol";

interface ILocks {
    /**
     * @dev Returns the token being held.
     */
    function token() external view returns(IERC20);

    /**
     * @dev Transfers tokens to be held in period of time.
     *
     * @param beneficiary Beneficiary's address.
     * @param amount Amount of token to be staked.
     * @param releaseTime Release timestamp.
     */
    function lock(address beneficiary, uint256 amount, uint256 releaseTime) external returns(bool);

    /**
     * @dev Transfers tokens held by the time lock to the beneficiary. Will only succeed if invoked after the release time.
     *
     * @param beneficiary Beneficiary's address.
     */
    function release(address beneficiary) external returns(bool);

    /**
     * @dev Emitted when tokens are locked.
     *
     * @param beneficiary Beneficiary's address.
     * @param amount Amount of token.
     * @param releaseTime Release timestamp.
     * @param timestamp Block timestamp.
     */
    event Lock(address indexed beneficiary, uint256 amount, uint256 releaseTime, uint256 timestamp);

    /**
     * @dev Emitted when tokens are released.
     *
     * @param beneficiary Beneficiary's address.
     * @param amount Amount of token.
     * @param releaseTime Release timestamp.
     * @param timestamp Block timestamp.
     */
    event Release(address indexed beneficiary, uint256 amount, uint256 releaseTime, uint256 timestamp);
}