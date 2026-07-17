import { BRAND } from './supabase';
import type { Order, OrderItem } from './types';

function cleanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  return digits.startsWith('91') ? digits : `91${digits}`;
}

export function waLink(phone: string, message: string): string {
  return `https://wa.me/${cleanPhone(phone)}?text=${encodeURIComponent(message)}`;
}

export function adminOrderAlert(order: Order, items: OrderItem[]): string {
  const itemLines = items.map((it) => `• ${it.product_name} x${it.quantity} = ₹${it.line_total}`).join('\n');
  const phone2Line = order.phone2 ? `📞 *Phone 2:* ${order.phone2}` : null;
  const waLine = order.whatsapp_number ? `💬 *WhatsApp:* ${order.whatsapp_number}` : null;
  const msg = [
    `🛒 *New Order — ${order.order_number}*`,
    '',
    `👤 *Customer:* ${order.customer_name}`,
    `📞 *Phone 1:* ${order.phone}`,
    phone2Line,
    waLine,
    `📍 *Delivery:* ${order.delivery_location ?? 'Tamil Nadu'}`,
    `🏠 *Address:* ${order.address}, ${order.city ?? ''} ${order.pincode}`,
    '',
    `*Items:*`,
    itemLines,
    '',
    `Subtotal: ₹${order.items_total}`,
    `Courier: ₹${order.shipping}`,
    `*Total: ₹${order.grand_total}*`,
    '',
    `Please verify and process! 🌶️`,
  ].filter((l) => l !== null).join('\n');
  return waLink(BRAND.phone, msg);
}

export function customerStatusMessage(order: Order, status: string): string {
  const name = order.customer_name.split(' ')[0];
  const id = order.order_number;
  const trackUrl = `kavismasala.com/#/track`;

  const messages: Record<string, string> = {
    Confirmed: [
      `Hi ${name}! 🎉`,
      ``,
      `Your *Kavis Masala* order *${id}* has been *confirmed*! We're getting ready to prepare your order.`,
      ``,
      `Thank you for choosing authentic homemade masalas! 🌶️`,
      ``,
      `Track your order: ${trackUrl}`,
    ].join('\n'),

    Preparing: [
      `Hi ${name}! 📦`,
      ``,
      `Great news! Your *Kavis Masala* order *${id}* is now being *prepared fresh* for you.`,
      ``,
      `We're carefully packing your order with love! 🌿`,
      ``,
      `Track your order: ${trackUrl}`,
    ].join('\n'),

    Shipped: [
      `Hi ${name}! 🚚`,
      ``,
      `Your *Kavis Masala* order *${id}* has been *shipped*!`,
      ``,
      `Expected delivery: 2–3 business days.`,
      ``,
      `Track your order: ${trackUrl}`,
      ``,
      `For any queries, call us: ${BRAND.phone}`,
    ].join('\n'),

    Delivered: [
      `Hi ${name}! ✅`,
      ``,
      `Your *Kavis Masala* order *${id}* has been *delivered*! 🎊`,
      ``,
      `We hope you love the authentic taste of our homemade masalas! 🌶️`,
      ``,
      `Please share your experience with us on Instagram: @${BRAND.instagramHandle}`,
      ``,
      `Thank you for your support! 🙏`,
    ].join('\n'),
  };

  return messages[status] ?? `Your Kavis Masala order ${id} status has been updated to: ${status}`;
}

export function buildCartWhatsAppMessage(
  items: { name: string; qty: number; price: number; total: number }[],
): string {
  const lines = items.map((it) => `• ${it.name} x${it.qty} = ₹${it.total}`).join('\n');
  const subtotal = items.reduce((s, it) => s + it.total, 0);
  return [
    `Hi Kavis Masala! 🌶️`,
    ``,
    `I'd like to place an order:`,
    ``,
    lines,
    ``,
    `*Subtotal: ₹${subtotal}*`,
    ``,
    `Please confirm availability and payment details. Thank you!`,
  ].join('\n');
}

export const SAVED_CUSTOMER_KEY = 'kavis_customer_details';
