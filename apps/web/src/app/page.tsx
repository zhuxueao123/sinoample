import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, Globe2, PackageCheck, ShieldCheck } from "lucide-react";
import { PageShell } from "@/components/page-shell";
import { getBlogPosts, getProductCategories, getProducts, getSolutions } from "@/lib/api";

export default async function HomePage() {
  const [productCategories, featuredProducts, solutions, blogPosts] = await Promise.all([
    getProductCategories(),
    getProducts(),
    getSolutions(),
    getBlogPosts()
  ]);

  return (
    <PageShell>
      <section className="hero">
        <div className="hero-media">
          <Image
            src="/images/hero-vending-showroom.png"
            alt="Smart vending machines in a modern showroom"
            fill
            priority
            sizes="100vw"
          />
        </div>
        <div className="container hero-content">
          <div className="hero-copy">
            <p className="eyebrow">Global B2B vending machine supplier</p>
            <h1>Smart Vending Machines for Global Businesses</h1>
            <p>
              Sino Ample supplies connected vending machines, OEM customization,
              and deployment-ready solutions for operators, distributors, and
              enterprise locations worldwide.
            </p>
            <div className="hero-actions">
              <Link className="button accent" href="/quote">
                Get a Quote
                <ArrowRight size={17} aria-hidden="true" />
              </Link>
              <Link className="button secondary" href="/products">
                View Products
              </Link>
            </div>
            <div className="hero-metrics" aria-label="Company highlights">
              <div className="hero-metric">
                <strong>OEM</strong>
                <span>Custom machine and branding support</span>
              </div>
              <div className="hero-metric">
                <strong>24/7</strong>
                <span>Unattended retail use cases</span>
              </div>
              <div className="hero-metric">
                <strong>Global</strong>
                <span>Export-ready configuration support</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="section-head">
            <h2>Product categories for commercial vending projects</h2>
            <p>
              Start with the machine category, then configure capacity, payment,
              network, branding, and cabinet layout for your market.
            </p>
          </div>
          <div className="grid products">
            {productCategories.map((category) => (
              <Link className="card" key={category.slug} href={`/products#${category.slug}`}>
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
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Featured machines ready for B2B discussion</h2>
            <p>
              Example product records for the first build. These will be managed
              from Strapi and synchronized to D1 later.
            </p>
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
                  <div className="meta-row">
                    {product.features.map((feature) => (
                      <span className="pill" key={feature}>
                        {feature}
                      </span>
                    ))}
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section feature-band">
        <div className="container">
          <div className="section-head">
            <h2>Built for buyers who need reliable supply, not a shopping cart</h2>
            <p>
              The website is designed to capture project requirements and route
              qualified leads to the right sales team.
            </p>
          </div>
          <div className="feature-list">
            {[
              [Globe2, "Export Support", "Configuration and sales follow-up for international buyers."],
              [PackageCheck, "Flexible Product Mix", "Machine categories for drinks, snacks, coffee, and fresh food."],
              [BadgeCheck, "OEM / ODM", "Cabinet branding, payment integration, and category adaptation."],
              [ShieldCheck, "Service Focus", "Warranty, shipping, and installation information for B2B buyers."]
            ].map(([Icon, title, text]) => (
              <div className="feature-item" key={title as string}>
                <Icon size={26} aria-hidden="true" />
                <h3>{title as string}</h3>
                <p>{text as string}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section alt">
        <div className="container">
          <div className="section-head">
            <h2>Solutions by location and business model</h2>
            <p>
              Help buyers understand which machine types fit their operating
              environment before they contact sales.
            </p>
          </div>
          <div className="grid solutions">
            {solutions.slice(0, 6).map(({ icon: Icon, ...solution }) => (
              <Link className="card solution-card" key={solution.slug} href="/solutions">
                <div className="solution-icon">
                  <Icon size={23} aria-hidden="true" />
                </div>
                <h3>{solution.title}</h3>
                <p>{solution.description}</p>
              </Link>
            ))}
          </div>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="section-head">
            <h2>Insights for vending operators and buyers</h2>
            <p>
              SEO-ready content will be maintained in Strapi and published to
              the Cloudflare front-end read database.
            </p>
          </div>
          <div className="grid blog">
            {blogPosts.map((post) => (
              <Link className="card" key={post.slug} href={`/blog/${post.slug}`}>
                <div className="card-body">
                  <span className="pill">{post.category}</span>
                  <h3 style={{ marginTop: 18 }}>{post.title}</h3>
                  <p>{post.excerpt}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </PageShell>
  );
}
