import { PageShell } from "@/components/page-shell";
import { ProductDetailClient } from "@/components/product-detail-client";
import { getProducts } from "@/lib/api";

type PageProps = {
  params: Promise<{
    categorySlug: string;
    productSlug: string;
  }>;
};

export async function generateStaticParams() {
  const products = await getProducts();
  return products.map((product) => ({
    categorySlug: product.categorySlug,
    productSlug: product.slug
  }));
}

export default async function ProductDetailPage({ params }: PageProps) {
  const { categorySlug, productSlug } = await params;

  return (
    <PageShell>
      <ProductDetailClient categorySlug={categorySlug} productSlug={productSlug} />
    </PageShell>
  );
}
