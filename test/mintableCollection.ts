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
  let theLandsOfRytell: any;

  const testDeployAmount = ethers.utils.parseEther("1000000000").toString();
  const usdcDeployAmount = ethers.utils.parseUnits("1000000000", 6).toString();

  this.beforeEach(async function () {
    // addresses
    [injectorAccount, ...landBuyers] = await ethers.getSigners();

    // deploy test tokens
    const WAVAX = await ethers.getContractFactory("WAVAX");
    testWavax = await WAVAX.deploy();
    await testWavax.deployed();
    const USDC = await ethers.getContractFactory("TestUsdc");
    testUsdc = await USDC.deploy(usdcDeployAmount, injectorAccount.address);
    await testUsdc.deployed();

    const RADI = await ethers.getContractFactory("TestRadi");
    testRadi = await RADI.deploy(testDeployAmount, injectorAccount.address);
    await testRadi.deployed();

    // Deploy factory
    const RytellFactory = await ethers.getContractFactory("RytellFactory");
    factory = await RytellFactory.deploy(injectorAccount.address);
    await factory.deployed();

    // Deploy router swap / inject-remove liquidity / comunicates with factory to create pair token
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
    const RytellPair = await ethers.getContractFactory("RytellPair");
    avaxUsdc = await RytellPair.attach(
      await factory.getPair(testWavax.address, testUsdc.address)
    );
    avaxRadi = await RytellPair.attach(
      await factory.getPair(testWavax.address, testRadi.address)
    );

    // initialize PriceCalculator
    const CalculatePrice = await ethers.getContractFactory("CalculatePrice");
    priceCalculator = await CalculatePrice.deploy(
      testWavax.address,
      testUsdc.address,
      testRadi.address,
      factory.address,
      BASE_USD_PRICE
    );
    await priceCalculator.deployed();
  });

  it("Should be initialized correctly", async function () {
    expect(await priceCalculator.avax()).to.equal(testWavax.address);
    expect(await priceCalculator.usdc()).to.equal(testUsdc.address);
    expect(await priceCalculator.radi()).to.equal(testRadi.address);
    expect(await priceCalculator.factory()).to.equal(factory.address);
    expect(await priceCalculator.baseUsdPrice()).to.equal(BASE_USD_PRICE);
  });

  it("Should calculate price accordingly", async function () {
    // approve router to spend radi
    await testRadi
      .connect(landBuyers[0])
      .approve(router.address, ethers.constants.MaxUint256);

    // land buyer buys radi for 5 avax
    await router
      .connect(landBuyers[0])
      .swapExactAVAXForTokens(
        "1",
        [testWavax.address, testRadi.address],
        landBuyers[0].address,
        new Date().getTime() + 1000 * 60 * 60 * 60,
        {
          value: ethers.utils.parseEther("5"),
        }
      );

    // inject more or less enough to buy a land
    await router
      .connect(landBuyers[0])
      .addLiquidityAVAX(
        testRadi.address,
        ethers.utils.parseEther("10220").toString(),
        "1",
        "1",
        landBuyers[0].address,
        new Date().getTime() + 1000 * 60 * 60 * 60,
        {
          value: ethers.utils.parseEther("2.09"),
        }
      );

    const buyerLpBalance = await avaxRadi.balanceOf(landBuyers[0].address);
    expect(buyerLpBalance).to.equal("128316292842037500529");

    const prices = await priceCalculator.getPrice();
    expect(prices[0].toString()).to.equal("2000000000000000000");
    expect(prices[1].toString()).to.equal("7538781219722625027437");
    expect(prices[2].toString()).to.equal("122790710853624402420");
  });

  it("Should let users mint lands with lp tokens at a fair price", async function () {
    const TheLandsOfRytell = await ethers.getContractFactory(
      "TheLandsOfRytell"
    );
    theLandsOfRytell = await TheLandsOfRytell.deploy(
      "ipfs://QmPT1Ah1ucxBSekD8MbQi9khunAe73mAusjede5xJkcApm/",
      landBuyers[1].address,
      priceCalculator.address,
      avaxRadi.address,
      "The lands of Rytell",
      "TLOR"
    );
    await theLandsOfRytell.deployed();
    await theLandsOfRytell.pause(false);

    // approve router to spend radi
    await testRadi
      .connect(landBuyers[0])
      .approve(router.address, ethers.constants.MaxUint256);

    // land buyer buys radi for 5 avax
    await router
      .connect(landBuyers[0])
      .swapExactAVAXForTokens(
        "1",
        [testWavax.address, testRadi.address],
        landBuyers[0].address,
        new Date().getTime() + 1000 * 60 * 60 * 60,
        {
          value: ethers.utils.parseEther("5"),
        }
      );

    // inject more or less enough to buy a land
    await router
      .connect(landBuyers[0])
      .addLiquidityAVAX(
        testRadi.address,
        ethers.utils.parseEther("10220").toString(),
        "1",
        "1",
        landBuyers[0].address,
        new Date().getTime() + 1000 * 60 * 60 * 60,
        {
          value: ethers.utils.parseEther("2.09"),
        }
      );

    await expect(
      theLandsOfRytell.connect(landBuyers[0]).mint(2)
    ).to.be.revertedWith("You don't have enough AVAX/RADI LP tokens.");

    // should revert if not allowed
    await expect(
      theLandsOfRytell.connect(landBuyers[0]).mint(1)
    ).to.be.revertedWith("ds-math-sub-underflow");

    // should not revert if allowed and enough
    await avaxRadi
      .connect(landBuyers[0])
      .approve(theLandsOfRytell.address, ethers.constants.MaxUint256);

    await expect(theLandsOfRytell.connect(landBuyers[0]).mint(1)).not.to.be
      .reverted;
    const prices = await priceCalculator.getPrice();

    // admin balance
    expect(
      (await avaxRadi.balanceOf(landBuyers[1].address)).toString()
    ).to.equal(prices[2].toString());

    console.log(
      await theLandsOfRytell.walletOfOwner(landBuyers[1].address),
      "previous giving"
    );

    await expect(theLandsOfRytell.give(1, landBuyers[1].address)).not.to.be
      .reverted;

    console.log(
      await theLandsOfRytell.walletOfOwner(landBuyers[1].address),
      "after giving"
    );

    // authorize with landbuyers 1
    // should not revert if allowed and enough
    await avaxRadi
      .connect(landBuyers[1])
      .approve(theLandsOfRytell.address, ethers.constants.MaxUint256);

    await expect(theLandsOfRytell.connect(landBuyers[1]).mint(1)).not.to.be
      .reverted;

    console.log(
      await theLandsOfRytell.walletOfOwner(landBuyers[1].address),
      "after buying"
    );
  });
});
