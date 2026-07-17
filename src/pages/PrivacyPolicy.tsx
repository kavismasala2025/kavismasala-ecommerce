import { Shield, Phone, Mail } from 'lucide-react';
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

export default function PrivacyPolicy() {
  return (
    <div className="bg-cream-50 min-h-screen">
      <section className="bg-maroon-800 text-white py-12">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <div className="w-14 h-14 rounded-full bg-white/20 flex items-center justify-center mx-auto mb-4">
            <Shield className="w-7 h-7" />
          </div>
          <h1 className="text-3xl font-bold">Privacy Policy</h1>
          <p className="text-white/70 mt-2 text-sm">Last updated: July 2026</p>
        </div>
      </section>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-10">
        <div className="bg-white rounded-2xl border border-stone-100 p-6 md:p-10">

          <p className="text-stone-600 leading-relaxed mb-8">
            At <strong className="text-maroon-800">Kavis Masala</strong> ("we", "our", "us"), your privacy is important to us.
            This Privacy Policy explains how we collect, use, and protect your personal information when you use our website
            and place orders with us.
          </p>

          <Section title="1. Information We Collect">
            <p>When you place an order or contact us, we may collect the following information:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li><strong>Personal details:</strong> Name, phone number</li>
              <li><strong>Delivery information:</strong> Address, city, pincode</li>
              <li><strong>Order details:</strong> Products ordered, quantities, order value</li>
              <li><strong>Communication:</strong> Messages, queries sent to us via phone or email</li>
            </ul>
            <p className="mt-3">
              We do <strong>not</strong> collect or store credit/debit card numbers. UPI payments are processed directly
              through your UPI app — we only receive confirmation of the payment.
            </p>
          </Section>

          <Section title="2. How We Use Your Information">
            <p>We use the information collected to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Process and deliver your orders</li>
              <li>Contact you about your order status</li>
              <li>Handle returns, refunds, and customer support</li>
              <li>Improve our products and services based on feedback</li>
              <li>Send occasional updates about new products (only with your consent)</li>
            </ul>
          </Section>

          <Section title="3. Data Sharing">
            <p>
              We do <strong>not</strong> sell, trade, or rent your personal information to third parties. Your data may
              be shared only with:
            </p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Delivery partners (only name, phone, and address for the purpose of delivery)</li>
              <li>Legal authorities if required by law</li>
            </ul>
          </Section>

          <Section title="4. Data Storage & Security">
            <p>
              Your order information is stored securely in our database. We use industry-standard security practices to
              protect your data from unauthorized access or disclosure.
            </p>
            <p className="mt-2">
              We retain your order data for record-keeping and dispute resolution purposes. You may request deletion of
              your data by contacting us at <a href={`mailto:${BRAND.email}`} className="text-maroon-700 font-semibold">{BRAND.email}</a>.
            </p>
          </Section>

          <Section title="5. Cookies">
            <p>
              Our website uses only essential local storage (for your shopping cart). We do not use tracking cookies or
              third-party analytics cookies.
            </p>
          </Section>

          <Section title="6. Children's Privacy">
            <p>
              Our website is not directed to children under 13 years of age. We do not knowingly collect personal
              information from children.
            </p>
          </Section>

          <Section title="7. Your Rights">
            <p>You have the right to:</p>
            <ul className="list-disc list-inside space-y-1 mt-2">
              <li>Access the personal data we hold about you</li>
              <li>Request correction of inaccurate data</li>
              <li>Request deletion of your data</li>
              <li>Opt out of any marketing communications</li>
            </ul>
            <p className="mt-2">
              To exercise any of these rights, please contact us using the details below.
            </p>
          </Section>

          <Section title="8. Changes to This Policy">
            <p>
              We may update this Privacy Policy from time to time. Any changes will be posted on this page with an updated
              date. We encourage you to review this policy periodically.
            </p>
          </Section>

          <Section title="9. Contact Us">
            <p>If you have any questions or concerns about this Privacy Policy, please contact us:</p>
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
          <Link to="/return-policy" className="text-maroon-700 font-semibold hover:underline text-sm">
            Return & Refund Policy
          </Link>
        </div>
      </div>
    </div>
  );
}
