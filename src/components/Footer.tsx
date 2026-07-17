import { Phone, Mail, MapPin, Instagram, Facebook, BadgeCheck } from 'lucide-react';
import { BRAND } from '../lib/supabase';
import { Link } from '../lib/router';

export default function Footer() {
  return (
    <footer className="bg-maroon-900 text-white/80 mt-0">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid gap-10 md:grid-cols-4">
        {/* Brand */}
        <div>
          <div className="flex items-center gap-2.5 mb-3">
            <img
              src={BRAND.logo}
              alt="Kavis Masala Logo"
              className="h-10 w-10 rounded-full object-cover border border-cream-300"
            />
            <span className="font-bold text-white text-lg">{BRAND.name}</span>
          </div>
          <p className="text-sm text-white/70 leading-relaxed">
            Pure homemade masala products with traditional recipes. Straight from Kanchipuram to your kitchen.
          </p>
          <div className="flex gap-3 mt-4">
            <a
              href={BRAND.instagram}
              target="_blank"
              rel="noopener noreferrer"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-cream-300 hover:text-maroon-900 flex items-center justify-center transition text-white"
              aria-label="Instagram"
            >
              <Instagram className="w-4 h-4" />
            </a>
            <a
              href="#"
              className="w-9 h-9 rounded-full bg-white/10 hover:bg-cream-300 hover:text-maroon-900 flex items-center justify-center transition text-white"
              aria-label="Facebook"
            >
              <Facebook className="w-4 h-4" />
            </a>
          </div>
        </div>

        {/* Shop links */}
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Shop</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/shop?category=Podi%20Varieties" className="hover:text-cream-300 transition">Podi Varieties</Link></li>
            <li><Link to="/shop?category=Pickles" className="hover:text-cream-300 transition">Pickles</Link></li>
            <li><Link to="/shop?category=Health%20Mix" className="hover:text-cream-300 transition">Health Mix</Link></li>
            <li><Link to="/shop?category=Rice%20Mixes" className="hover:text-cream-300 transition">Rice Mixes</Link></li>
            <li><Link to="/shop" className="hover:text-cream-300 transition">All Products</Link></li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Company</h4>
          <ul className="space-y-2 text-sm">
            <li><Link to="/about" className="hover:text-cream-300 transition">About Us</Link></li>
            <li><Link to="/track" className="hover:text-cream-300 transition">Track Order</Link></li>
            <li><Link to="/return-policy" className="hover:text-cream-300 transition">Return & Refund Policy</Link></li>
            <li><Link to="/privacy" className="hover:text-cream-300 transition">Privacy Policy</Link></li>
            <li>
              <a
                href={BRAND.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="hover:text-cream-300 transition flex items-center gap-1.5"
              >
                <Instagram className="w-3.5 h-3.5" /> @{BRAND.instagramHandle}
              </a>
            </li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 className="text-white font-semibold mb-3 text-sm uppercase tracking-wider">Contact Us</h4>
          <ul className="space-y-3 text-sm">
            <li className="flex items-center gap-2">
              <Phone className="w-4 h-4 text-cream-300 shrink-0" />
              <div>
                <a href={`tel:${BRAND.phone}`} className="hover:text-cream-300 transition block">{BRAND.phone}</a>
                <a href={`tel:${BRAND.phone2}`} className="hover:text-cream-300 transition block">{BRAND.phone2}</a>
              </div>
            </li>
            <li className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-cream-300 shrink-0" />
              <a href={`mailto:${BRAND.email}`} className="hover:text-cream-300 transition break-all">{BRAND.email}</a>
            </li>
            <li className="flex items-start gap-2">
              <MapPin className="w-4 h-4 text-cream-300 mt-0.5 shrink-0" />
              <span>Kanchipuram, Tamil Nadu, India</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-white/50">
          <span>&copy; {new Date().getFullYear()} {BRAND.name}. All rights reserved.</span>
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <span className="inline-flex items-center gap-1.5 text-cream-200/90 font-medium">
              <BadgeCheck className="w-3.5 h-3.5" />
              FSSAI Licensed | License No: <span className="font-semibold tracking-wider">{BRAND.fssaiLicense}</span>
            </span>
            <Link to="/privacy" className="hover:text-cream-300 transition">Privacy Policy</Link>
            <Link to="/return-policy" className="hover:text-cream-300 transition">Returns</Link>
            <Link to="/about" className="hover:text-cream-300 transition">About</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
