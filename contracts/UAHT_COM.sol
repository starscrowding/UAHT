// SPDX-License-Identifier: MIT
pragma solidity ^0.8.13;

import "@openzeppelin/contracts/utils/Multicall.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "./UAHT_DAO.sol";

contract UAHT_COM is Multicall {
    address public uaht;
    address public uaht_dao;
    uint256 public balance;
    uint256 public fee_id = 0;
    uint256 public slots_id = 1;
    uint256 public duration_id = 2;

    mapping(uint256 => uint256) public vars;
    mapping(address => mapping(uint256 => uint256)) public offers;
    mapping(address => mapping(address => uint256)) public deals;
    mapping(address => mapping(address => uint256)) public clock;
    mapping(address => mapping(uint256 => uint256)) public vouchers;

    modifier operable {
        require(UAHT_DAO(uaht_dao).trust(msg.sender));
        _;
    }

    event Offer(address from, uint256 slot);
    event CloseOffer(address from, uint256 slot);
    event Refund(address from, address to);
    event Deal(address from, address to, uint256 slot);
    event CancelDeal(address from, address to);
    event CloseDeal(address from, address to);
    event Voucher(address from, uint256 id);
    event UseVoucher(address to, uint256 id); 

    constructor() {
        uaht = 0x0D9447E16072b636b4a1E8f2b8C644e58F3eaA6A;
        vars[slots_id] = 12;
        vars[duration_id] = 7 * 24 * 60 * 60;
    }

    function hash(uint256 nonce) public view returns (bytes32) {
        return keccak256(abi.encodePacked(address(this), nonce));
    }

    function signedHash(uint256 nonce) public view returns (bytes32) {
        return ECDSA.toEthSignedMessageHash(hash(nonce));
    }

    function verifyHash(uint256 nonce, bytes memory sig, address from) public view returns (bool) {
        return ECDSA.recover(signedHash(nonce), sig) == from;
    }

    function fee(uint256 uah) public view returns (uint256) {
        return vars[fee_id] > 0 ? uah - uah / vars[fee_id] : uah;
    }

    function offer(uint256 slot, uint256 uah) public {
        require(slot < vars[slots_id]);
        UAHT_DAO(uaht_dao).transfer(msg.sender, address(this), uah, 0);
        balance += uah;
        offers[msg.sender][slot] += uah;
        clock[msg.sender][msg.sender] = block.timestamp;
        emit Offer(msg.sender, slot);
    }

    function closeOffer(uint256 slot) public {
        require(offers[msg.sender][slot] > 0);
        require(block.timestamp > clock[msg.sender][msg.sender] + vars[duration_id]);
        ERC20(uaht).transfer(msg.sender, offers[msg.sender][slot]);
        balance -= offers[msg.sender][slot];
        offers[msg.sender][slot] = 0;
        emit CloseOffer(msg.sender, slot);
    }

    function refund(address to, uint256 slot, uint256 uah) public {
        require(offers[msg.sender][slot] >= uah);
        require(clock[to][msg.sender] > 0);
        ERC20(uaht).transfer(to, uah);
        balance -= uah;
        offers[msg.sender][slot] -= uah;
        emit Refund(msg.sender, to);
    }

    function deal(address to, uint256 slot, uint256 uah) public {
        require(to != msg.sender);
        require(offers[to][slot] > 0);
        require(deals[msg.sender][to] == 0);
        UAHT_DAO(uaht_dao).transfer(msg.sender, address(this), uah, 0);
        balance += uah;
        deals[msg.sender][to] = uah;
        clock[msg.sender][to] = block.timestamp;
        emit Deal(msg.sender, to, slot);
    }

    function hashDeal(address from, address to) public view returns (bytes32) {
        require(deals[from][to] > 0);
        return hash(clock[from][to]);
    }

    function cancelDeal(address to) public {
        require(deals[msg.sender][to] > 0);
        require(clock[msg.sender][to] > 0);
        require(block.timestamp > clock[msg.sender][to] + vars[duration_id]);
        ERC20(uaht).transfer(msg.sender, deals[msg.sender][to]);
        balance -= deals[msg.sender][to];
        deals[msg.sender][to] = 0;
        clock[msg.sender][to] = 0;
        emit CancelDeal(msg.sender, to);
    }

    function closeDeal(address from, bytes memory sig) public {
        require(deals[from][msg.sender] > 0);
        require(verifyHash(clock[from][msg.sender], sig, from));
        ERC20(uaht).transfer(msg.sender, fee(deals[from][msg.sender]));
        balance -= deals[from][msg.sender];
        deals[from][msg.sender] = 0;
        emit CloseDeal(from, msg.sender);
    }

    function voucher(uint256 id, uint256 uah) public {
        require(vouchers[msg.sender][id] == 0);
        UAHT_DAO(uaht_dao).transfer(msg.sender, address(this), uah, 0);
        balance += uah;
        vouchers[msg.sender][id] = uah;
        emit Voucher(msg.sender, id);
    }

    function hashVoucher(address from, uint256 id) public view returns (bytes32) {
        require(vouchers[from][id] > 0);
        return hash(id);
    }

    function verifyVoucher(address from, uint256 id, bytes memory sig) public view returns (bool) {
        require(vouchers[from][id] > 0);
        return verifyHash(id, sig, from);
    }

    function useVoucher(address from, uint256 id, bytes memory sig) public {
        require(verifyVoucher(from, id, sig));
        ERC20(uaht).transfer(msg.sender, fee(vouchers[from][id]));
        balance -= vouchers[from][id];
        vouchers[from][id] = 0;
        emit UseVoucher(msg.sender, id);
    }

    function config(uint256 id, uint256 value) public operable {
        vars[id] = value;
    }

    function timer(address from, address to, uint256 timestamp) public operable {
        clock[from][to] = timestamp;
    }

    function delegate(address to, bool confirm) public operable {
        require(confirm);
        uaht_dao = to;
    } 

    function migrate(bool confirm) public operable {
        require(confirm);
        require(ERC20(uaht).balanceOf(address(this)) == 0);
        selfdestruct(payable(msg.sender));
    }
}
