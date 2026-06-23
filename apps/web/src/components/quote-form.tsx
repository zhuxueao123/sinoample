"use client";

import Script from "next/script";
import { FormEvent, useEffect, useState } from "react";
import { Send } from "lucide-react";
import { countries, productCategories } from "@/lib/data";
import { getProductCategories, type ProductCategoryView } from "@/lib/api";

export function QuoteForm({ compact = false }: { compact?: boolean }) {
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [message, setMessage] = useState("");
  const [categories, setCategories] = useState<ProductCategoryView[]>([]);

  useEffect(() => {
    let cancelled = false;

    getProductCategories().then((nextCategories) => {
      if (cancelled) return;
      setCategories(nextCategories);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formElement = event.currentTarget;
    setStatus("sending");
    setMessage("");

    const form = new FormData(formElement);
    const payload = {
      sourcePage: window.location.pathname,
      sourceType: "website_form",
      name: String(form.get("name") ?? ""),
      company: String(form.get("company") ?? ""),
      email: String(form.get("email") ?? ""),
      phone: String(form.get("phone") ?? ""),
      whatsapp: String(form.get("phone") ?? ""),
      country: String(form.get("country") ?? ""),
      productName: String(form.get("productType") ?? ""),
      quantity: String(form.get("quantity") ?? ""),
      message: String(form.get("message") ?? ""),
      privacyAccepted: form.get("privacy") === "on",
      turnstileToken: String(form.get("cf-turnstile-response") ?? "")
    };

    try {
      const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.sinoample.shop";
      const response = await fetch(`${apiBaseUrl}/api/inquiries`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (!response.ok) {
        throw new Error("Inquiry submission failed");
      }

      formElement.reset();
      setStatus("success");
      setMessage("Your inquiry has been submitted. Our sales team will contact you soon.");
    } catch {
      setStatus("error");
      setMessage("Submission failed. Please try again or contact sales@sinoample.shop.");
    }
  }

  return (
    <form className={`panel quote-form${compact ? " compact" : ""}`} onSubmit={handleSubmit} aria-label="Quote request form">
      {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
        <Script src="https://challenges.cloudflare.com/turnstile/v0/api.js" async defer />
      ) : null}
      <div className="form-grid">
        <div className="field">
          <label htmlFor="name">Name</label>
          <input id="name" name="name" required placeholder="Your name" />
        </div>
        <div className="field">
          <label htmlFor="company">Company</label>
          <input id="company" name="company" placeholder="Company name" />
        </div>
        <div className="field">
          <label htmlFor="email">Email</label>
          <input id="email" name="email" inputMode="email" required placeholder="name@company.com" />
        </div>
        <div className="field">
          <label htmlFor="phone">Phone / WhatsApp</label>
          <input id="phone" name="phone" placeholder="+1 000 000 0000" />
        </div>
        <div className="field">
          <label htmlFor="country">Country / Region</label>
          <select id="country" name="country" required defaultValue="">
            <option value="" disabled>
              Select country
            </option>
            {countries.map((country) => (
              <option key={country}>{country}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="productType">Interested Product</label>
          <select id="productType" name="productType" required defaultValue="">
            <option value="" disabled>
              Select product type
            </option>
            {(categories.length ? categories : productCategories).map((category) => (
              <option key={category.slug}>{category.name}</option>
            ))}
          </select>
        </div>
        <div className="field">
          <label htmlFor="quantity">Estimated Quantity</label>
          <input id="quantity" name="quantity" placeholder="e.g. 10 units" />
        </div>
        <div className="field">
          <label htmlFor="timeline">Timeline</label>
          <input id="timeline" name="timeline" placeholder="e.g. within 3 months" />
        </div>
        <div className="field full">
          <label htmlFor="message">Message</label>
          <textarea
            id="message"
            name="message"
            placeholder="Tell us about your locations, products, payment needs, or customization requirements."
          />
        </div>
        <div className="field full">
          <label className="checkbox-field">
            <input type="checkbox" name="privacy" required />
            <span>I agree to the Privacy Policy and allow Sino Ample to contact me about this inquiry.</span>
          </label>
        </div>
        {process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY ? (
          <div className="field full">
            <div
              className="cf-turnstile"
              data-sitekey={process.env.NEXT_PUBLIC_TURNSTILE_SITE_KEY}
            />
          </div>
        ) : null}
      </div>
      <button
        className="button accent"
        type="submit"
        disabled={status === "sending"}
        style={{ marginTop: compact ? 18 : 24 }}
      >
        <Send size={17} aria-hidden="true" />
        {status === "sending" ? "Submitting..." : "Submit Inquiry"}
      </button>
      {message ? (
        <p
          role="status"
          style={{
            margin: "14px 0 0",
            color: status === "error" ? "#9f2d20" : "#14725a",
            fontWeight: 700
          }}
        >
          {message}
        </p>
      ) : null}
    </form>
  );
}
