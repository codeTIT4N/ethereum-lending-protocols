# Supply and redeem on various ethereum lending protocols

Supply and redeeming on Yearn, Compound and Aave

### To run this project

Step 1: Clone the repo and initialize the project

```shell
git clone https://github.com/codeTIT4N/ethereum-lending-protocols.git
yarn
```

Step 2: Fork mainnet using ganache-cli and unlock the whales

```shell
ganache-cli --fork https://mainnet.infura.io/v3/<INFURA_PROJECT_ID> --networkId 999 --unlock 0xc564ee9f21ed8a2d8e7e76c085740d5e4c5fafbe --unlock 0xf977814e90da44bfa03b6295a0616a897441acec
```
> Don't forget to put in the INFURA_PROJECT_ID in the command above

Step 3: In a different terminal run the testcases

```shell
npx truffle test
```
