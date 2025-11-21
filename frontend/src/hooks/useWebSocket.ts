import { useDashboardData } from "../providers/DashboardDataProvider";

export const useWebSocket = () => {
  const { events } = useDashboardData();
  return events;
};
