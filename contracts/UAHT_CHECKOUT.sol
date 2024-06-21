// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "./UAHT_DAO.sol";

contract UAHT_CHECKOUT {
    address public uaht_dao = 0x08B491bC7848C6AF42c3882794A93d70c04e5816;

    event Order(address to, string offer, uint256 uah, address from); // оферта по id | jwt | msg | md

    function order(address to, string calldata offer, uint256 uah) public { 
        UAHT_DAO(uaht_dao).transfer(msg.sender, to, uah, 0);
        emit Order(to, offer, uah, msg.sender);
    }
}
