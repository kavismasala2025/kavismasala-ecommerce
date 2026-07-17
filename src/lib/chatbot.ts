import { supabase, BRAND, SHIPPING_RATES, CATEGORIES } from './supabase';
import { formatINR } from './format';
import { waLink } from './whatsapp';
import type { Product, Order, OrderItem } from './types';

export interface BotResponse {
  text: string;
  quickReplies?: string[];
  showWhatsApp?: boolean;
  products?: Product[];
  order?: Order & { items: OrderItem[] };
}

interface Intent {
  id: string;
  keywords: string[];
  handler: (input: string) => Promise<BotResponse>;
}

const waContact = () => waLink(BRAND.phone, "Hi Kavis Masala! I have a question.");

// ── Helpers ─────────────────────────────────────────────────────────────────
async function findProducts(query: string): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .or(`name.ilike.%${query}%,category.ilike.%${query}%,description.ilike.%${query}%`)
    .limit(5);
  return (data as Product[] | null) ?? [];
}

async function allProducts(): Promise<Product[]> {
  const { data } = await supabase
    .from('products')
    .select('*')
    .eq('is_active', true)
    .order('is_trending', { ascending: false })
    .limit(8);
  return (data as Product[] | null) ?? [];
}

async function trackOrder(orderId: string): Promise<(Order & { items: OrderItem[] }) | null> {
  const q = orderId.trim().toUpperCase();
  const { data: order } = await supabase
    .from('orders')
    .select('*')
    .or(`order_number.eq.${q},phone.eq.${q}`)
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();

  if (!order) return null;
  const { data: items } = await supabase.from('order_items').select('*').eq('order_id', (order as Order).id);
  return { ...(order as Order), items: (items as OrderItem[] | null) ?? [] };
}

// ── Intents ─────────────────────────────────────────────────────────────────
const INTENTS: Intent[] = [
  // Order tracking
  {
    id: 'track_order',
    keywords: ['track', 'order status', 'where is my order', 'order id', 'my order', 'track order', 'trackorder'],
    handler: async (input) => {
      // Extract an order ID pattern (KM + digits) or 10-digit phone
      const idMatch = input.match(/KM\d{4,}/i);
      const phoneMatch = input.match(/\b\d{10}\b/);
      const id = idMatch?.[0] ?? phoneMatch?.[0] ?? '';

      if (!id) {
        return {
          text: "I can track your order! Please share your **Order ID** (looks like KM20260001) or your registered 10-digit phone number.",
          quickReplies: ['How do I find my Order ID?', 'Contact on WhatsApp'],
        };
      }

      const order = await trackOrder(id);
      if (!order) {
        return {
          text: `I couldn't find an order with **${id}**. Please double-check the Order ID or phone number and try again.`,
          quickReplies: ['Track another order', 'Contact on WhatsApp'],
          showWhatsApp: true,
        };
      }

      const itemsList = order.items.map((it) => `• ${it.product_name} ×${it.quantity}`).join('\n');
      return {
        text: `Found your order **${order.order_number}**!\n\n*Status:* ${order.status}\n*Total:* ${formatINR(order.grand_total)}\n*Items:*\n${itemsList}\n\nPlaced on ${new Date(order.created_at).toLocaleDateString('en-IN')}.`,
        order,
        quickReplies: ['Track another order', 'View return policy', 'Contact on WhatsApp'],
      };
    },
  },

  // Product search / recommendations
  {
    id: 'product_search',
    keywords: ['product', 'products', 'recommend', 'suggest', 'what do you have', 'show me', 'buy', 'shop'],
    handler: async (input) => {
      // Try to extract a category or product name
      const cat = CATEGORIES.find((c) => input.toLowerCase().includes(c.toLowerCase()));
      if (cat) {
        const products = await findProducts(cat);
        if (products.length) {
          return {
            text: `Here are some **${cat}** we offer:`,
            products,
            quickReplies: ['Show all products', 'What are the prices?', 'Contact on WhatsApp'],
          };
        }
      }
      // Generic: extract a keyword
      const words = input.replace(/^(show me|find|search|buy|order|i want|looking for|do you have|have)\s+/i, '').trim();
      if (words.length > 2) {
        const products = await findProducts(words);
        if (products.length) {
          return {
            text: `I found these matching "${words}":`,
            products,
            quickReplies: ['Show all products', 'Track my order', 'Contact on WhatsApp'],
          };
        }
      }
      const products = await allProducts();
      return {
        text: "Here are some of our popular products. You can also browse the full shop!",
        products,
        quickReplies: ['Go to shop', 'What are the prices?', 'Track my order'],
      };
    },
  },

  // Prices
  {
    id: 'prices',
    keywords: ['price', 'prices', 'cost', 'how much', 'rate', 'rates'],
    handler: async () => {
      const products = await allProducts();
      const priceList = products.map((p) => `• ${p.name} — ${formatINR(p.price)}${p.weight ? ` (${p.weight})` : ''}`).join('\n');
      return {
        text: `Here are our current prices:\n\n${priceList}\n\nPrices include our authentic homemade quality. Courier charges are extra.`,
        quickReplies: ['What are the courier charges?', 'Go to shop', 'Track my order'],
      };
    },
  },

  // Payment methods
  {
    id: 'payment',
    keywords: ['payment', 'pay', 'upi', 'gpay', 'google pay', 'card', 'cash', 'how to pay', 'payment method'],
    handler: async () => ({
      text: `We accept the following payment methods:\n\n• **UPI / Google Pay** (preferred)\n  UPI ID: ${BRAND.upiId}\n  Name: ${BRAND.upiName}\n• **Bank transfer** (on request)\n\nPayment is collected after your order is confirmed. Our team will contact you on WhatsApp with payment details.`,
      quickReplies: ['What are the courier charges?', 'How long is delivery?', 'Track my order'],
    }),
  },

  // Shipping / delivery
  {
    id: 'shipping',
    keywords: ['shipping', 'delivery', 'courier', 'dispatch', 'ship', 'how long', 'when will', 'delivery time'],
    handler: async () => {
      const rates = Object.values(SHIPPING_RATES).map((r) => `• ${r.label}: ${r.note}`).join('\n');
      return {
        text: `We deliver across India via courier:\n\n${rates}\n\n**Delivery timeline:** 3–7 business days depending on your location. We'll share the tracking details once your order is shipped.`,
        quickReplies: ['What are the prices?', 'How do I pay?', 'Track my order'],
      };
    },
  },

  // Return policy
  {
    id: 'returns',
    keywords: ['return', 'refund', 'exchange', 'replace', 'damaged', 'broken', 'policy', 'complaint'],
    handler: async () => ({
      text: `**Return & Refund Policy:**\n\n• If you receive a damaged or spoiled product, contact us within **48 hours** with a photo.\n• We'll arrange a **replacement** or **full refund**.\n• Refunds are processed to your original payment method within 5–7 business days.\n• Due to the nature of food products, we don't accept returns for taste preferences.\n\nFor any issue, please reach out — we'll make it right!`,
      quickReplies: ['Contact on WhatsApp', 'Track my order', 'Go to shop'],
      showWhatsApp: true,
    }),
  },

  // Contact / business details
  {
    id: 'contact',
    keywords: ['contact', 'phone', 'call', 'email', 'reach', 'address', 'where are you', 'location', 'kanchipuram'],
    handler: async () => ({
      text: `**Contact Kavis Masala:**\n\n• Phone: ${BRAND.phone}, ${BRAND.phone2}\n• Email: ${BRAND.email}\n• Location: Kanchipuram, Tamil Nadu, India\n• Instagram: @${BRAND.instagramHandle}\n\nWe're happy to help with any questions!`,
      quickReplies: ['Contact on WhatsApp', 'Track my order', 'Go to shop'],
      showWhatsApp: true,
    }),
  },

  // FSSAI / certification
  {
    id: 'fssai',
    keywords: ['fssai', 'license', 'certified', 'certification', 'food safety', 'quality', 'hygiene'],
    handler: async () => ({
      text: `Yes, Kavis Masala is **FSSAI Licensed**.\n\nLicense No: **${BRAND.fssaiLicense}**\n\nThis means our products meet national food safety and quality standards. You can shop with confidence!`,
      quickReplies: ['Go to shop', 'What are the prices?', 'Contact on WhatsApp'],
    }),
  },

  // Ingredients / health benefits
  {
    id: 'ingredients',
    keywords: ['ingredient', 'ingredients', 'what is in', 'made of', 'contents', 'health', 'benefit', 'benefits', 'nutritious', 'organic', 'natural', 'preservative', 'additive'],
    handler: async () => ({
      text: `All our products are made with **traditional recipes** and **no artificial preservatives or additives**. We use fresh, natural ingredients sourced from trusted suppliers.\n\nFor specific ingredient lists on any product, just ask me about that product by name, or check the product page in our shop.`,
      quickReplies: ['Show all products', 'Are you FSSAI certified?', 'Contact on WhatsApp'],
    }),
  },

  // Combo / offers
  {
    id: 'combos',
    keywords: ['combo', 'offer', 'offers', 'deal', 'deals', 'discount', 'bundle', 'pack', 'gift'],
    handler: async () => ({
      text: `We occasionally offer **combo packs** and **festival specials** (e.g. Podi Combo, Diwali Gift Hampers). These are announced on our Instagram and website.\n\nFor bulk orders or custom gift hampers, please contact us directly — we're happy to put together something special!`,
      quickReplies: ['Contact on WhatsApp', 'Go to shop', 'Track my order'],
      showWhatsApp: true,
    }),
  },

  // Greeting
  {
    id: 'greeting',
    keywords: ['hi', 'hello', 'hey', 'namaste', 'vanakkam', 'good morning', 'good evening', 'good afternoon'],
    handler: async () => ({
      text: `Hello! Welcome to **Kavis Masala** 🌶️\n\nI'm your shopping assistant. I can help you with:\n• Finding products & prices\n• Tracking your order\n• Payment & delivery info\n• Returns & FAQs\n\nWhat can I help you with today?`,
      quickReplies: ['Show products', 'Track my order', 'What are the prices?', 'Contact on WhatsApp'],
    }),
  },

  // Thanks
  {
    id: 'thanks',
    keywords: ['thank', 'thanks', 'thank you', 'great', 'awesome', 'perfect', 'ok', 'okay'],
    handler: async () => ({
      text: `You're welcome! 😊 Is there anything else I can help you with?`,
      quickReplies: ['Show products', 'Track my order', 'Contact on WhatsApp'],
    }),
  },

  // Business hours
  {
    id: 'hours',
    keywords: ['hours', 'timing', 'open', 'close', 'when do you', 'available'],
    handler: async () => ({
      text: `We're available **Monday to Saturday, 9 AM – 7 PM**. Online orders can be placed 24/7 and we'll process them on the next business day.\n\nFor urgent queries, WhatsApp us anytime!`,
      quickReplies: ['Contact on WhatsApp', 'Go to shop', 'Track my order'],
      showWhatsApp: true,
    }),
  },
];

// ── Matcher ─────────────────────────────────────────────────────────────────
export async function getBotResponse(input: string): Promise<BotResponse> {
  const text = input.toLowerCase().trim();

  // Score each intent by keyword matches
  let best: { intent: Intent; score: number } | null = null;
  for (const intent of INTENTS) {
    let score = 0;
    for (const kw of intent.keywords) {
      if (text.includes(kw)) {
        // Longer keyword matches score higher
        score += kw.length;
      }
    }
    if (score > 0 && (!best || score > best.score)) {
      best = { intent, score };
    }
  }

  if (best) {
    return best.intent.handler(input);
  }

  // Fallback
  return {
    text: `I'm not sure I understood that. I can help with products, prices, order tracking, payment, delivery, returns, and more. Try asking me something specific, or reach out on WhatsApp!`,
    quickReplies: ['Show products', 'Track my order', 'What are the prices?', 'Contact on WhatsApp'],
    showWhatsApp: true,
  };
}

export { waContact };
