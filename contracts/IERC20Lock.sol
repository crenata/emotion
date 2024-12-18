// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./IERC20.sol";

interface IERC20Lock {
    struct Lock {
        address owner;
        address beneficiary;
        string name;
        string description;
        uint256 amount;
        uint256 releaseTime;
    }

    /**
     * @dev Returns the token being held.
     */
    function token() external view returns(IERC20);

    /**
     * @dev Returns list of tokens locked.
     */
    function lockedTokens() external view returns(Lock[] memory);

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
    ) external returns(bool);

    /**
     * @dev Transfers tokens held by the time lock to the beneficiary. Will only succeed if invoked after the release time.
     *
     * @param id Index of locked tokens.
     */
    function release(uint256 id) external returns(bool);

    /**
     * @dev Emitted when tokens are locked.
     *
     * @param owner Owner's address.
     * @param beneficiary Beneficiary's address.
     * @param name Name of locked tokens.
     * @param description Description of locked tokens.
     * @param amount Amount of token.
     * @param releaseTime Release timestamp.
     * @param timestamp Block timestamp.
     */
    event LockAdded(
        address indexed owner,
        address indexed beneficiary,
        string name,
        string description,
        uint256 amount,
        uint256 releaseTime,
        uint256 timestamp
    );

    /**
     * @dev Emitted when tokens are released.
     *
     * @param owner Owner's address.
     * @param beneficiary Beneficiary's address.
     * @param name Name of locked tokens.
     * @param description Description of locked tokens.
     * @param amount Amount of token.
     * @param releaseTime Release timestamp.
     * @param timestamp Block timestamp.
     */
    event LockRemoved(
        address indexed owner,
        address indexed beneficiary,
        string name,
        string description,
        uint256 amount,
        uint256 releaseTime,
        uint256 timestamp
    );
}