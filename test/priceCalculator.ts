import { expect } from "chai";
import { ethers } from "hardhat";

describe("CalculatePrice", function () {
  // let calculatePrice: any;
  let injectorAccount: any;
  let landBuyers: any[];
  let testWavax: any;
  let testUsdc: any;
  let testRadi: any;
  let factory: any;
  // let router: any;
  const testDeployAmount = ethers.utils.parseEther("1000000000").toString();
  console.log("TEST DEPLOY AMOUNT: ", testDeployAmount);
  this.beforeEach(async function () {
    // addresses
    [injectorAccount, ...landBuyers] = await ethers.getSigners();
    // deploy test tokens
    const WAVAX = await ethers.getContractFactory("WAVAX");
    testWavax = await WAVAX.deploy();
    const USDC = await ethers.getContractFactory("TestUsdc");
    testUsdc = await USDC.deploy(testDeployAmount, injectorAccount.address);
    const RADI = await ethers.getContractFactory("TestRadi");
    testRadi = await RADI.deploy(testDeployAmount, injectorAccount.address);

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

    // TODO approve router to take all injector account tokens
    await testWavax.approve(rytellRouter.address, ethers.constants.MaxUint256);
    await testUsdc.approve(rytellRouter.address, ethers.constants.MaxUint256);
    await testRadi.approve(rytellRouter.address, ethers.constants.MaxUint256);

    // inject initial liquidity
    // inject initial liquidity in avax usdc pair to set price $10.000
    await rytellRouter.addLiquidityAVAX(
      testUsdc.address,
      ethers.utils.parseEther("750000").toString(),
      "1",
      "1",
      injectorAccount.address,
      new Date().getTime() + 1000 * 60 * 60 * 60,
      {
        value: ethers.utils.parseEther("10000"),
      }
    );

    // inject initial liquidity in avax radi pair to set an arbitrary price
    await rytellRouter.addLiquidityAVAX(
      testRadi.address,
      ethers.utils.parseEther("37731600").toString(),
      "1",
      "1",
      injectorAccount.address,
      new Date().getTime() + 1000 * 60 * 60 * 60,
      {
        value: ethers.utils.parseEther("10000"),
      }
    );
  });

  it("Should compile and execute injection of liquidity", async function () {
    console.log("", await factory.allPairs("0"));
    console.log("", await factory.allPairs("1"));
  });
});
