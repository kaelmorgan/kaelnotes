import Link from "next/link";

const footerLinks = [
  { href: "/about", label: "About" },
  { href: "/faq", label: "FAQ" },
  { href: "/guides", label: "Guides" },
];

export function Footer() {
  return (
    <footer className="mt-16 border-t border-line">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-5 py-10 sm:flex-row sm:items-end sm:justify-between sm:px-8">
        <nav className="flex flex-wrap gap-x-6 gap-y-2 font-sans text-sm text-muted">
          {footerLinks.map((link) => (
            <Link key={link.href} href={link.href} className="hover:text-ink">
              {link.label}
            </Link>
          ))}
        </nav>
        <p className="font-sans text-xs tracking-wide text-muted">
          © 2026 Kael Notes. All rights reserved.
        </p>
      </div>
    </footer>
  );
}
