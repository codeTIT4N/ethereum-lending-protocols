//Fork mainnet before testing
const { time } = require("@openzeppelin/test-helpers")
const LendingSupply = artifacts.require("LendingSupply");
const IERC20 = artifacts.require("@openzeppelin/contracts/token/ERC20/IERC20.sol");

contract("LendingSupply", async (accounts) => {
    const USDT = "0xdAC17F958D2ee523a2206206994597C13D831ec7";
    const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F";
    const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48";
    const WHALE = "0xc564ee9f21ed8a2d8e7e76c085740d5e4c5fafbe";
    before(async () => {
        usdtContract = await IERC20.at(USDT);
        daiContract = await IERC20.at(DAI);
        usdcContract = await IERC20.at(USDC);
        instance = await LendingSupply.deployed();
        deployedAddress = await instance.address;
    })
    describe("----------------------------------- Compound Protocol --------------------------------------------", () => {
        it("should send USDT to the contract", async () => {
            let balbefore = await usdtContract.balanceOf(deployedAddress);
            console.log("Contract's USDT balance before transfer ==>", balbefore.toString());
            try {
                await usdtContract.transfer(deployedAddress, "10000000000", { from: WHALE });
            } catch (err) {
                console.log(err);
            }
            let balafter = await usdtContract.balanceOf(deployedAddress);
            console.log("Contract's USDT balance after transfer ==>", balafter.toString());
            assert.equal(balafter.toString(), "10000000000", "transfer failed!!!");
        })
        it("supply USDT to compound and get cUSDT in return", async () => {
            let balbefore = await instance.getCTokenBalance();
            console.log("Contract's cUSDT balance before supply ==>", balbefore.toString());
            try {
                await instance.supplyCompound({ from: accounts[0] })
            } catch (err) {
                console.log(err);
            }
            let balafter = await instance.getCTokenBalance();
            console.log("Contract's cUSDT balance after supply ==>", balafter.toString());
            let bal = await instance.balanceOfUnderlying.call();
            console.log("Contract's underlying balance==>", bal.toString());
            expect(balafter.toNumber()).to.be.greaterThan(balbefore.toNumber());
        })
        it("Compound: should accumulate interest after 100 blocks", async () => {
            let balbefore = await instance.balanceOfUnderlying.call();
            console.log("Contract's underlying balance before accumulating interest ==>", balbefore.toString());
            // accrue interest on supply
            const block = await web3.eth.getBlockNumber()
            try {
                await time.advanceBlockTo(block + 100)
            } catch (err) {
                console.log(err);
            }
            let balafter = await instance.balanceOfUnderlying.call();
            console.log("Contract's underlying balance after accumulating interest (after 100 blocks) ==>", balafter.toString());
            console.log("Total interest accumulated over 100 blocks==>", balafter - balbefore);
            expect(balafter.toNumber()).to.be.greaterThan(balbefore.toNumber());
        })
        it("should redeem cUSDT for underlying USDT", async () => {
            let balbefore = await instance.getCTokenBalance();
            console.log("Contract's cUSDT balance before redeeming ==>", balbefore.toString());
            let bal1 = await instance.balanceOfUnderlying.call();
            console.log("Contract's underlying balance before redeeming ==>", bal1.toString());
            try {
                await instance.redeemCompound({ from: accounts[0] });
            } catch (err) {
                console.log(err);
            }
            let balafter = await instance.getCTokenBalance();
            console.log("Contract's cUSDT balance after redeeming ==>", balafter.toString());
            let bal2 = await instance.balanceOfUnderlying.call();
            console.log("Contract's underlying balance after redeeming ==>", bal2.toString());
            assert.equal(balafter.toString(), "0", "Redeem failed!!!");
            assert.equal(bal2.toString(), "0", "Redeem failed!!!");
        })
    })
    describe("------------------------------------- Aave Protocol ---------------------------------------------", () => {
        it("should send DAI to the contract", async () => {
            let balbefore = await daiContract.balanceOf(deployedAddress);
            console.log("Contract's DAI balance before transfer ==>", balbefore.toString());
            try {
                await daiContract.transfer(deployedAddress, "10000000000000000000000", { from: WHALE });
            } catch (err) {
                console.log(err);
            }
            let balafter = await daiContract.balanceOf(deployedAddress);
            console.log("Contract's DAI balance after transfer ==>", balafter.toString());
            assert.equal(balafter.toString(), "10000000000000000000000", "transfer failed!!!");
        })
        it("supply DAI to Aave and get aDAI in return", async () => {
            let balbefore = await instance.getATokenBalance();
            console.log("Contract's aDAI balance before supply ==>", balbefore.toString());
            try {
                await instance.supplyAave({ from: accounts[0] })
            } catch (err) {
                console.log(err);
            }
            let balafter = await instance.getATokenBalance();
            console.log("Contract's aDAI balance after supply ==>", balafter.toString());
            expect(balafter / "1000000000000000000").to.be.greaterThan(balbefore / "1000000000000000000");
        })
        it("Aave: should accumulate interest after 100 blocks", async () => {
            let balbefore = await instance.getATokenBalance();
            console.log("Contract's aDAI balance before accumulating interest ==>", balbefore.toString());
            // accrue interest on supply
            const block = await web3.eth.getBlockNumber()
            try {
                await time.advanceBlockTo(block + 100)
            } catch (err) {
                console.log(err);
            }
            let balafter = await instance.getATokenBalance();
            console.log("Contract's aDAI balance after accumulating interest (after 100 blocks) ==>", balafter.toString());
            expect(balafter / "1000000000000000000").to.be.greaterThan(balbefore / "1000000000000000000");
        })
        it("should redeem aDAI for underlying DAI", async () => {
            let balbefore = await instance.getATokenBalance();
            console.log("Contract's aDAI balance before redeeming ==>", balbefore.toString());
            let bal1 = await daiContract.balanceOf(deployedAddress);
            console.log("Contract's DAI balance before redeeming: ", bal1.toString());
            try {
                await instance.redeemAave({ from: accounts[0] });
            } catch (err) {
                console.log(err);
            }
            let balafter = await instance.getATokenBalance();
            console.log("Contract's aDAI balance after redeeming ==>", balafter.toString());
            assert.equal(balafter.toString(), "0", "Redeem failed!!!");
            let bal2 = await daiContract.balanceOf(deployedAddress);
            console.log("Contract's DAI balance after redeeming: ", bal2.toString());
            assert.notEqual(bal2.toString(), "0", "Redeem failed!!!");
        })
    })
    describe("------------------------------------- Yearn Finance ---------------------------------------------", () => {
        it("should send USDC to the contract", async () => {
            let balbefore = await usdcContract.balanceOf(deployedAddress);
            console.log("Contract's USDC balance before transfer ==>", balbefore.toString());
            try {
                await usdcContract.transfer(deployedAddress, "10000000000", { from: WHALE });
            } catch (err) {
                console.log(err);
            }
            let balafter = await usdcContract.balanceOf(deployedAddress);
            console.log("Contract's USDC balance after transfer ==>", balafter.toString());
            assert.equal(balafter.toString(), "10000000000", "transfer failed!!!");
        })
        it("supply USDC to Yearn and get yUSDC in return", async () => {
            let balbefore = await instance.getYTokenBalance();
            console.log("Contract's yUSDC balance before supply ==>", balbefore.toString());
            try {
                await instance.supplyYearn({ from: accounts[0] })
            } catch (err) {
                console.log(err);
            }
            let balafter = await instance.getYTokenBalance();
            console.log("Contract's yUSDC balance after supply ==>", balafter.toString());
            expect(balafter.toNumber()).to.be.greaterThan(balbefore.toNumber());
        })
        it("should redeem yUSDC for underlying USDC", async () => {
            let balbefore = await instance.getYTokenBalance();
            console.log("Contract's yUSDC balance before redeeming ==>", balbefore.toString());
            let bal1 = await usdcContract.balanceOf(deployedAddress);
            console.log("Contract's USDC balance before redeeming: ", bal1.toString());
            try {
                await instance.redeemYearn({ from: accounts[0] });
            } catch (err) {
                console.log(err);
            }
            let balafter = await instance.getYTokenBalance();
            console.log("Contract's yUSDC balance after redeeming ==>", balafter.toString());
            assert.equal(balafter.toString(), "0", "Redeem failed!!!");
            let bal2 = await usdcContract.balanceOf(deployedAddress);
            console.log("Contract's USDC balance after redeeming: ", bal2.toString());
            assert.notEqual(bal2.toString(), "0", "Redeem failed!!!");
        })
    })
})