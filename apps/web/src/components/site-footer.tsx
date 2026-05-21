import Link from "next/link";

export function SiteFooter() {
  return (
    <footer className="footer">
      <div className="container footer-grid">
        <div>
          <h3>Sino Ample</h3>
          <p>
            Smart vending machines and B2B vending solutions for operators,
            distributors, and enterprise locations worldwide.
          </p>
        </div>
        <div>
          <h4>Products</h4>
          <div className="footer-links">
            <Link href="/products">Product Categories</Link>
            <Link href="/products/combo-vending-machines/sa-combo-42-smart-combo-vendor">
              Featured Product
            </Link>
            <Link href="/quote">Get a Quote</Link>
          </div>
        </div>
        <div>
          <h4>Company</h4>
          <div className="footer-links">
            <Link href="/about">About Us</Link>
            <Link href="/solutions">Solutions</Link>
            <Link href="/blog">Blog</Link>
          </div>
        </div>
        <div>
          <h4>Support</h4>
          <div className="footer-links">
            <Link href="/support">Service & Warranty</Link>
            <Link href="/contact">Contact Us</Link>
            <Link href="/privacy">Privacy Policy</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
