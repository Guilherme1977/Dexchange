import React, { createContext, useContext } from "react";
import { ethers, providers } from "ethers";
import ContractArtifact from "../contracts/Dexchange.json";
import ERC20 from "../contracts/ERC20.json";

import contractAddress from "../contracts/contract-address.json";
import tokenAddresses from "../contracts/token-addresses.json";

type Contract = Record<string, any> | null;
export type ContractContextValue = {
  contract: Contract;
  provider: providers.Provider | null;
  tokens: Record<string, Contract>;
};

export type ContractProviderProps = {
  children: React.ReactNode;
};

export const ContractContext = createContext<ContractContextValue>({
  contract: null,
  provider: null,
  tokens: {},
});

const getTokens = (provider: providers.Provider, tokenNames: string[]) => {
  return tokenNames.reduce((acc, next: string) => {
    // @ts-ignore
    const addr = tokenAddresses[next]
    const token = new ethers.Contract(
      addr,
      ERC20.abi,
      provider
    );

    return {
      ...acc,
      [next.toUpperCase()]: token,
    };
  }, {});
};

export const ContractProvider = ({ children }: ContractProviderProps) => {
  const provider = getProvider();
  const contract = new ethers.Contract(
    contractAddress.Dexchange,
    ContractArtifact.abi,
    provider
  );
  const tokenNames = ["Dai", "Bat", "Zrx", "Rep"]; // this should be read from the dex
  const tokens = getTokens(provider, tokenNames);
  return (
    <ContractContext.Provider value={{ contract, provider, tokens }}>
      {children}
    </ContractContext.Provider>
  );
};

export function useContract() {
  return useContext(ContractContext);
}

const getProvider = () => {
  let provider;

  console.info(`Deploy env ${process.env.REACT_APP_ENVIRONMENT}`);

  if (process.env.REACT_APP_ENVIRONMENT === "rinkeby") {
    provider = new ethers.providers.InfuraProvider(
      "rinkeby",
      process.env.REACT_APP_INFURA_API_KEY
    );
  } else if (process.env.REACT_APP_ENVIRONMENT === "mumbai") {
    provider = new ethers.providers.JsonRpcProvider(
      process.env.REACT_APP_MUMBAI
    );
  } else if (process.env.REACT_APP_ENVIRONMENT === "polygon") {
    provider = new ethers.providers.JsonRpcProvider(
      process.env.REACT_APP_POLYGON
    );
  } else {
    provider = new ethers.providers.JsonRpcProvider();
  }

  return provider;
};
