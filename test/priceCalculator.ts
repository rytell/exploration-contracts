import { expect } from "chai";
import { ethers } from "hardhat";

const BASE_USD_PRICE = 300;
const INITIAL_USDC_INJECTION_AMOUNT = "750000";

describe("CalculatePrice", function () {
  let priceCalculator: any;
  let injectorAccount: any;
  let landBuyers: any[];
  let testWavax: any;
  let testUsdc: any;
  let testRadi: any;
  let factory: any;
  let router: any;
  let avaxUsdc: any;
  let avaxRadi: any;
  const testDeployAmount = ethers.utils.parseEther("1000000000").toString();
  const usdcDeployAmount = ethers.utils.parseUnits("1000000000", 6).toString();
  this.beforeEach(async function () {
    // addresses
    [injectorAccount, ...landBuyers] = await ethers.getSigners();
    // deploy test tokens
    const WAVAX = await ethers.getContractFactory("WAVAX");
    testWavax = await WAVAX.deploy();
    const USDC = await ethers.getContractFactory("TestUsdc");
    testUsdc = await USDC.deploy(usdcDeployAmount, injectorAccount.address);
    const RADI = await ethers.getContractFactory("TestRadi");
    testRadi = await RADI.deploy(testDeployAmount, injectorAccount.address);

    // Deploy factory
    const RytellFactory = await ethers.getContractFactory("RytellFactory");
    factory = await RytellFactory.deploy(injectorAccount.address);
    await factory.deployed();

    // Deploy router
    const RytellRouter = await ethers.getContractFactory("RytellRouter");
    router = await RytellRouter.deploy(factory.address, testWavax.address);
    await router.deployed();

    // TODO approve router to take all injector account tokens
    await testWavax.approve(router.address, ethers.constants.MaxUint256);
    await testUsdc.approve(router.address, ethers.constants.MaxUint256);
    await testRadi.approve(router.address, ethers.constants.MaxUint256);

    // inject initial liquidity
    // inject initial liquidity in avax usdc pair to set price $10.000
    await router.addLiquidityAVAX(
      testUsdc.address,
      ethers.utils.parseUnits(INITIAL_USDC_INJECTION_AMOUNT, 6).toString(),
      "1",
      "1",
      injectorAccount.address,
      new Date().getTime() + 1000 * 60 * 60 * 60,
      {
        value: ethers.utils.parseEther("10000"),
      }
    );

    // inject initial liquidity in avax radi pair to set an arbitrary price
    await router.addLiquidityAVAX(
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

    // get pairs lp tokens addresses.
    avaxUsdc = await factory.allPairs("0");
    avaxRadi = await factory.allPairs("1");

    // initialize PriceCalculator
    const CalculatePrice = await ethers.getContractFactory("CalculatePrice");
    priceCalculator = await CalculatePrice.deploy(
      testWavax.address,
      testUsdc.address,
      testRadi.address,
      factory.address,
      BASE_USD_PRICE
    );
  });

  it("Should be initialized correctly", async function () {
    expect(await priceCalculator.avax()).to.equal(testWavax.address);
    expect(await priceCalculator.usdc()).to.equal(testUsdc.address);
    expect(await priceCalculator.radi()).to.equal(testRadi.address);
    expect(await priceCalculator.factory()).to.equal(factory.address);
    expect(await priceCalculator.baseUsdPrice()).to.equal(BASE_USD_PRICE);
  });

  it("Should calculate price accordingly", async function () {
    const prices = await priceCalculator.getPrice();
    expect(prices[0].toString()).to.equal("2000000000000000000");
    expect(prices[1].toString()).to.equal("7546320000000000000000");
  });
});
