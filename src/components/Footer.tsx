import { useState, FormEvent } from 'react';
import { Mail, ArrowRight, MapPin, Instagram, Facebook, Youtube } from 'lucide-react';

interface FooterProps {
  setScreen: (screen: 'home' | 'catalog' | 'detail' | 'checkout') => void;
  setSelectedCategory: (cat: any) => void;
}

export default function Footer({ setScreen, setSelectedCategory }: FooterProps) {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail('');
      setTimeout(() => setSubscribed(false), 4000);
    }
  };

  return (
    <footer className="bg-[#1e2022] text-[#e1e2e5] pt-20 pb-10 px-6 md:px-12 border-t border-[#acadaf]/10 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8 mb-16">
        {/* Brand Block */}
        <div className="flex flex-col gap-6">
          <button
            onClick={() => {
              setScreen('home');
              setSelectedCategory('All');
              window.scrollTo({ top: 0, behavior: 'smooth' });
            }}
            className="text-3xl font-black italic tracking-tighter text-white font-headline hover:opacity-80 transition-all text-left focus:outline-none"
          >
            Udaipur Sports
          </button>
          <p className="text-sm font-body text-[#acadaf] leading-relaxed max-w-sm">
            High-performance athletic gear curated specifically for Udaipur's premier sports community. Match-grade quality, elite speed, and technical precision.
          </p>
          <div className="flex gap-4 text-[#cafd00]">
            <a href="https://instagram.com" target="_blank" rel="noreferrer" className="hover:scale-115 transition-all" aria-label="Instagram">
              <Instagram className="w-5 h-5" />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="hover:scale-115 transition-all" aria-label="Facebook">
              <Facebook className="w-5 h-5" />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noreferrer" className="hover:scale-115 transition-all" aria-label="Youtube">
              <Youtube className="w-5 h-5" />
            </a>
            <a href="#maps" className="hover:scale-115 transition-all flex items-center gap-1.5 text-xs font-bold text-[#acadaf]" aria-label="Find Store">
              <MapPin className="w-4 h-4 text-[#cafd00]" /> Udaipur, India
            </a>
          </div>
        </div>

        {/* Quick Shop Links */}
        <div>
          <h4 className="text-white font-headline font-bold text-base tracking-wide uppercase mb-6 text-glow">
            DEPARTMENTS
          </h4>
          <ul className="flex flex-col gap-3 font-label text-sm text-[#acadaf]">
            {['Cricket', 'Football', 'Gym', 'Skating'].map((dept) => (
              <li key={dept}>
                <button
                  onClick={() => {
                    setSelectedCategory(dept);
                    setScreen('catalog');
                    window.scrollTo({ top: 0, behavior: 'smooth' });
                  }}
                  className="hover:text-[#cafd00] transition-colors cursor-pointer focus:outline-none"
                >
                  {dept} Department
                </button>
              </li>
            ))}
          </ul>
        </div>

        {/* Technical Guidance */}
        <div>
          <h4 className="text-white font-headline font-bold text-base tracking-wide uppercase mb-6">
            TECHNICAL SUPPORT
          </h4>
          <ul className="flex flex-col gap-3 font-body text-sm text-[#acadaf]">
            <li>
              <a href="#size" className="hover:text-[#cafd00] transition-colors">
                Kineti-Grid™ Fitting Guide
              </a>
            </li>
            <li>
              <a href="#bat" className="hover:text-[#cafd00] transition-colors">
                English Willow Curing Info
              </a>
            </li>
            <li>
              <a href="#pro" className="hover:text-[#cafd00] transition-colors">
                Pro Member Benefits
              </a>
            </li>
            <li>
              <a href="#delivery" className="hover:text-[#cafd00] transition-colors">
                Udaipur Local Instant Delivery
              </a>
            </li>
          </ul>
        </div>

        {/* Newsletter & Subscriptions */}
        <div className="flex flex-col gap-6">
          <div>
            <h4 className="text-white font-headline font-bold text-base tracking-wide uppercase mb-3">
              JOIN THE ARSENAL
            </h4>
            <p className="text-xs font-body text-[#acadaf] leading-relaxed">
              Subscribe to unlock early drops, limited edition willow releases, and 15% VIP member discount.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex gap-2 w-full">
            <div className="relative flex-1">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-[#757779] w-4 h-4" />
              <input
                type="email"
                required
                placeholder="Enter elite email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#2d2f31] border border-[#acadaf]/15 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-[#757779] focus:outline-none focus:border-[#cafd00]/50 font-label"
              />
            </div>
            <button
              type="submit"
              className="bg-[#cafd00] hover:bg-[#b5e200] text-[#4a5e00] p-3 rounded-xl transition-all cursor-pointer font-bold shrink-0 flex items-center justify-center shadow-[0_4px_12px_rgba(202,253,0,0.25)]"
              aria-label="Subscribe"
            >
              <ArrowRight className="w-5 h-5" />
            </button>
          </form>
          {subscribed && (
            <p className="text-xs font-medium text-[#cafd00] font-label transition-all animate-bounce">
              ✓ Elite access granted! Check your inbox shortly.
            </p>
          )}
        </div>
      </div>

      {/* Dividers & Bottom Credits */}
      <div className="border-t border-[#acadaf]/10 pt-8 max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6 text-[#acadaf] text-xs font-label">
        <div>
          <p>© {new Date().getFullYear()} Udaipur Sports Ltd. All high-performance rights reserved.</p>
        </div>
        <div className="flex gap-4 items-center">
          {/* Mock Badges representing secure Indian payment support (Visa, MasterCard, UPI, RuPay) */}
          <span className="px-2 py-1 bg-[#2d2f31]/50 border border-[#acadaf]/10 rounded text-[10px] tracking-widest text-[#cafd00]">UPI</span>
          <span className="px-2 py-1 bg-[#2d2f31]/50 border border-[#acadaf]/10 rounded text-[10px] tracking-widest text-white">RUPAY</span>
          <span className="px-2 py-1 bg-[#2d2f31]/50 border border-[#acadaf]/10 rounded text-[10px] tracking-widest text-white">VISA</span>
          <span className="px-2 py-1 bg-[#2d2f31]/50 border border-[#acadaf]/10 rounded text-[10px] tracking-widest text-white">MSCard</span>
        </div>
      </div>
    </footer>
  );
}
