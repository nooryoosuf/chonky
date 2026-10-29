import React from 'react';
import { ShieldCheck, HeartHandshake, Flame, Clock, MapPin, Sparkles } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about-section" className="py-20 sm:py-24 border-t border-chonky-border/60 dark:border-white/10 bg-white dark:bg-transparent transition-colors">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        
        {/* Top Story Block */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-chonky-peach dark:bg-chonky-red/30 text-chonky-red dark:text-chonky-peach text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Chonky Philosophy</span>
            </div>
            
            <h2 className="text-3xl sm:text-5xl font-black text-chonky-text dark:text-white tracking-tight font-sans leading-[1.12]">
              Crafted Big. Smashed Fresh. Never Cutting Corners.
            </h2>

            <p className="text-sm sm:text-base text-chonky-muted dark:text-gray-300 leading-relaxed">
              At <strong>Chonky</strong>, we set out to fix what fast food got wrong. No dry frozen patties, no limp lettuce, and no skimping on cheese. Every burger begins with 100% premium Angus beef smashed paper-thin on scorching griddles to achieve that crispy, caramelized lacy crust.
            </p>

            <p className="text-sm sm:text-base text-chonky-muted dark:text-gray-300 leading-relaxed">
              Our submarine bread is baked and toasted fresh, loaded with prime shaved meats and real provolone melt. Our sourdough pizzas ferment for 48 hours to create blistering, digestible crusts that snap and fold with ease.
            </p>

            <div className="pt-2 flex flex-wrap gap-3 text-xs font-black text-chonky-text dark:text-white">
              <div className="flex items-center gap-2 bg-chonky-subtle dark:bg-white/5 px-4 py-2.5 rounded-2xl border border-chonky-border/80 dark:border-white/10 shadow-xs">
                <Flame className="w-4 h-4 text-chonky-red dark:text-amber-400" />
                <span>100% Angus Smash</span>
              </div>
              <div className="flex items-center gap-2 bg-chonky-subtle dark:bg-white/5 px-4 py-2.5 rounded-2xl border border-chonky-border/80 dark:border-white/10 shadow-xs">
                <ShieldCheck className="w-4 h-4 text-chonky-red dark:text-emerald-400" />
                <span>HACCP Certified Kitchen</span>
              </div>
              <div className="flex items-center gap-2 bg-chonky-subtle dark:bg-white/5 px-4 py-2.5 rounded-2xl border border-chonky-border/80 dark:border-white/10 shadow-xs">
                <HeartHandshake className="w-4 h-4 text-chonky-red dark:text-rose-400" />
                <span>Fresh Daily Local Prep</span>
              </div>
            </div>
          </div>

          {/* Visual Showcase collage */}
          <div className="lg:col-span-5 grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-[2.2rem] overflow-hidden aspect-[4/5] shadow-hover bg-chonky-subtle dark:bg-[#150B0B] group">
                <img
                  src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=700&q=80"
                  alt="Smash griddle action"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
              </div>
              <div className="p-5 rounded-[2rem] bg-chonky-peach/60 dark:bg-white/5 border border-chonky-peach-dark/40 dark:border-white/10 text-center shadow-xs">
                <p className="text-3xl font-black text-chonky-red dark:text-chonky-peach">48 Hrs</p>
                <p className="text-xs font-bold text-chonky-text dark:text-gray-300 mt-0.5">Sourdough Fermentation</p>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="p-5 rounded-[2rem] bg-chonky-red text-white text-center shadow-glow-red">
                <p className="text-3xl font-black text-chonky-peach">30 Mins</p>
                <p className="text-xs font-bold text-white/90 mt-0.5">Average Island Delivery</p>
              </div>
              <div className="rounded-[2.2rem] overflow-hidden aspect-[4/5] shadow-hover bg-chonky-subtle dark:bg-[#150B0B] group">
                <img
                  src="https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=700&q=80"
                  alt="Melted submarine sandwich"
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700 ease-out"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kitchen Info Bar */}
        <div className="rounded-[2.5rem] bg-chonky-subtle dark:bg-[#170E0E] border border-chonky-border/70 dark:border-white/10 p-7 sm:p-10 grid grid-cols-1 md:grid-cols-3 gap-8 text-xs sm:text-sm shadow-xs">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-chonky-red/10 dark:bg-chonky-red/30 text-chonky-red dark:text-chonky-peach flex items-center justify-center shrink-0">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-chonky-text dark:text-white text-base sm:text-lg">Operating Hours</h4>
              <p className="text-chonky-muted dark:text-gray-400 mt-1 leading-relaxed">Saturday – Thursday: 12:00 PM – 1:00 AM</p>
              <p className="text-chonky-muted dark:text-gray-400">Friday: 2:00 PM – 1:00 AM</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-chonky-red/10 dark:bg-chonky-red/30 text-chonky-red dark:text-chonky-peach flex items-center justify-center shrink-0">
              <MapPin className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-chonky-text dark:text-white text-base sm:text-lg">Kitchen & Pickup Hub</h4>
              <p className="text-chonky-muted dark:text-gray-400 mt-1 leading-relaxed">Roashanee Magu, Henveiru, Malé</p>
              <p className="text-chonky-muted dark:text-gray-400">Direct curbside & boat jetty drop-off available</p>
            </div>
          </div>

          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-chonky-red/10 dark:bg-chonky-red/30 text-chonky-red dark:text-chonky-peach flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-chonky-text dark:text-white text-base sm:text-lg">Food Quality & Safety</h4>
              <p className="text-chonky-muted dark:text-gray-400 mt-1 leading-relaxed">100% Halal Certified Meats</p>
              <p className="text-chonky-muted dark:text-gray-400">Eco-friendly insulated thermal packaging</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
