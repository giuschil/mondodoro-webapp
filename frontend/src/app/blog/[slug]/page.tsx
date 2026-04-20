import Link from 'next/link';
import Image from 'next/image';
import { notFound } from 'next/navigation';
import { Sparkles, ArrowLeft, Clock, ArrowRight } from 'lucide-react';
import { getPostBySlug, getAllPosts } from '@/lib/blog';
import { marked } from 'marked';
import Button from '@/components/ui/Button';

export async function generateStaticParams() {
  const posts = getAllPosts();
  return posts.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) return {};
  return {
    title: `${post.title} – ListDreams Blog`,
    description: post.excerpt,
  };
}

const CATEGORY_COLORS: Record<string, string> = {
  Guide: 'bg-blue-100 text-blue-700',
  Strategie: 'bg-purple-100 text-purple-700',
  Tendenze: 'bg-amber-100 text-amber-700',
};

export default function ArticlePage({ params }: { params: { slug: string } }) {
  const post = getPostBySlug(params.slug);
  if (!post) notFound();

  const allPosts = getAllPosts();
  const related = allPosts.filter((p) => p.slug !== post.slug).slice(0, 2);
  const html = marked(post.content) as string;

  return (
    <div className="min-h-screen bg-white">

      {/* Nav */}
      <header className="sticky top-0 z-50 bg-white/80 backdrop-blur border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link href="/" className="flex items-center gap-2">
              <Sparkles className="h-7 w-7 text-amber-500" />
              <span className="text-xl font-bold text-gray-900 tracking-tight">ListDreams</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6 text-sm text-gray-600">
              <Link href="/#come-funziona" className="hover:text-gray-900 transition-colors">Come funziona</Link>
              <Link href="/prezzi" className="hover:text-gray-900 transition-colors">Prezzi</Link>
              <Link href="/blog" className="text-amber-600 font-medium">Blog</Link>
              <Link href="/centro-aiuto" className="hover:text-gray-900 transition-colors">Aiuto</Link>
            </nav>
            <div className="flex items-center gap-3">
              <Link href="/login">
                <Button variant="ghost" size="sm">Accedi</Button>
              </Link>
              <Link href="/register">
                <Button size="sm">
                  Inizia gratis
                  <ArrowRight className="ml-1.5 h-4 w-4" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">

        {/* Back */}
        <Link href="/blog" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-700 transition-colors mb-10">
          <ArrowLeft className="h-4 w-4" />
          Tutti gli articoli
        </Link>

        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
              {post.category}
            </span>
            <span className="flex items-center gap-1 text-xs text-gray-400">
              <Clock className="h-3.5 w-3.5" />
              {post.readingTime} min di lettura
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-gray-900 leading-tight tracking-tight mb-4">
            {post.title}
          </h1>
          <p className="text-lg text-gray-500 leading-relaxed mb-6">
            {post.subtitle}
          </p>
          <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
            <div className="h-9 w-9 rounded-full bg-amber-100 flex items-center justify-center">
              <Sparkles className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-900">{post.author}</p>
              <p className="text-xs text-gray-400">
                {new Date(post.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          </div>
        </div>

        {/* Cover image */}
        <div className="relative h-64 sm:h-80 rounded-2xl overflow-hidden mb-10 bg-gray-100">
          <Image
            src={post.image}
            alt={post.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 768px"
            priority
          />
        </div>

        {/* Article body */}
        <article
          className="prose prose-gray prose-lg max-w-none
            prose-headings:font-bold prose-headings:text-gray-900 prose-headings:tracking-tight
            prose-h2:text-2xl prose-h2:mt-10 prose-h2:mb-4
            prose-h3:text-xl prose-h3:mt-8 prose-h3:mb-3
            prose-p:text-gray-600 prose-p:leading-relaxed
            prose-a:text-amber-600 prose-a:no-underline hover:prose-a:underline
            prose-ul:text-gray-600 prose-li:my-1
            prose-strong:text-gray-900"
          dangerouslySetInnerHTML={{ __html: html }}
        />

        {/* CTA */}
        <div className="mt-14 rounded-2xl bg-gradient-to-br from-amber-500 to-yellow-400 p-px shadow-lg shadow-amber-100">
          <div className="rounded-2xl bg-white px-8 py-8 text-center">
            <p className="text-sm font-semibold text-amber-600 uppercase tracking-widest mb-2">Prova ListDreams</p>
            <h3 className="text-xl font-bold text-gray-900 mb-2">Attiva la lista nozze digitale nella tua gioielleria</h3>
            <p className="text-gray-500 text-sm mb-6">Gratuito. Nessun costo fisso. Attivo in 2 minuti.</p>
            <Link href="/register?role=jeweler">
              <Button size="lg" className="shadow-md shadow-amber-100">
                Crea il tuo account gratuito
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </Link>
          </div>
        </div>

        {/* Related articles */}
        {related.length > 0 && (
          <div className="mt-16">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Continua a leggere</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
              {related.map((p) => (
                <Link key={p.slug} href={`/blog/${p.slug}`} className="group flex flex-col rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow">
                  <div className="relative h-40 bg-gray-100 overflow-hidden">
                    <Image
                      src={p.image}
                      alt={p.title}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, 50vw"
                    />
                  </div>
                  <div className="p-5 bg-white flex-1">
                    <p className="text-xs text-gray-400 mb-1 flex items-center gap-1">
                      <Clock className="h-3 w-3" />{p.readingTime} min
                    </p>
                    <h3 className="text-sm font-bold text-gray-900 leading-snug group-hover:text-amber-600 transition-colors line-clamp-2">
                      {p.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50 mt-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span className="font-semibold text-gray-700">ListDreams</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <Link href="/blog" className="hover:text-gray-900 transition-colors">Blog</Link>
            <Link href="/prezzi" className="hover:text-gray-900 transition-colors">Prezzi</Link>
            <Link href="/contattaci" className="hover:text-gray-900 transition-colors">Contattaci</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
