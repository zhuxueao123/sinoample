import { PageShell } from "@/components/page-shell";

export default function AboutPage() {
  return (
    <PageShell>
      <section className="page-title">
        <div className="container">
          <h1>About Sino Ample</h1>
          <p>
            Sino Ample is planned as a global B2B vending machine supplier
            website for product presentation, company credibility, and qualified
            sales inquiries.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container grid products">
          {["Company Profile", "Production Capacity", "Quality Control"].map((title) => (
            <article className="card" key={title}>
              <div className="card-body">
                <h3>{title}</h3>
                <p>
                  This content will be maintained in Strapi and published to the
                  front-end read database for fast global access.
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
