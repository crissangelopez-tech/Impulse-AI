/**
 * DashboardLayout — Layout protegido con sidebar fija + outlet.
 *
 * Sidebar (Notion/Linear inspired):
 *  - Logo + workspace
 *  - Navegación: Dashboard / Crear / Historial / Mi Empresa / Planes / Configuración
 *  - Footer con avatar + dropdown user (logout)
 */
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  LayoutDashboard,
  Wand2,
  History,
  Building2,
  Sparkles,
  Settings,
  LogOut,
  ChevronsUpDown,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Logo } from "@/components/Logo";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

const NAV_ITEMS = [
  { to: "/dashboard", label: "Dashboard", icon: LayoutDashboard, testId: "nav-dashboard" },
  { to: "/crear", label: "Crear Plan de Fama", icon: Wand2, testId: "nav-create" },
  { to: "/historial", label: "Historial", icon: History, testId: "nav-history" },
  { to: "/mi-empresa", label: "Mi Empresa", icon: Building2, testId: "nav-company" },
  { to: "/planes", label: "Planes", icon: Sparkles, testId: "nav-plans" },
  { to: "/configuracion", label: "Configuración", icon: Settings, testId: "nav-settings" },
];

function Initials({ name = "" }) {
  const initials = name
    .split(" ")
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
  return (
    <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-zinc-950 text-xs font-bold text-white">
      {initials || "U"}
    </div>
  );
}

export default function DashboardLayout() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    toast.success("Sesión cerrada");
    navigate("/");
  };

  return (
    <div className="flex min-h-screen bg-[var(--pearl)]" data-testid="dashboard-layout">
      {/* SIDEBAR */}
      <aside
        className="sticky top-0 hidden h-screen w-64 flex-shrink-0 flex-col border-r border-zinc-200 bg-white/60 backdrop-blur-md md:flex"
        data-testid="sidebar"
      >
        <div className="flex h-16 items-center border-b border-zinc-200 px-5">
          <Logo />
        </div>

        <nav className="flex-1 space-y-0.5 px-3 py-5">
          <div className="label-eyebrow px-3 pb-2">Menú</div>
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              data-testid={item.testId}
              className={({ isActive }) =>
                `group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors ${
                  isActive
                    ? "bg-zinc-100 font-semibold text-zinc-950"
                    : "text-zinc-600 hover:bg-zinc-50 hover:text-zinc-950"
                }`
              }
            >
              <item.icon className="h-4 w-4" strokeWidth={2} />
              <span>{item.label}</span>
            </NavLink>
          ))}
        </nav>

        {/* User chip + dropdown */}
        <div className="border-t border-zinc-200 p-3">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex w-full items-center gap-3 rounded-lg p-2 text-left transition-colors hover:bg-zinc-50"
                data-testid="user-menu-trigger"
              >
                <Initials name={user?.name} />
                <div className="flex min-w-0 flex-1 flex-col">
                  <span className="truncate text-sm font-semibold text-zinc-950">{user?.name}</span>
                  <span className="truncate text-xs text-zinc-500">{user?.email}</span>
                </div>
                <ChevronsUpDown className="h-4 w-4 text-zinc-400" />
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" side="top" className="w-56">
              <DropdownMenuLabel>Mi cuenta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => navigate("/configuracion")} data-testid="menu-settings">
                <Settings className="mr-2 h-4 w-4" />
                Configuración
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => navigate("/planes")} data-testid="menu-plans">
                <Sparkles className="mr-2 h-4 w-4" />
                Planes
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-700" data-testid="menu-logout">
                <LogOut className="mr-2 h-4 w-4" />
                Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </aside>

      {/* MOBILE TOPBAR */}
      <div className="fixed inset-x-0 top-0 z-30 flex h-14 items-center justify-between border-b border-zinc-200 bg-white px-4 md:hidden">
        <Logo />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button data-testid="mobile-menu-trigger" className="rounded-md p-2 hover:bg-zinc-100">
              <ChevronsUpDown className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-56">
            {NAV_ITEMS.map((it) => (
              <DropdownMenuItem key={it.to} onClick={() => navigate(it.to)} data-testid={`mobile-${it.testId}`}>
                <it.icon className="mr-2 h-4 w-4" />
                {it.label}
              </DropdownMenuItem>
            ))}
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={handleLogout} className="text-red-600">
              <LogOut className="mr-2 h-4 w-4" />
              Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      {/* MAIN */}
      <main className="min-w-0 flex-1 pt-14 md:pt-0" data-testid="main-content">
        <div className="mx-auto max-w-6xl px-6 py-8 md:px-10 md:py-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
}
