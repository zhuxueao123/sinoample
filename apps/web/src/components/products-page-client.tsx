"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ProductCategoryView, ProductView } from "@/lib/api";
import { getProductCategories, getProducts } from "@/lib/api";

export function ProductsPageClient() {
  const [categories, setCategories] = useState<ProductCategoryView[]>([]);
  const [products, setProducts] = useState<ProductView[]>([]);

  useEffect(() => {
    let cancelled = false;

    Promise.all([getProductCategories(), getProducts()]).then(([nextCategories, nextProducts]) => {
      if (cancelled) return;
      setCategories(nextCategories);
      setProducts(nextProducts);
    });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <>
      <section className="section">
        <div className="container">
          <div className="grid products">
            {categories.map((category) => (
              <article className="card" id={category.slug} key={category.slug}>
                <div className="product-visual">
                  <div className="machine" aria-hidden="true" />
                </div>
                <div className="card-body">
                  <h3>{category.name}</h3>
                  <p>{category.description}</p>
                  <div className="meta-row">
                    {category.tags.map((tag) => (
                      <span className="pill" key={tag}>
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </article>
            ))}
          </div>
        </div>
      </section>
      <section className="section alt">
        <div className="container">
          <div className="section-head">
            <h2>Featured product records</h2>
            <p>These pages establish the layout for product records synchronized from Strapi.</p>
          </div>
          <div className="grid products">
            {products.map((product) => (
              <Link
                className="card"
                key={`${product.categorySlug}-${product.slug}`}
                href={`/products/${product.categorySlug}/${product.slug}`}
              >
                <div className="product-visual">
                  {product.imageUrl ? (
                    <img src={product.imageUrl} alt={product.name} />
                  ) : (
                    <div className="machine" aria-hidden="true" />
                  )}
                </div>
                <div className="card-body">
                  <span className="pill">{product.category}</span>
                  <h3 style={{ marginTop: 18 }}>{product.name}</h3>
                  <p>{product.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
