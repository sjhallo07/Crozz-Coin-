import BackendTokenAddress from "./components/Dashboard/BackendTokenAddress";
import EventsFeed from "./components/Dashboard/EventsFeed";
import JobQueue from "./components/Dashboard/JobQueue";
import TokenActions from "./components/Dashboard/TokenActions";
import TokenAddress from "./components/Dashboard/TokenAddress";
import TokenOverview from "./components/Dashboard/TokenOverview";
import WalletConsole from "./components/Dashboard/WalletConsole";
import Header from "./components/Layout/Header";

const App = () => (
  <main className="relative isolate overflow-hidden">
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-gradient-to-b from-brand-500/20 via-transparent to-transparent blur-3xl" />
    <div className="dashboard-shell">
      <Header />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="flex flex-col gap-6">
          <div className="grid gap-6 md:grid-cols-2">
            <TokenOverview />
            <TokenActions />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <EventsFeed />
            <JobQueue />
          </div>
        </div>

        <div className="flex flex-col gap-6">
          <TokenAddress />
          <BackendTokenAddress />
          <WalletConsole />
        </div>
      </div>
    </div>
  </main>
);

export default App;
