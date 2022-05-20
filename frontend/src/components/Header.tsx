import React, { useState } from "react";
import { useContract } from "../contexts/contractContext";
import { useAccount } from "../contexts/accountContext";
import { useAppState } from "../contexts/appContext";
import { ConnectButton } from "./ConnectButton";
import { Dropdown } from "./Dropdown";
import { Wallet } from "./Wallet";

export const Header = () => {
  const { tokens } = useContract();
  const { account } = useAccount();
  const { state, dispatch } = useAppState();

  const handleSelect = (market: string) => {
    dispatch({ type: "CHANGE_MARKET", payload: market });
  };

  return (
    <header className="p-8 md:flex md:items-center md:justify-between">
      <div className="flex-1 min-w-0">
        <h2 className="text-2xl font-bold leading-7 text-indigo-900 sm:text-3xl sm:truncate">
          Dexchange
        </h2>
        <h4 className="text-lg text-gray-600">
          The descentralized exchange app
        </h4>
      </div>

      <div className="flex flex-row items-center">
        {state.selectedMarket && (
          <p className="pr-8 font-bold">{state.selectedMarket}</p>
        )}
        <Dropdown
          items={Object.keys(tokens)}
          label={"Select market"}
          onSelect={handleSelect}
          selected={state.selectedMarket}
        />
      </div>

      <div className="mt-4 flex md:mt-0 md:ml-4">
        {!account ? <ConnectButton /> : <Wallet account={account} />}
      </div>
    </header>
  );
};
