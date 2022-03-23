// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/utils/SafeERC20.sol";
import "./ICompound.sol";
import "./IAave.sol";
import "./IYearn.sol";

contract LendingSupply {
    IERC20 public immutable USDT;
    CErc20 public immutable cUSDT;
    IERC20 public immutable DAI;
    IaToken public immutable aDAI;
    IERC20 public immutable USDC;
    IyToken public immutable yUSDC;
    IAaveLendingPool public immutable AaveLendingPool;

    constructor() {
        USDT = IERC20(0xdAC17F958D2ee523a2206206994597C13D831ec7);
        cUSDT = CErc20(0xf650C3d88D12dB855b8bf7D11Be6C55A4e07dCC9);
        DAI = IERC20(0x6B175474E89094C44Da98b954EedeAC495271d0F);
        aDAI = IaToken(0x028171bCA77440897B824Ca71D1c56caC55b68A3);
        USDC = IERC20(0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48);
        yUSDC = IyToken(0xa354F35829Ae975e850e23e9615b11Da1B3dC4DE);
        AaveLendingPool = IAaveLendingPool(
            0x7d2768dE32b0b80b7a3454c06BdAc94A69DDc7A9
        );
    }

    function supplyCompound() external {
        //assuming the contract already holds tokens
        SafeERC20.safeApprove(
            USDT,
            address(cUSDT),
            USDT.balanceOf(address(this))
        );
        require(
            cUSDT.mint(USDT.balanceOf(address(this))) == 0,
            "Compound: Mint failed!!!"
        );
    }

    function getCTokenBalance() external view returns (uint256) {
        return cUSDT.balanceOf(address(this));
    }

    function balanceOfUnderlying() external returns (uint256) {
        return cUSDT.balanceOfUnderlying(address(this));
    }

    function redeemCompound() external {
        require(
            cUSDT.redeem(cUSDT.balanceOf(address(this))) == 0,
            "Compound: Redeem failed!!!"
        );
    }

    function supplyAave() external {
        //assuming the contract already holds tokens
        DAI.approve(address(AaveLendingPool), type(uint256).max);
        AaveLendingPool.deposit(
            address(DAI),
            DAI.balanceOf(address(this)),
            address(this),
            0
        );
    }

    function getATokenBalance() external view returns (uint256) {
        return aDAI.balanceOf(address(this));
    }

    function redeemAave() external {
        AaveLendingPool.withdraw(
            address(DAI),
            type(uint256).max,
            address(this)
        );
    }

    function supplyYearn() external {
        //assuming the contract already holds tokens
        USDC.approve(address(yUSDC), type(uint256).max);
        yUSDC.deposit(USDC.balanceOf(address(this)));
    }

    function redeemYearn() external {
        yUSDC.withdraw(type(uint256).max);
    }

    function getYTokenBalance() external view returns (uint256) {
        return yUSDC.balanceOf(address(this));
    }
}
