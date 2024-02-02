// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

contract UAHT_ORACLE { // permissionless
    function data(address asset, address feed) public view returns(uint256) { // ASSET/UAHT
        return ERC20(asset).allowance(feed, asset);
    }
}
