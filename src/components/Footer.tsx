import React from 'react';
import { Phone, Mail, MapPin, Heart, ArrowRight, Sparkles, Clock, ShieldCheck } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gradient-to-b from-chonky-red to-[#4d0404] text-chonky-peach pt-16 pb-28 sm:pb-24 border-t-4 border-chonky-peach/30 selection:bg-chonky-peach selection:text-chonky-red">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Callout / Crave Club Banner */}
        <div className="rounded-3xl bg-black/25 backdrop-blur-md border border-white/10 p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 shadow-xl">
          <div className="space-y-1 text-center md:text-left">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-chonky-peach/20 text-chonky-peach text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Chonky VIP Crave Club</span>
            </div>
            <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Get secret drops, discount codes & new smash burgers first.
            </h3>
            <p className="text-xs text-chonky-peach/80">
              No spam. Just pure cravings and exclusive Malé drop alerts.
            </p>
          </div>

          <div className="w-full md:w-auto flex items-center max-w-md">
            <div className="relative w-full flex items-center">
              <input
                type="text"
                placeholder="Enter your phone or email..."
                className="w-full pl-4 pr-32 py-3 rounded-full bg-white/10 border border-white/20 text-white placeholder:text-chonky-peach/50 text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-chonky-peach transition"
              />
              <button
                type="button"
                onClick={() => alert("Welcome to the Chonky Crave Club! You'll receive exclusive offers soon.")}
                className="absolute right-1 px-5 py-2.5 rounded-full bg-chonky-peach text-chonky-red font-black text-xs hover:bg-white transition flex items-center gap-1 shadow-sm active:scale-95"
              >
                <span>Join</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

        {/* 4-Column Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-10">
          
          {/* Col 1: Brand & Identity */}
          <div className="space-y-4">
            <div className="flex items-center gap-3">
              <img
                src="/chonky-icon-peach.svg"
                alt="Chonky Mascot"
                className="h-10 w-auto"
              />
              <img
                src="/chonky-typography-peach.svg"
                alt="Chonky"
                className="h-7 w-auto"
              />
            </div>
            <p className="text-xs text-chonky-peach/80 leading-relaxed font-normal">
              Freshly ground 100% Angus smash burgers, slow-fermented pizzas, and toasted submarines crafted with zero shortcuts in Malé.
            </p>
            <div className="flex items-center gap-2.5 pt-1">
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">
                <ShieldCheck className="w-3.5 h-3.5 text-chonky-peach" />
                100% Halal Certified
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-white/10 text-white">
                <Clock className="w-3.5 h-3.5 text-chonky-peach" />
                Late Night
              </span>
            </div>
          </div>

          {/* Col 2: Menu Sections */}
          <div className="space-y-3">
            <h4 className="font-black text-sm uppercase tracking-wider text-white">
              Crave Menu
            </h4>
            <ul className="space-y-2 text-xs text-chonky-peach/80">
              <li>
                <a href="#menu-section" className="hover:text-white transition flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-chonky-peach/50" />
                  <span>Double Angus Smash Burgers</span>
                </a>
              </li>
              <li>
                <a href="#menu-section" className="hover:text-white transition flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-chonky-peach/50" />
                  <span>Toasted Hearth Submarines</span>
                </a>
              </li>
              <li>
                <a href="#menu-section" className="hover:text-white transition flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-chonky-peach/50" />
                  <span>Sourdough Stone-Baked Pizza</span>
                </a>
              </li>
              <li>
                <a href="#menu-section" className="hover:text-white transition flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-chonky-peach/50" />
                  <span>Animal-Style Fries & Tenders</span>
                </a>
              </li>
              <li>
                <a href="#deals-section" className="hover:text-white transition flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-chonky-peach/50" />
                  <span>Curated Squad Combos</span>
                </a>
              </li>
            </ul>
          </div>

          {/* Col 3: Delivery Zones */}
          <div className="space-y-3">
            <h4 className="font-black text-sm uppercase tracking-wider text-white">
              Delivery Coverage
            </h4>
            <ul className="space-y-2 text-xs text-chonky-peach/80">
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-chonky-peach" />
                <span>Malé City (All Wards) · 25–35m</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-chonky-peach" />
                <span>Hulhumalé Phase 1 · 30–40m</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-chonky-peach" />
                <span>Hulhumalé Phase 2 · 35–45m</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-chonky-peach" />
                <span>Vilimalé Express Ferry</span>
              </li>
              <li className="flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-chonky-peach" />
                <span>Harbor & Safari Boat Drop</span>
              </li>
            </ul>
          </div>

          {/* Col 4: Hotline & Store */}
          <div className="space-y-3">
            <h4 className="font-black text-sm uppercase tracking-wider text-white">
              Direct Kitchen Hotline
            </h4>
            <div className="space-y-2.5 text-xs text-chonky-peach/80">
              <a
                href="tel:+9607889900"
                className="inline-flex items-center gap-2.5 p-3 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-bold transition w-full border border-white/10"
              >
                <div className="w-8 h-8 rounded-xl bg-chonky-peach text-chonky-red flex items-center justify-center shrink-0">
                  <Phone className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-[10px] text-chonky-peach/70 uppercase">Call to Order</p>
                  <p className="text-sm font-black text-white">+960 788-9900</p>
                </div>
              </a>

              <div className="flex items-center gap-2 text-chonky-peach/90 pt-1">
                <Mail className="w-4 h-4 text-chonky-peach" />
                <span>crave@chonky.mv</span>
              </div>

              <div className="flex items-start gap-2 text-chonky-peach/90">
                <MapPin className="w-4 h-4 text-chonky-peach shrink-0 mt-0.5" />
                <span>Roashanee Magu, Henveiru, Malé</span>
              </div>
            </div>
          </div>

        </div>

        {/* Bottom Copyright & Love Note */}
        <div className="pt-8 border-t border-white/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-chonky-peach/70">
          <p>© {new Date().getFullYear()} Chonky Burgers & Subs Co. Maldives.</p>
          <p className="flex items-center gap-1.5 font-medium">
            <span>Crafted with</span>
            <Heart className="w-3.5 h-3.5 text-chonky-peach fill-chonky-peach animate-pulse" />
            <span>for genuine flavor seekers.</span>
          </p>
        </div>

      </div>
    </footer>
  );
};
