import { PageShell } from "@/components/page-shell";

const items = [
  "Service & Warranty",
  "Shipping & Installation",
  "Payment System Compatibility",
  "Customization Process",
  "FAQ"
];

export default function SupportPage() {
  return (
    <PageShell>
      <section className="page-title">
        <div className="container">
          <h1>Support</h1>
          <p>
            Service information for buyers evaluating warranty, shipping,
            payment compatibility, and customization workflows.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container grid products">
          {items.map((item) => (
            <article className="card" key={item}>
              <div className="card-body">
                <h3>{item}</h3>
                <p>
                  This section will be editable in Strapi and visible on the
                  public website after synchronization to D1.
                </p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
