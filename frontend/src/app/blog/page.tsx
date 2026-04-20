import Link from 'next/link';
import Image from 'next/image';
import { Sparkles, ArrowRight, Clock, Tag } from 'lucide-react';
import { getAllPosts } from '@/lib/blog';
import Button from '@/components/ui/Button';

export const metadata = {
  title: 'Blog – ListDreams',
  description: 'Guide, strategie e tendenze per gioiellerie italiane che vogliono crescere con le liste nozze digitali.',
};

const CATEGORY_COLORS: Record<string, string> = {
  Guide: 'bg-blue-100 text-blue-700',
  Strategie: 'bg-purple-100 text-purple-700',
  Tendenze: 'bg-amber-100 text-amber-700',
};

export default function BlogPage() {
  const posts = getAllPosts();
  const [featured, ...rest] = posts;

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

      {/* Hero */}
      <section className="bg-gradient-to-b from-amber-50 to-white pt-16 pb-10 px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-sm font-semibold text-amber-600 uppercase tracking-widest mb-3">Blog</p>
        <h1 className="text-4xl sm:text-5xl font-extrabold text-gray-900 tracking-tight mb-4">
          Risorse per gioiellerie
        </h1>
        <p className="text-lg text-gray-500 max-w-xl mx-auto">
          Guide pratiche, strategie di crescita e tendenze del settore orafo italiano.
        </p>
      </section>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">

        {/* Featured article */}
        {featured && (
          <Link href={`/blog/${featured.slug}`} className="group block mb-16">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-0 rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
              <div className="relative h-64 lg:h-auto min-h-[320px] bg-gray-100">
                <Image
                  src={featured.image}
                  alt={featured.title}
                  fill
                  className="object-cover group-hover:scale-[1.02] transition-transform duration-500"
                  sizes="(max-width: 1024px) 100vw, 50vw"
                />
              </div>
              <div className="flex flex-col justify-center p-8 lg:p-12 bg-white">
                <div className="flex items-center gap-3 mb-4">
                  <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[featured.category] ?? 'bg-gray-100 text-gray-600'}`}>
                    {featured.category}
                  </span>
                  <span className="flex items-center gap-1 text-xs text-gray-400">
                    <Clock className="h-3.5 w-3.5" />
                    {featured.readingTime} min
                  </span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-3 group-hover:text-amber-600 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-gray-500 leading-relaxed mb-6 line-clamp-3">
                  {featured.excerpt}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-400">
                    {new Date(featured.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </span>
                  <span className="inline-flex items-center gap-1.5 text-sm font-medium text-amber-600 group-hover:gap-2.5 transition-all">
                    Leggi l&apos;articolo <ArrowRight className="h-4 w-4" />
                  </span>
                </div>
              </div>
            </div>
          </Link>
        )}

        {/* Grid */}
        {rest.length > 0 && (
          <>
            <h2 className="text-xl font-bold text-gray-900 mb-8">Tutti gli articoli</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
              {rest.map((post) => (
                <Link key={post.slug} href={`/blog/${post.slug}`} className="group flex flex-col rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow duration-300">
                  <div className="relative h-48 bg-gray-100 overflow-hidden">
                    <Image
                      src={post.image}
                      alt={post.title}
                      fill
                      className="object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                    />
                  </div>
                  <div className="flex flex-col flex-1 p-6 bg-white">
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${CATEGORY_COLORS[post.category] ?? 'bg-gray-100 text-gray-600'}`}>
                        {post.category}
                      </span>
                      <span className="flex items-center gap-1 text-xs text-gray-400">
                        <Clock className="h-3 w-3" />
                        {post.readingTime} min
                      </span>
                    </div>
                    <h3 className="text-base font-bold text-gray-900 leading-snug mb-2 group-hover:text-amber-600 transition-colors line-clamp-2">
                      {post.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed line-clamp-3 flex-1">
                      {post.excerpt}
                    </p>
                    <p className="mt-4 text-xs text-gray-400">
                      {new Date(post.date).toLocaleDateString('it-IT', { day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </>
        )}

      </main>

      {/* Footer */}
      <footer className="border-t border-gray-100 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex flex-col sm:flex-row justify-between items-center gap-4 text-sm text-gray-500">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-amber-500" />
            <span className="font-semibold text-gray-700">ListDreams</span>
            <span>&copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <Link href="/prezzi" className="hover:text-gray-900 transition-colors">Prezzi</Link>
            <Link href="/contattaci" className="hover:text-gray-900 transition-colors">Contattaci</Link>
            <Link href="/privacy" className="hover:text-gray-900 transition-colors">Privacy</Link>
          </div>
        </div>
      </footer>

    </div>
  );
}
