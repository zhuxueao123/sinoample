"use client";

import { useEffect, useState } from "react";
import { getSiteSettings, type SiteSettingsView } from "@/lib/api";

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

export function AboutPageContent() {
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
          <h1>About Sino Ample</h1>
          <div dangerouslySetInnerHTML={{ __html: settings.aboutPageContent }} />
        </div>
      </section>
    </>
  );
}
