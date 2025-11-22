import AdminActions from "./components/Dashboard/AdminActions";
import AuthPanel from "./components/Dashboard/AuthPanel";
import BackendTokenAddress from "./components/Dashboard/BackendTokenAddress";
import EnhancedTokenOverview from "./components/Dashboard/EnhancedTokenOverview";
import EventsFeed from "./components/Dashboard/EventsFeed";
import JobQueue from "./components/Dashboard/JobQueue";
import SuiTokenOverview from "./components/Dashboard/SuiTokenOverview";
import TokenActions from "./components/Dashboard/TokenActions";
import TokenAddress from "./components/Dashboard/TokenAddress";
import TokenOverview from "./components/Dashboard/TokenOverview";
import UserActions from "./components/Dashboard/UserActions";
import WalletConsole from "./components/Dashboard/WalletConsole";
import Header from "./components/Layout/Header";

const App = () => (
  <main className="relative isolate overflow-hidden">
    <div className="pointer-events-none absolute inset-x-0 top-0 -z-10 h-[480px] bg-gradient-to-b from-brand-500/20 via-transparent to-transparent blur-3xl" />
    <div className="dashboard-shell">
      <Header />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(320px,1fr)]">
        <div className="flex flex-col gap-6">
          {/* Enhanced Token Overviews with Charts */}
          <div className="grid gap-6 lg:grid-cols-2">
            <EnhancedTokenOverview />
            <SuiTokenOverview />
          </div>

          {/* Legacy Token Overview (for backward compatibility) */}
          <div className="grid gap-6 md:grid-cols-2">
            <TokenOverview />
            <UserActions />
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            <TokenActions />
            <EventsFeed />
          </div>

          <AdminActions />

          <JobQueue />
        </div>

        <div className="flex flex-col gap-6">
          <AuthPanel />
          <TokenAddress />
          <BackendTokenAddress />
          <WalletConsole />
        </div>
      </div>
    </div>
  </main>
);

export default App;
