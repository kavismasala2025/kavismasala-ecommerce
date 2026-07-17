import { useEffect, useRef, useState } from 'react';
import { Bot, Send, X, Sparkles, MessageCircle } from 'lucide-react';
import { BRAND } from '../lib/supabase';
import { formatINR } from '../lib/format';
import { getBotResponse, waContact, type BotResponse } from '../lib/chatbot';
import { Link } from '../lib/router';
import type { Product, Order, OrderItem } from '../lib/types';

interface Message {
  id: string;
  role: 'user' | 'bot';
  text: string;
  quickReplies?: string[];
  showWhatsApp?: boolean;
  products?: Product[];
  order?: Order & { items: OrderItem[] };
  timestamp: number;
}

const STORAGE_KEY = 'kavis_chat_history';
const QUICK_INITIAL = ['Show products', 'Track my order', 'What are the prices?', 'Payment options'];

function uid() {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

// Render **bold** segments in text
function renderText(text: string) {
  return text.split(/(\*\*[^*]+\*\*)/g).map((seg, i) => {
    if (seg.startsWith('**') && seg.endsWith('**')) {
      return <strong key={i} className="font-bold">{seg.slice(2, -2)}</strong>;
    }
    return <span key={i}>{seg}</span>;
  });
}

export default function ChatBot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [typing, setTyping] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load history on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const saved = JSON.parse(raw) as Message[];
        if (Array.isArray(saved) && saved.length) {
          setMessages(saved);
          return;
        }
      }
    } catch {}
    // First visit — greeting
    setMessages([{
      id: uid(),
      role: 'bot',
      text: `Hello! Welcome to **${BRAND.name}** 🌶️\n\nI'm your shopping assistant. I can help you find products, track orders, answer questions about payment, delivery, and more!`,
      quickReplies: QUICK_INITIAL,
      timestamp: Date.now(),
    }]);
  }, []);

  // Persist history
  useEffect(() => {
    if (messages.length) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(messages.slice(-30))); } catch {}
    }
  }, [messages]);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }
  }, [messages, typing, open]);

  // Focus input when opened
  useEffect(() => {
    if (open) setTimeout(() => inputRef.current?.focus(), 300);
  }, [open]);

  const send = async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || typing) return;

    const userMsg: Message = { id: uid(), role: 'user', text: trimmed, timestamp: Date.now() };
    setMessages((m) => [...m, userMsg]);
    setInput('');
    setTyping(true);

    // Simulate thinking delay for natural feel
    const delay = Math.min(1800, 600 + trimmed.length * 25);
    await new Promise((r) => setTimeout(r, delay));

    try {
      const res: BotResponse = await getBotResponse(trimmed);
      const botMsg: Message = {
        id: uid(),
        role: 'bot',
        text: res.text,
        quickReplies: res.quickReplies,
        showWhatsApp: res.showWhatsApp,
        products: res.products,
        order: res.order,
        timestamp: Date.now(),
      };
      setMessages((m) => [...m, botMsg]);
    } catch {
      setMessages((m) => [...m, {
        id: uid(),
        role: 'bot',
        text: "Sorry, I had trouble processing that. Please try again or reach out on WhatsApp.",
        showWhatsApp: true,
        quickReplies: ['Contact on WhatsApp', 'Track my order'],
        timestamp: Date.now(),
      }]);
    } finally {
      setTyping(false);
    }
  };

  const clearChat = () => {
    if (!confirm('Clear chat history?')) return;
    localStorage.removeItem(STORAGE_KEY);
    setMessages([{
      id: uid(),
      role: 'bot',
      text: `Chat cleared. How can I help you today? 🌶️`,
      quickReplies: QUICK_INITIAL,
      timestamp: Date.now(),
    }]);
  };

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen((v) => !v)}
        aria-label={open ? 'Close chat' : 'Open chat assistant'}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full shadow-xl flex items-center justify-center transition-all duration-300 ${
          open
            ? 'bg-stone-800 text-white rotate-90'
            : 'bg-maroon-800 hover:bg-maroon-900 text-white hover:scale-110'
        }`}
      >
        {open ? <X className="w-6 h-6" /> : (
          <span className="relative">
            <Sparkles className="w-6 h-6" />
            {!open && (
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full border-2 border-maroon-800 animate-pulse" />
            )}
          </span>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className="fixed bottom-24 right-4 sm:right-6 z-50 w-[calc(100vw-2rem)] sm:w-96 max-w-md h-[70vh] max-h-[600px] bg-white rounded-2xl shadow-2xl border border-stone-200 flex flex-col overflow-hidden animate-in">
          {/* Header */}
          <div className="bg-maroon-800 text-white px-4 py-3 flex items-center gap-3 shrink-0">
            <div className="w-10 h-10 rounded-full bg-cream-300 text-maroon-900 flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-bold text-sm flex items-center gap-1.5">
                Kavis Assistant
                <span className="w-2 h-2 bg-green-400 rounded-full" />
              </div>
              <div className="text-white/60 text-xs">Typically replies instantly</div>
            </div>
            <button onClick={clearChat} className="text-white/60 hover:text-white text-xs px-2 py-1 rounded hover:bg-white/10 transition" title="Clear chat">
              Clear
            </button>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto px-3 py-4 space-y-3 bg-cream-50">
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] ${m.role === 'user' ? '' : 'w-full'}`}>
                  {m.role === 'bot' && (
                    <div className="flex items-center gap-1.5 mb-1">
                      <div className="w-5 h-5 rounded-full bg-maroon-100 text-maroon-700 flex items-center justify-center">
                        <Bot className="w-3 h-3" />
                      </div>
                      <span className="text-[10px] text-stone-400 font-medium">Assistant</span>
                    </div>
                  )}
                  <div
                    className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap break-words ${
                      m.role === 'user'
                        ? 'bg-maroon-800 text-white rounded-br-md'
                        : 'bg-white text-stone-800 border border-stone-100 rounded-bl-md shadow-sm'
                    }`}
                  >
                    {renderText(m.text)}
                  </div>

                  {/* Product cards */}
                  {m.products && m.products.length > 0 && (
                    <div className="mt-2 space-y-2">
                      {m.products.map((p) => (
                        <Link
                          key={p.id}
                          to={`/product/${p.slug}`}
                          onClick={() => setOpen(false)}
                          className="flex items-center gap-2.5 bg-white border border-stone-100 rounded-xl p-2 hover:border-maroon-300 hover:shadow-sm transition group"
                        >
                          <div className="w-12 h-12 rounded-lg overflow-hidden bg-cream-100 shrink-0">
                            {p.image_url && <img src={p.image_url} alt={p.name} className="w-full h-full object-cover" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-xs font-semibold text-stone-900 line-clamp-1 group-hover:text-maroon-700 transition">{p.name}</div>
                            <div className="text-xs text-stone-500">{p.category}</div>
                          </div>
                          <div className="text-sm font-bold text-maroon-700 shrink-0">{formatINR(p.price)}</div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {/* Order tracking card */}
                  {m.order && (
                    <div className="mt-2 bg-white border border-stone-100 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-bold text-stone-900 text-sm">{m.order.order_number}</div>
                        <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                          m.order.status === 'Delivered' ? 'bg-green-100 text-green-700' :
                          m.order.status === 'Shipped' ? 'bg-indigo-100 text-indigo-700' :
                          m.order.status === 'Preparing' ? 'bg-purple-100 text-purple-700' :
                          m.order.status === 'Confirmed' ? 'bg-blue-100 text-blue-700' :
                          'bg-amber-100 text-amber-700'
                        }`}>{m.order.status}</span>
                      </div>
                      <div className="text-xs text-stone-500 space-y-0.5">
                        <div>Total: <span className="font-semibold text-stone-700">{formatINR(m.order.grand_total)}</span></div>
                        <div>Placed: {new Date(m.order.created_at).toLocaleDateString('en-IN')}</div>
                      </div>
                      <div className="mt-2 pt-2 border-t border-stone-50 space-y-0.5">
                        {m.order.items.map((it, i) => (
                          <div key={i} className="text-xs text-stone-600 flex justify-between">
                            <span>{it.product_name} ×{it.quantity}</span>
                            <span>{formatINR(it.line_total)}</span>
                          </div>
                        ))}
                      </div>
                      <Link
                        to="/track"
                        onClick={() => setOpen(false)}
                        className="mt-2 block text-center text-xs font-semibold text-maroon-700 hover:underline"
                      >
                        View full tracking →
                      </Link>
                    </div>
                  )}

                  {/* WhatsApp button */}
                  {m.showWhatsApp && (
                    <a
                      href={waContact()}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1.5 bg-green-600 hover:bg-green-700 text-white text-xs font-semibold px-3 py-1.5 rounded-full transition"
                    >
                      <svg viewBox="0 0 24 24" className="w-3.5 h-3.5 fill-current"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/></svg>
                      Contact on WhatsApp
                    </a>
                  )}

                  {/* Quick replies */}
                  {m.quickReplies && m.quickReplies.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1.5">
                      {m.quickReplies.map((qr) => {
                        const isWhatsApp = qr.toLowerCase().includes('whatsapp');
                        return (
                          <button
                            key={qr}
                            onClick={() => isWhatsApp ? window.open(waContact(), '_blank') : send(qr)}
                            className={`text-xs font-medium px-3 py-1.5 rounded-full border transition active:scale-95 ${
                              isWhatsApp
                                ? 'border-green-300 text-green-700 bg-green-50 hover:bg-green-100'
                                : 'border-maroon-300 text-maroon-700 bg-white hover:bg-maroon-50'
                            }`}
                          >
                            {qr}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            ))}

            {/* Typing indicator */}
            {typing && (
              <div className="flex justify-start">
                <div className="bg-white border border-stone-100 rounded-2xl rounded-bl-md px-4 py-3 shadow-sm">
                  <div className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-maroon-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-2 h-2 bg-maroon-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-2 h-2 bg-maroon-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t border-stone-100 p-3 bg-white shrink-0">
            <form
              onSubmit={(e) => { e.preventDefault(); send(input); }}
              className="flex items-center gap-2"
            >
              <input
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask me anything..."
                className="flex-1 px-3.5 py-2.5 rounded-full border border-stone-200 focus:border-maroon-500 focus:outline-none text-sm bg-cream-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || typing}
                className="w-10 h-10 rounded-full bg-maroon-800 hover:bg-maroon-900 disabled:opacity-40 text-white flex items-center justify-center transition shrink-0"
                aria-label="Send"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
            <div className="text-[10px] text-stone-400 text-center mt-1.5 flex items-center justify-center gap-1">
              <MessageCircle className="w-3 h-3" /> Powered by Kavis Masala AI Assistant
            </div>
          </div>
        </div>
      )}
    </>
  );
}
