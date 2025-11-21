import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { defaultNetwork, networkConfig } from "../networkConfig";
import { ThemeProvider } from "./ThemeProvider";

const queryClient = new QueryClient();

interface Props {
  children: ReactNode;
}

export const SuiProviders = ({ children }: Props) => (
  <ThemeProvider>
    <QueryClientProvider client={queryClient}>
      <SuiClientProvider
        networks={networkConfig}
        defaultNetwork={defaultNetwork}
      >
        <WalletProvider autoConnect>
          {children}
          <Toaster position="top-center" />
        </WalletProvider>
      </SuiClientProvider>
    </QueryClientProvider>
  </ThemeProvider>
);
