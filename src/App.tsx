import { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowRight, ArrowLeft, Plus, Minus, Trash2, Heart, Check, 
  ChevronRight, Sparkles, Percent, Truck, CreditCard, 
  ShoppingBag, SlidersHorizontal, Share2, Info, Star, ShieldCheck
} from 'lucide-react';

import { Product, CartItem, ScreenType } from './types';
import { products, staticBagItems } from './data';
import Header from './components/Header';
import Footer from './components/Footer';
import NotificationBar, { NotificationMessage } from './components/Notification';

export default function App() {
  // Screens state
  const [currentScreen, setScreen] = useState<ScreenType>('home');
  const [activeProduct, setActiveProduct] = useState<Product>(products[0]);
  
  // Cart state - Prepopulated with items from the checkout mockup!
  const [cartItems, setCartItems] = useState<CartItem[]>(staticBagItems);
  
  // Wishlist state
  const [wishlist, setWishlist] = useState<string[]>([]);
  
  // Notification system state
  const [notifications, setNotifications] = useState<NotificationMessage[]>([]);

  // Detailed Product Screen - Active size
  const [selectedSize, setSelectedSize] = useState<number>(9);
  // Detailed Product Screen - Active thumbnail image
  const [activeImageIndex, setActiveImageIndex] = useState<number>(0);

  // Catalog Filters State
  const [selectedCategory, setSelectedCategory] = useState<'Cricket' | 'Football' | 'Gym' | 'Skating' | 'Accessories' | 'All'>('All');
  const [activeFilterTags, setActiveFilterTags] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<number>(50000);
  const [sortOption, setSortOption] = useState<string>('high-performance');

  // Checkout inputs state
  const [shippingForm, setShippingForm] = useState({
    firstName: 'Arjun',
    lastName: 'Sharma',
    address: '12, Saheli Marg, Near Fatehsagar Lake',
    city: 'Udaipur',
    state: 'Rajasthan',
    pincode: '313001',
    phone: '+91 98290 12345',
    email: 'arjun@udaipurpro.com',
    promoCode: ''
  });
  const [appliedPromo, setAppliedPromo] = useState<boolean>(false);
  const [orderCompleted, setOrderCompleted] = useState<boolean>(false);

  // Notification triggers
  const addNotification = (title: string, body?: string, type: 'success' | 'info' | 'error' = 'success') => {
    const id = Date.now().toString();
    setNotifications((prev) => [...prev, { id, title, body, type }]);
    
    // Auto-remove after 4 seconds
    setTimeout(() => {
      setNotifications((prev) => prev.filter((item) => item.id !== id));
    }, 4000);
  };

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((item) => item.id !== id));
  };

  // Toggle wishlist
  const toggleWishlist = (productId: string) => {
    const inWishlist = wishlist.includes(productId);
    if (inWishlist) {
      setWishlist((prev) => prev.filter((id) => id !== productId));
      addNotification('Removed from Wishlist', 'Equipment removed from your saved items.', 'info');
    } else {
      setWishlist((prev) => [...prev, productId]);
      addNotification('Saved to Wishlist', 'We will alert you when stock or prices update.', 'success');
    }
  };

  // Add to cart function
  const addToCart = (product: Product, size?: number) => {
    setCartItems((prev) => {
      const existingIndex = prev.findIndex(
        (item) => item.product.id === product.id && item.selectedSize === size
      );

      if (existingIndex > -1) {
        const updated = [...prev];
        updated[existingIndex].quantity += 1;
        return updated;
      } else {
        return [...prev, { product, quantity: 1, selectedSize: size }];
      }
    });

    addNotification(
      'Added to Kit Bag', 
      `${product.name} ${size ? `(UK ${size})` : ''} successfully appended.`, 
      'success'
    );
  };

  // Modify cart quantity
  const updateCartQuantity = (productId: string, size: number | undefined, delta: number) => {
    setCartItems((prev) => {
      return prev.map((item) => {
        if (item.product.id === productId && item.selectedSize === size) {
          const newQty = item.quantity + delta;
          return { ...item, quantity: Math.max(1, newQty) };
        }
        return item;
      }).filter((item) => item.quantity > 0);
    });
  };

  // Remove from cart
  const removeFromCart = (productId: string, size: number | undefined) => {
    setCartItems((prev) => prev.filter((item) => !(item.product.id === productId && item.selectedSize === size)));
    addNotification('Item Discharged', 'The element was cleared from your shipping roster.', 'info');
  };

  // Catalog filtered list memo
  const filteredProducts = useMemo(() => {
    let result = [...products];

    // Filter by main category
    if (selectedCategory !== 'All') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    // Filter by custom checkable tags
    if (activeFilterTags.length > 0) {
      result = result.filter((p) => 
        p.tags && p.tags.some((tag) => activeFilterTags.includes(tag))
      );
    }

    // Filter by max price range
    result = result.filter((p) => p.price <= priceRange);

    // Sort options
    if (sortOption === 'price-high') {
      result.sort((a, b) => b.price - a.price);
    } else if (sortOption === 'price-low') {
      result.sort((a, b) => a.price - b.price);
    } else {
      // Default / High performance (prioritize tags and higher price)
      result.sort((a, b) => {
        const aScore = (a.tags?.length || 0) * 1000 + a.price;
        const bScore = (b.tags?.length || 0) * 1000 + b.price;
        return bScore - aScore;
      });
    }

    return result;
  }, [selectedCategory, activeFilterTags, priceRange, sortOption]);

  // Pricing calculations
  const cartValues = useMemo(() => {
    const subtotal = cartItems.reduce((acc, item) => acc + item.product.price * item.quantity, 0);
    const shipping = 0; // FREE
    const discount = appliedPromo ? Math.round(subtotal * 0.15) : 0;
    const taxes = Math.round((subtotal - discount) * 0.18); // 18% GST standard in India
    const total = subtotal - discount + taxes;

    return { subtotal, shipping, discount, taxes, total };
  }, [cartItems, appliedPromo]);

  // Overall cart items count badge
  const cartCount = useMemo(() => {
    return cartItems.reduce((acc, item) => acc + item.quantity, 0);
  }, [cartItems]);

  // Handler to navigate directly to product detail setup
  const navigateToProduct = (product: Product) => {
    setActiveProduct(product);
    setSelectedSize(product.sizes ? product.sizes[0] || 9 : 9);
    setActiveImageIndex(0);
    setScreen('detail');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="min-h-screen bg-[#f6f6f8] text-[#2d2f31] flex flex-col font-body antialiased pt-20 relative">
      {/* Dynamic Notifications Alerts */}
      <NotificationBar notifications={notifications} removeNotification={removeNotification} />

      {/* Flagship Aesthetic Floating Preview bar - Helps user easily review all 4 exact responsive screens */}
      <div 
        className="fixed bottom-4 left-1/2 -translate-x-1/2 z-55 bg-[#2d2f31]/95 text-white py-2.5 px-5 rounded-full border border-white/10 shadow-2xl flex items-center gap-3 backdrop-blur-md"
        id="debug-screen-nav"
      >
        <span className="text-[10px] font-headline font-black tracking-wider text-[#cafd00] border-r border-white/20 pr-3">PREVIEW SHIELDS</span>
        <div className="flex gap-1.5 md:gap-3 text-xs font-label">
          {(['home', 'catalog', 'detail', 'checkout'] as ScreenType[]).map((scr) => (
            <button
              key={scr}
              onClick={() => {
                setScreen(scr);
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className={`px-3 py-1.5 rounded-full transition-all cursor-pointer font-bold focus:outline-none capitalize ${
                currentScreen === scr 
                  ? 'bg-[#cafd00] text-[#4a5e00] scale-102 font-black shadow-lg' 
                  : 'text-white hover:text-[#cafd00] hover:bg-white/5'
              }`}
              id={`switch-screen-${scr}`}
            >
              {scr}
            </button>
          ))}
        </div>
      </div>

      {/* Main Header Component */}
      <Header 
        currentScreen={currentScreen} 
        setScreen={setScreen} 
        cartCount={cartCount} 
        setSelectedCategory={setSelectedCategory} 
      />

      {/* Screen Views rendering with AnimatePresence */}
      <main className="flex-1">
        <AnimatePresence mode="wait">
          
          {/* HOME SCREEN */}
          {currentScreen === 'home' && (
            <motion.div
              key="home-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="pb-24"
            >
              {/* Dynamic Split Hero Section */}
              <section className="relative min-h-[85vh] bg-[#1e2022] overflow-hidden flex items-center px-6 md:px-12 lg:px-24">
                {/* Background decorative grids */}
                <div className="absolute inset-0 bg-[radial-gradient(#ffffff08_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none" />
                <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-[#cafd00]/10 rounded-full blur-3xl pointer-events-none" />

                <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10 py-12">
                  
                  {/* Hero Left Content */}
                  <div className="lg:col-span-7 flex flex-col items-start text-left">
                    <span className="px-3.5 py-1.5 bg-[#cafd00]/10 border border-[#cafd00]/30 rounded-full text-xs font-label font-bold text-[#cafd00] tracking-wide mb-6 inline-flex items-center gap-1.5 animate-pulse uppercase">
                      <Sparkles className="w-3.5 h-3.5 text-[#cafd00]" /> Engineered for Udaipur athletes
                    </span>
                    
                    <h1 className="text-4xl sm:text-5xl md:text-6xl font-headline font-black tracking-tight text-white mb-6 leading-[1.05]">
                      GEAR UP <br className="hidden sm:inline" />
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#cafd00] to-white">
                        YOUR GAME
                      </span>
                    </h1>

                    <p className="text-[#acadaf] font-body text-base md:text-lg mb-10 max-w-xl leading-relaxed">
                      Equip your journey with master-crafted cricket bats, track-tuned racing skates, and reactive football silos. Designed to dominate fatehsagar loops and match days alike.
                    </p>

                    <div className="flex flex-wrap gap-4 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          setSelectedCategory('All');
                          setScreen('catalog');
                        }}
                        className="bg-[#cafd00] hover:bg-[#b5e200] text-[#4a5e00] font-headline font-extrabold text-sm tracking-wide px-8 py-4 rounded-xl transition-all shadow-[0_12px_24px_rgba(202,253,0,0.25)] hover:scale-102 flex items-center gap-2 cursor-pointer focus:outline-none"
                        id="hero-explore-btn"
                      >
                        EXPLORE ARSENAL <ArrowRight className="w-4 h-4 text-[#4a5e00]" />
                      </button>
                      
                      <button
                        onClick={() => {
                          setSelectedCategory('Cricket');
                          setScreen('catalog');
                        }}
                        className="bg-transparent border border-[#acadaf]/25 text-[#e1e2e5] hover:text-white hover:border-white font-headline font-bold text-sm tracking-wide px-7 py-4 rounded-xl transition-all cursor-pointer focus:outline-none"
                      >
                        VIEW CATEGORIES
                      </button>
                    </div>

                    {/* Bottom Status Info Block */}
                    <div className="flex gap-8 border-t border-[#acadaf]/10 pt-10 mt-12 text-[#acadaf] text-xs font-label tracking-wider uppercase">
                      <div>
                        <span className="text-white/40 block mb-1">STATUS</span>
                        <span className="text-[#cafd00] font-bold flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-[#cafd00] inline-block"></span> READY TO PLAY
                        </span>
                      </div>
                      <div>
                        <span className="text-white/40 block mb-1">COLLECTION</span>
                        <span className="text-white font-bold">WINTER '24 RELEASE</span>
                      </div>
                    </div>
                  </div>

                  {/* Hero Right Visuals - High Polish Clip Path Frame */}
                  <div className="lg:col-span-5 relative w-full h-[350px] sm:h-[450px] lg:h-[500px]">
                    <div className="absolute inset-0 border border-[#cafd00]/20 rounded-3xl translate-x-3 translate-y-3 pointer-events-none" />
                    
                    {/* Running Athletic Visual */}
                    <div 
                      className="w-full h-full rounded-3xl overflow-hidden relative shadow-2xl"
                      style={{
                        clipPath: 'polygon(0 0, 100% 0, 100% 90%, 15% 100%, 0 85%)'
                      }}
                    >
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnrzz3PoZ-VlX82036i-QVkJ_5ebPkIY54F9OaFrk6yULGeuMRDhChkQVm38Ord3gjHRznWRQZc6scHhVsNFk504-GczwuT75iANqgWt7XTUl1vGDj306n1Um6EZHTvWVNYuFvlBzhqLsMk4sQ6jvtRgXyN7KUBvFcSSuEhDkJMolVbG2MypxTKGdi4BGB8dK8iZcfUVKfSSs3-dID9Pw2l7gnsXBwFJ9xJMQI5MMusW5kDBa_WghXRXEQGN2s9U2Az1FCyW9G9lM" 
                        alt="Udaipur Elite Track Athlete Running" 
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover object-center filter grayscale-[30%] hover:scale-105 transition-transform duration-[4000ms] ease-out"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-[#1e2022] via-transparent to-transparent opacity-90" />
                      
                      {/* Floating overlay price tags */}
                      <div className="absolute bottom-6 left-6 bg-[#cafd00] text-[#4a5e00] px-4 py-2 rounded-xl border border-white/20 shadow-xl font-headline font-black text-sm flex items-center gap-2">
                        <span>AERO RACING SILO</span>
                        <span className="text-xs font-bold opacity-80">| PRO ONLY</span>
                      </div>
                    </div>
                  </div>

                </div>
              </section>

              {/* Bento Box Departments Section */}
              <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full">
                <div className="mb-14 text-left">
                  <h2 className="text-3xl md:text-4xl font-headline font-black tracking-tight text-[#2d2f31]">
                    DEPARTMENTS
                  </h2>
                  <p className="text-[#5a5c5d] font-body text-base mt-2 max-w-lg">
                    Select your division. Every zone curated with Olympic-level parameters.
                  </p>
                </div>

                {/* Bento Grid layout */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 auto-rows-[220px]">
                  
                  {/* Cricket - Big Double Card */}
                  <div 
                    onClick={() => {
                      setSelectedCategory('Cricket');
                      setScreen('catalog');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="md:col-span-8 md:row-span-2 rounded-3xl relative overflow-hidden group cursor-pointer shadow-md bg-white border border-[#acadaf]/15"
                    id="dept-cricket-card"
                  >
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDXueVaPEUtwt5qr4M5U9cvuWbsWTuuT-0aHxN30Sx9yk6XzaATekNT7j22ElWnHohLNFIMR2BYn_XXwCKNqRvHToFGexlO-9ubwd6GMywPEcqh9fuYxKb20gp0jGYUmEJwSkxM3MUQQemndBm_OVV8FUHYtIAOScI9J43O6mn8-7P31Om72gKkVkGTrQ1lEZmHFy9gwhfOUf2iUr6eaZg8eNaT7Jse6QgfGJAXWRzCXTg4fTXKI_ZYIO5pOByKX8V4Ivp2rfAP5SQ"
                      alt="Cricket Willow Bat on pitch"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover font-sans filter contrast-[1.05] brightness-90 group-hover:scale-103 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent flex flex-col justify-end p-6 md:p-8" />
                    <div className="absolute bottom-6 left-6 md:bottom-8 md:on-surface text-white flex flex-col max-w-md gap-1">
                      <span className="text-[#cafd00] font-label font-black text-xs uppercase tracking-widest">LIMITED EDITIONS AVAILABLE</span>
                      <h3 className="text-2xl md:text-3xl font-headline font-extrabold tracking-tight text-white mb-1">Cricket</h3>
                      <p className="text-xs md:text-sm text-[#e1e2e5]/80 font-body">English Willow bats shaped by pro-artisans. Certified grains and shock proof handles.</p>
                    </div>
                    {/* Hover arrow button */}
                    <div className="absolute top-6 right-6 bg-[#cafd00] p-3 rounded-full text-[#4a5e00] opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-xl">
                      <ArrowRight className="w-5 h-5" />
                    </div>
                  </div>

                  {/* Football - Compact Square Card */}
                  <div 
                    onClick={() => {
                      setSelectedCategory('Football');
                      setScreen('catalog');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="md:col-span-4 rounded-3xl relative overflow-hidden group cursor-pointer shadow-md bg-white border border-[#acadaf]/15"
                    id="dept-football-card"
                  >
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuBhn6KMaKR89cdnt9djyWDwJnY79y1i83guP0nhnIgj2Fs20eAxAtu7z5jIOWO-FLrywjSbhO4jNweOOQfDUl22o7GIQqdamqi7ps0EnQXsLDoJjeyZZiuR_uuDnRI-E-rNcyNRWzSoyiiln5gcWSfS8S4f6wP6_XmFqLl0S0fm8uPlbAsFRQH0l4vX4H36zX8dllqnjwdvhQvWzwzyGr3ucjftIaA3UJLabYxStqNLpcWGvGonPfDCCBSn4N3dQkwV7S-ojhWgCLg"
                      alt="Football boot action"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover filter brightness-[0.85] group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-5" />
                    <div className="absolute bottom-5 left-5 text-white flex flex-col gap-0.5">
                      <h3 className="text-xl font-headline font-extrabold tracking-tight">Football</h3>
                      <p className="text-xs text-[#e1e2e5]/80 font-body">Precision ground cleats.</p>
                    </div>
                  </div>

                  {/* Gym - Compact Square Card */}
                  <div 
                    onClick={() => {
                      setSelectedCategory('Gym');
                      setScreen('catalog');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="md:col-span-4 rounded-3xl relative overflow-hidden group cursor-pointer shadow-md bg-white border border-[#acadaf]/15"
                    id="dept-gym-card"
                  >
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDzUZHOVvWlp8z4LmkKm_q6eDrkF5SOe2dfvdID52MrvgXRTD02ABMjZ36WuLIHQDnyb5zjSpBYFSunWVo53-XMVZ58VNwfpbKqm-t8qw1Q7cE80uXY86pJiaATEVuHdF6YfF6EprDIzzI-QbjSe5oBW3-SiToxr-IAOJjZX1wpdvkxr5fhtbqvQgSkEkWRyoAJZHL78gYZH2qyYu2saPlr7LigOwp4LG5qXz5nVXAVBGqVXIA6UFAPLrervz7CU9g2YT2YbnsknLc"
                      alt="Gym Dumbbells weightlifting setup"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover filter brightness-[0.85] group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-5" />
                    <div className="absolute bottom-5 left-5 text-white flex flex-col gap-0.5">
                      <h3 className="text-xl font-headline font-extrabold tracking-tight">Gym & Fitness</h3>
                      <p className="text-xs text-[#e1e2e5]/80 font-body">Elite power structures.</p>
                    </div>
                  </div>

                  {/* Skating - Landscape Row Card at bottom */}
                  <div 
                    onClick={() => {
                      setSelectedCategory('Skating');
                      setScreen('catalog');
                      window.scrollTo({ top: 0, behavior: 'smooth' });
                    }}
                    className="md:col-span-4 rounded-3xl relative overflow-hidden group cursor-pointer shadow-md bg-white border border-[#acadaf]/15"
                    id="dept-skating-card"
                  >
                    <img 
                      src="https://lh3.googleusercontent.com/aida-public/AB6AXuDIpgxOj49AK7leqa1lzgG0qcse6cQwz8uaFGeQ5Y4lrSQcNxre5sqbq5Byk_m-OVh872dy0nzAc9FTQ1EBllX258081QSRxikU6IetbrJYTnOwlGe8fa6nse1MGhNH7yaT0NDJptPth-kdjUu3HUFaAOsnXeXGOxqQIOxp8gWiTgop1dn7kXJqhpLrmubYZ3zeS76bwhsKlOrX3AH4V3BK2jYoYSuHvAjcsJAi8yQCKNWxn2xlUYBg-rpkahpMVJiJ4nwP6G33O5g"
                      alt="Inline roller skating close up"
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover filter brightness-[0.85] group-hover:scale-105 transition-transform duration-700 ease-out"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent flex flex-col justify-end p-5" />
                    <div className="absolute bottom-5 left-5 text-white flex flex-col gap-0.5">
                      <h3 className="text-xl font-headline font-extrabold tracking-tight">Skating</h3>
                      <p className="text-xs text-[#e1e2e5]/80 font-body">Stable high-speed racing chassis.</p>
                    </div>
                  </div>

                </div>
              </section>

              {/* Elite Arsenal Featured Grid Product Carousel */}
              <section className="py-20 bg-gradient-to-b from-[#f0f1f3] to-[#f6f6f8] px-6 md:px-12 border-y border-[#acadaf]/10">
                <div className="max-w-7xl mx-auto w-full">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                    <div className="text-left">
                      <span className="text-xs font-label font-bold text-[#5a5c5d] tracking-widest uppercase block mb-1">RECOMMENDED EXCLUSIVES</span>
                      <h2 className="text-3xl md:text-4xl font-headline font-black tracking-tight text-[#2d2f31]">
                        ELITE ARSENAL
                      </h2>
                      <p className="text-[#5a5c5d] font-body text-sm mt-1 max-w-md">
                        Professional grade equipment tested at peak friction and load rates.
                      </p>
                    </div>
                    
                    <button
                      onClick={() => {
                        setSelectedCategory('All');
                        setScreen('catalog');
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="text-sm font-label font-black text-[#4e6300] hover:text-[#4a5e00] hover:translate-x-1.5 transition-all flex items-center gap-1 bg-white px-5 py-2.5 rounded-full border border-[#acadaf]/20 cursor-pointer"
                    >
                      BROWSE ALL HARNESSES <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Curated Grid of products */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {products.slice(6, 10).map((prod) => (
                      <div 
                        key={prod.id}
                        className="bg-white rounded-2xl border border-[#acadaf]/15 overflow-hidden flex flex-col h-full group hover:shadow-xl hover:border-[#4e6300]/25 transition-all duration-300"
                        id={`product-card-${prod.id}`}
                      >
                        {/* Image Frame */}
                        <div 
                          className="w-full aspect-[4/3] bg-[#fcfcfc] flex items-center justify-center p-4 overflow-hidden relative cursor-pointer"
                          onClick={() => navigateToProduct(prod)}
                        >
                          {/* Tags indicator */}
                          {prod.id === 'aero-form-pro-gloves' && (
                            <span className="absolute top-3 left-3 bg-[#1e2022] text-white font-label font-black text-[9px] tracking-wider px-2 py-1 rounded">
                              LIMITED STOCK
                            </span>
                          )}
                          <img 
                            src={prod.image} 
                            alt={prod.name} 
                            referrerPolicy="no-referrer"
                            className="max-h-full max-w-full object-contain filter group-hover:scale-108 transition-transform duration-500" 
                          />
                          {/* Interactive Hover Add Cart overlay */}
                          <div className="absolute inset-x-0 bottom-0 py-2.5 bg-black/80 backdrop-blur-sm text-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 flex items-center justify-center gap-1.5 text-xs text-white uppercase font-bold tracking-wider">
                            <Sparkles className="w-3 text-[#cafd00] animate-pulse" /> Click to View Specs
                          </div>
                        </div>

                        {/* Text Block */}
                        <div className="p-5 flex flex-col flex-1">
                          <span className="text-[10px] font-label font-bold text-[#757779] tracking-wider uppercase mb-1">
                            {prod.subtext}
                          </span>
                          <h3 
                            className="font-headline font-extrabold text-sm text-[#2d2f31] group-hover:text-[#4e6300] transition-colors leading-tight mb-2 cursor-pointer flex-1"
                            onClick={() => navigateToProduct(prod)}
                          >
                            {prod.name}
                          </h3>
                          
                          <div className="flex items-center justify-between mt-auto pt-4 border-t border-[#acadaf]/10">
                            <div className="flex flex-col text-left">
                              <span className="text-base font-headline font-black text-[#2d2f31]">
                                ₹{prod.price.toLocaleString('en-IN')}
                              </span>
                              {prod.originalPrice && (
                                <span className="text-[10px] line-through text-[#757779] font-label -mt-1">
                                  ₹{prod.originalPrice.toLocaleString('en-IN')}
                                </span>
                              )}
                            </div>

                            {/* Wishlist and Quick buy icons */}
                            <div className="flex gap-1.5">
                              <button
                                onClick={() => toggleWishlist(prod.id)}
                                className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                  wishlist.includes(prod.id)
                                    ? 'bg-rose-50 border-rose-200 text-rose-500'
                                    : 'bg-[#f6f6f8] border-[#acadaf]/20 text-[#5a5c5d] hover:text-rose-500 hover:bg-rose-50'
                                }`}
                                aria-label="Add to Wishlist"
                              >
                                <Heart className={`w-3.5 h-3.5 ${wishlist.includes(prod.id) ? 'fill-rose-500' : ''}`} />
                              </button>
                              <button
                                onClick={() => addToCart(prod)}
                                className="bg-[#cafd00] hover:bg-[#b5e200] text-[#4a5e00] p-2 rounded-xl transition-all font-bold shadow-[0_4px_10px_rgba(202,253,0,0.2)] focus:outline-none cursor-pointer"
                                aria-label="Quick Add to Cart"
                              >
                                <Plus className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </section>

              {/* BUILT FOR THE PROS: Editorial testimonial and validation stats */}
              <section className="py-24 px-6 md:px-12 max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                {/* Left Testimonial */}
                <div className="lg:col-span-7 text-left">
                  <span className="text-[#4e6300] font-label font-black text-xs uppercase tracking-widest block mb-4">
                    BUILT FOR THE PROS
                  </span>
                  
                  <blockquote className="mb-8">
                    <p className="text-xl md:text-2xl font-headline font-medium italic text-[#1e2022] leading-relaxed relative">
                      "The precision of Udaipur Sports' equipment is unmatched. From specialized grain count on English willow to reactive footwear grip, they understand athletes require perfection."
                    </p>
                  </blockquote>

                  {/* athlete author card */}
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-[#cafd00]">
                      <img 
                        src="https://lh3.googleusercontent.com/aida-public/AB6AXuDnrzz3PoZ-VlX82036i-QVkJ_5ebPkIY54F9OaFrk6yULGeuMRDhChkQVm38Ord3gjHRznWRQZc6scHhVsNFk504-GczwuT75iANqgWt7XTUl1vGDj306n1Um6EZHTvWVNYuFvlBzhqLsMk4sQ6jvtRgXyN7KUBvFcSSuEhDkJMolVbG2MypxTKGdi4BGB8dK8iZcfUVKfSSs3-dID9Pw2l7gnsXBwFJ9xJMQI5MMusW5kDBa_WghXRXEQGN2s9U2Az1FCyW9G9lM"
                        alt="Testimonial Pro Athlete"
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-cover grayscale"
                      />
                    </div>
                    <div>
                      <h4 className="font-headline font-extrabold text-sm text-[#2d2f31]">Arjun Choudhary</h4>
                      <p className="text-xs text-[#5a5c5d] font-label">State First-Class Batsman, Rajasthan</p>
                    </div>
                  </div>
                </div>

                {/* Right Statistics Box */}
                <div className="lg:col-span-5 bg-[#1e2022] rounded-3xl p-8 text-white relative overflow-hidden self-stretch flex flex-col justify-between border border-white/5">
                  <div className="absolute top-0 right-0 w-44 h-44 bg-[#cafd00]/5 rounded-full blur-2xl" />
                  
                  <div>
                    <span className="text-[#cafd00] font-label font-bold text-xs uppercase tracking-widest block mb-3">
                      PRO GRID PROVEN
                    </span>
                    <div className="text-6xl md:text-7xl font-headline font-black text-white tracking-tighter mb-4">
                      98%
                    </div>
                    <p className="text-sm text-[#acadaf] leading-relaxed mb-6">
                      Elite athletes from Udaipur select and validate structural metrics on custom bats, athletic cages, and traction pads before matching.
                    </p>
                  </div>

                  <div className="py-4 border-t border-white/10 flex items-center justify-between text-[#acadaf] text-xs font-label">
                    <span className="flex items-center gap-1.5">
                      <ShieldCheck className="w-4 h-4 text-[#cafd00]" /> Shock Tested Lab Certification
                    </span>
                  </div>
                </div>
              </section>

            </motion.div>
          )}

          {/* CATALOG / PRODUCTS FILTER SCREEN */}
          {currentScreen === 'catalog' && (
            <motion.div
              key="catalog-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto w-full px-6 md:px-12 py-12"
            >
              {/* Product header breadcrumb */}
              <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-10 gap-4 text-left">
                <div>
                  <div className="flex items-center gap-1.5 text-xs font-label text-[#5a5c5d] mb-2">
                    <span className="hover:text-[#4e6300] cursor-pointer" onClick={() => setScreen('home')}>HOME</span>
                    <ChevronRight className="w-3 h-3 text-[#acadaf]" />
                    <span className="text-[#2d2f31] font-bold">PREMIUM HARDWARE</span>
                  </div>
                  <h1 className="text-3xl md:text-4xl font-headline font-black tracking-tight text-[#2d2f31]">
                    PREMIUM HARDWARE
                  </h1>
                  <p className="text-[#5a5c5d] font-body text-sm mt-1">
                    {filteredProducts.length} Items Engineered for Udaipur Pros
                  </p>
                </div>

                {/* Sorting Controls */}
                <div className="flex items-center gap-2 font-label text-xs">
                  <span className="text-[#757779]">Sort by:</span>
                  <select 
                    value={sortOption}
                    onChange={(e) => setSortOption(e.target.value)}
                    className="bg-white border border-[#acadaf]/25 rounded-lg py-2 px-3 text-[#2d2f31] outline-none font-bold focus:border-[#4e6300] cursor-pointer"
                  >
                    <option value="high-performance">High Performance</option>
                    <option value="price-high">Price: High-Low</option>
                    <option value="price-low">Price: Low-High</option>
                  </select>
                </div>
              </div>

              {/* Main Content Layout with Left technical Sidebar */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left side Filter Board Column */}
                <div className="lg:col-span-3 bg-white border border-[#acadaf]/15 p-6 rounded-3xl text-left shadow-sm sticky top-24">
                  <div className="flex items-center gap-1.5 font-headline font-bold text-base tracking-wide uppercase text-[#2d2f31] pb-4 border-b border-[#acadaf]/10 mb-6">
                    <SlidersHorizontal className="w-4 h-4 text-[#4e6300]" /> TECHNICAL SIDEBAR
                  </div>

                  {/* Standard Category selectors inside Sidebar */}
                  <div className="mb-6">
                    <h4 className="text-xs font-headline font-extrabold tracking-wider uppercase text-[#757779] mb-3">
                      DIVISION CATEGORY
                    </h4>
                    <div className="flex flex-col gap-2 font-label text-sm">
                      {['All', 'Cricket', 'Football', 'Gym', 'Skating', 'Accessories'].map((cat) => (
                        <button
                          key={cat}
                          onClick={() => setSelectedCategory(cat as any)}
                          className={`w-full text-left py-1 px-3.5 rounded-lg transition-all cursor-pointer font-bold ${
                            selectedCategory === cat
                              ? 'bg-[#cafd00]/30 text-[#4a5e00] text-glow'
                              : 'text-[#5a5c5d] hover:text-[#2d2f31] hover:bg-[#f0f1f3]'
                          }`}
                        >
                          {cat}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Filter Tags Checkbox */}
                  <div className="mb-6 pt-5 border-t border-[#acadaf]/10">
                    <h4 className="text-xs font-headline font-extrabold tracking-wider uppercase text-[#757779] mb-3">
                      SPECIFICATION RATING
                    </h4>
                    <div className="flex flex-col gap-2.5 font-label text-xs text-[#5a5c5d] font-bold">
                      {[
                        { label: 'Elite Performance Only', tag: 'Elite Performance' },
                        { label: 'Match Day Gear', tag: 'Match Day Gear' },
                        { label: 'Training Essentials', tag: 'Training Essentials' },
                        { label: 'Limited Release', tag: 'Limited' }
                      ].map((item) => {
                        const isChecked = activeFilterTags.includes(item.tag);
                        return (
                          <label key={item.tag} className="flex items-center gap-2 cursor-pointer group">
                            <input 
                              type="checkbox"
                              checked={isChecked}
                              onChange={() => {
                                if (isChecked) {
                                  setActiveFilterTags(prev => prev.filter(t => t !== item.tag));
                                } else {
                                  setActiveFilterTags(prev => [...prev, item.tag]);
                                }
                              }}
                              className="accent-[#4e6300] rounded focus:ring-0 focus:outline-none cursor-pointer w-4 h-4"
                            />
                            <span className="group-hover:text-[#2d2f31] transition-colors">{item.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  {/* Price Slider State */}
                  <div className="mb-6 pt-5 border-t border-[#acadaf]/10">
                    <div className="flex justify-between items-center mb-2 text-xs font-headline font-extrabold text-[#757779] tracking-wider uppercase">
                      <span>BUDGET ROSTER</span>
                      <span className="text-[#4e6300] font-black font-label text-sm">₹{priceRange.toLocaleString('en-IN')}</span>
                    </div>
                    <input 
                      type="range"
                      min={500}
                      max={50000}
                      step={500}
                      value={priceRange}
                      onChange={(e) => setPriceRange(Number(e.target.value))}
                      className="w-full h-1.5 bg-[#f0f1f3] rounded-lg appearance-none cursor-pointer accent-[#4e6300]"
                    />
                    <div className="flex justify-between text-[10px] text-[#acadaf] mt-1 font-label">
                      <span>₹500</span>
                      <span>₹50,000</span>
                    </div>
                  </div>

                  {/* Dynamic Neon promotional code discount widget */}
                  <div className="bg-[#1e2022] rounded-2xl p-5 border border-white/5 relative overflow-hidden text-white mt-10">
                    <div className="absolute -top-1/2 -right-1/2 w-36 h-36 bg-[#cafd00]/10 rounded-full blur-2xl" />
                    <Percent className="w-8 h-8 text-[#cafd00] mb-3" />
                    <h5 className="font-headline font-black text-sm text-white mb-1">MEMBER EXCLUSIVES</h5>
                    <p className="text-[11px] text-[#acadaf] leading-normal mb-4 font-body">
                      Enter discount coupon <strong className="text-[#cafd00] tracking-widest font-mono">UDAIPUR15</strong> at checkout to unlock 15% discount instantly.
                    </p>
                    <button
                      onClick={() => {
                        setAppliedPromo(true);
                        addNotification('VIP Discount Coupon Activated', '15% will be deducted at order completion summary.', 'success');
                      }}
                      className="w-full py-2 bg-[#cafd00] text-[#4a5e00] hover:bg-[#b5e200] font-headline font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                    >
                      Unlock discount
                    </button>
                  </div>
                </div>

                {/* Right side Grid Layout of filtered products */}
                <div className="lg:col-span-9 flex flex-col gap-8">
                  {filteredProducts.length === 0 ? (
                    <div className="bg-white border border-[#acadaf]/15 rounded-3xl p-16 text-center shadow-sm">
                      <SlidersHorizontal className="w-12 h-12 text-[#acadaf] mx-auto mb-4" />
                      <h3 className="font-headline font-extrabold text-lg text-[#2d2f31]">NO GEAR DISCOVERED</h3>
                      <p className="text-[#5a5c5d] font-body text-sm mt-1 max-w-sm mx-auto">
                        We couldn't track equipment with your requested filters or budget range. Expand parameters and try again.
                      </p>
                      <button
                        onClick={() => {
                          setSelectedCategory('All');
                          setActiveFilterTags([]);
                          setPriceRange(50000);
                          setSortOption('high-performance');
                        }}
                        className="mt-6 px-6 py-2.5 bg-[#cafd00] text-[#4a5e00] rounded-xl font-headline font-bold text-xs"
                      >
                        RESET ALL FILTERS
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {filteredProducts.map((prod) => (
                        <div 
                          key={prod.id}
                          className="bg-white rounded-2xl border border-[#acadaf]/15 overflow-hidden flex flex-col h-full group hover:shadow-xl hover:border-[#4e6300]/25 transition-all duration-300"
                        >
                          {/* Product Image Stage */}
                          <div 
                            className="w-full aspect-[4/3] bg-[#fcfcfc] flex items-center justify-center p-4 relative cursor-pointer overflow-hidden"
                            onClick={() => navigateToProduct(prod)}
                          >
                            {/* Tags pill */}
                            {prod.tags && prod.tags.slice(0, 1).map((tg) => (
                              <span key={tg} className="absolute top-3 left-3 bg-[#f0f1f3] text-[#2d2f31] font-label font-bold text-[9px] tracking-wider px-2 py-1 rounded border border-[#acadaf]/20 uppercase">
                                {tg === 'Elite Performance' ? 'ELITE PRO' : tg}
                              </span>
                            ))}

                            <img 
                              src={prod.image} 
                              alt={prod.name} 
                              referrerPolicy="no-referrer"
                              className="max-h-full max-w-full object-contain filter group-hover:scale-105 transition-transform duration-500" 
                            />
                            
                            {/* Speed overlays specs block */}
                            <div className="absolute inset-x-0 bottom-0 py-2.5 bg-black/85 backdrop-blur-sm text-center transform translate-y-full group-hover:translate-y-0 transition-transform duration-300 text-xs text-white uppercase font-bold tracking-wider">
                              ⚡ View Technical Specs
                            </div>
                          </div>

                          {/* Detail block */}
                          <div className="p-5 flex flex-col flex-1">
                            <span className="text-[10px] font-label font-bold text-[#757779] tracking-wider uppercase mb-1">
                              {prod.subtext}
                            </span>
                            <h3 
                              className="font-headline font-extrabold text-sm text-[#2d2f31] group-hover:text-[#4e6300] transition-colors leading-tight mb-2 flex-1 cursor-pointer"
                              onClick={() => navigateToProduct(prod)}
                            >
                              {prod.name}
                            </h3>
                            <p className="text-xs text-[#5a5c5d] font-body line-clamp-2 leading-relaxed mb-4">
                              {prod.description}
                            </p>

                            <div className="flex items-center justify-between pt-4 border-t border-[#acadaf]/10 mt-auto">
                              <div className="flex flex-col text-left">
                                <span className="text-base font-headline font-black text-[#2d2f31]">
                                  ₹{prod.price.toLocaleString('en-IN')}
                                </span>
                                {prod.originalPrice && (
                                  <span className="text-[10px] line-through text-[#757779] font-label -mt-1">
                                    ₹{prod.originalPrice.toLocaleString('en-IN')}
                                  </span>
                                )}
                              </div>

                              {/* Buttons action indicators */}
                              <div className="flex gap-1.5">
                                <button
                                  onClick={() => toggleWishlist(prod.id)}
                                  className={`p-2 rounded-xl border transition-all cursor-pointer ${
                                    wishlist.includes(prod.id)
                                      ? 'bg-rose-50 border-rose-200 text-rose-500'
                                      : 'bg-[#f6f6f8] border-[#acadaf]/20 text-[#5a5c5d] hover:text-rose-500 hover:bg-rose-50'
                                  }`}
                                  aria-label="Wishlist Item"
                                >
                                  <Heart className={`w-3.5 h-3.5 ${wishlist.includes(prod.id) ? 'fill-rose-500' : ''}`} />
                                </button>
                                <button
                                  onClick={() => addToCart(prod)}
                                  className="bg-[#cafd00] hover:bg-[#b5e200] text-[#4a5e00] px-3.5 py-2 rounded-xl transition-all font-headline font-extrabold text-xs tracking-wider flex items-center gap-1 shadow-[0_4px_10px_rgba(202,253,0,0.2)] cursor-pointer"
                                  aria-label="Add Gear"
                                >
                                  ADD TO BAG <Plus className="w-3" />
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>
            </motion.div>
          )}

          {/* PRODUCT DETAIL SCREEN */}
          {currentScreen === 'detail' && (
            <motion.div
              key="detail-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto w-full px-6 md:px-12 py-12"
            >
              {/* Product page Breadcrumb with navigation details */}
              <div className="flex items-center gap-1.5 text-xs font-label text-[#5a5c5d] mb-10 text-left">
                <span className="hover:text-[#4e6300] cursor-pointer" onClick={() => setScreen('home')}>HOME</span>
                <ChevronRight className="w-3 h-3 text-[#acadaf]" />
                <span className="hover:text-[#4e6300] cursor-pointer" onClick={() => setScreen('catalog')}>{activeProduct.category.toUpperCase()}</span>
                <ChevronRight className="w-3 h-3 text-[#acadaf]" />
                <span className="text-[#2d2f31] font-bold">{activeProduct.name}</span>
              </div>

              {/* Core Detail Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start mb-20 text-left">
                
                {/* Left Side: Media Imagery with Dynamic Thumbnails */}
                <div className="lg:col-span-7 flex flex-col gap-4">
                  
                  {/* Large High precision image preview */}
                  <div className="bg-white border border-[#acadaf]/15 rounded-3xl aspect-[4/3] w-full flex items-center justify-center p-8 relative overflow-hidden shadow-sm">
                    {/* Elite spec badge */}
                    <span className="absolute top-4 left-4 bg-[#cafd00] text-[#4a5e00] font-label font-bold text-xs px-3.5 py-1.5 rounded-full shadow-[0_4px_10px_rgba(202,253,0,0.15)] uppercase">
                      ELITE PERFORMANCE
                    </span>
                    
                    <img 
                      src={activeProduct.images ? activeProduct.images[activeImageIndex] : activeProduct.image} 
                      alt={activeProduct.name} 
                      referrerPolicy="no-referrer"
                      className="max-h-full max-w-full object-contain filter drop-shadow-xl" 
                    />
                  </div>

                  {/* Thumbnail Carousel lists */}
                  {activeProduct.images && activeProduct.images.length > 0 && (
                    <div className="grid grid-cols-5 gap-3">
                      {activeProduct.images.map((imgUrl, idx) => (
                        <button
                          key={idx}
                          onClick={() => setActiveImageIndex(idx)}
                          className={`aspect-square bg-white border rounded-xl overflow-hidden p-2 flex items-center justify-center transition-all cursor-pointer ${
                            activeImageIndex === idx 
                              ? 'border-[#4e6300] ring-2 ring-[#4e6300]/25' 
                              : 'border-[#acadaf]/15 hover:border-[#757779]'
                          }`}
                          aria-label={`View Product Image ${idx + 1}`}
                        >
                          <img 
                            src={imgUrl} 
                            alt={`Thumbnail view ${idx + 1}`} 
                            referrerPolicy="no-referrer"
                            className="max-h-full max-w-full object-contain mix-blend-multiply" 
                          />
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Right Side: Technical Specs & Controls Panel */}
                <div className="lg:col-span-5 flex flex-col justify-center">
                  <span className="text-xs font-label font-bold text-[#757779] tracking-wider uppercase mb-1">
                    {activeProduct.subtext || 'Udaipur Sports Innovation'}
                  </span>
                  
                  <h1 className="text-3xl md:text-4xl font-headline font-black tracking-tight text-[#2d2f31] mb-4 leading-none">
                    {activeProduct.name.split(' ').slice(0, -2).join(' ')} <span className="text-[#4e6300]">{activeProduct.name.split(' ').slice(-2).join(' ')}</span>
                  </h1>

                  {/* Pricing Frame */}
                  <div className="flex items-center gap-4 mb-6">
                    <span className="text-2xl font-headline font-black text-[#2d2f31]">
                      ₹{activeProduct.price.toLocaleString('en-IN')}.00
                    </span>
                    {activeProduct.originalPrice && (
                      <span className="text-sm line-through text-[#acadaf] font-label">
                        ₹{activeProduct.originalPrice.toLocaleString('en-IN')}.00
                      </span>
                    )}
                    <span className="text-[10px] uppercase font-bold text-[#cafd00] bg-[#1e2022] font-label px-2.5 py-1 rounded">
                      TAXES INCLUDED
                    </span>
                  </div>

                  <p className="text-sm md:text-base text-[#5a5c5d] font-body mb-8 leading-relaxed">
                    {activeProduct.description}
                  </p>

                  {/* UK Size Selectors */}
                  {activeProduct.sizes && (
                    <div className="mb-8">
                      <div className="flex justify-between items-center mb-3 text-xs font-headline font-extrabold text-[#757779] tracking-wider uppercase">
                        <span>SELECT SIZE (UK)</span>
                        <a href="#guide" className="text-[#4e6300] underline font-bold cursor-pointer">SIZE GUIDE</a>
                      </div>
                      
                      <div className="grid grid-cols-6 gap-2">
                        {activeProduct.sizes.map((sz) => {
                          const isSelected = selectedSize === sz;
                          const isDisabled = sz === 12; // simulated simulated out of stock size
                          
                          return (
                            <button
                              key={sz}
                              disabled={isDisabled}
                              onClick={() => setSelectedSize(sz)}
                              className={`py-3.5 rounded-lg text-xs font-headline font-black border transition-all uppercase cursor-pointer flex items-center justify-center ${
                                isDisabled 
                                  ? 'bg-[#f0f1f3] border-[#acadaf]/10 text-[#acadaf] line-through cursor-not-allowed opacity-50'
                                  : isSelected
                                    ? 'bg-[#1e2022] text-white border-black shadow-lg scale-102'
                                    : 'bg-white text-[#2d2f31] border-[#acadaf]/20 hover:border-[#757779]'
                              }`}
                              aria-label={`UK size ${sz}`}
                            >
                              {sz}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Specs parameters lists */}
                  <div className="grid grid-cols-2 gap-4 border-y border-[#acadaf]/15 py-6 mb-8 text-xs font-label text-[#5a5c5d]">
                    <div className="flex flex-col text-left gap-0.5">
                      <span className="text-[#757779] tracking-wider uppercase text-[10px]">WEIGHT PARAMETER</span>
                      <strong className="text-[#2d2f31] font-bold text-sm">{activeProduct.weight || 'Standard Class'}</strong>
                    </div>
                    <div className="flex flex-col text-left gap-0.5">
                      <span className="text-[#757779] tracking-wider uppercase text-[10px]">DROP / CHASSIS RATING</span>
                      <strong className="text-[#2d2f31] font-bold text-sm">{activeProduct.drop || 'Match-day Certified'}</strong>
                    </div>
                  </div>

                  {/* Core CTA Actions */}
                  <div className="flex flex-col sm:flex-row gap-4">
                    <button
                      onClick={() => addToCart(activeProduct, selectedSize)}
                      className="flex-1 bg-[#4e6300] hover:bg-[#4a5e00] text-[#e1ff88] py-4 rounded-xl font-headline font-black text-sm uppercase tracking-wider transition-all shadow-[0_10px_20px_rgba(78,99,0,0.25)] hover:scale-102 flex items-center justify-center gap-2 cursor-pointer focus:outline-none"
                    >
                      SECURE YOUR PAIR <ArrowRight className="w-4 h-4 text-[#e1ff88]" />
                    </button>
                    
                    <button
                      onClick={() => toggleWishlist(activeProduct.id)}
                      className={`px-6 py-4 rounded-xl border transition-all flex items-center justify-center gap-2 uppercase font-headline font-bold text-xs tracking-wider cursor-pointer ${
                        wishlist.includes(activeProduct.id)
                          ? 'bg-rose-50 border-rose-200 text-rose-600'
                          : 'bg-white border-[#acadaf]/20 text-[#5a5c5d] hover:text-rose-600 hover:border-rose-200'
                      }`}
                    >
                      <Heart className={`w-4 h-4 ${wishlist.includes(activeProduct.id) ? 'fill-rose-500' : ''}`} /> {wishlist.includes(activeProduct.id) ? 'SAVED' : 'ADD TO WISHLIST'}
                    </button>
                  </div>
                </div>

              </div>

              {/* RECOMMENDED / YOU MIGHT ALSO NEED SECTION (BENTO GRID STYLE RECOMMENDATIONS) */}
              <section className="border-t border-[#acadaf]/15 pt-20">
                <div className="text-left mb-10">
                  <h3 className="font-headline font-black text-2xl text-[#2d2f31] uppercase">
                    You Might Also Need
                  </h3>
                  <p className="text-sm font-body text-[#5a5c5d] mt-1">
                    Complete your kit with optimized parameters. Add dynamically to cart list.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.slice(10, 13).map((recommendedItem) => (
                    <div 
                      key={recommendedItem.id}
                      className="bg-white rounded-2xl border border-[#acadaf]/15 p-5 flex items-center gap-4 hover:shadow-lg transition-all group"
                    >
                      <div className="w-20 h-20 bg-[#fbfbfb] rounded-xl shrink-0 p-1 flex items-center justify-center overflow-hidden border border-[#acadaf]/5">
                        <img 
                          src={recommendedItem.image} 
                          alt={recommendedItem.name} 
                          referrerPolicy="no-referrer"
                          className="max-h-full max-w-full object-contain filter group-hover:scale-105 transition-transform duration-300" 
                        />
                      </div>
                      <div className="flex-1 text-left min-w-0">
                        <span className="text-[9px] font-label font-bold text-[#757779] uppercase tracking-wider block">
                          {recommendedItem.subtext}
                        </span>
                        <h4 className="font-headline font-extrabold text-xs text-[#2d2f31] truncate group-hover:text-[#4e6300] transition-colors mb-1">
                          {recommendedItem.name}
                        </h4>
                        <span className="text-sm font-headline font-black text-[#2d2f31]">
                          ₹{recommendedItem.price.toLocaleString('en-IN')}
                        </span>
                      </div>
                      <button
                        onClick={() => addToCart(recommendedItem)}
                        className="p-2.5 bg-[#f6f6f8] text-[#2d2f31] hover:bg-[#cafd00] hover:text-[#4a5e00] rounded-xl transition-all border border-[#acadaf]/15 group-hover:border-transparent cursor-pointer focus:outline-none"
                        aria-label="Add Accessory"
                      >
                        <Plus className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </section>

            </motion.div>
          )}

          {/* CHECKOUT / SHIPPING / CART SCREEN */}
          {currentScreen === 'checkout' && (
            <motion.div
              key="checkout-screen"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="max-w-7xl mx-auto w-full px-6 md:px-12 py-12"
            >
              {/* Checkout Progress Flow Header */}
              <div className="max-w-xl mx-auto mb-16">
                <div className="flex justify-between items-center text-xs font-headline font-black tracking-wider text-[#757779] relative">
                  {/* Background Progress bar line */}
                  <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-[#acadaf]/15 -translate-y-1/2 z-0" />
                  
                  {/* Highlight current state bar line */}
                  <div className="absolute top-1/2 left-0 w-1/2 h-0.5 bg-[#4e6300] -translate-y-1/2 z-0" />

                  <div className="z-10 flex flex-col items-center gap-1.5 bg-[#f6f6f8] px-3">
                    <span className="w-8 h-8 rounded-full border-2 border-[#4e6300] bg-[#4e6300] text-white flex items-center justify-center font-bold text-xs shadow-md">✓</span>
                    <span className="text-[#4e6300] font-extrabold">1. CART</span>
                  </div>

                  <div className="z-10 flex flex-col items-center gap-1.5 bg-[#f6f6f8] px-3">
                    <span className="w-8 h-8 rounded-full border-2 border-[#4e6300] bg-[#cafd00] text-[#4a5e00] flex items-center justify-center font-bold text-xs ring-4 ring-[#4e6300]/10 shadow-md">2</span>
                    <span className="text-[#2d2f31] font-extrabold">2. SHIPPING</span>
                  </div>

                  <div className="z-10 flex flex-col items-center gap-1.5 bg-[#f6f6f8] px-3">
                    <span className="w-8 h-8 rounded-full border-2 border-[#acadaf]/30 bg-white text-[#757779] flex items-center justify-center font-bold text-xs">3</span>
                    <span className="text-[#757779] font-bold">3. PAYMENT</span>
                  </div>
                </div>
              </div>

              {/* Grid checkout setup */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* Left Side: Shipping inputs & active bag reviews */}
                <div className="lg:col-span-7 flex flex-col gap-8">
                  
                  {/* Shipping Address Forms */}
                  <div className="bg-white border border-[#acadaf]/15 rounded-3xl p-6 shadow-sm text-left">
                    <div className="flex items-center gap-2 mb-2">
                      <Truck className="w-5 h-5 text-[#4e6300]" />
                      <h2 className="font-headline font-black text-lg text-[#2d2f31] uppercase">
                        Shipping Address
                      </h2>
                    </div>
                    <p className="text-xs text-[#5a5c5d] font-body mb-6">
                      Preloaded for fast Udaipur delivery. Modify metrics values freely.
                    </p>

                    <form className="grid grid-cols-2 gap-4 text-xs font-label font-bold text-[#5a5c5d]">
                      <div className="flex flex-col gap-1">
                        <label>First Name</label>
                        <input 
                          type="text"
                          value={shippingForm.firstName}
                          onChange={(e) => setShippingForm({...shippingForm, firstName: e.target.value})}
                          className="bg-[#f6f6f8] border border-[#acadaf]/20 rounded-xl py-3.5 px-4 text-sm text-[#2d2f31] focus:outline-none focus:border-[#4e6300]"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label>Last Name</label>
                        <input 
                          type="text"
                          value={shippingForm.lastName}
                          onChange={(e) => setShippingForm({...shippingForm, lastName: e.target.value})}
                          className="bg-[#f6f6f8] border border-[#acadaf]/20 rounded-xl py-3.5 px-4 text-sm text-[#2d2f31] focus:outline-none focus:border-[#4e6300]"
                        />
                      </div>

                      <div className="col-span-2 flex flex-col gap-1">
                        <label>Delivery Address</label>
                        <input 
                          type="text"
                          value={shippingForm.address}
                          onChange={(e) => setShippingForm({...shippingForm, address: e.target.value})}
                          className="bg-[#f6f6f8] border border-[#acadaf]/20 rounded-xl py-3.5 px-4 text-sm text-[#2d2f31] focus:outline-none focus:border-[#4e6300]"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label>City</label>
                        <input 
                          type="text"
                          value={shippingForm.city}
                          onChange={(e) => setShippingForm({...shippingForm, city: e.target.value})}
                          className="bg-[#f6f6f8] border border-[#acadaf]/20 rounded-xl py-3.5 px-4 text-sm text-[#2d2f31] focus:outline-none focus:border-[#4e6300]"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label>Pincode</label>
                        <input 
                          type="text"
                          maxLength={6}
                          value={shippingForm.pincode}
                          onChange={(e) => setShippingForm({...shippingForm, pincode: e.target.value})}
                          className="bg-[#f6f6f8] border border-[#acadaf]/20 rounded-xl py-3.5 px-4 text-sm text-center font-mono text-[#2d2f31] focus:outline-none focus:border-[#4e6300]"
                        />
                      </div>

                      <div className="flex flex-col gap-1">
                        <label>Support Phone</label>
                        <input 
                          type="tel"
                          value={shippingForm.phone}
                          onChange={(e) => setShippingForm({...shippingForm, phone: e.target.value})}
                          className="bg-[#f6f6f8] border border-[#acadaf]/20 rounded-xl py-3.5 px-4 text-sm text-[#2d2f31] focus:outline-none focus:border-[#4e6300]"
                        />
                      </div>
                      <div className="flex flex-col gap-1">
                        <label>Email Address</label>
                        <input 
                          type="email"
                          value={shippingForm.email}
                          onChange={(e) => setShippingForm({...shippingForm, email: e.target.value})}
                          className="bg-[#f6f6f8] border border-[#acadaf]/20 rounded-xl py-3.5 px-4 text-sm text-[#2d2f31] focus:outline-none focus:border-[#4e6300]"
                        />
                      </div>
                    </form>
                  </div>

                  {/* Your Gear Selected Items lists */}
                  <div className="bg-white border border-[#acadaf]/15 rounded-3xl p-6 shadow-sm text-left">
                    <div className="flex items-center gap-2 mb-6 border-b border-[#acadaf]/10 pb-4">
                      <ShoppingBag className="w-5 h-5 text-[#4e6300]" />
                      <h2 className="font-headline font-black text-lg text-[#2d2f31] uppercase">
                        Your Gear Selection ({cartItems.length})
                      </h2>
                    </div>

                    {cartItems.length === 0 ? (
                      <div className="py-10 text-center text-[#757779]">
                        <p className="font-bold text-sm">Bag empty. Discover elite products first!</p>
                        <button
                          onClick={() => setScreen('catalog')}
                          className="mt-4 px-6 py-2.5 bg-[#cafd00] text-[#4a5e00] font-headline font-bold text-xs tracking-wider rounded-xl"
                        >
                          OPEN CATALOG
                        </button>
                      </div>
                    ) : (
                      <div className="flex flex-col gap-6">
                        {cartItems.map((item, idx) => (
                          <div 
                            key={`${item.product.id}-${item.selectedSize || idx}`}
                            className="flex gap-4 items-center border-b border-[#acadaf]/10 pb-6 last:border-0 last:pb-0"
                          >
                            {/* Product photo */}
                            <div className="w-20 h-20 bg-[#fbfbfb] rounded-2xl border border-[#acadaf]/10 flex items-center justify-center p-2.5 shrink-0 overflow-hidden">
                              <img 
                                src={item.product.image} 
                                alt={item.product.name} 
                                referrerPolicy="no-referrer"
                                className="max-h-full max-w-full object-contain" 
                              />
                            </div>

                            {/* Details text */}
                            <div className="flex-1 min-w-0 text-left">
                              <span className="text-[9px] font-label font-bold text-[#757779] uppercase block mb-0.5">
                                {item.product.subtext}
                              </span>
                              <h4 className="font-headline font-extrabold text-sm text-[#2d2f31] leading-tight mb-1 truncate">
                                {item.product.name}
                              </h4>
                              {item.selectedSize && (
                                <span className="text-[10px] uppercase font-bold text-[#4e6300] bg-[#cafd00]/15 border border-[#cafd00]/30 px-2 py-0.5 rounded font-label mb-1 inline-block">
                                  Size UK {item.selectedSize}
                                </span>
                              )}
                              
                              {/* Quantity adjustments */}
                              <div className="flex items-center gap-2 mt-2">
                                <button
                                  onClick={() => updateCartQuantity(item.product.id, item.selectedSize, -1)}
                                  className="p-1 rounded bg-[#f6f6f8] hover:bg-[#f0f1f3] text-[#2d2f31] transition-all cursor-pointer border border-[#acadaf]/10"
                                  aria-label="Decrease quantity"
                                >
                                  <Minus className="w-3 h-3" />
                                </button>
                                <span className="text-xs font-mono font-bold px-2">{item.quantity}</span>
                                <button
                                  onClick={() => updateCartQuantity(item.product.id, item.selectedSize, 1)}
                                  className="p-1 rounded bg-[#f6f6f8] hover:bg-[#f0f1f3] text-[#2d2f31] transition-all cursor-pointer border border-[#acadaf]/10"
                                  aria-label="Increase quantity"
                                >
                                  <Plus className="w-3 h-3" />
                                </button>
                              </div>
                            </div>

                            {/* Prices and dynamic action buttons */}
                            <div className="flex flex-col items-end gap-3 shrink-0">
                              <span className="text-sm font-headline font-black text-[#2d2f31]">
                                ₹{(item.product.price * item.quantity).toLocaleString('en-IN')}
                              </span>
                              <button
                                onClick={() => removeFromCart(item.product.id, item.selectedSize)}
                                className="p-2 text-[#757779] hover:text-rose-500 rounded-lg hover:bg-rose-50 transition-colors cursor-pointer"
                                aria-label="Remove item"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Right Side: Order summary status column */}
                <div className="lg:col-span-5 sticky top-24 flex flex-col gap-6">
                  
                  {/* Summary Core Block */}
                  <div className="bg-[#1e2022] rounded-3xl text-white p-6 relative overflow-hidden border border-white/5 text-left shadow-xl">
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-[#4e6300] to-[#cafd00]" />
                    
                    <h3 className="font-headline font-black text-base text-white uppercase tracking-wider mb-6">
                      ORDER SUMMARY
                    </h3>

                    {/* Calculations charts */}
                    <div className="flex flex-col gap-4 font-label text-xs pb-6 border-b border-white/10 text-[#acadaf]">
                      <div className="flex justify-between">
                        <span>Items Subtotal</span>
                        <strong className="text-white">₹{cartValues.subtotal.toLocaleString('en-IN')}.00</strong>
                      </div>
                      
                      {appliedPromo && (
                        <div className="flex justify-between text-[#cafd00]">
                          <span>VIP Member Discount (15%)</span>
                          <strong>- ₹{cartValues.discount.toLocaleString('en-IN')}.00</strong>
                        </div>
                      )}
                      
                      <div className="flex justify-between">
                        <span>Local Udaipur Courier</span>
                        <strong className="text-[#cafd00] font-black">FREE</strong>
                      </div>
                      
                      <div className="flex justify-between">
                        <span>Estimated Taxes (GST 18%)</span>
                        <strong className="text-white">₹{cartValues.taxes.toLocaleString('en-IN')}.00</strong>
                      </div>
                    </div>

                    <div className="flex justify-between items-end pt-6 mb-8">
                      <div className="flex flex-col gap-0.5">
                        <span className="text-xs text-[#acadaf] font-label">TOTAL LIQUIDITY</span>
                        <span className="text-[10px] text-white/50 font-body">INCLUDES APPLICABLE DUTIES</span>
                      </div>
                      <span className="text-3xl font-headline font-black text-white text-glow">
                        ₹{cartValues.total.toLocaleString('en-IN')}.00
                      </span>
                    </div>

                    {/* Dynamic Submit CTAs */}
                    <button
                      onClick={() => {
                        if (cartItems.length === 0) {
                          addNotification('Secure Portal Failure', 'Kit bag is empty. Append specs before clearing.', 'error');
                          return;
                        }
                        setOrderCompleted(true);
                        addNotification('Order Process Initiated', 'Instant payment handshake authorized.', 'success');
                      }}
                      className="w-full bg-[#cafd00] hover:bg-[#b5e200] text-[#4a5e00] py-4 rounded-xl font-headline font-black text-sm uppercase tracking-wider transition-all shadow-[0_12px_24px_rgba(202,253,0,0.25)] flex items-center justify-center gap-2 hover:scale-102 cursor-pointer focus:outline-none"
                    >
                      COMPLETE PURCHASE <CreditCard className="w-4 h-4 text-[#4a5e00]" />
                    </button>
                  </div>

                  {/* Coupon card holder code */}
                  <div className="bg-white border border-[#acadaf]/15 rounded-3xl p-5 shadow-sm text-left">
                    <span className="text-[10px] font-label font-bold text-[#757779] uppercase block mb-2">PROMO OR VIP BADGES</span>
                    <div className="flex gap-2">
                      <input 
                        type="text"
                        placeholder="Enter code (UDAIPUR15)"
                        value={shippingForm.promoCode}
                        onChange={(e) => setShippingForm({...shippingForm, promoCode: e.target.value})}
                        className="bg-[#f6f6f8] border border-[#acadaf]/20 rounded-xl px-4 py-3 text-xs flex-1 uppercase font-mono tracking-widest focus:outline-none font-bold text-[#2d2f31]"
                      />
                      <button
                        onClick={() => {
                          const parsed = shippingForm.promoCode.trim().toUpperCase();
                          if (parsed === 'UDAIPUR15') {
                            setAppliedPromo(true);
                            addNotification('Promo applied successfully', '15% early bird discount deducted.', 'success');
                          } else {
                            addNotification('Invalid code', 'Please use code UDAIPUR15 for preview.', 'error');
                          }
                        }}
                        className="bg-[#1e2022] hover:bg-[#2d2f31] text-white px-5 rounded-xl font-headline font-black text-xs uppercase tracking-wide cursor-pointer transition-colors"
                      >
                        APPLY
                      </button>
                    </div>
                    {appliedPromo && (
                      <p className="text-[11px] font-bold text-[#4e6300] mt-2 font-label flex items-center gap-1">
                        ✓ VIP Coupon active (15% discount)
                      </p>
                    )}
                  </div>

                </div>

              </div>
            </motion.div>
          )}

        </AnimatePresence>
      </main>

      {/* Flagship Success Confirmation Modal Screen */}
      <AnimatePresence>
        {orderCompleted && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-60 bg-black/80 backdrop-blur-md flex items-center justify-center p-6"
            id="order-success-modal"
          >
            <motion.div
              initial={{ scale: 0.9, y: 30, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              exit={{ scale: 0.9, y: 30, opacity: 0 }}
              className="bg-white rounded-3xl border border-[#acadaf]/15 p-8 max-w-md w-full relative overflow-hidden shadow-2xl text-center"
            >
              {/* Top aesthetic gradient background tag */}
              <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-[#4e6300] to-[#cafd00]" />
              
              {/* Success Icon ripple ring */}
              <div className="w-16 h-16 bg-[#cafd00]/20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-xl animate-pulse">
                <Check className="w-8 h-8 text-[#4e6300] stroke-[3]" />
              </div>

              <h2 className="text-2xl font-headline font-black tracking-tight text-[#2d2f31] mb-2 uppercase">
                ORDER DISPATCHED!
              </h2>
              
              <p className="text-xs font-label font-bold text-[#4e6300] uppercase tracking-widest mb-4">
                FAST ESTIMATE: TODAY BY 6:00 PM
              </p>

              <div className="bg-[#f6f6f8] rounded-2xl p-4 text-left text-xs font-body text-[#5a5c5d] gap-2 flex flex-col mb-6 border border-[#acadaf]/10">
                <div className="flex justify-between border-b border-[#acadaf]/10 pb-2">
                  <span>RECEIVER</span>
                  <strong className="text-[#2d2f31]">{shippingForm.firstName} {shippingForm.lastName}</strong>
                </div>
                <div className="flex justify-between border-b border-[#acadaf]/10 pb-2">
                  <span>DELIVERY DESTINATION</span>
                  <strong className="text-[#2d2f31]">{shippingForm.city} - {shippingForm.pincode}</strong>
                </div>
                <div className="flex justify-between">
                  <span>FINANCIAL SECURE SUMMARY</span>
                  <strong className="text-[#2d2f31] font-mono">₹{cartValues.total.toLocaleString('en-IN')}.00</strong>
                </div>
              </div>

              <p className="text-xs font-body text-[#757779] leading-relaxed mb-6">
                Your high performance equipment is routed safely. Thank you for selecting Udaipur Sports.
              </p>

              <div className="flex flex-col gap-2.5">
                <button
                  onClick={() => {
                    setCartItems([]);
                    setOrderCompleted(false);
                    setScreen('home');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="w-full bg-[#1e2022] hover:bg-[#2d2f31] text-white py-3.5 rounded-xl font-headline font-extrabold text-xs uppercase tracking-wider transition-colors cursor-pointer"
                >
                  RETURN TO ARENA
                </button>
                <p className="text-[10px] text-[#acadaf] font-mono">TRACKING: UDAI-{Math.floor(100000 + Math.random() * 900000)}</p>
              </div>

            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Global Editorial Footer */}
      <Footer setScreen={setScreen} setSelectedCategory={setSelectedCategory} />
    </div>
  );
}
