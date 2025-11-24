import { ConnectButton } from '@mysten/dapp-kit';
import { type SVGProps } from 'react';
import RoleSwitcher from '../../components/Dashboard/RoleSwitcher';
import { useThemeMode } from '../../providers/ThemeProvider';
import { useUserRole } from '../../providers/UserRoleProvider';
import { getCurrentNetwork, isMainnet } from '../../utils/sui';
import Button from '../UI/Button';

const Header = () => {
  const { theme, toggleTheme } = useThemeMode();
  const { isAdmin } = useUserRole();
  const isDark = theme === 'dark';
  const network = getCurrentNetwork();
  const isMain = isMainnet();

  const networkColors = {
    mainnet: 'bg-green-500 text-white',
    testnet: 'bg-yellow-500 text-white',
    localnet: 'bg-gray-500 text-white',
  };

  return (
    <header className="header">
      <div className="flex items-center gap-4">
        <h1 className="header-title">{isAdmin ? 'Admin Dashboard' : 'User Dashboard'}</h1>
        <div
          className={`px-3 py-1 rounded-full text-xs font-semibold uppercase ${networkColors[network]}`}
        >
          {network}
        </div>
        {isMain && <span className="text-red-600 text-xs font-semibold">⚠️ LIVE</span>}
      </div>
      <div className="flex items-center gap-3">
        <RoleSwitcher />
        <ConnectButton />
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          className="border border-slate-200/60 text-slate-600 dark:border-slate-800 dark:text-slate-100"
        >
          {isDark ? <SunIcon className="h-4 w-4" /> : <MoonIcon className="h-4 w-4" />}
          <span className="hidden sm:inline">{isDark ? 'Light' : 'Dark'} mode</span>
        </Button>
      </div>
    </header>
  );
};

const SunIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2m0 16v2m10-10h-2M4 12H2m15.5-7.5L16 6m-8 12-1.5 1.5m0-13L8 6m8 12 1.5 1.5" />
  </svg>
);

const MoonIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M21 14.5A8.5 8.5 0 0 1 9.5 3 8.5 8.5 0 1 0 21 14.5Z" />
  </svg>
);

const ClockIcon = (props: SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.5}
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M12 6v6l4 2" />
  </svg>
);

export default Header;
