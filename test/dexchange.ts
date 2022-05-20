import { expect } from "chai";
import { ethers } from "hardhat";
import { SignerWithAddress } from "@nomiclabs/hardhat-ethers/signers";
// import { balance } from "@openzeppelin/test-helpers";
import {
  Dexchange__factory,
  Dexchange,
  Dai,
  Bat,
  Zrx,
  Rep,
} from "../typechain";

const Side = {
  BUY: 0,
  SELL: 1,
};

describe("Dexchange", () => {
  let owner: SignerWithAddress;
  let trader1: SignerWithAddress;
  let trader2: SignerWithAddress;
  let dex: Dexchange;
  let dai: Dai;
  let bat: Bat;
  let zrx: Zrx;
  let rep: Rep;

  const [DAI, BAT, ZRX, REP] = ["DAI", "BAT", "ZRX", "REP"].map((s) =>
    ethers.utils.formatBytes32String(s)
  );

  beforeEach(async () => {
    [owner, trader1, trader2] = await ethers.getSigners();
    const DaiFactory = await ethers.getContractFactory("Dai");
    const BatFactory = await ethers.getContractFactory("Bat");
    const ZrxFactory = await ethers.getContractFactory("Zrx");
    const RepFactory = await ethers.getContractFactory("Rep");

    [dai, bat, zrx, rep] = await Promise.all([
      DaiFactory.deploy(10000000),
      BatFactory.deploy(10000000),
      ZrxFactory.deploy(10000000),
      RepFactory.deploy(10000000),
    ]);

    const DexFactory = (await ethers.getContractFactory(
      "Dexchange"
    )) as Dexchange__factory;

    dex = await DexFactory.deploy();

    await Promise.all([
      dex.connect(owner).addToken(DAI, dai.address),
      dex.connect(owner).addToken(BAT, bat.address),
      dex.connect(owner).addToken(ZRX, zrx.address),
      dex.connect(owner).addToken(REP, rep.address),
    ]);

    const amount = ethers.utils.parseEther("1000");

    // @ts-ignore
    const seedTokenBalance = async (token, trader) => {
      await token.faucet(trader.address, amount);
      await token.connect(trader).approve(dex.address, amount);
    };

    await Promise.all(
      [dai, bat, zrx, rep].map((token) => seedTokenBalance(token, trader1))
    );

    await Promise.all(
      [dai, bat, zrx, rep].map((token) => seedTokenBalance(token, trader2))
    );
  });

  it("should deposit token", async () => {
    const amount = ethers.utils.parseEther("100");
    await dex.connect(trader1).deposit(DAI, amount);

    const balance = await dex.balances(trader1.address, DAI);

    expect(balance.toString()).to.equal(amount.toString());
  });

  it("should not deposit token which are not approved", async () => {
    const amount = ethers.utils.parseEther("100");
    const NAT = ethers.utils.formatBytes32String("NAT");

    await expect(dex.connect(trader1).deposit(NAT, amount)).to.be.revertedWith(
      "this token does not exist"
    );
  });

  it("should withdraw tokens", async () => {
    const amount = ethers.utils.parseEther("100");
    await dex.connect(trader1).deposit(DAI, amount);
    await dex.connect(trader1).withdraw(DAI, amount);

    const balanceDex = await dex.balances(trader1.address, DAI);
    const balanceDai = await dai.balanceOf(trader1.address);

    expect(balanceDex).to.equal(0);
    expect(balanceDai).to.equal(ethers.utils.parseEther("1000"));
  });

  it("should not withdraw non existing tokens", async () => {
    const amount = ethers.utils.parseEther("100");
    const NAT = ethers.utils.formatBytes32String("NAT");

    await expect(dex.connect(trader1).withdraw(NAT, amount)).to.be.revertedWith(
      "this token does not exist"
    );
  });

  it("should not withdraw if balance is too low", async () => {
    const amount = ethers.utils.parseEther("2000");

    await expect(dex.connect(trader1).withdraw(DAI, amount)).to.be.revertedWith(
      "balance to low"
    );
  });

  it("should create limit order", async () => {
    const amount = ethers.utils.parseEther("100");
    await dex.connect(trader1).deposit(DAI, amount);

    const tradeAmount = ethers.utils.parseEther("10");
    const price1 = 10;
    const price2 = 11;
    const price3 = 9;

    await dex
      .connect(trader1)
      .createLimitOrder(REP, tradeAmount, price1, Side.BUY);

    let buyOrders = await dex.getOrders(REP, Side.BUY);
    let sellOrders = await dex.getOrders(REP, Side.SELL);

    expect(buyOrders.length).to.equal(1);
    expect(buyOrders[0].trader).to.equal(trader1.address);
    expect(buyOrders[0].ticker).to.equal(
      ethers.utils.formatBytes32String("REP")
    );
    expect(buyOrders[0].price).to.equal(10);
    expect(buyOrders[0].amount).to.equal(tradeAmount);
    expect(sellOrders.length).to.equal(0);

    await dex.connect(trader2).deposit(DAI, ethers.utils.parseEther("200"));

    await dex
      .connect(trader2)
      .createLimitOrder(REP, tradeAmount, price2, Side.BUY);

    buyOrders = await dex.getOrders(REP, Side.BUY);
    sellOrders = await dex.getOrders(REP, Side.SELL);

    expect(buyOrders.length).to.equal(2);
    expect(buyOrders[0].trader).to.equal(trader2.address);
    expect(buyOrders[1].trader).to.equal(trader1.address);
    expect(buyOrders[0].price).to.equal(11);

    expect(sellOrders.length).to.equal(0);

    await dex
      .connect(trader2)
      .createLimitOrder(REP, tradeAmount, price3, Side.BUY);

    buyOrders = await dex.getOrders(REP, Side.BUY);
    sellOrders = await dex.getOrders(REP, Side.SELL);

    expect(buyOrders.length).to.equal(3);
    expect(buyOrders[0].trader).to.equal(trader2.address);
    expect(buyOrders[1].trader).to.equal(trader1.address);
    expect(buyOrders[2].trader).to.equal(trader2.address);
    expect(buyOrders[2].price).to.equal(9);

    expect(sellOrders.length).to.equal(0);
  });

  it("should not createLimitOrder with non existing tokens", async () => {
    const amount = ethers.utils.parseEther("10");
    const NAT = ethers.utils.formatBytes32String("NAT");

    await expect(
      dex.connect(trader1).createLimitOrder(NAT, amount, 10, Side.BUY)
    ).to.be.revertedWith("this token does not exist");
  });

  it("should not createLimitOrder with DAI", async () => {
    const amount = ethers.utils.parseEther("10");

    await expect(
      dex.connect(trader1).createLimitOrder(DAI, amount, 10, Side.BUY)
    ).to.be.revertedWith("cannot trade DAI");
  });

  it("should not createLimitOrder if balance is too low", async () => {
    await dex.connect(trader1).deposit(REP, ethers.utils.parseEther("99"));

    await expect(
      dex
        .connect(trader1)
        .createLimitOrder(REP, ethers.utils.parseEther("100"), 10, Side.SELL)
    ).to.be.revertedWith("balance too low");
  });

  it("should not createLimitOrder if DAI balance is too low", async () => {
    await dex.connect(trader1).deposit(DAI, ethers.utils.parseEther("99"));

    await expect(
      dex
        .connect(trader1)
        .createLimitOrder(REP, ethers.utils.parseEther("10"), 10, Side.BUY)
    ).to.be.revertedWith("DAI balance too low");
  });

  it("should createMarketOrder and match against limit orders", async () => {
    await dex.connect(trader1).deposit(DAI, ethers.utils.parseEther("100"));
    await dex
      .connect(trader1)
      .createLimitOrder(REP, ethers.utils.parseEther("10"), 10, Side.BUY);

    await dex.connect(trader2).deposit(REP, ethers.utils.parseEther("100"));

    await dex
      .connect(trader2)
      .createMarketOrder(REP, ethers.utils.parseEther("5"), Side.SELL);

    const balances = await Promise.all([
      dex.balances(trader1.address, DAI),
      dex.balances(trader1.address, REP),
      dex.balances(trader2.address, DAI),
      dex.balances(trader2.address, REP),
    ]);

    const orders = await dex.getOrders(REP, Side.BUY);
    expect(orders[0].filled).to.equal(ethers.utils.parseEther("5"));
    expect(balances[0]).to.equal(ethers.utils.parseEther("50"));
    expect(balances[1]).to.equal(ethers.utils.parseEther("5"));
    expect(balances[2]).to.equal(ethers.utils.parseEther("50"));
    expect(balances[3]).to.equal(ethers.utils.parseEther("95"));
  });

  it("should not createMarketOrder with non existing tokens", async () => {
    const amount = ethers.utils.parseEther("10");
    const NAT = ethers.utils.formatBytes32String("NAT");

    await expect(
      dex.connect(trader1).createMarketOrder(NAT, amount, Side.BUY)
    ).to.be.revertedWith("this token does not exist");
  });

  it("should not createMarketOrder with DAI", async () => {
    const amount = ethers.utils.parseEther("10");

    await expect(
      dex.connect(trader1).createMarketOrder(DAI, amount, Side.BUY)
    ).to.be.revertedWith("cannot trade DAI");
  });

  it("should not createMarketOrder if balance is too low", async () => {
    await dex.connect(trader1).deposit(REP, ethers.utils.parseEther("99"));

    await expect(
      dex
        .connect(trader1)
        .createMarketOrder(REP, ethers.utils.parseEther("100"), Side.SELL)
    ).to.be.revertedWith("balance too low");
  });

  it("should not createMarketOrder if DAI balance is too low", async () => {
    await dex.connect(trader1).deposit(REP, ethers.utils.parseEther("100"));
    await dex
      .connect(trader1)
      .createLimitOrder(REP, ethers.utils.parseEther("100"), 10, Side.SELL);

    await expect(
      dex
        .connect(trader2)
        .createMarketOrder(REP, ethers.utils.parseEther("100"), Side.BUY)
    ).to.be.revertedWith("DAI balance too low");
  });
});
