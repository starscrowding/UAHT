// SPDX-License-Identifier: MIT
pragma solidity ^0.8.28;

contract UAHT_ORACLE { // permissionless
    struct Data {
      uint256 value;
      uint256 timestamp;
   }

    mapping (address => mapping(address => Data)) public feeds; 

    function data(address asset, address feed) public view returns(uint256) { // ASSET/UAHT
        require(feeds[feed][asset].value > 0, "!data");
        return feeds[feed][asset].value;
    }

    function set(address asset, uint256 value) public {
        feeds[msg.sender][asset] = Data(value, block.timestamp);
    }
}
