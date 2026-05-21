import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { QuoteForm } from "@/components/quote-form";
import { getProduct, getProducts } from "@/lib/api";

type PageProps = {
  params: Promise<{
    categorySlug: string;
    productSlug: string;
  }>;
};

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    categorySlug: product.categorySlug,
    productSlug: product.slug
  }));
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { categorySlug, productSlug } = await params;
  const product = await getProduct(categorySlug, productSlug);

  if (!product) {
    notFound();
  }

  return (
    <PageShell>
      <section className="page-title">
        <div className="container">
          <span className="pill">{product.category}</span>
          <h1 style={{ marginTop: 18 }}>{product.name}</h1>
          <p>{product.description}</p>
        </div>
      </section>
      <section className="section">
        <div className="container detail-layout">
          <article className="panel">
            <h2>Key Features</h2>
            <div className="meta-row" style={{ marginBottom: 28 }}>
              {product.features.map((feature) => (
                <span className="pill" key={feature}>
                  {feature}
                </span>
              ))}
            </div>
            <h2>Specifications</h2>
            <div className="spec-list">
              {product.specs.map(([label, value]) => (
                <div className="spec-row" key={label}>
                  <span>{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
          </article>
          <aside>
            <QuoteForm compact />
          </aside>
        </div>
      </section>
    </PageShell>
  );
}
