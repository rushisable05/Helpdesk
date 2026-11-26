import { useState } from "react";
import { Link, NavLink, Outlet, useNavigate } from "react-router";
import { Role } from "core/constants/role.ts";
import { signOut, useSession } from "../lib/auth-client";
import { useTheme } from "../lib/theme";
import SessionTimeoutManager from "./SessionTimeoutManager";
import {
  LayoutDashboard,
  Ticket,
  Users,
  LogOut,
  Sun,
  Moon,
  Menu,
  X,
} from "lucide-react";

export default function Layout() {
  const { data: session } = useSession();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const handleSignOut = async () => {
    setMobileMenuOpen(false);
    await signOut();
    navigate("/login", { replace: true });
  };

  const navLinkClass = ({ isActive }: { isActive: boolean }) =>
    `inline-flex items-center gap-2 text-[13px] font-medium px-3 py-1.5 rounded-lg transition-all duration-200 ${
      isActive
        ? "text-primary-foreground bg-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-accent"
    }`;

  const mobileNavLinkClass = ({ isActive }: { isActive: boolean }) =>
    `flex items-center gap-2.5 text-sm font-medium px-3 py-2.5 rounded-lg transition-all duration-200 ${
      isActive
        ? "text-primary-foreground bg-primary"
        : "text-muted-foreground hover:text-foreground hover:bg-accent"
    }`;

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* 1-Minute Inactivity Session Manager */}
      <SessionTimeoutManager />

      <nav className="sticky top-0 z-50 bg-background border-b px-4 sm:px-6 h-14 flex items-center justify-between">
        <div className="flex items-center gap-1.5">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="flex items-center gap-2 mr-2 md:mr-5 group"
          >
            <div className="h-7 w-7 rounded-lg bg-primary flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-sm">
                H
              </span>
            </div>
            <span className="text-[15px] font-semibold tracking-tight group-hover:text-foreground transition-colors">
              Helpdesk
            </span>
          </Link>
          <div className="hidden md:flex items-center gap-1.5">
            <NavLink to="/" end className={navLinkClass}>
              <LayoutDashboard className="h-3.5 w-3.5" />
              Dashboard
            </NavLink>
            <NavLink to="/tickets" className={navLinkClass}>
              <Ticket className="h-3.5 w-3.5" />
              Tickets
            </NavLink>
            {session?.user?.role === Role.admin && (
              <NavLink to="/users" className={navLinkClass}>
                <Users className="h-3.5 w-3.5" />
                Users
              </NavLink>
            )}
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={toggleTheme}
            className="inline-flex items-center justify-center rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 cursor-pointer"
            aria-label="Toggle theme"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </button>

          <div className="hidden md:flex items-center">
            <div className="h-5 w-px bg-border mx-2" />
            <span
              className="inline-flex items-center gap-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/50 mr-2"
              title="Auto-closes session after 1 minute of inactivity"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
              1m Auto-Lock
            </span>
            <span className="text-[13px] text-muted-foreground mr-1">
              {session?.user?.name}
            </span>
            <button
              className="inline-flex items-center justify-center gap-1.5 rounded-lg text-[13px] font-medium px-2.5 py-1.5 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>

          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="md:hidden inline-flex items-center justify-center rounded-lg h-9 w-9 text-muted-foreground hover:text-foreground hover:bg-accent transition-all duration-200 cursor-pointer"
            aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
          >
            {mobileMenuOpen ? (
              <X className="h-5 w-5" />
            ) : (
              <Menu className="h-5 w-5" />
            )}
          </button>
        </div>
      </nav>

      {mobileMenuOpen && (
        <div className="md:hidden border-b bg-background px-4 py-3 space-y-1.5 animate-in-page">
          <NavLink
            to="/"
            end
            className={mobileNavLinkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            <LayoutDashboard className="h-4 w-4" />
            Dashboard
          </NavLink>
          <NavLink
            to="/tickets"
            className={mobileNavLinkClass}
            onClick={() => setMobileMenuOpen(false)}
          >
            <Ticket className="h-4 w-4" />
            Tickets
          </NavLink>
          {session?.user?.role === Role.admin && (
            <NavLink
              to="/users"
              className={mobileNavLinkClass}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Users className="h-4 w-4" />
              Users
            </NavLink>
          )}
          <div className="pt-2 mt-2 border-t flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-xs font-medium text-muted-foreground">
                {session?.user?.name}
              </span>
              <span className="inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full bg-muted/60 text-muted-foreground border border-border/50">
                <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                1m Auto-Lock
              </span>
            </div>
            <button
              className="inline-flex items-center gap-1.5 rounded-lg text-xs font-medium px-3 py-2 text-muted-foreground hover:text-foreground hover:bg-accent transition-all cursor-pointer"
              onClick={handleSignOut}
            >
              <LogOut className="h-3.5 w-3.5" />
              Sign out
            </button>
          </div>
        </div>
      )}

      <main className="flex-1 px-4 py-5 sm:px-6 sm:py-6 md:px-8 md:py-8 max-w-[1200px] w-full mx-auto animate-in-page">
        <Outlet />
      </main>
    </div>
  );
}
