// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

import "./IERC20.sol";

interface IPresale {
    /**
     * @dev Returns the erc token address.
     */
    function token() external view returns(IERC20);

    /**
     * @dev Returns the token price.
     */
    function tokenPrice() external view returns(uint256);

    /**
     * @dev Returns the tokens sold.
     */
    function tokensSold() external view returns(uint256);

    /**
     * @dev Transfers tokens bought by buyer.
     *
     * @param amount Amount of token to buy.
     */
    function buyTokens(uint256 amount) external payable returns(bool);

    /**
     * @dev End the presale.
     */
    function endSale() external returns(bool);

    /**
     * @dev Emitted when tokens bought.
     *
     * @param buyer Buyer's address.
     * @param amountPrimary Amount of primary.
     * @param amountToken Amount of token.
     * @param timestamp Block timestamp.
     */
    event Buy(address indexed buyer, uint256 amountPrimary, uint256 amountToken, uint256 timestamp);

    /**
     * @dev Emitted when presale end triggered.
     *
     * @param owner Owner's address.
     * @param balance Contract's balance.
     * @param amount Amount of token.
     * @param timestamp Block timestamp.
     */
    event End(address indexed owner, uint256 balance, uint256 amount, uint256 timestamp);
}