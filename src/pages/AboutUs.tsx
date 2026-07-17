import { Heart, Leaf, Target, Award } from 'lucide-react';
import { BRAND } from '../lib/supabase';
import { Link } from '../lib/router';

const VALUES = [
  { icon: '🌿', title: 'Traditional Methods', desc: 'Every recipe follows age-old techniques passed down through generations.' },
  { icon: '🫙', title: 'Small Batches', desc: 'Prepared in small quantities to ensure freshness and uncompromised quality.' },
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
            src={BRAND.logo}
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
            <span className="text-maroon-800 font-semibold italic"> "Unave Marundhu" (Food is Medicine).</span>
          </p>
          <p className="text-stone-600 mt-4 leading-relaxed">
            Our journey began not in a factory, but in a school environment — among teachers who inspired discipline, care,
            and a deep respect for natural living. What started as simple homemade preparations shared within our school
            community slowly grew into something much bigger — a purpose.
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
              Kavis Masala was started by a group of passionate school teachers who believed that today's fast food culture
              was slowly moving people away from healthy, traditional eating habits. With this concern in mind, we began
              preparing homemade spice powders, health mixes, and traditional food blends in our own kitchens — using
              age-old recipes passed down through generations.
            </p>
            <p className="text-stone-600 leading-relaxed mt-3">
              What began as small batches made for colleagues, friends, and families soon gained trust for its
              <strong className="text-maroon-800"> authentic taste, purity, and health benefits.</strong>
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
            "Let food be your medicine, and medicine be your food."
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
            <h2 className="text-2xl font-bold text-stone-900 mb-3">Our Mission</h2>
            <p className="text-stone-600 leading-relaxed">
              To bring back the lost tradition of healthy eating by offering <strong className="text-maroon-800">pure, homemade-style
              masalas and health mixes</strong> that support a natural and balanced lifestyle.
            </p>
            <p className="text-stone-600 leading-relaxed mt-3">
              We aim to make every kitchen healthier by reconnecting people with traditional wisdom.
            </p>
          </div>
        </div>

        {/* From our kitchen */}
        <div className="bg-cream-100 border border-cream-200 rounded-2xl p-6 md:p-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-10 h-10 rounded-full bg-maroon-800 flex items-center justify-center">
              <Leaf className="w-5 h-5 text-white" />
            </div>
            <h2 className="text-2xl font-bold text-stone-900">From Our Kitchen to Yours</h2>
          </div>
          <p className="text-stone-600 leading-relaxed mb-4">
            Today, Kavis Masala is more than just a brand — it is a movement started by teachers, rooted in tradition,
            and driven by care for your family's health.
          </p>
          <p className="text-stone-700 font-medium mb-3">Every packet you receive carries:</p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {['Tradition', 'Trust', 'Taste', '"Unave Marundhu"'].map((v) => (
              <div key={v} className="bg-white rounded-xl p-3 text-center border border-cream-200">
                <span className="text-maroon-800 font-bold text-sm">{v}</span>
              </div>
            ))}
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
