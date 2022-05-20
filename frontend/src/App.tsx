import React from "react";
import { ContractProvider, useContract } from "./contexts/contractContext";
import { AccountProvider } from "./contexts/accountContext";
import { DexchangeDataProvider } from "./contexts/dexchangeContext";
import { AppStateProvider } from "./contexts/appContext";
import { LoadingScreen } from "./components/LoadingScreen";
import { Header } from "./components/Header";
import { NewOrder } from "./components/NewOrder";
import { Orders } from "./components/Orders";
import { MyOrders } from "./components/MyOrders";
import { Trades } from "./components/Trades";

function App() {
  return (
    <ContractProvider>
      <AccountProvider>
        <AppStateProvider>
          <DexchangeDataProvider>
            <UI />
          </DexchangeDataProvider>
        </AppStateProvider>
      </AccountProvider>
    </ContractProvider>
  );
}

const UI = () => {
  const { contract, provider } = useContract();

  if (!contract || !provider) {
    return <LoadingScreen />;
  }

  return (
    <div>
      <Header />
      <main className="flex justify-start items-start p-8">
        <div className="pr-4">
          <NewOrder />
        </div>
        <div className="pl-4">
          <div className="mb-4">
            <Trades />
          </div>

          <div className="mb-4">
            <Orders />
          </div>
          <div className="mt-4">
            <MyOrders />
          </div>
        </div>
      </main>
    </div>
  );
};

export default App;
