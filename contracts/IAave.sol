// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

interface IaToken {
    function balanceOf(address _user) external view returns (uint256);
}


interface IAaveLendingPool {
    function deposit(address _asset, uint256 _amount, address _onBehalfOff,uint16 _referralCode) external;
    function withdraw(address _asset, uint256 _amount, address _to) external;
    // function getReserveData(address asset) external view returns;
}