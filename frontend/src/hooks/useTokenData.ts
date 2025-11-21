import { useEffect, useState } from "react";

const defaultData = {
  totalSupply: "0",
  circulating: "0",
  holderCount: 0,
};

export const useTokenData = () => {
  const [data, setData] = useState(defaultData);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let mounted = true;

    fetch("/api/tokens/summary")
      .then((res) => res.json())
      .then((payload) => mounted && setData(payload))
      .catch(() => mounted && setData(defaultData))
      .finally(() => mounted && setIsLoading(false));

    return () => {
      mounted = false;
    };
  }, []);

  return { data, isLoading };
};
