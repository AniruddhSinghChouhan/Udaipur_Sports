import { useState } from 'react';
import { ShoppingCart, User, Search, Menu, X } from 'lucide-react';
import { ScreenType } from '../types';

interface HeaderProps {
  currentScreen: ScreenType;
  setScreen: (screen: ScreenType) => void;
  cartCount: number;
  setSelectedCategory: (cat: 'Cricket' | 'Football' | 'Gym' | 'Skating' | 'Accessories' | 'All') => void;
}

export default function Header({ currentScreen, setScreen, cartCount, setSelectedCategory }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchValue, setSearchValue] = useState('');

  const navItems: { label: string; value: 'Cricket' | 'Football' | 'Gym' | 'Skating' }[] = [
    { label: 'Cricket', value: 'Cricket' },
    { label: 'Football', value: 'Football' },
    { label: 'Gym', value: 'Gym' },
    { label: 'Skating', value: 'Skating' },
  ];

  const handleNavClick = (category: 'Cricket' | 'Football' | 'Gym' | 'Skating') => {
    setSelectedCategory(category);
    setScreen('catalog');
    setMobileMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 w-full z-50 bg-[#f6f6f8]/90 backdrop-blur-xl border-b border-[#acadaf]/10 h-20 px-6 md:px-12 flex justify-between items-center">
      {/* Brand Logo */}
      <button
        onClick={() => {
          setScreen('home');
          setSelectedCategory('All');
        }}
        className="text-2xl font-black italic tracking-tighter text-[#2d2f31] font-headline hover:opacity-80 transition-all cursor-pointer text-left focus:outline-none"
        id="logo-brand"
      >
        Udaipur Sports
      </button>

      {/* Desktop Links */}
      <div className="hidden md:flex gap-8 items-center font-headline font-bold text-sm tracking-tight">
        {navItems.map((item) => (
          <button
            key={item.value}
            onClick={() => handleNavClick(item.value)}
            className="text-[#5a5c5d] hover:text-[#2d2f31] hover:scale-105 transition-all cursor-pointer focus:outline-none py-1 relative group"
            id={`nav-desktop-${item.value.toLowerCase()}`}
          >
            {item.label}
            <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-[#4e6300] transition-all group-hover:w-full"></span>
          </button>
        ))}
      </div>

      {/* Actions */}
      <div className="flex items-center gap-4 md:gap-6">
        {/* Search bar */}
        <div className="hidden lg:flex items-center bg-[#f0f1f3] px-4 py-2 rounded-full border border-[#acadaf]/10 focus-within:border-[#4e6300]/40 transition-all">
          <Search className="text-[#757779] w-4 h-4 mr-2" />
          <input
            type="text"
            placeholder="Search gear..."
            value={searchValue}
            onChange={(e) => setSearchValue(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && searchValue.trim()) {
                setSelectedCategory('All');
                setScreen('catalog');
              }
            }}
            className="bg-transparent border-none outline-none focus:ring-0 text-sm font-label w-40 text-[#2d2f31] placeholder-[#757779]"
          />
        </div>

        {/* Cart */}
        <button
          onClick={() => setScreen('checkout')}
          className="relative hover:scale-110 transition-all text-[#2d2f31] cursor-pointer focus:outline-none p-2"
          id="cart-header-btn"
          aria-label="View Shopping Cart"
        >
          <ShoppingCart className="w-5 h-5" />
          {cartCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#4e6300] text-[#e1ff88] text-[10px] font-black rounded-full w-5 h-5 flex items-center justify-center font-headline shadow-[0_4px_10px_rgba(78,99,0,0.3)]">
              {cartCount}
            </span>
          )}
        </button>

        {/* User icon */}
        <button
          onClick={() => {
            alert("Udaipur Sports Member Portal is coming soon!");
          }}
          className="hover:scale-110 transition-all text-[#2d2f31] cursor-pointer focus:outline-none p-2"
          id="profile-header-btn"
          aria-label="User Profile"
        >
          <User className="w-5 h-5" />
        </button>

        {/* Mobile menu trigger */}
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden hover:scale-110 transition-all text-[#2d2f31] cursor-pointer focus:outline-none p-2"
          id="mobile-menu-trigger"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="absolute top-20 left-0 w-full bg-[#f6f6f8] border-b border-[#acadaf]/15 shadow-xl md:hidden z-40 transition-all duration-300">
          <div className="px-6 py-6 flex flex-col gap-4 font-headline font-bold text-lg">
            {navItems.map((item) => (
              <button
                key={item.value}
                onClick={() => handleNavClick(item.value)}
                className="text-[#2d2f31] py-2 text-left hover:text-[#4e6300] border-b border-[#acadaf]/5"
                id={`nav-mobile-${item.value.toLowerCase()}`}
              >
                {item.label}
              </button>
            ))}
            <div className="flex items-center bg-[#f0f1f3] px-4 py-3 rounded-xl mt-2 w-full">
              <Search className="text-[#757779] w-5 h-5 mr-3" />
              <input
                type="text"
                placeholder="Search premium gear..."
                value={searchValue}
                onChange={(e) => setSearchValue(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && searchValue.trim()) {
                    setSelectedCategory('All');
                    setScreen('catalog');
                    setMobileMenuOpen(false);
                  }
                }}
                className="bg-transparent border-none outline-none focus:ring-0 text-sm font-label w-full text-[#2d2f31]"
              />
            </div>
          </div>
        </div>
      )}
    </nav>
  );
}
