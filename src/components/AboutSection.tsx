import React from 'react';
import { ShieldCheck, HeartHandshake, Flame, Clock, MapPin, Sparkles } from 'lucide-react';

export const AboutSection: React.FC = () => {
  return (
    <section id="about-section" className="py-16 sm:py-20 border-t border-chonky-border/60 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-12">
        
        {/* Top Story Block */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div className="space-y-5">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-chonky-peach text-chonky-red text-xs font-black uppercase tracking-wider">
              <Sparkles className="w-3.5 h-3.5" />
              <span>The Chonky Philosophy</span>
            </div>
            
            <h2 className="text-3xl sm:text-4xl font-black text-chonky-text tracking-tight font-sans leading-tight">
              Crafted Big. Smashed Fresh. Never Cutting Corners.
            </h2>

            <p className="text-sm sm:text-base text-chonky-muted leading-relaxed">
              At <strong>Chonky</strong>, we set out to fix what fast food got wrong. No dry frozen patties, no limp lettuce, and no skimping on cheese. Every burger begins with 100% premium Angus beef smashed paper-thin on scorching griddles to achieve that crispy, caramelized lacy crust.
            </p>

            <p className="text-sm sm:text-base text-chonky-muted leading-relaxed">
              Our submarine bread is baked and toasted fresh, loaded with prime shaved meats and real provolone melt. Our sourdough pizzas ferment for 48 hours to create blistering, digestible crusts that snap and fold with ease.
            </p>

            <div className="pt-2 flex flex-wrap gap-4 text-xs font-bold text-chonky-text">
              <div className="flex items-center gap-2 bg-chonky-subtle px-3 py-2 rounded-xl border border-chonky-border">
                <Flame className="w-4 h-4 text-chonky-red" />
                <span>100% Angus Smash</span>
              </div>
              <div className="flex items-center gap-2 bg-chonky-subtle px-3 py-2 rounded-xl border border-chonky-border">
                <ShieldCheck className="w-4 h-4 text-chonky-red" />
                <span>HACCP Certified Kitchen</span>
              </div>
              <div className="flex items-center gap-2 bg-chonky-subtle px-3 py-2 rounded-xl border border-chonky-border">
                <HeartHandshake className="w-4 h-4 text-chonky-red" />
                <span>Fresh Daily Local Prep</span>
              </div>
            </div>
          </div>

          {/* Visual Showcase collage */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="rounded-3xl overflow-hidden aspect-[4/5] shadow-card bg-chonky-subtle">
                <img
                  src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=700&q=80"
                  alt="Smash griddle action"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
              <div className="p-4 rounded-2xl bg-chonky-peach/50 border border-chonky-peach-dark/30 text-center">
                <p className="text-2xl font-black text-chonky-red">48 Hrs</p>
                <p className="text-xs font-semibold text-chonky-text">Sourdough Fermentation</p>
              </div>
            </div>

            <div className="space-y-4 pt-8">
              <div className="p-4 rounded-2xl bg-chonky-red text-white text-center shadow-soft">
                <p className="text-2xl font-black text-chonky-peach">30 Mins</p>
                <p className="text-xs font-medium text-white/90">Average Island Delivery</p>
              </div>
              <div className="rounded-3xl overflow-hidden aspect-[4/5] shadow-card bg-chonky-subtle">
                <img
                  src="https://images.unsplash.com/photo-1528735602780-2552fd46c7af?auto=format&fit=crop&w=700&q=80"
                  alt="Melted submarine sandwich"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-500"
                />
              </div>
            </div>
          </div>
        </div>

        {/* Kitchen Info Bar */}
        <div className="rounded-3xl bg-chonky-subtle border border-chonky-border p-6 sm:p-8 grid grid-cols-1 md:grid-cols-3 gap-6 text-xs sm:text-sm">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-chonky-red/10 text-chonky-red flex items-center justify-center shrink-0">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-chonky-text text-sm sm:text-base">Operating Hours</h4>
              <p className="text-chonky-muted mt-1">Saturday – Thursday: 12:00 PM – 1:00 AM</p>
              <p className="text-chonky-muted">Friday: 2:00 PM – 1:00 AM</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-chonky-red/10 text-chonky-red flex items-center justify-center shrink-0">
              <MapPin className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-chonky-text text-sm sm:text-base">Kitchen & Pickup Hub</h4>
              <p className="text-chonky-muted mt-1">Roashanee Magu, Henveiru, Malé</p>
              <p className="text-chonky-muted">Direct curbside & boat jetty drop-off available</p>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-chonky-red/10 text-chonky-red flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="font-bold text-chonky-text text-sm sm:text-base">Food Quality & Safety</h4>
              <p className="text-chonky-muted mt-1">100% Halal Certified Meats</p>
              <p className="text-chonky-muted">Eco-friendly insulated thermal packaging</p>
            </div>
          </div>
        </div>

      </div>
    </section>
  );
};
