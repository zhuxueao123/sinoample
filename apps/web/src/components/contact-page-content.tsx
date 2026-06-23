"use client";

import { useEffect, useState } from "react";
import { Mail, MapPin, MessageCircle } from "lucide-react";
import { getSiteSettings, type SiteSettingsView } from "@/lib/api";
import { QuoteForm } from "@/components/quote-form";

const fallbackSettings: SiteSettingsView = {
  aboutPageContent:
    "<p>Sino Ample is planned as a global B2B vending machine supplier website for product presentation, company credibility, and qualified sales inquiries.</p>",
  contactPageTitle: "Contact Us",
  contactPageIntro:
    "Send your project information and our sales team will contact you with product recommendations and next steps.",
  salesContactTitle: "Sales Contact",
  contactEmail: "sales@sinoample.shop",
  whatsapp: "To be configured",
  address: "Company address to be confirmed",
};

export function ContactPageContent() {
  const [settings, setSettings] = useState<SiteSettingsView>(fallbackSettings);

  useEffect(() => {
    let cancelled = false;

    getSiteSettings().then((nextSettings) => {
      if (cancelled) return;
      setSettings(nextSettings);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
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
    </>
  );
}
