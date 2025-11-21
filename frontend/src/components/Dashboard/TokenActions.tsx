import Button from "../UI/Button";

const TokenActions = () => (
  <div className="token-actions">
    <Button onClick={() => alert("Mint flow coming soon")}>Mint</Button>
    <Button variant="secondary" onClick={() => alert("Burn flow coming soon")}>Burn</Button>
    <Button variant="ghost" onClick={() => alert("Distribute flow coming soon")}>Distribute</Button>
  </div>
);

export default TokenActions;
