import { useState } from "react";
import { Link, Outlet, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import NotificationBell from "./NotificationBell";
import { House, Plus, LogOut, Menu, X } from "../components/icons";

export default function Layout() {
  const { user, logout } = useAuth();
  const nav = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const navLinks = (
    <>
      <Link to="/catalog" onClick={() => setMenuOpen(false)}>Catalog</Link>
      <Link to="/auctions" onClick={() => setMenuOpen(false)}>Auctions</Link>
      {user && (
        <Link to="/auction/new" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> Auction
        </Link>
      )}
      {user && <Link to="/favorites" onClick={() => setMenuOpen(false)}>Favorites</Link>}
      {user && (
        <Link to="/create" onClick={() => setMenuOpen(false)} className="flex items-center gap-2">
          <Plus className="h-4 w-4" /> List property
        </Link>
      )}
      {user && <Link to="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>}
    </>
  );

  return (
    <div className="flex min-h-screen flex-col">
      {/* ---------------------------------------------------- sticky glass nav */}
      <header className="sticky top-0 z-40 bg-white/70 backdrop-blur-xl border-b border-ink/[0.06] shadow-soft transition-all duration-300">
        <div className="container-wide flex h-16 items-center gap-5">
          {/* brand: house glyph + wordmark */}
          <Link to="/" className="group flex shrink-0 items-center gap-2.5">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gradient-from to-gradient-to text-white shadow-glow transition-transform duration-200 group-hover:-translate-y-0.5">
              <House className="h-[18px] w-[18px]" />
            </span>
            <span className="leading-none">
              <span className="font-display text-xl font-semibold tracking-tight text-ink">
                Really<span className="text-accent">.</span>Estate
              </span>
              <span className="ml-1 hidden align-middle text-[10px] font-semibold uppercase tracking-[0.2em] text-muted sm:inline">
                Estate
              </span>
            </span>
          </Link>

          {/* center nav links (desktop) */}
          <nav className="hidden items-center gap-6 text-sm font-medium text-muted md:flex">
            <Link
              to="/catalog"
              className="relative transition-colors hover:text-ink after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-brand-600 after:transition-all after:duration-300 hover:after:w-full"
            >
              Catalog
            </Link>
            <Link
              to="/auctions"
              className="relative transition-colors hover:text-ink after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-brand-600 after:transition-all after:duration-300 hover:after:w-full"
            >
              Auctions
            </Link>
            {user && (
              <Link
                to="/auction/new"
                className="relative flex items-center gap-1.5 transition-colors hover:text-ink after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-brand-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                <Plus className="h-4 w-4" /> Auction
              </Link>
            )}
            {user && (
              <Link
                to="/favorites"
                className="relative transition-colors hover:text-ink after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-brand-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                Favorites
              </Link>
            )}
            {user && (
              <Link
                to="/create"
                className="relative flex items-center gap-1.5 transition-colors hover:text-ink after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-brand-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                <Plus className="h-4 w-4" /> List property
              </Link>
            )}
            {user && (
              <Link
                to="/dashboard"
                className="relative transition-colors hover:text-ink after:absolute after:left-0 after:-bottom-1 after:h-px after:w-0 after:bg-brand-600 after:transition-all after:duration-300 hover:after:w-full"
              >
                Dashboard
              </Link>
            )}
          </nav>

          <div className="flex-1" />

          {/* right cluster: bell + profile/logout or login/signup */}
          {user ? (
            <div className="flex items-center gap-3 text-sm">
              <NotificationBell />
              <Link
                to="/profile"
                className="hidden items-center gap-2 rounded-full px-2 py-1 text-muted transition-colors hover:bg-ink/[0.04] hover:text-ink sm:flex"
              >
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brand-50 font-display text-sm font-semibold text-brand-700">
                  {(user.login?.[0] ?? "U").toUpperCase()}
                </span>
                <span className="leading-tight">
                  <span className="block font-medium text-ink">{user.login}</span>
                  <span className="block text-xs text-muted">{user.role?.name ?? "Client"}</span>
                </span>
              </Link>
              <button
                className="ghost"
                onClick={() => { logout(); nav("/"); }}
              >
                <LogOut className="h-4 w-4" />
                <span className="hidden sm:inline">Logout</span>
              </button>
            </div>
          ) : (
            <div className="hidden items-center gap-3 text-sm sm:flex">
              <Link
                to="/login"
                className="rounded-xl px-3 py-2 font-medium text-ink ring-1 ring-ink/15 transition-all hover:bg-ink/[0.04] hover:ring-ink/25"
              >
                Login
              </Link>
              <Link to="/register" className="btn">Sign up</Link>
            </div>
          )}

          {/* mobile hamburger */}
          <button
            type="button"
            aria-label="Toggle navigation menu"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
            className="ghost ml-1 h-10 w-10 !px-0 md:hidden"
          >
            {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>

        {/* mobile slide-down sheet */}
        {menuOpen && (
          <div className="border-t border-ink/[0.06] bg-white/90 backdrop-blur-xl md:hidden">
            <nav className="container-wide flex flex-col gap-1 py-4 text-base font-medium text-ink [&>a]:rounded-xl [&>a]:px-3 [&>a]:py-2.5 [&>a]:text-ink hover:[&>a]:bg-ink/[0.04]">
              {navLinks}
              {!user && (
                <div className="mt-2 flex flex-col gap-2 border-t border-ink/[0.06] pt-3">
                  <Link
                    to="/login"
                    onClick={() => setMenuOpen(false)}
                    className="rounded-xl px-3 py-2.5 text-center font-medium text-ink ring-1 ring-ink/15 transition-all hover:bg-ink/[0.04]"
                  >
                    Login
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)} className="btn justify-center">
                    Sign up
                  </Link>
                </div>
              )}
            </nav>
          </div>
        )}
      </header>

      {/* ------------------------------------------------------------- content */}
      <main className="container flex-1">
        <Outlet />
      </main>

      {/* -------------------------------------------------------------- footer */}
      <footer className="mt-16 bg-dark text-white/70">
        <div className="container-wide py-14">
          <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
            {/* brand column */}
            <div>
              <Link to="/" className="flex items-center gap-2.5">
                <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-gradient-from to-gradient-to text-white">
                  <House className="h-[18px] w-[18px]" />
                </span>
                <span className="font-display text-xl font-semibold tracking-tight text-white">
                  Really<span className="text-accent">.</span>Estate
                </span>
              </Link>
              <p className="mt-4 max-w-xs text-sm text-white/55">
                Editorial proptech — find the place that becomes your address. Vetted residences across the city.
              </p>
            </div>

            {/* explore */}
            <div>
              <h4 className="font-display text-sm font-semibold text-white">Explore</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><Link to="/catalog" className="text-white/65 transition-colors hover:text-white">Catalog</Link></li>
                <li><Link to="/auctions" className="text-white/65 transition-colors hover:text-white">Auctions</Link></li>
                {user && <li><Link to="/favorites" className="text-white/65 transition-colors hover:text-white">Favorites</Link></li>}
              </ul>
            </div>

            {/* account */}
            <div>
              <h4 className="font-display text-sm font-semibold text-white">Account</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                {user ? (
                  <>
                    <li><Link to="/dashboard" className="text-white/65 transition-colors hover:text-white">Dashboard</Link></li>
                    <li><Link to="/create" className="text-white/65 transition-colors hover:text-white">List property</Link></li>
                    <li><Link to="/profile" className="text-white/65 transition-colors hover:text-white">Profile</Link></li>
                  </>
                ) : (
                  <>
                    <li><Link to="/login" className="text-white/65 transition-colors hover:text-white">Login</Link></li>
                    <li><Link to="/register" className="text-white/65 transition-colors hover:text-white">Sign up</Link></li>
                  </>
                )}
              </ul>
            </div>

            {/* contact */}
            <div>
              <h4 className="font-display text-sm font-semibold text-white">Contact</h4>
              <ul className="mt-4 space-y-2.5 text-sm">
                <li><a href="mailto:hello@really.estate" className="text-white/65 transition-colors hover:text-white">hello@really.estate</a></li>
                <li className="text-white/55">Tashkent, Uzbekistan</li>
              </ul>
            </div>
          </div>

          {/* oversized wordmark sign-off + legal */}
          <div className="mt-12 border-t border-white/10 pt-8">
            <div className="font-display text-5xl font-semibold tracking-tight text-white/10 sm:text-7xl">
              Really.Estate
            </div>
            <div className="mt-6 flex flex-col gap-2 text-xs text-white/45 sm:flex-row sm:items-center sm:justify-between">
              <span>© {new Date().getFullYear()} Really Estate. All rights reserved.</span>
              <span className="flex gap-5">
                <a href="#" className="transition-colors hover:text-white/80">Privacy</a>
                <a href="#" className="transition-colors hover:text-white/80">Terms</a>
                <a href="#" className="transition-colors hover:text-white/80">Cookies</a>
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
