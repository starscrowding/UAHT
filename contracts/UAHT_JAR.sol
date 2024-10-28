// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

interface IUAHT_JAR { // відкриті позики

    function free_uaht() external returns(uint256);

    function total_asset(address asset) external returns(uint256);

    function put(address asset, uint256 amount, address to) external returns(uint256); // застава

    function pop(address asset, uint256 uaht, address to) external returns(uint256); // ліквідація
}