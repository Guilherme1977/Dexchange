import { ethers, artifacts, network } from "hardhat";
import fs from "fs";
import { Dai, Bat, Zrx, Rep } from "../typechain";
import contractAddress from "../config.json";

type Contract = Dai | Bat | Zrx | Rep;

const [DAI, BAT, ZRX, REP] = ["DAI", "BAT", "ZRX", "REP"].map((s) =>
  ethers.utils.formatBytes32String(s)
);
const contractName = "Dexchange";
const Side = {
  BUY: 0,
  SELL: 1,
};
async function main() {
  const [owner, trader1, trader2, trader3, trader4] = await ethers.getSigners();
  const factories = await Promise.all([
    ethers.getContractFactory("Dai"),
    ethers.getContractFactory("Bat"),
    ethers.getContractFactory("Zrx"),
    ethers.getContractFactory("Rep"),
  ]);

  const initialSupply = "10000000000000000000";
  const [dai, bat, zrx, rep] = await Promise.all(
    factories.map((f) => f.deploy(initialSupply))
  );

  saveFrontendFiles([dai, bat, zrx, rep], ["Dai", "Bat", "Zrx", "Rep"]);

  const dex = await ethers.getContractAt(
    contractName,
    contractAddress[contractName]
  );

  await Promise.all([
    dex.connect(owner).addToken(DAI, dai.address),
    dex.connect(owner).addToken(BAT, bat.address),
    dex.connect(owner).addToken(ZRX, zrx.address),
    dex.connect(owner).addToken(REP, rep.address),
  ]);

  // @ts-ignore
  const seedTokenBalance = async (token, trader) => {
    const amount = ethers.utils.parseEther("1000");
    await token.faucet(trader.address, amount);
    await token.connect(trader).approve(dex.address, amount);

    const ticker = await token.symbol();

    await dex
      .connect(trader)
      .deposit(ethers.utils.formatBytes32String(ticker), amount);
  };

  await Promise.all(
    [dai, bat, zrx, rep].map((token) => seedTokenBalance(token, trader1))
  );

  await Promise.all(
    [dai, bat, zrx, rep].map((token) => seedTokenBalance(token, trader2))
  );

  await Promise.all(
    [dai, bat, zrx, rep].map((token) => seedTokenBalance(token, trader3))
  );

  await Promise.all(
    [dai, bat, zrx, rep].map((token) => seedTokenBalance(token, trader4))
  );

  const increaseTime = async (seconds: number) => {
    await network.provider.send("evm_increaseTime", [seconds]);
    await network.provider.send("evm_mine");
  };

  //create trades
  await dex.connect(trader1).createLimitOrder(BAT, 1000, 10, Side.BUY);
  await dex.connect(trader2).createMarketOrder(BAT, 1000, Side.SELL);
  await increaseTime(1);
  await dex.connect(trader1).createLimitOrder(BAT, 1200, 11, Side.BUY);
  await dex.connect(trader2).createMarketOrder(BAT, 1200, Side.SELL);
  await increaseTime(1);
  await dex.connect(trader1).createLimitOrder(BAT, 1200, 15, Side.BUY);
  await dex.connect(trader2).createMarketOrder(BAT, 1200, Side.SELL);
  await increaseTime(1);
  await dex.connect(trader1).createLimitOrder(BAT, 1500, 14, Side.BUY);
  await dex.connect(trader2).createMarketOrder(BAT, 1500, Side.SELL);
  await increaseTime(1);
  await dex.connect(trader1).createLimitOrder(BAT, 2000, 12, Side.BUY);
  await dex.connect(trader2).createMarketOrder(BAT, 2000, Side.SELL);

  await dex.connect(trader1).createLimitOrder(REP, 1000, 2, Side.BUY);
  await dex.connect(trader2).createMarketOrder(REP, 1000, Side.SELL);
  await increaseTime(1);
  await dex.connect(trader1).createLimitOrder(REP, 500, 4, Side.BUY);
  await dex.connect(trader2).createMarketOrder(REP, 500, Side.SELL);
  await increaseTime(1);
  await dex.connect(trader1).createLimitOrder(REP, 800, 2, Side.BUY);
  await dex.connect(trader2).createMarketOrder(REP, 800, Side.SELL);
  await increaseTime(1);
  await dex.connect(trader1).createLimitOrder(REP, 1200, 6, Side.BUY);
  await dex.connect(trader2).createMarketOrder(REP, 1200, Side.SELL);

  //create orders
  await dex.connect(trader1).createLimitOrder(BAT, 1400, 10, Side.BUY);
  await dex.connect(trader2).createLimitOrder(BAT, 1200, 11, Side.BUY);
  await dex.connect(trader2).createLimitOrder(BAT, 1000, 12, Side.BUY);

  await dex.connect(trader1).createLimitOrder(REP, 3000, 4, Side.BUY);
  await dex.connect(trader1).createLimitOrder(REP, 2000, 5, Side.BUY);
  await dex.connect(trader2).createLimitOrder(REP, 500, 6, Side.BUY);

  await dex.connect(trader1).createLimitOrder(ZRX, 4000, 12, Side.BUY);
  await dex.connect(trader1).createLimitOrder(ZRX, 3000, 13, Side.BUY);
  await dex.connect(trader2).createLimitOrder(ZRX, 500, 14, Side.BUY);

  await dex.connect(trader3).createLimitOrder(BAT, 2000, 16, Side.SELL);
  await dex.connect(trader4).createLimitOrder(BAT, 3000, 15, Side.SELL);
  await dex.connect(trader4).createLimitOrder(BAT, 500, 14, Side.SELL);

  await dex.connect(trader3).createLimitOrder(REP, 4000, 10, Side.SELL);
  await dex.connect(trader3).createLimitOrder(REP, 2000, 9, Side.SELL);
  await dex.connect(trader4).createLimitOrder(REP, 800, 8, Side.SELL);

  await dex.connect(trader3).createLimitOrder(ZRX, 1500, 23, Side.SELL);
  await dex.connect(trader3).createLimitOrder(ZRX, 1200, 22, Side.SELL);
  await dex.connect(trader4).createLimitOrder(ZRX, 900, 21, Side.SELL);

  // for whatever reason promise.all on these gives transaction run out of gas
  // errors on some of the transactions
  // await Promise.all([
  //   dex.connect(trader1).createLimitOrder(BAT, 1400, 10, Side.BUY),
  //   dex.connect(trader2).createLimitOrder(BAT, 1200, 11, Side.BUY),
  //   dex.connect(trader2).createLimitOrder(BAT, 1000, 12, Side.BUY),

  //   dex.connect(trader1).createLimitOrder(REP, 3000, 4, Side.BUY),
  //   dex.connect(trader1).createLimitOrder(REP, 2000, 5, Side.BUY),
  //   dex.connect(trader2).createLimitOrder(REP, 500, 6, Side.BUY),

  //   dex.connect(trader1).createLimitOrder(ZRX, 4000, 12, Side.BUY),
  //   dex.connect(trader1).createLimitOrder(ZRX, 3000, 13, Side.BUY),
  //   dex.connect(trader2).createLimitOrder(ZRX, 500, 14, Side.BUY),

  //   dex.connect(trader3).createLimitOrder(BAT, 2000, 16, Side.SELL),
  //   dex.connect(trader4).createLimitOrder(BAT, 3000, 15, Side.SELL),
  //   dex.connect(trader4).createLimitOrder(BAT, 500, 14, Side.SELL),

  //   dex.connect(trader3).createLimitOrder(REP, 4000, 10, Side.SELL),
  //   dex.connect(trader3).createLimitOrder(REP, 2000, 9, Side.SELL),
  //   dex.connect(trader4).createLimitOrder(REP, 800, 8, Side.SELL),

  //   dex.connect(trader3).createLimitOrder(ZRX, 1500, 23, Side.SELL),
  //   dex.connect(trader3).createLimitOrder(ZRX, 1200, 22, Side.SELL),
  //   dex.connect(trader4).createLimitOrder(ZRX, 900, 21, Side.SELL),
  // ]);
}

function saveFrontendFiles(tokens: Contract[], tokenNames: string[]) {
  // tokens and tokenNames must be in the same order
  const contractsDir = __dirname + "/../frontend/src/contracts";

  if (!fs.existsSync(contractsDir)) {
    fs.mkdirSync(contractsDir);
  }

  const addresses = tokens.reduce((acc, next, i) => {
    return {
      ...acc,
      [tokenNames[i]]: next.address,
    };
  }, {});

  try {
    const json = JSON.stringify(addresses, undefined, 2);
    fs.writeFileSync(contractsDir + "/token-addresses.json", json);
  } catch (err) {
    console.error(err);
  }

  const erc20Artifact = artifacts.readArtifactSync("Dai");
  // just pick one of the contracts as all are the same ERC20 
  try {
    fs.writeFileSync(
      contractsDir + `/ERC20.json`,
      JSON.stringify(erc20Artifact, null, 2)
    );
  } catch (err) {
    console.log(`ERC20 artifact could not be written`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});
