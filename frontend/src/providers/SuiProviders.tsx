import { SuiClientProvider, WalletProvider } from "@mysten/dapp-kit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { ReactNode } from "react";
import { Toaster } from "react-hot-toast";
import { defaultNetwork, networkConfig } from "../networkConfig";
import { AuthProvider } from "./AuthProvider";
import { DashboardDataProvider } from "./DashboardDataProvider";
import { ThemeProvider } from "./ThemeProvider";
import { UserRoleProvider } from "./UserRoleProvider";

const queryClient = new QueryClient();

interface Props {
  children: ReactNode;
}

export const SuiProviders = ({ children }: Props) => (
  <ThemeProvider>
    <UserRoleProvider>
      <AuthProvider>
        <DashboardDataProvider>
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
        </DashboardDataProvider>
      </AuthProvider>
    </UserRoleProvider>
  </ThemeProvider>
);
