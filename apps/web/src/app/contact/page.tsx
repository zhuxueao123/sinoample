import { Mail, MapPin, MessageCircle } from "lucide-react";
import { QuoteForm } from "@/components/quote-form";
import { PageShell } from "@/components/page-shell";

export default function ContactPage() {
  return (
    <PageShell>
      <section className="page-title">
        <div className="container">
          <h1>Contact Us</h1>
          <p>
            Send your project information and our sales team will contact you
            with product recommendations and next steps.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container quote-layout">
          <div className="panel">
            <h2>Sales Contact</h2>
            <div className="spec-list">
              <div className="spec-row">
                <span>
                  <Mail size={17} aria-hidden="true" /> Email
                </span>
                <span>sales@sinoample.shop</span>
              </div>
              <div className="spec-row">
                <span>
                  <MessageCircle size={17} aria-hidden="true" /> WhatsApp
                </span>
                <span>To be configured</span>
              </div>
              <div className="spec-row">
                <span>
                  <MapPin size={17} aria-hidden="true" /> Address
                </span>
                <span>Company address to be confirmed</span>
              </div>
            </div>
          </div>
          <QuoteForm />
        </div>
      </section>
    </PageShell>
  );
}
