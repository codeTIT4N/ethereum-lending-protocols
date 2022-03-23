// SPDX-License-Identifier: MIT
pragma solidity ^0.8;

interface IyToken {
    function balanceOf(address _user) external view returns (uint256);

    function approve(address spender, uint256 amount) external returns (bool);

    function deposit(uint256 amount) external returns (uint256);

    function withdraw(uint256 amount) external returns (uint256);
}
