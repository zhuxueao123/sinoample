"use client";

import { useEffect, useState } from "react";
import { QuoteForm } from "@/components/quote-form";
import type { ProductView } from "@/lib/api";
import { getProduct } from "@/lib/api";

type ProductDetailClientProps = {
  categorySlug: string;
  productSlug: string;
};

export function ProductDetailClient({ categorySlug, productSlug }: ProductDetailClientProps) {
  const [product, setProduct] = useState<ProductView | null>(null);

  useEffect(() => {
    let cancelled = false;
    getProduct(categorySlug, productSlug).then((nextProduct) => {
      if (cancelled) return;
      setProduct(nextProduct);
    });

    return () => {
      cancelled = true;
    };
  }, [categorySlug, productSlug]);

  if (!product) {
    return (
      <section className="section">
        <div className="container">
          <div className="panel">Loading product data...</div>
        </div>
      </section>
    );
  }

  const renderedSpecLabels = new Set(
    [
      product.modelNumber ? "model no." : "",
      product.delivery ? "delivery" : "",
      product.minimumOrderQuantity ? "minimum order quantity" : "",
      product.supplyAbility ? "supply ability" : "",
      product.countryOfOrigin ? "country of origin" : "",
      product.stockTime ? "stock time" : ""
    ]
      .filter(Boolean)
      .map((item) => item.toLowerCase())
  );
  const extraSpecs = product.specs.filter(([label]) => !renderedSpecLabels.has(String(label).trim().toLowerCase()));

  return (
    <>
      <section className="page-title">
        <div className="container">
          <span className="pill">{product.category}</span>
          <h1 style={{ marginTop: 18 }}>{product.name}</h1>
          <p>{product.description}</p>
        </div>
      </section>
      <section className="section">
        <div className="container detail-layout">
          <article className="panel">
            {product.imageUrl ? (
              <div className="detail-media">
                <img src={product.imageUrl} alt={product.name} />
              </div>
            ) : null}
            <h2>Key Features</h2>
            <div className="meta-row" style={{ marginBottom: 28 }}>
              {product.features.map((feature) => (
                <span className="pill" key={feature}>
                  {feature}
                </span>
              ))}
            </div>
            <h2>Specifications</h2>
            <div className="spec-list">
              {product.modelNumber ? (
                <div className="spec-row">
                  <span>Model NO.</span>
                  <span>{product.modelNumber}</span>
                </div>
              ) : null}
              {product.delivery ? (
                <div className="spec-row">
                  <span>Delivery</span>
                  <span>{product.delivery}</span>
                </div>
              ) : null}
              {product.minimumOrderQuantity ? (
                <div className="spec-row">
                  <span>Minimum order quantity</span>
                  <span>{product.minimumOrderQuantity}</span>
                </div>
              ) : null}
              {product.supplyAbility ? (
                <div className="spec-row">
                  <span>Supply Ability</span>
                  <span>{product.supplyAbility}</span>
                </div>
              ) : null}
              {product.countryOfOrigin ? (
                <div className="spec-row">
                  <span>Country of Origin</span>
                  <span>{product.countryOfOrigin}</span>
                </div>
              ) : null}
              {product.stockTime ? (
                <div className="spec-row">
                  <span>Stock Time</span>
                  <span>{product.stockTime}</span>
                </div>
              ) : null}
              {extraSpecs.map(([label, value]) => (
                <div className="spec-row" key={label}>
                  <span>{label}</span>
                  <span>{value}</span>
                </div>
              ))}
            </div>
            {product.videoUrl ? (
              <>
                <div className="detail-media">
                  <video controls preload="metadata" src={product.videoUrl} />
                </div>
              </>
            ) : null}
            {product.galleryImages.length ? (
              <>
                <div className="gallery-grid">
                  {product.galleryImages.map((imageUrl) => (
                    <img src={imageUrl} alt={product.name} key={imageUrl} />
                  ))}
                </div>
              </>
            ) : null}
          </article>
          <aside className="detail-inquiry">
            <QuoteForm compact />
          </aside>
        </div>
      </section>
    </>
  );
}
