import { Mail, MapPin, MessageCircle } from "lucide-react";
import { QuoteForm } from "@/components/quote-form";
import { PageShell } from "@/components/page-shell";
import { getSiteSettings } from "@/lib/api";

export default async function ContactPage() {
  const settings = await getSiteSettings();

  return (
    <PageShell>
      <section className="page-title">
        <div className="container">
          <h1>{settings.contactPageTitle}</h1>
          <p>{settings.contactPageIntro}</p>
        </div>
      </section>
      <section className="section">
        <div className="container quote-layout">
          <div className="panel">
            <h2>{settings.salesContactTitle}</h2>
            <div className="spec-list">
              <div className="spec-row">
                <span>
                  <Mail size={17} aria-hidden="true" /> Email
                </span>
                <span>{settings.contactEmail}</span>
              </div>
              <div className="spec-row">
                <span>
                  <MessageCircle size={17} aria-hidden="true" /> WhatsApp
                </span>
                <span>{settings.whatsapp}</span>
              </div>
              <div className="spec-row">
                <span>
                  <MapPin size={17} aria-hidden="true" /> Address
                </span>
                <span>{settings.address}</span>
              </div>
            </div>
          </div>
          <QuoteForm />
        </div>
      </section>
    </PageShell>
  );
}
