import BackendTokenAddress from "./components/Dashboard/BackendTokenAddress";
import EventsFeed from "./components/Dashboard/EventsFeed";
import JobQueue from "./components/Dashboard/JobQueue";
import TokenActions from "./components/Dashboard/TokenActions";
import TokenAddress from "./components/Dashboard/TokenAddress";
import TokenOverview from "./components/Dashboard/TokenOverview";
import WalletConsole from "./components/Dashboard/WalletConsole";
import Header from "./components/Layout/Header";

const App = () => (
  <main>
    <Header />
    <section className="grid">
      <TokenOverview />
      <TokenActions />
      <EventsFeed />
      <JobQueue />
      <TokenAddress />
      <BackendTokenAddress />
      <WalletConsole />
    </section>
  </main>
);

export default App;
