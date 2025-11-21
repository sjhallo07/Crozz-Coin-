import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { Theme } from "@radix-ui/themes";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { defaultNetwork, networkConfig } from "../networkConfig";

const queryClient = new QueryClient();

interface Props {
  children: ReactNode;
}

export const SuiProviders = ({ children }: Props) => (
  <Theme appearance="light">
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
  </Theme>
);
