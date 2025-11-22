import { type SVGProps } from "react";

const Sidebar = () => {
  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 overflow-hidden rounded-lg bg-brand-500/10 p-1.5">
            <img
              src="/crozz-logo.png"
              alt="Crozz logo"
              className="h-full w-full object-contain"
            />
          </div>
          <h2 className="text-xl font-bold text-white">CROZZ Admin</h2>
        </div>
      </div>
      <nav className="sidebar-nav">
        <ul>
          <li className="sidebar-nav-item active">
            <DashboardIcon className="h-5 w-5" />
            <span>Dashboard</span>
          </li>
          <li className="sidebar-nav-item">
            <UsersIcon className="h-5 w-5" />
            <span>Users</span>
          </li>
          <li className="sidebar-nav-item">
            <TokensIcon className="h-5 w-5" />
            <span>Tokens</span>
          </li>
          <li className="sidebar-nav-item">
            <SettingsIcon className="h-5 w-5" />
            <span>Settings</span>
          </li>
        </ul>
      </nav>
    </aside>
  );
};

const DashboardIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="3" y="3" width="7" height="7" />
    <rect x="14" y="3" width="7" height="7" />
    <rect x="14" y="14" width="7" height="7" />
    <rect x="3" y="14" width="7" height="7" />
  </svg>
);

const UsersIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
    <circle cx="9" cy="7" r="4" />
    <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
  </svg>
);

const TokensIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

const SettingsIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={2}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6M5.63 5.63l4.24 4.24m4.24 4.24 4.24 4.24M1 12h6m6 0h6M5.63 18.37l4.24-4.24m4.24-4.24 4.24-4.24" />
  </svg>
);

export default Sidebar;
