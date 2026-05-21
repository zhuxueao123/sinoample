import { PageShell } from "@/components/page-shell";
import { getSolutions } from "@/lib/api";

export default async function SolutionsPage() {
  const solutions = await getSolutions();

  return (
    <PageShell>
      <section className="page-title">
        <div className="container">
          <h1>Vending Solutions</h1>
          <p>
            Match vending machine configuration to operating location, customer
            traffic, product category, and service workflow.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container grid solutions">
          {solutions.map(({ icon: Icon, ...solution }) => (
            <article className="card solution-card" key={solution.slug}>
              <div className="solution-icon">
                <Icon size={23} aria-hidden="true" />
              </div>
              <h3>{solution.title}</h3>
              <p>{solution.description}</p>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
