// SPDX-License-Identifier: GPL-3.0
pragma solidity ^0.8.0;

contract TestContract {
    event TestEvent(uint256 amount, string name, address account);
    
    function TestFunction (uint256 amount, string calldata name) public {
        emit TestEvent(amount, name, msg.sender);
    }
}