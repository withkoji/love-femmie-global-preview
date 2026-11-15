import { useState } from 'react';
import { Link, NavLink, Outlet, useNavigate } from 'react-router-dom';
import { Heart, Menu, Search, X, Globe } from 'lucide-react';
import { useAuth, loginWithRedirect, logout } from 'zitejs/auth';
import { Button } from '@project/components/ui/button';
import { Input } from '@project/components/ui/input';
import { cn } from '@project/components/lib/utils';
import Footer from './Footer';

const NAV = [['/academy', 'Academy'], ['/recipes', 'Recipes'], ['/tv', 'FEMMIE TV'], ['/kids', 'Kids'], ['/community', 'Community'], ['/blog', 'Journal'], ['/membership', 'Membership']];

export function Logo() {
  return (
    <Link to="/" className="flex items-center gap-2">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-primary text-primary-foreground shadow-md"><Heart className="h-4 w-4 fill-current" /></span>
      <span className="leading-none"><span className="font-display text-xl font-bold tracking-wide">LOVE FEMMIE</span><span className="block text-[10px] uppercase tracking-[0.3em] text-gold">Global</span></span>
    </Link>
  );
}

export default function Layout() {
  const { user } = useAuth();
  const nav = useNavigate();
  const [open, setOpen] = useState(false);
  const [q, setQ] = useState('');
  const search = (e: React.FormEvent) => { e.preventDefault(); nav(`/academy?q=${encodeURIComponent(q)}`); setOpen(false); };
  return (
    <div className="min-h-screen flex flex-col">
      <header className="sticky top-0 z-40 border-b bg-background/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-7xl items-center gap-4 px-4">
          <Logo />
          <nav className="ml-6 hidden gap-1 lg:flex">
            {NAV.map(([to, l]) => <NavLink key={to} to={to} className={({ isActive }) => cn('rounded-full px-3 py-1.5 text-sm font-medium transition-colors hover:bg-accent', isActive && 'bg-accent text-accent-foreground')}>{l}</NavLink>)}
          </nav>
          <form onSubmit={search} className="ml-auto hidden md:block relative w-56">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses" className="rounded-full pl-9 bg-muted border-0" />
          </form>
          <span className="hidden xl:flex items-center gap-1 text-sm text-muted-foreground"><Globe className="h-4 w-4" />EN</span>
          <div className="hidden md:flex gap-2 ml-auto md:ml-0">
            {user ? (<><Button variant="ghost" asChild><Link to="/account">My FEMMIE</Link></Button><Button variant="outline" onClick={() => logout()}>Sign out</Button></>)
              : (<><Button variant="ghost" onClick={() => loginWithRedirect()}>Log in</Button><Button asChild className="rounded-full"><Link to="/membership">Join now</Link></Button></>)}
          </div>
          <Button variant="ghost" size="icon" className="ml-auto md:hidden" onClick={() => setOpen(!open)}>{open ? <X /> : <Menu />}</Button>
        </div>
        {open && (
          <div className="border-t px-4 py-4 space-y-2 md:hidden">
            <form onSubmit={search}><Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search courses" /></form>
            {NAV.map(([to, l]) => <Link key={to} to={to} onClick={() => setOpen(false)} className="block py-2 font-medium">{l}</Link>)}
            {user ? <><Link to="/account" onClick={() => setOpen(false)} className="block py-2 font-medium">My FEMMIE</Link><Button variant="outline" className="w-full" onClick={() => logout()}>Sign out</Button></>
              : <Button className="w-full" onClick={() => loginWithRedirect()}>Log in / Sign up</Button>}
          </div>
        )}
      </header>
      <main className="flex-1"><Outlet /></main>
      <Footer />
    </div>
  );
}
