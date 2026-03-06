import { Link } from 'react-router-dom';
import { Shield } from 'lucide-react';

const links = [
  { label: 'Features', href: '#features' },
  { label: 'Learn', href: '#learn' },
  { label: 'Sign In', to: '/login' },
];

export function Footer() {
  const scrollTo = (href: string) => {
    const el = document.querySelector(href);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <footer className="border-t border-white/[0.06] py-12">
      <div className="mx-auto max-w-6xl px-4 sm:px-6">
        <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
          <div className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-[#00ffcc]" />
            <span className="font-semibold text-white">RiskRadar</span>
            <span className="text-sm text-[#8b949e]">
              — Cybersecurity for real people
            </span>
          </div>

          <div className="flex items-center gap-6">
            {links.map((link) =>
              'to' in link ? (
                <Link
                  key={link.label}
                  to={link.to!}
                  className="text-sm text-[#8b949e] transition-colors hover:text-white"
                >
                  {link.label}
                </Link>
              ) : (
                <button
                  key={link.label}
                  onClick={() => scrollTo(link.href!)}
                  className="text-sm text-[#8b949e] transition-colors hover:text-white"
                >
                  {link.label}
                </button>
              )
            )}
          </div>
        </div>

        <div className="mt-8 border-t border-white/[0.04] pt-6 text-center text-xs text-[#8b949e]">
          &copy; {new Date().getFullYear()} RiskRadar. Built as an educational
          cybersecurity project.
        </div>
      </div>
    </footer>
  );
}
