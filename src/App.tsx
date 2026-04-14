import { useState, useEffect, useMemo } from 'react';
import ReactMarkdown from 'react-markdown';
import { BrowserRouter as Router, Routes, Route, Link, useParams, useLocation } from 'react-router-dom';
import { Bike, Cpu, Shield, ChevronRight, ExternalLink, Tag, Menu, X, ArrowRight, ChevronDown, Music, MessagesSquare, MessageCircleCheck, Share2, Copy } from 'lucide-react';

// Custom Brand Icons (removed from recent lucide-react versions)
const Instagram = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
    <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
  </svg>
);

const Facebook = (props: any) => (
  <svg
    xmlns="http://www.w3.org/2000/svg"
    width="24"
    height="24"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
  </svg>
);
import { motion, AnimatePresence } from 'motion/react';
import { Helmet, HelmetProvider } from 'react-helmet-async';
import { supabase } from './lib/supabase';

// Helper to get correct asset path considering BASE_URL
const getAssetPath = (path: string) => {
  if (!path) return '';
  if (path.startsWith('http') || path.startsWith('data:')) return path;
  const baseUrl = import.meta.env.BASE_URL || '/';
  const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
  const cleanPath = path.startsWith('/') ? path.slice(1) : path;
  return `${normalizedBaseUrl}${cleanPath}`;
};

const getFullUrl = (path: string) => {
  const assetPath = getAssetPath(path);
  if (assetPath.startsWith('http')) return assetPath;
  return `${window.location.origin}${assetPath}`;
};

// Types
// ... (rest of types)
interface NewsItem {
  id: string;
  modelIds?: string[];
  title: string;
  summary: string;
  content?: string;
  url?: string;
  date: string;
  image?: string;
  category?: string;
}

interface UsedBike {
  title: string;
  price: number;
  image_url: string;
  url: string;
}

interface AffiliateLink {
  name: string;
  price: string;
  image: string;
  url: string;
  store: string;
}

interface Model {
  id: string;
  categoryId: string;
  brand?: string;
  name: string;
  description: string;
  image?: string;
  specs?: { label: string; value: string }[];
  news: NewsItem[];
  usedBikes: UsedBike[];
  affiliates: AffiliateLink[];
}

interface Category {
  id: string;
  name: string;
  description: string;
  icon: string;
}

interface SiteData {
  categories: Category[];
  models: Model[];
  homeNews: NewsItem[];
  socialLinks?: {
    instagram?: string;
    facebook?: string;
    bluesky?: string;
    tiktok?: string;
    whatsapp?: string;
  };
}

// Components
const ShareButtons = ({ title, url }: { title: string; url: string }) => {
  const [copied, setCopied] = useState(false);
  const shareUrl = window.location.origin + url;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const shareData = {
    title: title,
    text: title,
    url: shareUrl,
  };

  const handleNativeShare = async () => {
    try {
      await navigator.share(shareData);
    } catch (err) {
      console.log('Error sharing:', err);
    }
  };

  const socialLinks = [
    {
      name: 'WhatsApp',
      icon: <MessageCircleCheck className="w-4 h-4" />,
      url: `https://api.whatsapp.com/send?text=${encodeURIComponent(title + ' ' + shareUrl)}`,
      color: 'hover:bg-green-500 hover:text-white'
    },
    {
      name: 'Facebook',
      icon: <Facebook className="w-4 h-4" />,
      url: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`,
      color: 'hover:bg-blue-600 hover:text-white'
    },
    {
      name: 'Bluesky',
      icon: <MessagesSquare className="w-4 h-4" />,
      url: `https://bsky.app/intent/compose?text=${encodeURIComponent(title + ' ' + shareUrl)}`,
      color: 'hover:bg-blue-500 hover:text-white'
    }
  ];

  return (
    <div className="flex items-center gap-2">
      {navigator.share && (
        <button 
          onClick={handleNativeShare}
          className="p-2 rounded-full bg-zinc-100 text-zinc-600 hover:bg-zinc-900 hover:text-white transition-all"
          title="Compartilhar"
        >
          <Share2 className="w-4 h-4" />
        </button>
      )}
      
      {socialLinks.map(link => (
        <a 
          key={link.name}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`p-2 rounded-full bg-zinc-100 text-zinc-600 transition-all ${link.color}`}
          title={`Compartilhar no ${link.name}`}
        >
          {link.icon}
        </a>
      ))}

      <button 
        onClick={handleCopy}
        className={`p-2 rounded-full transition-all flex items-center gap-2 ${copied ? 'bg-green-100 text-green-600' : 'bg-zinc-100 text-zinc-600 hover:bg-zinc-900 hover:text-white'}`}
        title="Copiar link"
      >
        <Copy className="w-4 h-4" />
        {copied && <span className="text-[10px] font-bold pr-1">Copiado!</span>}
      </button>
    </div>
  );
};

const ScrollToTop = () => {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
};

const Navbar = ({ data }: { data: SiteData | null }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState<string | null>(null);
  const [expandedMobileCat, setExpandedMobileCat] = useState<string | null>(null);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  const getModelsByCategory = (catId: string) => {
    return data?.models.filter(m => m.categoryId === catId && m.affiliates.length > 0) || [];
  };

  const nonEmptyCategories = useMemo(() => {
    if (!data) return [];
    return data.categories.filter(cat => getModelsByCategory(cat.id).length > 0);
  }, [data]);

  const NavItem = ({ to, label, catId }: any) => {
    const models = catId ? getModelsByCategory(catId) : [];
    const hasSubmenu = models.length > 0;

    return (
      <div 
        className="relative group"
        onMouseEnter={() => catId && setActiveDropdown(catId)}
        onMouseLeave={() => setActiveDropdown(null)}
      >
        <Link 
          to={to} 
          className="flex items-center gap-1 text-zinc-500 hover:text-zinc-900 text-sm font-medium transition-colors py-4"
        >
          {label}
          {hasSubmenu && <ChevronDown className="w-3 h-3 opacity-50" />}
        </Link>

        {hasSubmenu && activeDropdown === catId && (
          <div className="absolute top-full left-0 w-64 bg-white border border-zinc-200 shadow-xl rounded-xl py-4 z-50">
            {models.map(model => (
              <Link
                key={model.id}
                to={`/model/${model.id}`}
                className="block px-6 py-2 text-sm text-zinc-600 hover:text-zinc-900 hover:bg-zinc-50 transition-colors"
                onClick={() => setActiveDropdown(null)}
              >
                {model.name}
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  };

  return (
    <nav className="bg-white border-b border-zinc-100 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-14">
          <div className="flex items-center">
            <Link to="/" className="flex items-center gap-2">
              <div className="bg-zinc-900 p-1 rounded-md overflow-hidden">
                <img 
                  src={getAssetPath("/images/logo.png")} 
                  alt="MobiStyle Logo" 
                  className="w-5 h-5 object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
              <span className="font-display font-bold text-lg tracking-tight">MobiStyle Ofertas</span>
            </Link>
          </div>
          
          <div className="hidden md:flex items-center space-x-6">
            <Link to="/noticias" className="text-zinc-500 hover:text-zinc-900 text-sm font-medium transition-colors">Notícias</Link>
            {nonEmptyCategories.map((cat: Category) => (
              <NavItem key={cat.id} to={`/category/${cat.id}`} label={cat.name} catId={cat.id} />
            ))}
          </div>

          <div className="md:hidden flex items-center">
            <button onClick={() => setIsOpen(!isOpen)} className="text-zinc-600">
              {isOpen ? <X /> : <Menu />}
            </button>
          </div>
        </div>
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden bg-white border-b border-zinc-200 overflow-y-auto max-h-[calc(100vh-4rem)]"
          >
            <div className="px-4 pt-2 pb-6 space-y-2">
              <Link to="/noticias" onClick={() => setIsOpen(false)} className="block px-3 py-2 text-zinc-600 font-medium">Notícias</Link>
              
              {/* Mobile Submenus */}
              {nonEmptyCategories.map(cat => {
                const catId = cat.id;
                const models = getModelsByCategory(catId);
                const isExpanded = expandedMobileCat === catId;

                return (
                  <div key={catId} className="space-y-1 border-b border-zinc-100">
                    <div className="flex items-center justify-between">
                      <Link 
                        to={`/category/${catId}`} 
                        onClick={() => setIsOpen(false)} 
                        className="flex-grow px-3 py-3 text-zinc-900 font-bold"
                      >
                        {cat?.name}
                      </Link>
                      <button 
                        onClick={() => setExpandedMobileCat(isExpanded ? null : catId)}
                        className="px-4 py-3 text-zinc-400"
                      >
                        <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                      </button>
                    </div>
                    
                    <AnimatePresence>
                      {isExpanded && (
                        <motion.div 
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: 'auto', opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          className="overflow-hidden bg-zinc-50"
                        >
                          <div className="pl-4 py-2 space-y-1">
                            {models.map(model => (
                              <Link
                                key={model.id}
                                to={`/model/${model.id}`}
                                onClick={() => setIsOpen(false)}
                                className="block px-3 py-2 text-zinc-500 text-sm hover:text-zinc-900 transition-colors"
                              >
                                {model.name}
                              </Link>
                            ))}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                );
              })}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
};

const Footer = ({ data }: { data: SiteData | null }) => (
  <footer className="bg-zinc-900 text-zinc-500 py-8 mt-12">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div>
          <div className="flex items-center gap-2 mb-4">
            <div className="bg-white p-1 rounded-md overflow-hidden">
              <img 
                src={getAssetPath("/images/logo.png")} 
                alt="MobiStyle Logo" 
                className="w-5 h-5 object-contain invert"
                referrerPolicy="no-referrer"
              />
            </div>
            <span className="font-display font-bold text-lg text-white tracking-tight">MobiStyle Ofertas</span>
          </div>
          <p className="text-xs leading-relaxed max-w-xs mb-6">
            Sua fonte de notícias e curadoria de ofertas em acessórios para mobilidade urbana e estilo de vida.
          </p>
          
          {data?.socialLinks && (
            <div className="flex items-center gap-5">
              {data.socialLinks.instagram && (
                <a href={data.socialLinks.instagram} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors" title="Instagram">
                  <Instagram className="w-8 h-8" />
                </a>
              )}
              {data.socialLinks.facebook && (
                <a href={data.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors" title="Facebook">
                  <Facebook className="w-8 h-8" />
                </a>
              )}
              {data.socialLinks.tiktok && (
                <a href={data.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors" title="TikTok">
                  <Music className="w-8 h-8" />
                </a>
              )}
              {data.socialLinks.bluesky && (
                <a href={data.socialLinks.bluesky} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors" title="Bluesky">
                  <MessagesSquare className="w-8 h-8" />
                </a>
              )}
              {data.socialLinks.whatsapp && (
                <a href={data.socialLinks.whatsapp} target="_blank" rel="noopener noreferrer" className="text-zinc-500 hover:text-white transition-colors" title="WhatsApp">
                  <MessageCircleCheck className="w-8 h-8" />
                </a>
              )}
            </div>
          )}
        </div>
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Links</h4>
          <ul className="space-y-2 text-xs">
            <li><Link to="/noticias" className="hover:text-white transition-colors">Notícias</Link></li>
            {data?.categories.filter(cat => data.models.some(m => m.categoryId === cat.id && ((m.affiliates?.length || 0) > 0 || (m.usedBikes?.length || 0) > 0))).map(cat => (
              <li key={cat.id}>
                <Link to={`/category/${cat.id}`} className="hover:text-white transition-colors">
                  {cat.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>
        <div>
          <h4 className="text-white text-xs font-bold uppercase tracking-widest mb-4">Sobre</h4>
          <div className="space-y-3 text-[11px] leading-relaxed">
            <p>
              MobiStyle Ofertas é um site de curadoria independente em equipamentos para motociclismo e gadgets de mobilidade urbana. Selecionamos e recomendamos os melhores produtos e ofertas do mercado.
            </p>
            <p>
              O MobiStyle Ofertas é uma plataforma de curadoria de links, não um site de vendas diretas. Ao clicar em um produto, você é redirecionado para o marketplace parceiro. Não realizamos transações, não armazenamos dados de pagamento e não somos responsáveis pela venda ou entrega dos produtos.
            </p>
          </div>
        </div>
      </div>
      <div className="border-t border-zinc-800 mt-8 pt-6 text-center text-[10px]">
        <p>&copy; 2026 MobiStyle. Todos os direitos reservados.</p>
      </div>
    </div>
  </footer>
);

const Home = ({ data }: { data: SiteData | null }) => {
  const [newsLimit] = useState(7);
  if (!data) return null;

  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Bike': return <Bike className="w-8 h-8" />;
      case 'Cpu': return <Cpu className="w-8 h-8" />;
      case 'Shield': return <Shield className="w-8 h-8" />;
      default: return <Bike className="w-8 h-8" />;
    }
  };

  const nonEmptyCategories = useMemo(() => {
    if (!data) return [];
    return data.categories.filter(cat => 
      data.models.some(m => m.categoryId === cat.id && ((m.affiliates?.length || 0) > 0 || (m.usedBikes?.length || 0) > 0))
    );
  }, [data]);

  const allNews = useMemo(() => {
    if (!data) return [];
    const combined: NewsItem[] = [];
    
    // Add home news
    data.homeNews.forEach(n => {
      if (!combined.find(cn => cn.title === n.title)) {
        combined.push(n);
      }
    });

    // Add model news
    data.models.forEach(m => {
      m.news.forEach(n => {
        if (!combined.find(cn => cn.title === n.title)) {
          const category = n.category || data.categories.find(c => c.id === m.categoryId)?.name;
          combined.push({ ...n, category });
        }
      });
    });

    // Sort by date
    return combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
  }, [data]);

  const visibleNews = allNews.slice(0, newsLimit);

  const location = useLocation();
  const canonicalUrl = window.location.origin + location.pathname;

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <Helmet>
        <title>MobiStyle | Home</title>
        <meta name="description" content="MobiStyle Ofertas. Curadoria de mobilidade urbana e tecnologia." />
        <link rel="canonical" href={canonicalUrl} />
        
        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content="MobiStyle | Home" />
        <meta property="og:description" content="MobiStyle Ofertas. Curadoria de mobilidade urbana e tecnologia." />
        <meta property="og:image" content={getFullUrl("/images/news/sobre.png")} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content="MobiStyle | Home" />
        <meta property="twitter:description" content="MobiStyle Ofertas. Curadoria de mobilidade urbana e tecnologia." />
        <meta property="twitter:image" content={getFullUrl("/images/news/sobre.png")} />
      </Helmet>
      <section className="mb-12">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-display font-bold tracking-tight">Últimas Notícias</h2>
          <div className="h-px flex-grow mx-6 bg-zinc-100 hidden sm:block"></div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 md:auto-rows-[240px] mb-6">
          {visibleNews.slice(0, 4).map((news, idx) => {
            let gridClass = "col-span-1 row-span-1 min-h-[220px]";
            if (idx === 0) gridClass = "md:col-span-2 md:row-span-2 min-h-[380px] md:min-h-0";
            if (idx === 1) gridClass = "md:col-span-2 md:row-span-1";
            if (idx === 2) gridClass = "md:col-span-1 md:row-span-1";
            if (idx === 3) gridClass = "md:col-span-1 md:row-span-1";

            return (
              <motion.div 
                key={news.id || idx}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
                className={`group relative rounded-2xl overflow-hidden border border-zinc-100 transition-all duration-300 ${gridClass}`}
              >
                <Link to={`/noticia/${news.id}`} className="block w-full h-full">
                  <img 
                    src={getAssetPath(news.image || `/images/news/${news.id}.jpg`)} 
                    alt={news.title} 
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('images.unsplash.com')) {
                        target.src = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop';
                      }
                    }}
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent z-20" />
                  
                  <div className="absolute inset-0 p-5 flex flex-col justify-end z-30">
                    <div className="flex items-center gap-2 mb-2">
                      <span className="px-1.5 py-0.5 bg-white/10 backdrop-blur-md border border-white/10 text-white text-[8px] font-bold uppercase tracking-wider rounded">
                        {news.category}
                      </span>
                      <span className="text-white/60 text-[9px] font-medium">{news.date}</span>
                    </div>
                    
                    <h3 className={`${idx === 0 ? 'text-xl md:text-2xl' : 'text-base'} font-display font-bold text-white mb-1 leading-tight group-hover:text-zinc-200 transition-colors`}>
                      {news.title}
                    </h3>
                    
                    {idx === 0 && (
                      <p className="text-white/60 text-xs line-clamp-2 mb-3 max-w-xl hidden sm:block font-normal">
                        {news.summary}
                      </p>
                    )}

                    <div className="flex items-center justify-between mt-2">
                      <span className="text-[10px] font-bold text-white/80 group-hover:text-white transition-colors">Ler mais</span>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (navigator.share) {
                            navigator.share({
                              title: news.title,
                              url: window.location.origin + `/noticia/${news.id}`
                            });
                          } else {
                            navigator.clipboard.writeText(window.location.origin + `/noticia/${news.id}`);
                            alert('Link copiado para a área de transferência!');
                          }
                        }}
                        className="p-1.5 rounded-full bg-white/10 backdrop-blur-md border border-white/10 text-white/60 hover:text-white hover:bg-white/20 transition-all"
                        title="Compartilhar"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            );
          })}
        </div>

        {/* Standard Layout Section */}
        {visibleNews.length > 4 && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {visibleNews.slice(4, 7).map((news, idx) => (
              <motion.div 
                key={news.id || idx + 4}
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                viewport={{ once: true }}
                className="group bg-white rounded-2xl overflow-hidden border border-zinc-100 hover:border-zinc-200 transition-all"
              >
                <Link to={`/noticia/${news.id}`} className="flex sm:block items-center">
                  <div className="w-24 h-24 sm:w-full sm:aspect-[16/9] overflow-hidden bg-zinc-50 flex-shrink-0">
                    <img 
                      src={getAssetPath(news.image || `/images/news/${news.id}.jpg`)} 
                      alt={news.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('images.unsplash.com')) {
                          target.src = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop';
                        }
                      }}
                    />
                  </div>
                  <div className="p-4 sm:p-5">
                    <div className="flex items-center gap-2 mb-1.5">
                      <span className="text-zinc-400 text-[9px] font-bold uppercase tracking-wider">
                        {news.category}
                      </span>
                      <span className="text-zinc-300 text-[9px] font-medium">{news.date}</span>
                    </div>
                    <h3 className="text-sm font-bold group-hover:text-zinc-700 transition-colors line-clamp-2 leading-snug">{news.title}</h3>
                    <div className="mt-3 pt-3 border-t border-zinc-50 flex items-center justify-between">
                      <span className="text-[10px] font-bold hover:underline">Ler mais</span>
                      <button 
                        onClick={(e) => {
                          e.preventDefault();
                          e.stopPropagation();
                          if (navigator.share) {
                            navigator.share({
                              title: news.title,
                              url: window.location.origin + `/noticia/${news.id}`
                            });
                          } else {
                            navigator.clipboard.writeText(window.location.origin + `/noticia/${news.id}`);
                            alert('Link copiado para a área de transferência!');
                          }
                        }}
                        className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors"
                        title="Compartilhar"
                      >
                        <Share2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        )}
        <div className="mt-12 text-center">
          <Link 
            to="/noticias"
            className="px-8 py-3 bg-zinc-900 text-white rounded-full font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl inline-flex items-center gap-2"
          >
            Veja mais notícias <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </section>

      {nonEmptyCategories.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-3xl font-display font-bold tracking-tight">Explorar ofertas em</h2>
            <div className="h-px flex-grow mx-8 bg-zinc-200 hidden sm:block"></div>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {nonEmptyCategories.map((cat) => (
              <Link 
                key={cat.id} 
                to={`/category/${cat.id}`}
                className="group bg-white p-8 rounded-2xl border border-zinc-200 shadow-sm hover:border-zinc-900 transition-all flex flex-col items-start gap-6"
              >
                <div className="bg-zinc-100 p-4 rounded-xl group-hover:bg-zinc-900 group-hover:text-white transition-colors">
                  {getIcon(cat.icon)}
                </div>
                <div>
                  <h3 className="text-xl font-bold mb-2">{cat.name}</h3>
                  <p className="text-zinc-500 text-sm mb-4">{cat.description}</p>
                  <span className="text-xs font-bold uppercase tracking-widest flex items-center gap-2">
                    Ver itens <ChevronRight className="w-3 h-3" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}
    </motion.div>
  );
};

const CategoryPage = ({ data }: { data: SiteData | null }) => {
  const { categoryId } = useParams();
  const [selectedBrand, setSelectedBrand] = useState<string | null>(null);
  
  if (!data) return null;

  const category = data.categories.find(c => c.id === categoryId);
  const allModelsInCategory = data.models.filter(m => 
    m.categoryId === categoryId && ((m.affiliates?.length || 0) > 0 || (m.usedBikes?.length || 0) > 0)
  );
  
  // Extract unique brands for filtering
  const brands = Array.from(new Set(allModelsInCategory.map(m => m.brand).filter(Boolean))) as string[];
  
  const filteredModels = selectedBrand 
    ? allModelsInCategory.filter(m => m.brand === selectedBrand)
    : allModelsInCategory;

  const isMenuMode = ['equipamentos', 'gadgets', 'motos-scooters'].includes(categoryId || '');

  const location = useLocation();
  const canonicalUrl = window.location.origin + location.pathname;

  if (!category) return <div className="p-20 text-center">Categoria não encontrada.</div>;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <Helmet>
        <title>{category.name} | MobiStyle</title>
        <meta name="description" content={category.description} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={`${category.name} | MobiStyle`} />
        <meta property="og:description" content={category.description} />
        <meta property="og:image" content={getFullUrl("/images/news/sobre.png")} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={`${category.name} | MobiStyle`} />
        <meta property="twitter:description" content={category.description} />
        <meta property="twitter:image" content={getFullUrl("/images/news/sobre.png")} />
      </Helmet>
      <div className="mb-8">
        <div className="flex items-center gap-3 text-[10px] text-zinc-400 mb-3 uppercase tracking-widest font-bold">
          <Link to="/" className="hover:text-zinc-900 transition-colors">Home</Link>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className="text-zinc-900">{category.name}</span>
        </div>
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <h1 className="text-3xl font-display font-bold mb-2 tracking-tight">{category.name}</h1>
            <p className="text-zinc-500 text-sm max-w-2xl">{category.description}</p>
          </div>
          
          {/* Brand Filter */}
          {brands.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              <button
                onClick={() => setSelectedBrand(null)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                  selectedBrand === null 
                    ? 'bg-zinc-900 text-white' 
                    : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                }`}
              >
                Todas
              </button>
              {brands.map(brand => (
                <button
                  key={brand}
                  onClick={() => setSelectedBrand(brand)}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                    selectedBrand === brand 
                      ? 'bg-zinc-900 text-white' 
                      : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
                  }`}
                >
                  {brand}
                </button>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className={isMenuMode 
        ? "grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 lg:grid-cols-6 gap-3" 
        : "grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4"}
      >
        {filteredModels.map((model) => (
          <Link 
            key={model.id} 
            to={`/model/${model.id}`}
            className={`group bg-white rounded-xl border border-zinc-100 overflow-hidden hover:border-zinc-300 transition-all ${isMenuMode ? 'p-1.5' : ''}`}
          >
            <div className={`${isMenuMode ? 'aspect-square rounded-lg' : 'aspect-[4/3]'} bg-zinc-50 flex items-center justify-center overflow-hidden`}>
              <img 
                src={getAssetPath(model.image || `/images/models/${model.id}.jpg`)} 
                alt={model.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('images.unsplash.com')) {
                    target.src = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop';
                  }
                }}
              />
            </div>
            <div className={isMenuMode ? "p-2 text-center" : "p-4"}>
              <h3 className={`${isMenuMode ? 'text-xs' : 'text-sm'} font-bold mb-1 line-clamp-1`}>{model.name}</h3>
              {!isMenuMode && (
                <p className="text-zinc-500 text-[11px] mb-3 line-clamp-2 leading-snug">{model.description}</p>
              )}
            </div>
          </Link>
        ))}
      </div>
      
      {filteredModels.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-zinc-400">Nenhum modelo encontrado para esta marca.</p>
        </div>
      )}
    </motion.div>
  );
};

const NewsList = ({ data }: { data: SiteData | null }) => {
  const [visibleCount, setVisibleCount] = useState(12);
  const [allNews, setAllNews] = useState<NewsItem[]>([]);
  const [searchParams, setSearchParams] = useLocation().search ? new URLSearchParams(useLocation().search) : new URLSearchParams();
  const location = useLocation();
  
  const selectedCategory = new URLSearchParams(location.search).get('category');

  useEffect(() => {
    if (data) {
      // Combine home news and model news
      const combined: NewsItem[] = [];
      
      // Add home news
      data.homeNews.forEach(n => {
        if (!combined.find(cn => cn.title === n.title)) {
          combined.push(n);
        }
      });

      // Add model news
      data.models.forEach(m => {
        m.news.forEach(n => {
          if (!combined.find(cn => cn.title === n.title)) {
            // If news doesn't have a category, use the site category name
            const category = n.category || data.categories.find(c => c.id === m.categoryId)?.name;
            combined.push({ ...n, category });
          }
        });
      });

      // Sort by date
      combined.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setAllNews(combined);
    }
  }, [data]);

  const categories = Array.from(new Set(allNews.map(n => n.category).filter(Boolean))) as string[];
  const filteredNews = selectedCategory 
    ? allNews.filter(n => n.category === selectedCategory)
    : allNews;

  useEffect(() => {
    const handleScroll = () => {
      if (window.innerHeight + window.scrollY >= document.body.offsetHeight - 500) {
        setVisibleCount(prev => Math.min(prev + 6, filteredNews.length));
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [filteredNews.length]);

  const canonicalUrl = window.location.origin + location.pathname;
  const pageTitle = selectedCategory ? `${selectedCategory} - Notícias` : 'Todas as Notícias';
  const pageDesc = "Fique por dentro das últimas notícias sobre mobilidade urbana, tecnologia e estilo de vida.";

  if (!data) return null;

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <Helmet>
        <title>{pageTitle} | MobiStyle</title>
        <meta name="description" content={pageDesc} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={`${pageTitle} | MobiStyle`} />
        <meta property="og:description" content={pageDesc} />
        <meta property="og:image" content={getFullUrl("/images/news/sobre.png")} />

        {/* Twitter */}
        <meta property="twitter:card" content="summary" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={`${pageTitle} | MobiStyle`} />
        <meta property="twitter:description" content={pageDesc} />
        <meta property="twitter:image" content={getFullUrl("/images/news/sobre.png")} />
      </Helmet>
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-display font-bold mb-2 tracking-tight">Todas as Notícias</h1>
          <p className="text-zinc-500 text-sm">Fique por dentro das novidades do mundo das duas rodas.</p>
        </div>
        
        {/* Category Filters */}
        <div className="flex flex-wrap gap-1.5">
          <Link
            to="/noticias"
            className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
              selectedCategory === null 
                ? 'bg-zinc-900 text-white' 
                : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
            }`}
          >
            Todas
          </Link>
          {categories.map(cat => (
            <Link
              key={cat}
              to={`/noticias?category=${encodeURIComponent(cat)}`}
              className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                selectedCategory === cat 
                  ? 'bg-zinc-900 text-white' 
                  : 'bg-zinc-100 text-zinc-500 hover:bg-zinc-200'
              }`}
            >
              {cat}
            </Link>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        {filteredNews.slice(0, visibleCount).map((news, idx) => (
          <motion.div 
            key={idx}
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            className="group bg-white rounded-xl overflow-hidden border border-zinc-100 hover:border-zinc-200 transition-all"
          >
            <Link to={`/noticia/${news.id}`} className="block h-full">
              <div className="aspect-[16/9] overflow-hidden bg-zinc-50">
                <img 
                  src={getAssetPath(news.image || `/images/news/${news.id}.jpg`)} 
                  alt={news.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  referrerPolicy="no-referrer"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    if (!target.src.includes('images.unsplash.com')) {
                      target.src = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop';
                    }
                  }}
                />
              </div>
              <div className="p-4">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-zinc-400 text-[9px] font-bold uppercase tracking-wider">
                    {news.category}
                  </span>
                  <span className="text-zinc-300 text-[9px] font-medium">{news.date}</span>
                </div>
                <h3 className="text-sm font-bold mb-2 group-hover:text-zinc-700 transition-colors line-clamp-2 leading-snug">{news.title}</h3>
                <p className="text-zinc-500 text-[11px] line-clamp-2 leading-snug mb-4">{news.summary}</p>
                <div className="flex items-center justify-between mt-auto pt-3 border-t border-zinc-50">
                  <span className="text-[10px] font-bold hover:underline">
                    Ler mais
                  </span>
                  <button 
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      if (navigator.share) {
                        navigator.share({
                          title: news.title,
                          url: window.location.origin + `/noticia/${news.id}`
                        });
                      } else {
                        navigator.clipboard.writeText(window.location.origin + `/noticia/${news.id}`);
                        alert('Link copiado para a área de transferência!');
                      }
                    }}
                    className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors"
                    title="Compartilhar"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>
      
      {filteredNews.length === 0 && (
        <div className="py-20 text-center">
          <p className="text-zinc-400">Nenhuma notícia encontrada nesta categoria.</p>
        </div>
      )}

      {visibleCount < filteredNews.length && (
        <div className="mt-12 text-center text-zinc-400 animate-pulse">
          Carregando mais notícias...
        </div>
      )}
    </motion.div>
  );
};

const IntenseDebateComments = ({ postId, postTitle, postUrl }: { postId: string, postTitle: string, postUrl: string }) => {
  useEffect(() => {
    const acct = import.meta.env.VITE_INTENSE_DEBATE_ACCT || import.meta.env.VITE_INTENSE_DEBATE_ID;
    if (!acct) return;

    // Remove existing script and container if they exist
    const existingScript = document.getElementById('intense-debate-script');
    if (existingScript) existingScript.remove();
    
    const idcContainer = document.getElementById('idc-container');
    if (idcContainer) idcContainer.remove();

    // Set global variables for IntenseDebate
    (window as any).idcomments_acct = acct;
    (window as any).idcomments_post_id = postId;
    (window as any).idcomments_post_url = postUrl;

    const script = document.createElement('script');
    script.id = 'intense-debate-script';
    script.type = 'text/javascript';
    script.src = 'https://www.intensedebate.com/js/genericCommentWrapperV2.js';
    script.async = true;
    
    const wrapper = document.getElementById('idcomments_wrapper');
    if (wrapper) {
      wrapper.appendChild(script);
    }

    return () => {
      if (script && script.parentNode) {
        script.parentNode.removeChild(script);
      }
      const container = document.getElementById('idc-container');
      if (container) container.remove();
      
      // Clean up global variables to prevent leaks
      delete (window as any).idcomments_acct;
      delete (window as any).idcomments_post_id;
      delete (window as any).idcomments_post_url;
    };
  }, [postId, postUrl, postTitle]);

  const hasConfig = import.meta.env.VITE_INTENSE_DEBATE_ACCT || import.meta.env.VITE_INTENSE_DEBATE_ID;

  if (!hasConfig) {
    return (
      <div className="mt-16 pt-12 border-t border-zinc-200 text-center text-zinc-400 text-sm italic">
        Configure VITE_INTENSE_DEBATE_ACCT para habilitar os comentários.
      </div>
    );
  }

  return (
    <div className="mt-16 pt-12 border-t border-zinc-200">
      <h2 className="text-2xl font-bold mb-8">Comentários</h2>
      <span id="IDCommentsPostTitle" style={{ display: 'none' }}>{postTitle}</span>
      <div id="idcomments_wrapper"></div>
    </div>
  );
};

const NewsDetail = ({ data }: { data: SiteData | null }) => {
  const { newsId } = useParams();
  if (!data) return null;

  // Find news in homeNews or models
  let news: NewsItem | undefined;
  
  // Search in homeNews
  news = data.homeNews.find(n => n.id === newsId);
  
  // If not found, search in models
  if (!news) {
    for (const model of data.models) {
      news = model.news.find(n => n.id === newsId);
      if (news) break;
    }
  }

  if (!news) return <div className="p-20 text-center">Notícia não encontrada.</div>;

  const relatedModels = data.models.filter(m => news?.modelIds?.includes(m.id));

  const relatedNews = useMemo(() => {
    if (!data || !news) return [];
    
    const allNews: NewsItem[] = [];
    data.homeNews.forEach(n => allNews.push(n));
    data.models.forEach(m => {
      m.news.forEach(n => {
        if (!allNews.find(existing => existing.id === n.id)) {
          allNews.push(n);
        }
      });
    });

    return allNews
      .filter(n => n.id !== news.id)
      .filter(n => {
        const sameCategory = n.category === news.category;
        const sharedModels = news.modelIds?.some(id => n.modelIds?.includes(id));
        return sameCategory || sharedModels;
      })
      .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
      .slice(0, 3);
  }, [data, news]);

  const randomCategoryOffers = useMemo(() => {
    if (!data) return null;
    
    // Filter models that are "subcategories" of equipment and have offers
    const equipmentSubcategories = data.models.filter(m => 
      m.categoryId === 'equipamentos' && m.affiliates.length > 0
    );

    if (equipmentSubcategories.length === 0) return null;

    // Pick a random subcategory (model)
    const randomSub = equipmentSubcategories[Math.floor(Math.random() * equipmentSubcategories.length)];
    
    // Shuffle and take 6
    const shuffled = [...randomSub.affiliates].sort(() => 0.5 - Math.random());
    return {
      id: randomSub.id,
      name: randomSub.name,
      offers: shuffled.slice(0, 6)
    };
  }, [data, newsId]);

  const location = useLocation();
  const canonicalUrl = window.location.origin + location.pathname;
  const newsImage = news.image?.startsWith('http') ? news.image : getFullUrl(news.image || `/images/news/${news.id}.jpg`);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
    >
      <Helmet>
        <title>{news.title} | MobiStyle</title>
        <meta name="description" content={news.summary} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="article" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={`${news.title} | MobiStyle`} />
        <meta property="og:description" content={news.summary} />
        <meta property="og:image" content={newsImage} />
        <meta property="og:image:secure_url" content={newsImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={`${news.title} | MobiStyle`} />
        <meta property="twitter:description" content={news.summary} />
        <meta property="twitter:image" content={newsImage} />
      </Helmet>

      <div className="mb-8">
        <div className="flex items-center gap-3 text-[10px] text-zinc-400 mb-4 uppercase tracking-widest font-bold">
          <Link to="/" className="hover:text-zinc-900 transition-colors">Home</Link>
          <ChevronRight className="w-2.5 h-2.5" />
          <Link to="/noticias" className="hover:text-zinc-900 transition-colors">Notícias</Link>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className="text-zinc-900 line-clamp-1">{news.title}</span>
        </div>
        
        <div className="flex items-center gap-3 mb-4">
          <span className="text-zinc-400 text-[10px] font-bold uppercase tracking-wider">
            {news.category}
          </span>
          <span className="text-zinc-300 text-[10px] font-medium">{news.date}</span>
        </div>

        <h1 className="text-3xl md:text-4xl font-display font-bold mb-6 tracking-tight leading-tight">
          {news.title}
        </h1>

        <div className="flex items-center justify-between mb-8 pb-6 border-b border-zinc-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-zinc-900 flex items-center justify-center text-white text-[10px] font-bold">
              MS
            </div>
            <div>
              <div className="text-[10px] font-bold text-zinc-900 uppercase tracking-wider">MobiStyle Redação</div>
              <div className="text-[9px] text-zinc-400 uppercase">{news.date}</div>
            </div>
          </div>
          <ShareButtons title={news.title} url={`/noticia/${news.id}`} />
        </div>

        <div className="rounded-2xl overflow-hidden mb-8 bg-zinc-50 border border-zinc-100">
          <img 
            src={getAssetPath(news.image || `/images/news/${news.id}.jpg`)} 
            alt={news.title} 
            className="w-full h-auto block"
            referrerPolicy="no-referrer"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              if (!target.src.includes('images.unsplash.com')) {
                target.src = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop';
              }
            }}
          />
        </div>

        <div className="prose prose-zinc prose-sm max-w-none mb-12">
          <ReactMarkdown>
            {(news.content || '').replace(/\\n/g, '\n')}
          </ReactMarkdown>
        </div>

        <div className="flex flex-col items-center gap-4 py-8 border-y border-zinc-100 mb-12">
          <span className="text-[10px] font-bold uppercase tracking-widest text-zinc-400">Gostou da notícia? Compartilhe!</span>
          <ShareButtons title={news.title} url={`/noticia/${news.id}`} />
        </div>
      </div>

      {relatedModels.length > 0 && (
        <div className="mt-12 pt-8 border-t border-zinc-100">
          <h2 className="text-xl font-bold mb-6 tracking-tight">Modelos Relacionados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {relatedModels.map(model => (
              <Link 
                key={model.id} 
                to={`/model/${model.id}`}
                className="flex items-center gap-3 p-3 bg-white rounded-xl border border-zinc-100 hover:border-zinc-300 transition-all group"
              >
                <div className="w-16 h-16 bg-zinc-50 rounded-lg overflow-hidden flex-shrink-0">
                  <img 
                    src={getAssetPath(model.image || `/images/models/${model.id}.jpg`)} 
                    alt={model.name}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('images.unsplash.com')) {
                        target.src = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop';
                      }
                    }}
                  />
                </div>
                <div>
                  <h3 className="text-sm font-bold group-hover:text-zinc-700 transition-colors">{model.name}</h3>
                  <p className="text-[10px] text-zinc-500 line-clamp-1 mt-0.5">{model.description}</p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {randomCategoryOffers && randomCategoryOffers.offers.length > 0 && (
        <div className="mt-12 pt-8 border-t border-zinc-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight">Ofertas em {randomCategoryOffers.name}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {randomCategoryOffers.offers.map((offer, i) => (
              <a 
                key={i} 
                href={offer.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group bg-white p-3 rounded-xl border border-zinc-100 hover:border-zinc-300 transition-all flex flex-col"
              >
                <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-zinc-50">
                  <img 
                    src={getAssetPath(offer.image)} 
                    alt={offer.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('images.unsplash.com')) {
                        target.src = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop';
                      }
                    }}
                  />
                </div>
                <div className="flex-grow">
                  <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">{offer.store}</span>
                  <h3 className="text-[11px] font-bold line-clamp-2 mb-1 group-hover:text-zinc-700 transition-colors leading-tight">{offer.name}</h3>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-display font-bold text-zinc-900">{offer.price}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}

      <IntenseDebateComments 
        postId={news.id} 
        postTitle={news.title} 
        postUrl={window.location.href} 
      />

      {relatedNews.length > 0 && (
        <div className="mt-12 pt-8 border-t border-zinc-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight">Notícias Relacionadas</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {relatedNews.map((n, i) => (
              <motion.div 
                key={n.id || i}
                className="group bg-white rounded-xl overflow-hidden border border-zinc-100 hover:border-zinc-200 transition-all"
              >
                <Link to={`/noticia/${n.id}`}>
                  <div className="aspect-[16/9] overflow-hidden bg-zinc-50">
                    <img 
                      src={getAssetPath(n.image || `/images/news/${n.id}.jpg`)} 
                      alt={n.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('images.unsplash.com')) {
                          target.src = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop';
                        }
                      }}
                    />
                  </div>
                  <div className="p-3">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-zinc-400 text-[8px] font-bold uppercase tracking-wider">
                        {n.category}
                      </span>
                      <span className="text-zinc-300 text-[8px]">{n.date}</span>
                    </div>
                    <h3 className="text-xs font-bold group-hover:text-zinc-700 transition-colors line-clamp-2 leading-snug">{n.title}</h3>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

const ModelPage = ({ data }: { data: SiteData | null }) => {
  const { modelId } = useParams();
  const [newsLimit, setNewsLimit] = useState(5);
  if (!data) return null;

  const model = data.models.find(m => m.id === modelId);
  if (!model) return <div className="p-20 text-center">Modelo não encontrado.</div>;

  const isMotoOrScooter = model.categoryId === 'motos-scooters';
  const visibleNews = [...model.news]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, newsLimit);

  const randomCategoryOffers = useMemo(() => {
    if (!data) return null;
    
    // Filter models that are "subcategories" of equipment and have offers
    const equipmentSubcategories = data.models.filter(m => 
      m.categoryId === 'equipamentos' && m.affiliates.length > 0
    );

    if (equipmentSubcategories.length === 0) return null;

    // Pick a random subcategory (model)
    const randomSub = equipmentSubcategories[Math.floor(Math.random() * equipmentSubcategories.length)];
    
    // Shuffle and take 6
    const shuffled = [...randomSub.affiliates].sort(() => 0.5 - Math.random());
    return {
      id: randomSub.id,
      name: randomSub.name,
      offers: shuffled.slice(0, 6)
    };
  }, [data, modelId]);

  // Structured Data (JSON-LD)
  const structuredData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": model.name,
    "description": model.description,
    "image": model.image,
    "brand": {
      "@type": "Brand",
      "name": "MobiStyle Ofertas"
    }
  };

  const location = useLocation();
  const canonicalUrl = window.location.origin + location.pathname;
  const modelImage = model.image?.startsWith('http') ? model.image : getFullUrl(model.image || `/images/models/${model.id}.jpg`);

  if (!isMotoOrScooter) {
    return (
      <motion.div 
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8"
      >
        <Helmet>
          <title>{model.name} | MobiStyle</title>
          <meta name="description" content={model.description} />
          <link rel="canonical" href={canonicalUrl} />

          {/* Open Graph / Facebook */}
          <meta property="og:type" content="product" />
          <meta property="og:url" content={canonicalUrl} />
          <meta property="og:title" content={`${model.name} | MobiStyle`} />
          <meta property="og:description" content={model.description} />
          <meta property="og:image" content={modelImage} />
          <meta property="og:image:secure_url" content={modelImage} />
          <meta property="og:image:width" content="1200" />
          <meta property="og:image:height" content="630" />

          {/* Twitter */}
          <meta property="twitter:card" content="summary_large_image" />
          <meta property="twitter:url" content={canonicalUrl} />
          <meta property="twitter:title" content={`${model.name} | MobiStyle`} />
          <meta property="twitter:description" content={model.description} />
          <meta property="twitter:image" content={modelImage} />

          <script type="application/ld+json">
            {JSON.stringify(structuredData)}
          </script>
        </Helmet>
        <div className="mb-8">
          <div className="flex items-center gap-3 text-[10px] text-zinc-400 mb-3 uppercase tracking-widest font-bold">
            <Link to="/" className="hover:text-zinc-900 transition-colors">Home</Link>
            <ChevronRight className="w-2.5 h-2.5" />
            <Link to={`/category/${model.categoryId}`} className="hover:text-zinc-900 transition-colors">
              {data.categories.find(c => c.id === model.categoryId)?.name}
            </Link>
            <ChevronRight className="w-2.5 h-2.5" />
            <span className="text-zinc-900">{model.name}</span>
          </div>
          <h1 className="text-3xl font-display font-bold mb-2 tracking-tight">{model.name}</h1>
          {!['equipamentos', 'gadgets'].includes(model.categoryId) && (
            <p className="text-zinc-500 text-sm max-w-3xl leading-relaxed">{model.description}</p>
          )}
        </div>

        <section className="mb-12">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-display font-bold tracking-tight flex items-center gap-2">
              <Tag className="w-5 h-5 text-zinc-900" /> Melhores Ofertas
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-3">
            {model.affiliates.map((item, i) => (
              <motion.div 
                key={i} 
                className="group bg-white p-3 rounded-xl border border-zinc-100 hover:border-zinc-300 transition-all flex flex-col"
              >
                <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-zinc-50">
                  <img 
                    src={getAssetPath(item.image)} 
                    alt={item.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('images.unsplash.com')) {
                        target.src = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop';
                      }
                    }}
                  />
                </div>
                <div className="flex-grow space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">{item.store}</span>
                  </div>
                  <h3 className="text-[11px] font-bold text-zinc-800 line-clamp-2 leading-tight">{item.name}</h3>
                  <div className="text-sm font-display font-bold text-zinc-900">{item.price}</div>
                </div>
                <a 
                  href={item.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-full mt-3 py-1.5 bg-zinc-900 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 hover:bg-zinc-800 transition-colors"
                >
                  Comprar <ExternalLink className="w-2.5 h-2.5" />
                </a>
              </motion.div>
            ))}
          </div>
        </section>

        {randomCategoryOffers && randomCategoryOffers.offers.length > 0 && (
          <div className="mt-20 pt-12 border-t border-zinc-200">
            <div className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-bold">Ofertas em {randomCategoryOffers.name}</h2>
              <div className="h-px flex-grow ml-8 bg-zinc-100"></div>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {randomCategoryOffers.offers.map((offer, i) => (
                <a 
                  key={i} 
                  href={offer.url} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="group bg-white p-4 rounded-2xl border border-zinc-100 hover:border-zinc-900 transition-all flex flex-col"
                >
                  <div className="aspect-square rounded-xl overflow-hidden mb-4 bg-zinc-50">
                    <img 
                      src={getAssetPath(offer.image)} 
                      alt={offer.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('images.unsplash.com')) {
                          target.src = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop';
                        }
                      }}
                    />
                  </div>
                  <div className="flex-grow">
                    <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">{offer.store}</span>
                    <h3 className="text-xs font-bold line-clamp-2 mb-2 group-hover:text-zinc-700 transition-colors">{offer.name}</h3>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-sm font-display font-bold text-zinc-900">{offer.price}</span>
                    <ExternalLink className="w-3 h-3 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                  </div>
                </a>
              ))}
            </div>
            <div className="mt-10 text-center">
              <Link 
                to={`/model/${randomCategoryOffers.id}`}
                className="inline-flex items-center gap-2 px-8 py-3 bg-zinc-900 text-white rounded-full font-bold text-sm hover:bg-zinc-800 transition-all shadow-lg hover:shadow-xl"
              >
                Veja mais ofertas em {randomCategoryOffers.name} <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        )}
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-0 md:pt-8 pb-8"
    >
      <Helmet>
        <title>{model.name} | MobiStyle</title>
        <meta name="description" content={model.description} />
        <link rel="canonical" href={canonicalUrl} />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="product" />
        <meta property="og:url" content={canonicalUrl} />
        <meta property="og:title" content={`${model.name} | MobiStyle`} />
        <meta property="og:description" content={model.description} />
        <meta property="og:image" content={modelImage} />
        <meta property="og:image:secure_url" content={modelImage} />
        <meta property="og:image:width" content="1200" />
        <meta property="og:image:height" content="630" />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content={canonicalUrl} />
        <meta property="twitter:title" content={`${model.name} | MobiStyle`} />
        <meta property="twitter:description" content={model.description} />
        <meta property="twitter:image" content={modelImage} />

        <script type="application/ld+json">
          {JSON.stringify(structuredData)}
        </script>
      </Helmet>
      <div className="mb-12">
        <div className="flex items-center gap-3 text-[10px] text-zinc-400 mb-4 pt-8 md:pt-0 uppercase tracking-widest font-bold">
          <Link to="/" className="hover:text-zinc-900 transition-colors">Home</Link>
          <ChevronRight className="w-2.5 h-2.5" />
          <Link to={`/category/${model.categoryId}`} className="hover:text-zinc-900 transition-colors">
            {data.categories.find(c => c.id === model.categoryId)?.name}
          </Link>
          <ChevronRight className="w-2.5 h-2.5" />
          <span className="text-zinc-900">{model.name}</span>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 items-start">
          {model.image && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="aspect-[4/3] -mx-4 sm:-mx-6 md:mx-0 rounded-none md:rounded-2xl overflow-hidden bg-zinc-50 border border-zinc-100"
            >
              <img 
                src={getAssetPath(model.image)} 
                alt={model.name} 
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (!target.src.includes('images.unsplash.com')) {
                    target.src = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop';
                  }
                }}
              />
            </motion.div>
          )}

          <div className="space-y-6">
            <h1 className="text-3xl md:text-5xl font-display font-bold tracking-tight leading-tight">{model.name}</h1>
            
            <div className="prose prose-zinc max-w-none">
              <p className="text-zinc-600 text-[13px] leading-relaxed">
                {model.description}
              </p>
            </div>

            {model.specs && model.specs.length > 0 && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 xl:grid-cols-4 gap-3">
                {model.specs.map((spec, i) => (
                  <div key={i} className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                    <span className="text-[9px] text-zinc-400 uppercase font-bold block mb-0.5">{spec.label}</span>
                    <span className="text-xs font-bold">{spec.value}</span>
                  </div>
                ))}
              </div>
            )}
            
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                <span className="text-[9px] text-zinc-400 uppercase font-bold block mb-0.5">Categoria</span>
                <span className="text-xs font-bold">{data.categories.find(c => c.id === model.categoryId)?.name}</span>
              </div>
              <div className="bg-zinc-50 p-3 rounded-xl border border-zinc-100">
                <span className="text-[9px] text-zinc-400 uppercase font-bold block mb-0.5">Acessórios</span>
                <span className="text-xs font-bold">{model.affiliates.length} itens</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-12">
          {/* 1. Seminovas no Webmotors */}
          {model.usedBikes.length > 0 && (
            <section>
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-display font-bold tracking-tight">Seminovas no Webmotors</h2>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {model.usedBikes.map((bike, i) => (
                  <a 
                    key={i} 
                    href={bike.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="group bg-white border border-zinc-100 rounded-xl overflow-hidden hover:border-zinc-300 transition-all flex flex-col"
                  >
                    <div className="aspect-[4/3] overflow-hidden bg-zinc-50">
                      <img 
                        src={getAssetPath(bike.image_url || '/images/logo.png')} 
                        alt={bike.title} 
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        referrerPolicy="no-referrer"
                        onError={(e) => {
                          const target = e.target as HTMLImageElement;
                          if (!target.src.includes('images.unsplash.com')) {
                            target.src = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop';
                          }
                        }}
                      />
                    </div>
                    <div className="p-3 flex flex-col flex-grow">
                      <div className="flex justify-between items-start mb-1">
                        <h3 className="font-bold text-[11px] leading-tight text-zinc-900 group-hover:text-zinc-700 transition-colors line-clamp-2 h-8">{bike.title}</h3>
                        <ExternalLink className="w-3 h-3 text-zinc-300 group-hover:text-zinc-900 transition-colors flex-shrink-0 ml-1" />
                      </div>
                      
                      <div className="mt-auto pt-2 border-t border-zinc-50 flex items-center justify-between">
                        <span className="text-sm font-display font-bold text-zinc-900">
                          {new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 }).format(bike.price)}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>
            </section>
          )}

          {/* 3. Melhores Ofertas & Acessórios */}
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-display font-bold tracking-tight flex items-center gap-2">
                <Tag className="w-5 h-5 text-zinc-900" /> Melhores Ofertas & Acessórios
              </h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
              {model.affiliates.map((item, i) => (
                <motion.div 
                  key={i} 
                  className="group bg-white p-3 rounded-xl border border-zinc-100 hover:border-zinc-300 transition-all flex flex-col"
                >
                  <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-zinc-50">
                    <img 
                      src={getAssetPath(item.image)} 
                      alt={item.name} 
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                      referrerPolicy="no-referrer"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        if (!target.src.includes('images.unsplash.com')) {
                          target.src = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop';
                        }
                      }}
                    />
                  </div>
                  <div className="flex-grow space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="text-[8px] font-bold uppercase tracking-widest text-zinc-400">{item.store}</span>
                    </div>
                    <h3 className="text-[11px] font-bold text-zinc-800 line-clamp-2 leading-tight">{item.name}</h3>
                    <div className="text-sm font-display font-bold text-zinc-900">{item.price}</div>
                  </div>
                  <a 
                    href={item.url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="w-full mt-3 py-1.5 bg-zinc-900 text-white text-[10px] font-bold rounded-lg flex items-center justify-center gap-1.5 hover:bg-zinc-800 transition-colors"
                  >
                    Comprar <ExternalLink className="w-2.5 h-2.5" />
                  </a>
                </motion.div>
              ))}
            </div>
          </section>
        </div>

        {/* Sidebar - News & Reviews */}
        <div className="space-y-8">
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-display font-bold tracking-tight">Notícias & Reviews</h2>
            </div>
            <div className="space-y-3">
              {visibleNews.map((n, i) => (
                <div key={i} className="bg-white p-4 rounded-xl border border-zinc-100 hover:border-zinc-200 transition-colors">
                  <div className="flex items-center justify-between mb-1.5">
                    <Link 
                      to={`/noticias?category=${encodeURIComponent(n.category || '')}`}
                      className="text-[9px] text-zinc-400 hover:text-zinc-900 uppercase font-bold tracking-wider"
                    >
                      {n.category}
                    </Link>
                    <span className="text-[9px] text-zinc-300 uppercase font-bold">{n.date}</span>
                  </div>
                  <h3 className="text-xs font-bold mb-2 line-clamp-2 leading-snug">{n.title}</h3>
                  <div className="flex items-center justify-between mt-3 pt-3 border-t border-zinc-50">
                    <Link to={`/noticia/${n.id}`} className="inline-flex items-center gap-1 text-[10px] font-bold hover:underline">
                      Ler mais <ChevronRight className="w-2.5 h-2.5" />
                    </Link>
                    <button 
                      onClick={(e) => {
                        e.preventDefault();
                        if (navigator.share) {
                          navigator.share({
                            title: n.title,
                            url: window.location.origin + `/noticia/${n.id}`
                          });
                        } else {
                          navigator.clipboard.writeText(window.location.origin + `/noticia/${n.id}`);
                          alert('Link copiado para a área de transferência!');
                        }
                      }}
                      className="p-1.5 rounded-full hover:bg-zinc-100 text-zinc-400 hover:text-zinc-900 transition-colors"
                      title="Compartilhar"
                    >
                      <Share2 className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              ))}
              {model.news.length > newsLimit && (
                <button 
                  onClick={() => setNewsLimit(prev => prev + 5)}
                  className="w-full py-2.5 bg-zinc-50 rounded-xl font-bold text-[10px] text-zinc-500 hover:bg-zinc-100 transition-colors uppercase tracking-widest"
                >
                  Ver mais notícias
                </button>
              )}
            </div>
          </section>
        </div>
      </div>

      {randomCategoryOffers && randomCategoryOffers.offers.length > 0 && (
        <div className="mt-16 pt-8 border-t border-zinc-100">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold tracking-tight">Ofertas em {randomCategoryOffers.name}</h2>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {randomCategoryOffers.offers.map((offer, i) => (
              <a 
                key={i} 
                href={offer.url} 
                target="_blank" 
                rel="noopener noreferrer"
                className="group bg-white p-3 rounded-xl border border-zinc-100 hover:border-zinc-300 transition-all flex flex-col"
              >
                <div className="aspect-square rounded-lg overflow-hidden mb-3 bg-zinc-50">
                  <img 
                    src={getAssetPath(offer.image)} 
                    alt={offer.name} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      if (!target.src.includes('images.unsplash.com')) {
                        target.src = 'https://images.unsplash.com/photo-1558981806-ec527fa84c39?q=80&w=800&auto=format&fit=crop';
                      }
                    }}
                  />
                </div>
                <div className="flex-grow">
                  <span className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest block mb-1">{offer.store}</span>
                  <h3 className="text-[11px] font-bold line-clamp-2 mb-1 group-hover:text-zinc-700 transition-colors leading-tight">{offer.name}</h3>
                </div>
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-xs font-display font-bold text-zinc-900">{offer.price}</span>
                  <ExternalLink className="w-2.5 h-2.5 text-zinc-400 group-hover:text-zinc-900 transition-colors" />
                </div>
              </a>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default function App() {
  const [data, setData] = useState<SiteData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [supaError, setSupaError] = useState<string | null>(null);
  const [supaDataCount, setSupaDataCount] = useState<number>(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const baseUrl = import.meta.env.BASE_URL || '/';
        const normalizedBaseUrl = baseUrl.endsWith('/') ? baseUrl : `${baseUrl}/`;
        
        const baseRes = await fetch(`${normalizedBaseUrl}base.json`);
        if (!baseRes.ok) throw new Error(`Falha ao carregar base.json: ${baseRes.status}`);
        const base = await baseRes.json();

        let news: NewsItem[] = [];
        let usedBikesData: Record<string, UsedBike[]> = {};
        let affiliatesData: Record<string, AffiliateLink[]> = {};

        const isSupabaseConfigured = import.meta.env.VITE_SUPABASE_URL && import.meta.env.VITE_SUPABASE_ANON_KEY;
        
        if (isSupabaseConfigured) {
          try {
            const [newsResult, usedResult, affiliatesResult] = await Promise.all([
              supabase.from('news').select('*').order('date', { ascending: false }),
              supabase.from('used_bikes').select('*'),
              supabase.from('affiliates').select('*')
            ]);

            if (newsResult.error) {
              setSupaError(newsResult.error.message);
            }

            if (newsResult.data && newsResult.data.length > 0) {
              setSupaDataCount(newsResult.data.length);
              news = newsResult.data.map(n => ({
                id: n.slug,
                modelIds: n.model_ids,
                title: n.title,
                summary: n.summary,
                content: n.content,
                category: n.category,
                image: n.image_url,
                date: (() => {
                  if (!n.date) return '';
                  const [year, month, day] = n.date.split('T')[0].split('-').map(Number);
                  return new Date(year, month - 1, day).toLocaleDateString('pt-BR');
                })()
              }));
            }

            if (usedResult.data && usedResult.data.length > 0) {
              usedResult.data.forEach(u => {
                if (!usedBikesData[u.model_id]) usedBikesData[u.model_id] = [];
                usedBikesData[u.model_id].push({
                  title: u.title,
                  price: Number(u.price),
                  image_url: u.image_url,
                  url: u.external_url
                });
              });
            }

            if (affiliatesResult.data && affiliatesResult.data.length > 0) {
              affiliatesResult.data.forEach(a => {
                if (!affiliatesData[a.model_id]) affiliatesData[a.model_id] = [];
                affiliatesData[a.model_id].push({
                  name: a.name,
                  price: a.price,
                  image: a.image_url,
                  url: a.affiliate_url,
                  store: a.store_name
                });
              });
            }
          } catch (supaErr) {
            setSupaError(supaErr instanceof Error ? supaErr.message : 'Unknown Supabase error');
            console.warn("Supabase fetch failed, falling back to JSON:", supaErr);
          }
        }

        // 3. Fallback to JSON if Supabase data is empty or failed
        if (news.length === 0) {
          const newsRes = await fetch(`${normalizedBaseUrl}news.json`);
          if (newsRes.ok) news = await newsRes.json();
        }
        
        if (Object.keys(usedBikesData).length === 0) {
          const usedBikesRes = await fetch(`${normalizedBaseUrl}used_bikes.json`);
          if (usedBikesRes.ok) usedBikesData = await usedBikesRes.json();
        }

        if (Object.keys(affiliatesData).length === 0) {
          const affiliatesRes = await fetch(`${normalizedBaseUrl}affiliates.json`);
          if (affiliatesRes.ok) affiliatesData = await affiliatesRes.json();
        }

        // 4. Merge data
        const mergedModels = base.models.map((m: any) => ({
          ...m,
          news: news.filter((n: any) => n.modelIds?.includes(m.id)),
          usedBikes: usedBikesData[m.id] || [],
          affiliates: affiliatesData[m.id] || []
        }));

        const homeNews = news.filter((n: any) => !n.modelIds || n.modelIds.length === 0);

        setData({
          categories: base.categories,
          models: mergedModels,
          homeNews: homeNews,
          socialLinks: base.socialLinks
        });
        setLoading(false);
      } catch (err) {
        console.error("Error loading data:", err);
        setError(err instanceof Error ? err.message : 'Erro desconhecido ao carregar dados');
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 border-4 border-zinc-200 border-t-zinc-900 rounded-full animate-spin"></div>
          <p className="font-display font-medium text-zinc-500">Carregando MobiStyle...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-zinc-50 p-4">
        <div className="max-w-md w-full bg-white p-8 rounded-2xl shadow-sm border border-zinc-100 text-center">
          <div className="w-12 h-12 bg-red-50 text-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
            <X className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-display font-bold mb-2">Erro ao carregar o site</h2>
          <p className="text-zinc-500 text-sm mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()}
            className="w-full py-3 bg-zinc-900 text-white rounded-xl font-bold hover:bg-zinc-800 transition-colors"
          >
            Tentar Novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <HelmetProvider>
      <Router basename={import.meta.env.BASE_URL}>
        <ScrollToTop />
        <div className="min-h-screen flex flex-col">
          <Navbar data={data} />
          <main className="flex-grow">
            <Routes>
              <Route path="/" element={<Home data={data} />} />
              <Route path="/noticias" element={<NewsList data={data} />} />
              <Route path="/noticia/:newsId" element={<NewsDetail data={data} />} />
              <Route path="/category/:categoryId" element={<CategoryPage data={data} />} />
              <Route path="/model/:modelId" element={<ModelPage data={data} />} />
            </Routes>
          </main>
          <Footer data={data} />
        </div>
      </Router>
    </HelmetProvider>
  );
}
