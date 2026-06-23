import { PageShell } from "@/components/page-shell";
import { getSiteSettings } from "@/lib/api";

export default async function AboutPage() {
  const settings = await getSiteSettings();

  return (
    <PageShell>
      <section className="page-title">
        <div className="container">
          <h1>{settings.aboutPageTitle}</h1>
          <p>{settings.aboutPageIntro}</p>
        </div>
      </section>
      <section className="section">
        <div className="container grid products">
          {settings.aboutSections.map((section) => (
            <article className="card" key={`${section.title}-${section.body}`}>
              <div className="card-body">
                <h3>{section.title}</h3>
                <p>{section.body}</p>
              </div>
            </article>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
