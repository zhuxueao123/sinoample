import { PageShell } from "@/components/page-shell";
import { ProductsPageClient } from "@/components/products-page-client";

export default function ProductsPage() {
  return (
    <PageShell>
      <section className="page-title">
        <div className="container">
          <h1>Vending Machine Products</h1>
          <p>
            Explore core vending machine categories for distributors, operators,
            facilities, and OEM projects. Each product can be configured for
            payment method, capacity, cabinet layout, and branding requirements.
          </p>
        </div>
      </section>
      <ProductsPageClient />
    </PageShell>
  );
}
