// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

interface IAqiDatabase {
    function addAqiToDb(uint256 _aqi) external;
    function getAqiDbLength() external view returns (uint256);
}