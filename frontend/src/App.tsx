import BackendTokenAddress from "./components/Dashboard/BackendTokenAddress";
import EventsFeed from "./components/Dashboard/EventsFeed";
import TokenActions from "./components/Dashboard/TokenActions";
import TokenAddress from "./components/Dashboard/TokenAddress";
import TokenOverview from "./components/Dashboard/TokenOverview";
import Header from "./components/Layout/Header";

const App = () => (
  <main>
    <Header />
    <section className="grid">
      <TokenOverview />
      <TokenActions />
      <EventsFeed />
      <TokenAddress />
      <BackendTokenAddress />
    </section>
  </main>
);

export default App;
