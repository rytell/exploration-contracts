import { expect } from "chai";
import { ethers } from "hardhat";

describe("CalculatePrice", function () {
  // let calculatePrice: any;
  let injectorAccount: any;
  let testWavax: any;
  let testUsdc: any;
  let testRadi: any;
  let factory: any;
  // let router: any;
  const testDeployAmount = ethers.utils.parseEther("1000000000").toString();
  console.log("TEST DEPLOY AMOUNT: ", testDeployAmount);
  this.beforeEach(async function () {
    // addresses
    [injectorAccount] = await ethers.getSigners();
    // deploy test tokens
    const WAVAX = await ethers.getContractFactory("TestWavax");
    testWavax = await WAVAX.deploy(injectorAccount.address, testDeployAmount);
    const USDC = await ethers.getContractFactory("TestUsdc");
    testUsdc = await USDC.deploy(injectorAccount.address, testDeployAmount);
    const RADI = await ethers.getContractFactory("TestRadi");
    testRadi = await RADI.deploy(injectorAccount.address, testDeployAmount);

    // Deploy factory
    const RytellFactory = await ethers.getContractFactory("RytellFactory");
    factory = await RytellFactory.deploy(injectorAccount.address);
    await factory.deployed();

    // Deploy router
    const RytellRouter = await ethers.getContractFactory("RytellRouter");
    const rytellRouter = await RytellRouter.deploy(
      factory.address,
      testWavax.address
    );
    await rytellRouter.deployed();
  });
});
