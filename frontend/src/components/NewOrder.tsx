import React, { useState } from "react";
import { useAppState } from "../contexts/appContext";
import { useDexchangeData } from "../contexts/dexchangeContext";

const Type = {
  LIMIT: "LIMIT",
  MARKET: "MARKET",
};

const Side = {
  BUY: 0,
  SELL: 1,
};

const initialData = {
  type: null,
  side: null,
  amount: null,
  price: null,
};

export const NewOrder = () => {
  const {
    state: { selectedMarket },
  } = useAppState();
  const { createMarketOrder, createLimitOrder } = useDexchangeData();
  const [form, setForm] = useState(initialData);

  const change = (k: string) => (value: string | number) => {
    setForm((s) => ({
      ...s,
      [k]: value,
    }));
  };

  const handleSave = () => {
    if (form.amount && form.type && form.side) {
      if (form.type === Type.MARKET) {
        createMarketOrder(form.amount, form.side);
      } else if (form.type === Type.LIMIT && form.price) {
        createLimitOrder(form.amount, form.price, form.side);
      }
    }
  };

  const isDisabled = () => {
    return !form.type || !form.side || !form.amount;
  };

  if (selectedMarket === "DAI") {
    return null;
  }

  return (
    <div className="bg-white overflow-hidden shadow rounded-lg divide-y divide-gray-200">
      <div className="px-4 py-5 sm:px-6">
        <h3 className="text-xl font-bold">New Order for {selectedMarket}</h3>
      </div>
      <div className="px-4 py-5 sm:p-6">
        <span className="w-full relative z-0 inline-flex shadow-sm rounded-md mb-4">
          <button
            type="button"
            onClick={() => change("type")(Type.LIMIT)}
            className={`w-1/2 relative inline-flex items-center justify-center px-4 py-2 rounded-l-md border border-gray-300 ${
              form.type === Type.LIMIT ? "bg-indigo-300" : "bg-white"
            } text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
          >
            {Type.LIMIT}
          </button>
          <button
            type="button"
            onClick={() => change("type")(Type.MARKET)}
            className={`w-1/2 -ml-px relative inline-flex items-center justify-center px-4 py-2 rounded-r-md border border-gray-300 ${
              form.type === Type.MARKET ? "bg-indigo-300" : "bg-white"
            } text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
          >
            {Type.MARKET}
          </button>
        </span>

        <span className="w-full relative z-0 inline-flex shadow-sm rounded-md mb-4">
          <button
            type="button"
            onClick={() => change("side")(Side.BUY)}
            className={`w-1/2 relative inline-flex items-center justify-center px-4 py-2 rounded-l-md border border-gray-300 ${
              form.side === Side.BUY ? "bg-indigo-300" : "bg-white"
            } text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
          >
            BUY
          </button>
          <button
            type="button"
            onClick={() => change("side")(Side.SELL)}
            className={`w-1/2 -ml-px relative inline-flex items-center justify-center px-4 py-2 rounded-r-md border border-gray-300 ${
              form.side === Side.SELL ? "bg-indigo-300" : "bg-white"
            } text-sm font-medium text-gray-700 hover:bg-gray-50 focus:z-10 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500`}
          >
            SELL
          </button>
        </span>

        {form.type === Type.MARKET ? null : (
          <div className="border border-gray-300 rounded-md px-3 py-2 shadow-sm focus-within:ring-1 focus-within:ring-gray-300 focus-within:border-gray-300 mb-4">
            <label
              htmlFor="price"
              className="block text-xs font-medium text-gray-900"
            >
              Price
            </label>
            <input
              type="text"
              value={form.price || ""}
              onChange={(e) => change("price")(e.target.value)}
              name="price"
              id="price"
              className="block w-full border-0 p-0 text-gray-900 placeholder-gray-500 focus:ring-0 sm:text-sm bg-transparent focus:bg-transparent"
              placeholder="Enter price for order"
            />
          </div>
        )}

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
            placeholder="Enter amount for order"
          />
        </div>
      </div>
      <div className="px-4 py-4 sm:px-6">
        <div className="flex items-center justify-end">
          <button
            type="button"
            onClick={() => setForm(initialData)}
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
  );
};
