import React, { useEffect, useState } from "react";
import { ethers } from "ethers";
import { useAppState } from "../contexts/appContext";
import { useContract } from "../contexts/contractContext";
import { useDexchangeData } from "../contexts/dexchangeContext";

const formInitialValues = { direction: null, amount: null }

export const Wallet = ({ account }: { account: string }) => {
  const { tokens } = useContract();
  const {
    state: { selectedMarket },
  } = useAppState();

  const { currentBalance, tokenBalance, deposit, withdraw } =
    useDexchangeData();
  const [expanded, setExpanded] = useState(false);
  const [form, setForm] = useState(formInitialValues);

  const change = (key: string) => (value: string) => {
    setForm((s) => ({
      ...s,
      [key]: value,
    }));
  };

  const handleSave = () => {
    if (selectedMarket && form.amount) {
      if (form.direction === "DEPOSIT") {
        deposit(selectedMarket, form.amount);
      } else if (form.direction === "WITHDRAW") {
        withdraw(selectedMarket, form.amount);
      }
      setForm(formInitialValues);
    }
  };

  const isDisabled = () => {
    return !selectedMarket || !form.direction || !form.amount;
  };

  return (
    <>
      <div className="relative inline-block">
        <button
          type="button"
          className="text-gray-500 group bg-white rounded-md inline-flex items-center text-base font-medium hover:text-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
          aria-expanded="false"
          onClick={() => setExpanded(!expanded)}
        >
          <span>My Account</span>

          <svg
            className="text-gray-400 ml-2 h-5 w-5 group-hover:text-gray-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fill-rule="evenodd"
              d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z"
              clip-rule="evenodd"
            />
          </svg>
        </button>

        {expanded && (
          <div className=" origin-top-right right-0 absolute z-10  mt-3 px-2 w-screen max-w-md sm:px-0">
            <div className="rounded-lg shadow-lg ring-1 ring-black ring-opacity-5 overflow-hidden">
              <div className="relative grid gap-6 bg-white px-5 py-6 sm:gap-8 sm:p-8">
                <div className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50 transition ease-in-out duration-150">
                  <svg
                    className="flex-shrink-0 h-6 w-6 text-indigo-600"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke-width="2"
                    stroke="currentColor"
                    aria-hidden="true"
                  >
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                    />
                  </svg>
                  <div className="ml-4">
                    <p className="text-base font-medium text-gray-900">
                      Wallet address
                    </p>
                    <p className="mt-1 text-sm text-gray-400">{`${account}`}</p>
                  </div>
                </div>
                {currentBalance && (
                  <div className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50 transition ease-in-out duration-150">
                    <svg
                      className="flex-shrink-0 h-6 w-6 text-indigo-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <div className="ml-4">
                      <p className="text-base font-medium text-gray-900">
                        Available in exchange
                      </p>
                      <p className="mt-1 text-xl text-gray-500">
                        {`${ethers.utils.formatEther(
                          currentBalance
                        )} ${selectedMarket}`}
                      </p>
                    </div>
                  </div>
                )}

                {tokenBalance && (
                  <div className="-m-3 p-3 flex items-start rounded-lg hover:bg-gray-50 transition ease-in-out duration-150">
                    <svg
                      className="flex-shrink-0 h-6 w-6 text-indigo-600"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke-width="2"
                      stroke="currentColor"
                      aria-hidden="true"
                    >
                      <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                      />
                    </svg>
                    <div className="ml-4">
                      <p className="text-base font-medium text-gray-900">
                        Available in wallet
                      </p>
                      <p className="mt-1 text-xl text-gray-500">
                        {`${ethers.utils.formatEther(
                          tokenBalance
                        )} ${selectedMarket}`}
                      </p>
                    </div>
                  </div>
                )}
              </div>
              <div className="px-5 py-5 bg-gray-50  sm:px-8">
                <span className="w-full relative z-0 inline-flex shadow-sm rounded-md">
                  <button
                    type="button"
                    onClick={() => change("direction")("DEPOSIT")}
                    className={`w-1/2 relative inline-flex items-center justify-center px-4 py-2 rounded-l-md border border-gray-300 ${
                      form.direction === "DEPOSIT"
                        ? "bg-indigo-300"
                        : "bg-white"
                    } text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                  >
                    Deposit
                  </button>
                  <button
                    type="button"
                    onClick={() => change("direction")("WITHDRAW")}
                    className={`w-1/2 -ml-px relative inline-flex items-center justify-center px-4 py-2 rounded-r-md border border-gray-300 ${
                      form.direction === "WITHDRAW"
                        ? "bg-indigo-300"
                        : "bg-white"
                    } text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
                  >
                    Withdraw
                  </button>
                </span>
                <div className="py-4">
                  <div className="border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-gray-300 focus-within:border-gray-300">
                    <label
                      htmlFor="amount"
                      className="block text-xs font-medium text-gray-900"
                    >
                      Amount
                    </label>
                    <input
                      type="text"
                      value={form.amount || ""}
                      onChange={(e) => change("amount")(e.target.value)}
                      name="amount"
                      id="amount"
                      className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm bg-transparent focus:bg-transparent"
                      placeholder="Enter amount to transfer"
                    />
                  </div>
                </div>
                <div className="flex items-center justify-end">
                  <button
                    type="button"
                    onClick={() => setForm(formInitialValues)}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                  >
                    Cancel
                  </button>
                  <button
                    type="button"
                    onClick={handleSave}
                    disabled={isDisabled()}
                    className={`ml-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white ${
                      isDisabled() ? "bg-gray-200" : "bg-indigo-600"
                    } hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500`}
                  >
                    Send
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
};
