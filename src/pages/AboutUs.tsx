import { Heart, Leaf, Target, Award } from 'lucide-react';
import { BRAND } from '../lib/supabase';
import { Link } from '../lib/router';

const VALUES = [
  { icon: '🌿', title: 'Traditional Methods', desc: 'Every recipe follows age-old techniques passed down through generations.' },
  { icon: '✅', title: 'No Preservatives', desc: 'Pure, clean ingredients — free from artificial preservatives and additives.' },
  { icon: '🇮🇳', title: 'Indian Heritage', desc: 'Inspired by the rich culinary traditions of South India.' },
];

export default function AboutUs() {
  return (
    <div className="bg-cream-50 min-h-screen">
      {/* Hero */}
      <section className="bg-maroon-800 text-white py-14 md:py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center">
          <img
           src="/kavis-logo.png"
            alt="Kavis Masala Logo"
            className="h-24 w-24 rounded-full object-cover border-4 border-cream-300 shadow-xl mx-auto mb-5"
          />
          <h1 className="text-3xl md:text-5xl font-bold mb-3">About Us</h1>
          <p className="text-white/80 text-lg md:text-xl italic font-medium max-w-2xl mx-auto">
            "Unave Marundhu" — Food is Medicine
          </p>
          <div className="mx-auto mt-4 w-16 h-1 rounded-full bg-cream-300" />
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-12 space-y-12">

        {/* Tagline block */}
        <div className="bg-white rounded-2xl border border-stone-100 p-6 md:p-8 text-center shadow-sm">
          <p className="text-lg md:text-xl text-stone-700 leading-relaxed">
            At <strong className="text-maroon-800">Kavis Masala</strong>, we believe in one timeless truth from our tradition —
            <br className="hidden md:block" />
            <span className="text-maroon-800 font-semibold italic"> "Unave Marundhu"</span>
          </p>
          <p className="text-stone-600 mt-4 leading-relaxed">
            Every journey has a beginning, and ours began in a school, with homemade preparations, curious minds, and a desire to create something meaningful.
The appreciation we received from the teachers and colleagues around us gave that small beginning a new direction — and Kavis Masala was born.

          </p>
        </div>

        {/* Our Beginning */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="bg-maroon-800 text-white w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shrink-0">
            🌱
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-stone-900 mb-3">Our Beginning</h2>
            <p className="text-stone-600 leading-relaxed">
              Kavis Masala began as a small initiative in a school environment, where our homemade preparations were first made and shared among teachers and colleagues. What started with a few simple products soon received appreciation for their traditional taste, quality, and convenience, encouraging us to take the idea forward.
As we saw how useful these preparations were in making everyday cooking easier, we envisioned bringing them beyond our school community — especially for working professionals, hostelers, bachelors, and even homemakers who wanted the comfort of traditional food without spending hours preparing it from scratch. This simple beginning became the foundation for Kavis Masala, with a purpose to make traditional cooking easier, faster, and more convenient for everyone.
            </p>
            <p className="text-stone-600 leading-relaxed mt-3">
              What began as small batches made for colleagues, friends, and families soon gained trust for its
             authentic taste, purity, and health benefits.
            </p>
          </div>
        </div>

        {/* Philosophy */}
        <div className="bg-maroon-800 text-white rounded-2xl p-6 md:p-10 text-center">
          <div className="w-12 h-12 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Heart className="w-6 h-6" />
          </div>
          <h2 className="text-2xl font-bold mb-3">Our Philosophy</h2>
          <p className="text-white/80 mb-4">We follow a simple principle:</p>
          <blockquote className="text-xl md:text-2xl font-bold italic text-cream-300 mb-6">
            "Rooted in tradition, crafted for today — bringing goodness to every home."
          </blockquote>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center mt-4">
            {VALUES.map((v) => (
              <div key={v.title} className="bg-white/10 rounded-xl p-3">
                <div className="text-2xl mb-1">{v.icon}</div>
                <div className="font-semibold text-sm text-white">{v.title}</div>
                <div className="text-xs text-white/60 mt-1">{v.desc}</div>
              </div>
            ))}
          </div>
        </div>

{/* Mission */}
<div className="flex flex-col md:flex-row gap-6 items-start">
  <div className="bg-green-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
    <Target className="w-7 h-7" />
  </div>

  <div className="flex-1">
    <h2 className="text-2xl font-bold text-stone-900 mb-5">
      Our Mission
    </h2>

    <div className="space-y-4">
      <div>
        <h3 className="font-semibold text-maroon-800">
          🌿 Preserve Tradition
        </h3>
        <p className="text-stone-600 leading-relaxed">
          Keeping our rich food heritage alive and passing it on to future generations.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-maroon-800">
          🥘 Simplify Cooking
        </h3>
        <p className="text-stone-600 leading-relaxed">
          Making everyday cooking easier and bringing convenience to modern lifestyles.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-maroon-800">
          ❤️ Serve Every Lifestyle
        </h3>
        <p className="text-stone-600 leading-relaxed">
          Bringing traditional flavours closer to people and their everyday food needs.
        </p>
      </div>

      <div>
        <h3 className="font-semibold text-maroon-800">
          🌾 Inspire the Future
        </h3>
        <p className="text-stone-600 leading-relaxed">
          Connecting the wisdom of our past with the kitchens of future generations.
        </p>
      </div>
    </div>
  </div>
</div>



        {/* Promise */}
        <div className="flex flex-col md:flex-row gap-6 items-start">
          <div className="bg-amber-500 text-white w-14 h-14 rounded-2xl flex items-center justify-center shrink-0">
            <Award className="w-7 h-7" />
          </div>
          <div className="flex-1">
            <h2 className="text-2xl font-bold text-stone-900 mb-3">Our Promise</h2>
            <p className="text-stone-600 leading-relaxed">
              We promise to always stay true to our roots — delivering <strong className="text-maroon-800">authentic,
              chemical-free, and lovingly prepared products</strong> that bring health and happiness to your home.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 mt-5 flex-wrap">
              <span className="inline-flex items-center gap-1.5 bg-maroon-100 text-maroon-800 text-sm font-semibold px-3 py-1.5 rounded-full">
                📍 Based in Kanchipuram
              </span>
              <span className="inline-flex items-center gap-1.5 bg-green-100 text-green-800 text-sm font-semibold px-3 py-1.5 rounded-full">
                ✅ No Artificial Agents
              </span>
              <span className="inline-flex items-center gap-1.5 bg-amber-100 text-amber-800 text-sm font-semibold px-3 py-1.5 rounded-full">
                🏠 Homemade with Love
              </span>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center">
          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-maroon-800 hover:bg-maroon-900 text-white font-bold px-8 py-4 rounded-full transition text-lg shadow-lg shadow-maroon-800/20"
          >
            Shop Our Products
          </Link>
          <p className="text-stone-500 text-sm mt-3">
            Questions? Call us at <a href={`tel:${BRAND.phone}`} className="text-maroon-700 font-semibold hover:underline">{BRAND.phone}</a>
          </p>
        </div>
      </div>
    </div>
  );
}
