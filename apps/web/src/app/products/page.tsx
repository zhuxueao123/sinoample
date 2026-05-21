import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { getProductCategories, getProducts } from "@/lib/api";

export default async function ProductsPage() {
  const [productCategories, featuredProducts] = await Promise.all([
    getProductCategories(),
    getProducts()
  ]);

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
      <section className="section">
        <div className="container">
          <div className="grid products">
            {productCategories.map((category) => (
              <article className="card" id={category.slug} key={category.slug}>
                <div className="product-visual">
                  <div className="machine" aria-hidden="true" />
                </div>
                <div className="card-body">
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <div className="meta-row">
                    {category.tags.map((tag) => (
                      <span className="pill" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section alt">
        <div className="container">
          <div className="section-head">
            <h2>Featured product records</h2>
            <p>These pages establish the layout for product records synchronized from Strapi.</p>
          </div>
          <div className="grid products">
            {featuredProducts.map((product) => (
              <Link
                className="card"
                key={product.slug}
                href={`/products/${product.categorySlug}/${product.slug}`}
              >
                <div className="card-body">
                  <span className="pill">{product.category}</span>
                  <h3 style={{ marginTop: 18 }}>{product.name}</h3>
                  <p>{product.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
