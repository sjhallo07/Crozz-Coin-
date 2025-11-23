import { isInsecureToken } from "../../constants/config";
import { useUserRole } from "../../providers/UserRoleProvider";
import Button from "../UI/Button";

export default function RoleSwitcher() {
  const { role, isAdmin, toggleRole } = useUserRole();
  
  // Check if admin token is configured
  const hasAdminToken = !isInsecureToken(import.meta.env.VITE_CROZZ_ADMIN_TOKEN);

  // If no admin token, don't show the switcher
  if (!hasAdminToken) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <Button
        variant={isAdmin ? "primary" : "ghost"}
        size="sm"
        onClick={toggleRole}
        className={`
          transition-all
          ${isAdmin 
            ? "bg-purple-600 text-white hover:bg-purple-700" 
            : "border border-slate-200 text-slate-600 hover:bg-slate-50"
          }
        `}
      >
        <span className="text-xs font-semibold">
          {isAdmin ? "👨‍💼 Admin Mode" : "👤 User Mode"}
        </span>
      </Button>
    </div>
  );
}
