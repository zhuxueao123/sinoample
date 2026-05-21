import Link from "next/link";
import { PageShell } from "@/components/page-shell";
import { getBlogPosts } from "@/lib/api";

export default async function BlogPage() {
  const blogPosts = await getBlogPosts();

  return (
    <PageShell>
      <section className="page-title">
        <div className="container">
          <h1>Blog & Insights</h1>
          <p>
            Practical buying guides and vending industry insights for overseas
            operators, distributors, and enterprise buyers.
          </p>
        </div>
      </section>
      <section className="section">
        <div className="container grid blog">
          {blogPosts.map((post) => (
            <Link className="card" key={post.slug} href={`/blog/${post.slug}`}>
              <div className="card-body">
                <span className="pill">{post.category}</span>
                <h3 style={{ marginTop: 18 }}>{post.title}</h3>
                <p>{post.excerpt}</p>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </PageShell>
  );
}
