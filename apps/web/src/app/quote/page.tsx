import { QuoteForm } from "@/components/quote-form";
import { PageShell } from "@/components/page-shell";

export default function QuotePage() {
  return (
    <PageShell>
      <section className="page-title">
        <div className="container">
          <h1>Get a Quote</h1>
          <p>
            Share your product interest, location, quantity, and customization
            requirements. The right sales representative will follow up offline.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container quote-layout">
          <div className="panel">
            <h2>What happens next</h2>
            <p>
              Your inquiry will be routed by country or region, saved in our lead
              database, and sent to the responsible sales team through Zoho Mail.
            </p>
            <div className="spec-list">
              <div className="spec-row">
                <span>Step 1</span>
                <span>Submit your requirements</span>
              </div>
              <div className="spec-row">
                <span>Step 2</span>
                <span>Sales reviews product fit and quantity</span>
              </div>
              <div className="spec-row">
                <span>Step 3</span>
                <span>Offline quotation and order discussion</span>
              </div>
            </div>
          </div>
          <QuoteForm />
        </div>
      </section>
    </PageShell>
  );
}
