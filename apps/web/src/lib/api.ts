import {
  blogPosts as mockBlogPosts,
  featuredProducts as mockProducts,
  productCategories as mockCategories,
  solutions as mockSolutions
} from "./data";

const apiBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL ?? "https://api.sinoample.shop";

type ApiList<T> = {
  data?: T[];
};

type ApiItem<T> = {
  data?: T;
};

export type ProductCategoryView = {
  name: string;
  slug: string;
  description: string;
  tags: string[];
};

export type ProductView = {
  name: string;
  slug: string;
  categorySlug: string;
  category: string;
  description: string;
  features: string[];
  specs: [string, string][];
};

export type BlogPostView = {
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  content?: string;
};

export async function getProductCategories(): Promise<ProductCategoryView[]> {
  const rows = await fetchList<Record<string, unknown>>("/api/product-categories");
  if (!rows.length) return mockCategories;

  return rows.map((row) => ({
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    description: String(row.description ?? ""),
    tags: []
  }));
}

export async function getProducts(): Promise<ProductView[]> {
  const rows = await fetchList<Record<string, unknown>>("/api/products");
  if (!rows.length) return mockProducts.map((product) => ({
    ...product,
    specs: product.specs.map(([label, value]) => [label, value] as [string, string])
  }));
  return rows.map(mapProduct);
}

export async function getProduct(categorySlug: string, productSlug: string): Promise<ProductView | null> {
  const row = await fetchItem<Record<string, unknown>>(`/api/products/${categorySlug}/${productSlug}`);
  if (row) return mapProduct(row);

  const product = mockProducts.find(
    (item) => item.categorySlug === categorySlug && item.slug === productSlug
  );
  return product
    ? { ...product, specs: product.specs.map(([label, value]) => [label, value] as [string, string]) }
    : null;
}

export async function getBlogPosts(): Promise<BlogPostView[]> {
  const rows = await fetchList<Record<string, unknown>>("/api/blog-posts");
  if (!rows.length) return mockBlogPosts;
  return rows.map(mapBlogPost);
}

export async function getBlogPost(slug: string): Promise<BlogPostView | null> {
  const row = await fetchItem<Record<string, unknown>>(`/api/blog-posts/${slug}`);
  if (row) return mapBlogPost(row);
  return mockBlogPosts.find((post) => post.slug === slug) ?? null;
}

export async function getSolutions() {
  const rows = await fetchList<Record<string, unknown>>("/api/solutions");
  if (!rows.length) return mockSolutions;

  return rows.map((row) => ({
    title: String(row.title ?? ""),
    slug: String(row.slug ?? ""),
    description: String(row.short_description ?? row.overview ?? ""),
    icon: mockSolutions[0].icon
  }));
}

async function fetchList<T>(path: string): Promise<T[]> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, { next: { revalidate: 300 } });
    if (!response.ok) return [];
    const json = (await response.json()) as ApiList<T>;
    return json.data ?? [];
  } catch {
    return [];
  }
}

async function fetchItem<T>(path: string): Promise<T | null> {
  try {
    const response = await fetch(`${apiBaseUrl}${path}`, { next: { revalidate: 300 } });
    if (!response.ok) return null;
    const json = (await response.json()) as ApiItem<T>;
    return json.data ?? null;
  } catch {
    return null;
  }
}

function mapProduct(row: Record<string, unknown>): ProductView {
  const features = parseJson<string[]>(row.key_features_json, []);
  const specs = parseJson<Array<[string, string]>>(row.specifications_json, []);

  return {
    name: String(row.name ?? ""),
    slug: String(row.slug ?? ""),
    categorySlug: String(row.category_slug ?? ""),
    category: String(row.category_slug ?? "Product"),
    description: String(row.short_description ?? row.overview ?? ""),
    features,
    specs
  };
}

function mapBlogPost(row: Record<string, unknown>): BlogPostView {
  return {
    title: String(row.title ?? ""),
    slug: String(row.slug ?? ""),
    excerpt: String(row.excerpt ?? ""),
    category: String(row.category_slug ?? "Insights"),
    content: String(row.content ?? "")
  };
}

function parseJson<T>(value: unknown, fallback: T): T {
  if (!value) return fallback;
  if (typeof value !== "string") return value as T;
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}
