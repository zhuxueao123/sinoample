import { notFound } from "next/navigation";
import { PageShell } from "@/components/page-shell";
import { getBlogPost, getBlogPosts } from "@/lib/api";

type PageProps = {
  params: Promise<{
    slug: string;
  }>;
};

export async function generateStaticParams() {
  const blogPosts = await getBlogPosts();
  return blogPosts.map((post) => ({ slug: post.slug }));
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  const post = await getBlogPost(slug);

  if (!post) {
    notFound();
  }

  return (
    <PageShell>
      <section className="page-title">
        <div className="container">
          <span className="pill">{post.category}</span>
          <h1 style={{ marginTop: 18 }}>{post.title}</h1>
          <p>{post.excerpt}</p>
        </div>
      </section>
      <section className="section">
        <div className="container">
          <article className="panel" style={{ maxWidth: 820 }}>
            {post.content ? <p>{post.content}</p> : null}
            {!post.content ? (
              <>
                <p>
                  This is a CMS-ready article page. In production, the article body
                  will be maintained in Strapi, synchronized to D1, and rendered here
                  with SEO metadata.
                </p>
                <p>
                  The first implementation keeps this page lightweight while we build
                  the content model, synchronization pipeline, and Cloudflare
                  deployment workflow.
                </p>
              </>
            ) : null}
          </article>
        </div>
      </section>
    </PageShell>
  );
}
