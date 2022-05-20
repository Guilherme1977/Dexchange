import React from "react";
import { useAccount } from "../contexts/accountContext";

export const ConnectButton = () => {
  const { connect } = useAccount();

  return (
    <button
      onClick={connect}
      disabled={!connect}
      type="button"
      className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
    >
      Connect wallet
    </button>
  );
};
