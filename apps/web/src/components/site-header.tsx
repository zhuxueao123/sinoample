import Link from "next/link";
import Image from "next/image";
import { Mail, Send } from "lucide-react";

export function SiteHeader() {
  return (
    <header className="topbar">
      <nav className="container nav" aria-label="Primary navigation">
        <Link href="/" className="brand" aria-label="Sino Ample home">
          <Image
            className="brand-logo"
            src="/images/logo.png"
            alt="Sino Ample"
            width={1398}
            height={1016}
            priority
          />
        </Link>
        <div className="nav-links">
          <Link href="/products">Products</Link>
          <Link href="/solutions">Solutions</Link>
          <Link href="/about">About Us</Link>
          <Link href="/support">Support</Link>
          <Link href="/blog">Blog</Link>
          <Link href="/contact">Contact</Link>
        </div>
        <div className="nav-actions">
          <Link className="button secondary" href="/contact">
            <Mail size={17} aria-hidden="true" />
            Contact
          </Link>
          <Link className="button" href="/quote">
            <Send size={17} aria-hidden="true" />
            Get a Quote
          </Link>
        </div>
      </nav>
    </header>
  );
}
