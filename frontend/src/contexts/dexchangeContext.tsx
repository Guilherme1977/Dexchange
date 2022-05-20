import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
} from "react";
import { ethers } from "ethers";
import { useContract } from "./contractContext";
import { useAccount } from "./accountContext";
import { useAppState } from "./appContext";

export type DexchangeDataContextValue = {
  deposit: (arg0: string, arg1: string) => void;
  withdraw: (arg0: string, arg1: string) => void;
  createMarketOrder: (arg0: string, arg1: number) => void;
  createLimitOrder: (arg0: string, arg1: string, arg2: number) => void;
  currentBalance: number | null;
  tokenBalance: number | null;
  orders: { buy: any[]; sell: any[] };
  trades: any[];
};

export const DexchangeDataContext = createContext<DexchangeDataContextValue>(
  {} as DexchangeDataContextValue
);

export type DexchangeDataProviderProps = {
  children: React.ReactNode;
};

export const DexchangeDataProvider = ({
  children,
}: DexchangeDataProviderProps): JSX.Element => {
  const { contract, tokens } = useContract();
  const { account, accountProvider } = useAccount();
  const {
    state: { selectedMarket },
  } = useAppState();

  const [orders, setOrders] = useState({ buy: [], sell: [] });
  const [currentBalance, setCurrentBalance] = useState(null);
  const [tokenBalance, setTokenBalance] = useState(null);
  const [trades, setTrades] = useState([]);

  const deposit = async (ticker: string, amount: string) => {
    if (account) {
      const signer = accountProvider?.getSigner();
      const contractWithSigner = contract?.connect(signer);
      const token = tokens[ticker];
      try {
        const tx = await token
          ?.connect(signer)
          .approve(contract?.address, ethers.utils.parseUnits(amount));
        await tx.wait();
      } catch (err) {
        console.log(err);
      }

      try {
        await contractWithSigner.deposit(
          ethers.utils.formatBytes32String(ticker),
          ethers.utils.parseUnits(amount)
        );
      } catch (err) {
        console.error(err);
      }

      await fetchBalances(account, ticker);
    }
  };

  const withdraw = async (ticker: string, amount: string) => {
    if (account) {
      const signer = accountProvider?.getSigner();
      const contractWithSigner = contract?.connect(signer);

      try {
        await contractWithSigner.withdraw(
          ethers.utils.formatBytes32String(ticker),
          ethers.utils.parseUnits(amount)
        );
      } catch (err) {
        console.error(err);
      }

      await fetchBalances(account, ticker);
    }
  };

  const createMarketOrder = useCallback(
    async (amount: string, side: number) => {
      if (selectedMarket) {
        const signer = accountProvider?.getSigner();
        const contractWithSigner = contract?.connect(signer);
        try {
          await contractWithSigner?.createMarketOrder(
            ethers.utils.formatBytes32String(selectedMarket),
            ethers.utils.parseUnits(amount),
            side
          );
        } catch (err) {
          console.log(err);
        }
      }
    },
    [selectedMarket, accountProvider, contract]
  );

  const createLimitOrder = useCallback(
    async (amount: string, price: string, side: number) => {
      if (selectedMarket) {
        const signer = accountProvider?.getSigner();
        const contractWithSigner = contract?.connect(signer);
        try {
          await contractWithSigner?.createLimitOrder(
            ethers.utils.formatBytes32String(selectedMarket),
            ethers.utils.parseUnits(amount),
            ethers.utils.parseUnits(price),
            side
          );
        } catch (err) {
          console.log(err);
        }
      }
    },
    [selectedMarket, accountProvider, contract]
  );

  const fetchOrders = useCallback(
    async (ticker: string) => {
      try {
        const os = await Promise.all([
          contract?.getOrders(ethers.utils.formatBytes32String(ticker), 0),
          contract?.getOrders(ethers.utils.formatBytes32String(ticker), 1),
        ]);

        setOrders({ buy: os[0], sell: os[1] });
      } catch (err) {
        console.log(err);
      }
    },
    [contract]
  );

  const fetchBalances = useCallback(
    async (address: string, ticker: string) => {
      try {
        const balance = await contract?.balances(
          address,
          ethers.utils.formatBytes32String(ticker)
        );

        setCurrentBalance(balance.toString());
      } catch (err) {
        console.log(err);
      }

      try {
        const tokenB = await tokens[ticker]?.balanceOf(address);
        setTokenBalance(tokenB);
      } catch (err) {
        console.log(err);
      }
    },
    [contract, tokens]
  );
  const tradeHandler = useCallback(
    (
      tradeId: string,
      orderId: string,
      ticker: any,
      trader1: string,
      trader2: string,
      matched: any,
      price: any,
      date: any,
      event: any
    ) => {
      const trade = {
        tradeId,
        orderId,
        ticker: ethers.utils.parseBytes32String(ticker),
        trader1,
        trader2,
        matched,
        price,
        date,
      };
      // @ts-ignore
      setTrades((ts) => {
        return [trade, ...ts];
      });
    },
    [setTrades]
  );

  useEffect(() => {
    if (selectedMarket) {
      setTrades([]);

      const filter = contract?.filters.NewTrade(
        null,
        null,
        ethers.utils.formatBytes32String(selectedMarket)
      );
      contract?.on(filter, tradeHandler);
    }
  }, [selectedMarket, contract]);

  useEffect(() => {
    if (account && selectedMarket) {
      fetchOrders(selectedMarket);
      fetchBalances(account, selectedMarket);
    }
  }, [fetchOrders, fetchBalances, selectedMarket]);

  return (
    <DexchangeDataContext.Provider
      value={{
        deposit,
        withdraw,
        createLimitOrder,
        createMarketOrder,
        currentBalance,
        tokenBalance,
        orders,
        trades,
      }}
    >
      {children}
    </DexchangeDataContext.Provider>
  );
};

export const useDexchangeData = () => {
  return useContext(DexchangeDataContext);
};
