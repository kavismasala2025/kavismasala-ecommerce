import { RefreshCw, AlertCircle, Phone, Mail } from 'lucide-react';
import { BRAND } from '../lib/supabase';
import { Link } from '../lib/router';

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <div className="mb-8">
    <h2 className="text-xl font-bold text-maroon-800 mb-3 flex items-center gap-2">
      <span className="w-1.5 h-6 bg-maroon-700 rounded-full inline-block" />
      {title}
    </h2>
    <div className="text-stone-600 leading-relaxed space-y-2">{children}</div>
  </div>
);

export default function ReturnPolicy() {
  return (
    <div className="bg-cream-50 min-h-screen">
      <section className="bg-maroon-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            <RefreshCw className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold">Return & Refund Policy</h1>
          <p className="text-white/70 mt-2 text-sm">Last updated: July 2026</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-8 flex items-start gap-3">
          <AlertCircle className="w-5 h-5 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-sm text-amber-800">
            <strong>Important:</strong> Since our products are consumable food items, we follow strict hygiene and quality
            standards. Please read this policy carefully before placing an order.
          </p>
        </div>

        <div className="bg-white rounded-2xl border border-stone-100 p-6 md:p-10">

          <Section title="1. Return Eligibility">
            <p>We accept returns only under the following circumstances:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>The product received is <strong>damaged</strong> or <strong>defective</strong> (broken seal, leaking packet, etc.).</li>
              <li>You received a <strong>wrong product</strong> that does not match your order.</li>
              <li>The product is <strong>past its expiry date</strong> at the time of delivery.</li>
            </ul>
            <p className="mt-3 font-semibold text-stone-700">We do NOT accept returns for:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Change of mind or dislike of taste.</li>
              <li>Products that have been opened or partially consumed.</li>
              <li>Incorrect orders placed by the customer.</li>
              <li>Damage caused after delivery due to customer mishandling.</li>
            </ul>
          </Section>

          <Section title="2. Return Window">
            <p>
              Return requests must be raised within <strong>48 hours of delivery</strong>. Requests raised after this window
              will not be considered.
            </p>
          </Section>

          <Section title="3. How to Raise a Return Request">
            <p>To initiate a return, please contact us within 48 hours of delivery:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>WhatsApp / Call: <a href={`tel:${BRAND.phone}`} className="text-maroon-700 font-semibold">{BRAND.phone}</a> or <a href={`tel:${BRAND.phone2}`} className="text-maroon-700 font-semibold">{BRAND.phone2}</a></li>
              <li>Email: <a href={`mailto:${BRAND.email}`} className="text-maroon-700 font-semibold">{BRAND.email}</a></li>
            </ul>
            <p className="mt-3">Please share:</p>
            <ul className="list-disc list-inside space-y-1 mt-1">
              <li>Your Order ID (e.g., KM2026XXXXX)</li>
              <li>Clear photographs of the damaged / wrong product</li>
              <li>A brief description of the issue</li>
            </ul>
          </Section>

          <Section title="4. Refund Policy">
            <p>Once your return is approved:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>A <strong>full refund</strong> will be initiated to your original UPI payment method.</li>
              <li>Refunds are typically processed within <strong>5–7 business days</strong>.</li>
              <li>You will receive a confirmation message once the refund is initiated.</li>
            </ul>
          </Section>

          <Section title="5. Replacement Policy">
            <p>
              In cases of damaged or wrong products, we may offer a <strong>free replacement</strong> instead of a refund,
              depending on stock availability. We will confirm the option with you before proceeding.
            </p>
          </Section>

          <Section title="6. No-Return Items">
            <p>The following are strictly non-returnable:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Opened or used food products</li>
              <li>Products purchased during a sale or at a discounted price (unless defective)</li>
            </ul>
          </Section>

          <Section title="7. Shipping Costs for Returns">
            <p>
              If the return is due to <strong>our error</strong> (wrong/defective product), we will bear the return
              shipping cost.
            </p>
            <p>
              If the return request is for any other approved reason, the customer must arrange and pay for return shipping.
            </p>
          </Section>

          <Section title="8. Contact Us">
            <p>For any questions about this policy, please reach out to us:</p>
            <div className="flex flex-col sm:flex-row gap-3 mt-3">
              <a href={`tel:${BRAND.phone}`}
                className="inline-flex items-center gap-2 bg-maroon-50 text-maroon-800 font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-maroon-100 transition">
                <Phone className="w-4 h-4" /> {BRAND.phone}
              </a>
              <a href={`mailto:${BRAND.email}`}
                className="inline-flex items-center gap-2 bg-maroon-50 text-maroon-800 font-semibold px-4 py-2.5 rounded-lg text-sm hover:bg-maroon-100 transition">
                <Mail className="w-4 h-4" /> {BRAND.email}
              </a>
            </div>
          </Section>
        </div>

        <div className="mt-6 text-center">
          <Link to="/shop" className="text-maroon-700 font-semibold hover:underline text-sm">
            ← Back to Shop
          </Link>
          <span className="mx-3 text-stone-300">|</span>
          <Link to="/privacy" className="text-maroon-700 font-semibold hover:underline text-sm">
            Privacy Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
