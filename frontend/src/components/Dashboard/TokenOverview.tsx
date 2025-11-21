import { useTokenData } from "../../hooks/useTokenData";
import Card from "../UI/Card";

const TokenOverview = () => {
  const { data, isLoading } = useTokenData();

  return (
    <Card title="Crozz Token Overview">
      {isLoading ? (
        <p>Loading supply metrics…</p>
      ) : (
        <ul>
          <li>Total Supply: {data.totalSupply}</li>
          <li>Circulating: {data.circulating}</li>
          <li>Holders: {data.holderCount}</li>
        </ul>
      )}
    </Card>
  );
};

export default TokenOverview;
