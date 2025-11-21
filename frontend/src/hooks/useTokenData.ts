import { useDashboardData } from "../providers/DashboardDataProvider";

export const useTokenData = () => {
  const { tokenSummary, summaryLoading } = useDashboardData();
  return { data: tokenSummary, isLoading: summaryLoading };
};
