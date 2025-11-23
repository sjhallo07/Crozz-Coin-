import AdminActions from "./components/Dashboard/AdminActions";
import NetworkIndicator from "./components/Dashboard/NetworkIndicator";
import UserActions from "./components/Dashboard/UserActions";
import Header from "./components/Layout/Header";
import MainContent from "./components/Layout/MainContent";
import Sidebar from "./components/Layout/Sidebar";

const App = () => (
  <div className="dashboard-root">
    <Sidebar />
    <div className="dashboard-main">
      <Header />
      <MainContent>
        <NetworkIndicator />
        <UserActions />
        <AdminActions />
      </MainContent>
    </div>
  </div>
);

export default App;
