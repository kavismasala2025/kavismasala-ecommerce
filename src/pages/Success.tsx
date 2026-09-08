import { useEffect, useState } from 'react';
import {
  CheckCircle2,
  Package,
  Phone,
  MapPin,
  ArrowRight,
  Printer,
  FileText,
  X,
} from 'lucide-react';

import { supabase, BRAND } from '../lib/supabase';
import { formatINR } from '../lib/format';
import { Link, useRouter } from '../lib/router';
import type { Order, OrderItem } from '../lib/types';

export default function Success() {
  const { path } = useRouter();

  const [order, setOrder] = useState<Order | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [showBill, setShowBill] = useState(false);

  /* =========================
     GET ORDER NUMBER
  ========================= */
  const orderNumber = (() => {
    const qs = path.split('?')[1] ?? '';
    return new URLSearchParams(qs).get('order') ?? '';
  })();

  /* =========================
     LOAD ORDER
  ========================= */
  useEffect(() => {
    (async () => {
      if (!orderNumber) {
        setLoading(false);
        return;
      }

      const { data } = await supabase
        .from('orders')
        .select('*')
        .eq('order_number', orderNumber)
        .maybeSingle();

      setOrder(data);

      if (data) {
        const { data: oi } = await supabase
          .from('order_items')
          .select('*')
          .eq('order_id', data.id);

        setItems(oi ?? []);
      }

      setLoading(false);
    })();
  }, [orderNumber]);

  /* =========================
     PRINT INVOICE
  ========================= */
  const handlePrint = () => {
    window.print();
  };

  /* =========================
     DATE
  ========================= */
  const getOrderDate = () => {
    const createdAt = (order as (Order & { created_at?: string }) | null)
      ?.created_at;

    if (!createdAt) {
      return new Date().toLocaleDateString('en-IN', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }

    return new Date(createdAt).toLocaleDateString('en-IN', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    });
  };

  /* =========================
     LOADING
  ========================= */
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-maroon-800 mx-auto mb-4"></div>

          <p className="text-gray-700 font-medium">
            Loading order...
          </p>
        </div>
      </div>
    );
  }

  /* =========================
     ORDER NOT FOUND
  ========================= */
  if (!order) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-amber-50 px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 text-center max-w-md w-full">
          <Package className="w-14 h-14 text-gray-400 mx-auto mb-4" />

          <h1 className="text-2xl font-bold text-gray-800 mb-2">
            Order not found
          </h1>

          <p className="text-gray-600 mb-6">
            We couldn't find the order you're looking for.
          </p>

          <Link
            to="/shop"
            className="inline-flex items-center gap-2 bg-maroon-800 text-white px-6 py-3 rounded-lg font-semibold hover:bg-maroon-900 transition"
          >
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      {/* =========================================================
          PRINT STYLES
      ========================================================= */}
      <style>
        {`
          .print-invoice {
            display: none;
          }

          @media print {
            @page {
              size: A4;
              margin: 12mm;
            }

            body {
              background: white !important;
            }

            body * {
              visibility: hidden !important;
            }

            .print-invoice,
            .print-invoice * {
              visibility: visible !important;
            }

            .print-invoice {
              display: block !important;
              position: absolute !important;
              left: 0 !important;
              top: 0 !important;
              width: 100% !important;
              background: white !important;
              color: #111 !important;
              padding: 0 !important;
              margin: 0 !important;
            }

            .no-print {
              display: none !important;
            }
          }
        `}
      </style>

      {/* =========================================================
          NORMAL SUCCESS PAGE
      ========================================================= */}
      <div className="no-print min-h-screen bg-amber-50 py-8 px-4">

        <div className="max-w-3xl mx-auto">

          {/* SUCCESS CARD */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">

            {/* HEADER */}
            <div className="bg-maroon-800 text-white p-8 text-center">

              <CheckCircle2
                className="w-20 h-20 mx-auto mb-4"
                strokeWidth={1.5}
              />

              <h1 className="text-3xl md:text-4xl font-bold mb-2">
                Order Confirmed!
              </h1>

              <p className="text-white/90">
                Thank you! We'll prepare your order right away.
              </p>

            </div>

            {/* CONTENT */}
            <div className="p-5 md:p-8">

              {/* ORDER NUMBER */}
              <div className="bg-amber-50 border border-amber-200 rounded-xl p-5 mb-6 text-center">

                <p className="text-sm text-gray-600 mb-1">
                  Order Number
                </p>

                <p className="text-2xl font-bold text-maroon-800">
                  {order.order_number}
                </p>

                <p className="text-sm text-gray-500 mt-2">
                  Order Date: {getOrderDate()}
                </p>

              </div>

              {/* CUSTOMER DETAILS */}
              <div className="grid md:grid-cols-2 gap-5 mb-8">

                {/* ADDRESS */}
                <div className="border rounded-xl p-5">

                  <div className="flex items-center gap-2 mb-3">
                    <MapPin className="w-5 h-5 text-maroon-800" />

                    <h2 className="font-bold text-gray-800">
                      Delivery Address
                    </h2>
                  </div>

                  <p className="font-semibold text-gray-800">
                    {order.customer_name}
                  </p>

                  <p className="text-gray-600 mt-1">
                    {order.address}
                  </p>

                  <p className="text-gray-600">
                    {order.city} - {order.pincode}
                  </p>

                </div>

                {/* CONTACT */}
                <div className="border rounded-xl p-5">

                  <div className="flex items-center gap-2 mb-3">
                    <Phone className="w-5 h-5 text-maroon-800" />

                    <h2 className="font-bold text-gray-800">
                      Contact
                    </h2>
                  </div>

                  <p className="text-gray-700">
                    Phone: {order.phone}
                  </p>

                  {order.phone2 && (
                    <p className="text-gray-700 mt-1">
                      Alternate: {order.phone2}
                    </p>
                  )}

                  <div className="mt-4 text-sm">
                    <p>
                      <span className="font-semibold">
                        Payment:
                      </span>{' '}
                      {order.payment_method}
                    </p>

                    <p className="mt-1">
                      <span className="font-semibold">
                        Payment Status:
                      </span>{' '}
                      {order.payment_status}
                    </p>

                    <p className="mt-1">
                      <span className="font-semibold">
                        Order Status:
                      </span>{' '}
                      {order.status}
                    </p>
                  </div>

                </div>

              </div>

              {/* ORDER ITEMS */}
              <div className="mb-8">

                <div className="flex items-center gap-2 mb-4">
                  <Package className="w-5 h-5 text-maroon-800" />

                  <h2 className="text-xl font-bold text-gray-800">
                    Your Items
                  </h2>
                </div>

                <div className="border rounded-xl overflow-hidden">

                  {items.map((item, index) => (
                    <div
                      key={item.id ?? index}
                      className="flex justify-between gap-4 p-4 border-b last:border-b-0"
                    >

                      <div className="flex-1">

                        <p className="font-semibold text-gray-800">
                          {item.product_name}
                        </p>

                        <p className="text-sm text-gray-500 mt-1">
                          Qty: {item.quantity} ×{' '}
                          {formatINR(item.price)}
                        </p>

                      </div>

                      <p className="font-bold text-gray-800 whitespace-nowrap">
                        {formatINR(item.line_total)}
                      </p>

                    </div>
                  ))}

                </div>

              </div>

              {/* TOTALS */}
              <div className="bg-gray-50 rounded-xl p-5 mb-8">

                <div className="flex justify-between py-2 text-gray-700">
                  <span>Subtotal</span>

                  <span>
                    {formatINR(order.items_total)}
                  </span>
                </div>

                <div className="flex justify-between py-2 text-gray-700">
                  <span>Courier / Delivery</span>

                  <span>
                    {order.shipping === 0
                      ? 'FREE'
                      : formatINR(order.shipping)}
                  </span>
                </div>

                <div className="border-t mt-3 pt-4 flex justify-between items-center">

                  <span className="text-lg font-bold text-gray-900">
                    Grand Total
                  </span>

                  <span className="text-2xl font-bold text-maroon-800">
                    {formatINR(order.grand_total)}
                  </span>

                </div>

                <div className="mt-4 text-sm text-gray-600">
                  Payment Status:{' '}
                  <span className="font-semibold">
                    {order.payment_status}
                  </span>
                </div>

              </div>

              {/* BILL BUTTONS */}
              <div className="grid sm:grid-cols-2 gap-3 mb-8">

                <button
                  onClick={() => setShowBill(true)}
                  className="flex items-center justify-center gap-2 border-2 border-maroon-800 text-maroon-800 px-5 py-3 rounded-xl font-bold hover:bg-maroon-50 transition"
                >
                  <FileText className="w-5 h-5" />
                  View Bill
                </button>

                <button
                  onClick={handlePrint}
                  className="flex items-center justify-center gap-2 bg-maroon-800 text-white px-5 py-3 rounded-xl font-bold hover:bg-maroon-900 transition"
                >
                  <Printer className="w-5 h-5" />
                  Print / Save PDF
                </button>

              </div>

              {/* SUPPORT */}
              <div className="border-t pt-6 text-center">

                <p className="text-gray-600 mb-2">
                  Need help with your order?
                </p>

                <p className="font-semibold text-maroon-800">
                  {BRAND.phone}
                </p>

                {BRAND.phone2 && (
                  <p className="font-semibold text-maroon-800">
                    {BRAND.phone2}
                  </p>
                )}

              </div>

              {/* NAVIGATION */}
              <div className="flex flex-col sm:flex-row gap-3 justify-center mt-8">

                <Link
                  to="/shop"
                  className="flex items-center justify-center gap-2 bg-maroon-800 text-white px-6 py-3 rounded-xl font-semibold hover:bg-maroon-900 transition"
                >
                  Continue Shopping
                  <ArrowRight className="w-4 h-4" />
                </Link>

                <Link
                  to="/"
                  className="flex items-center justify-center gap-2 border border-gray-300 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-50 transition"
                >
                  Back to Home
                </Link>

              </div>

            </div>
          </div>
        </div>
      </div>

      {/* =========================================================
          VIEW BILL MODAL
      ========================================================= */}
      {showBill && (
        <div className="no-print fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-hidden">

            {/* MODAL HEADER */}
            <div className="flex items-center justify-between p-4 border-b bg-gray-50">

              <h2 className="text-xl font-bold text-gray-800">
                Order Bill
              </h2>

              <button
                onClick={() => setShowBill(false)}
                className="p-2 rounded-lg hover:bg-gray-200 transition"
                aria-label="Close bill"
              >
                <X className="w-5 h-5" />
              </button>

            </div>

            {/* BILL */}
            <div className="overflow-y-auto max-h-[75vh] p-5 md:p-8">

              <div className="border rounded-xl p-5 md:p-8">

                {/* LOGO + BUSINESS */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-5 border-b pb-6">

                  <div className="flex items-center gap-4">

                    <img
                      src="/kavis-logo.png"
                      alt="Kavis Masala"
                      className="w-20 h-20 object-contain"
                    />

                    <div>
                      <h1 className="text-2xl font-bold text-maroon-800">
                        Kavis Masala
                      </h1>

                      <p className="text-sm text-gray-500">
                        Quality Masala Products
                      </p>
                    </div>

                  </div>

                  <div className="text-center sm:text-right">

                    <h2 className="text-2xl font-bold text-gray-800">
                      INVOICE
                    </h2>

                    <p className="text-sm text-gray-500">
                      Order #{order.order_number}
                    </p>

                    <p className="text-sm text-gray-500">
                      {getOrderDate()}
                    </p>

                  </div>

                </div>

                {/* CUSTOMER */}
                <div className="grid md:grid-cols-2 gap-6 py-6 border-b">

                  <div>

                    <p className="text-xs uppercase font-bold text-gray-500 mb-2">
                      Bill To
                    </p>

                    <p className="font-bold text-gray-800">
                      {order.customer_name}
                    </p>

                    <p className="text-gray-600 mt-1">
                      {order.address}
                    </p>

                    <p className="text-gray-600">
                      {order.city} - {order.pincode}
                    </p>

                  </div>

                  <div>

                    <p className="text-xs uppercase font-bold text-gray-500 mb-2">
                      Contact
                    </p>

                    <p className="text-gray-700">
                      {order.phone}
                    </p>

                    {order.phone2 && (
                      <p className="text-gray-700">
                        {order.phone2}
                      </p>
                    )}

                    <p className="text-gray-700 mt-2">
                      Payment: {order.payment_method}
                    </p>

                    <p className="text-gray-700">
                      Status: {order.payment_status}
                    </p>

                  </div>

                </div>

                {/* ITEMS TABLE */}
                <div className="py-6">

                  <table className="w-full text-sm">

                    <thead>
                      <tr className="border-b-2 border-gray-800">

                        <th className="text-left py-3">
                          Product
                        </th>

                        <th className="text-center py-3">
                          Qty
                        </th>

                        <th className="text-right py-3">
                          Price
                        </th>

                        <th className="text-right py-3">
                          Total
                        </th>

                      </tr>
                    </thead>

                    <tbody>

                      {items.map((item, index) => (
                        <tr
                          key={item.id ?? index}
                          className="border-b"
                        >

                          <td className="py-3 font-medium">
                            {item.product_name}
                          </td>

                          <td className="py-3 text-center">
                            {item.quantity}
                          </td>

                          <td className="py-3 text-right">
                            {formatINR(item.price)}
                          </td>

                          <td className="py-3 text-right font-semibold">
                            {formatINR(item.line_total)}
                          </td>

                        </tr>
                      ))}

                    </tbody>

                  </table>

                </div>

                {/* TOTALS */}
                <div className="flex justify-end">

                  <div className="w-full sm:w-80">

                    <div className="flex justify-between py-2">
                      <span>Subtotal</span>

                      <span>
                        {formatINR(order.items_total)}
                      </span>
                    </div>

                    <div className="flex justify-between py-2">
                      <span>Delivery</span>

                      <span>
                        {order.shipping === 0
                          ? 'FREE'
                          : formatINR(order.shipping)}
                      </span>
                    </div>

                    <div className="border-t-2 border-gray-800 mt-2 pt-3 flex justify-between">

                      <span className="font-bold text-lg">
                        Grand Total
                      </span>

                      <span className="font-bold text-lg text-maroon-800">
                        {formatINR(order.grand_total)}
                      </span>

                    </div>

                  </div>

                </div>

                {/* FOOTER */}
                <div className="border-t mt-8 pt-5 text-center text-sm text-gray-500">

                  <p className="font-semibold text-gray-700">
                    Thank you for shopping with Kavis Masala!
                  </p>

                  <p className="mt-1">
                    Payment Status: {order.payment_status}
                  </p>

                  <p className="mt-1">
                    Order Status: {order.status}
                  </p>

                  <p className="mt-3">
                    Contact: {BRAND.phone}
                    {BRAND.phone2
                      ? ` | ${BRAND.phone2}`
                      : ''}
                  </p>

                </div>

              </div>

            </div>

            {/* MODAL BUTTONS */}
            <div className="border-t p-4 flex flex-col sm:flex-row gap-3 justify-end bg-gray-50">

              <button
                onClick={() => setShowBill(false)}
                className="px-5 py-3 rounded-xl border border-gray-300 font-semibold text-gray-700 hover:bg-white transition"
              >
                Close
              </button>

              <button
                onClick={handlePrint}
                className="flex items-center justify-center gap-2 px-5 py-3 rounded-xl bg-maroon-800 text-white font-semibold hover:bg-maroon-900 transition"
              >
                <Printer className="w-5 h-5" />
                Print / Save PDF
              </button>

            </div>

          </div>

        </div>
      )}

      {/* =========================================================
          HIDDEN PRINT INVOICE
      ========================================================= */}
      <div className="print-invoice">

        {/* INVOICE HEADER */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderBottom: '2px solid #333',
            paddingBottom: '20px',
            marginBottom: '20px',
          }}
        >

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '15px',
            }}
          >

            <img
              src="/kavis-logo.png"
              alt="Kavis Masala"
              style={{
                width: '85px',
                height: '85px',
                objectFit: 'contain',
              }}
            />

            <div>

              <h1
                style={{
                  margin: 0,
                  fontSize: '26px',
                  fontWeight: 700,
                }}
              >
                Kavis Masala
              </h1>

              <p
                style={{
                  margin: '5px 0 0',
                  fontSize: '13px',
                }}
              >
                Quality Masala Products
              </p>

            </div>

          </div>

          <div style={{ textAlign: 'right' }}>

            <h2
              style={{
                margin: 0,
                fontSize: '25px',
              }}
            >
              INVOICE
            </h2>

            <p style={{ margin: '5px 0' }}>
              Order No: {order.order_number}
            </p>

            <p style={{ margin: 0 }}>
              Date: {getOrderDate()}
            </p>

          </div>

        </div>

        {/* CUSTOMER DETAILS */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            gap: '30px',
            marginBottom: '25px',
          }}
        >

          <div style={{ width: '50%' }}>

            <h3
              style={{
                marginBottom: '8px',
                fontSize: '14px',
              }}
            >
              BILL TO
            </h3>

            <p style={{ margin: '3px 0', fontWeight: 700 }}>
              {order.customer_name}
            </p>

            <p style={{ margin: '3px 0' }}>
              {order.address}
            </p>

            <p style={{ margin: '3px 0' }}>
              {order.city} - {order.pincode}
            </p>

          </div>

          <div style={{ width: '50%' }}>

            <h3
              style={{
                marginBottom: '8px',
                fontSize: '14px',
              }}
            >
              CONTACT
            </h3>

            <p style={{ margin: '3px 0' }}>
              Phone: {order.phone}
            </p>

            {order.phone2 && (
              <p style={{ margin: '3px 0' }}>
                Alternate: {order.phone2}
              </p>
            )}

            <p style={{ margin: '3px 0' }}>
              Payment: {order.payment_method}
            </p>

            <p style={{ margin: '3px 0' }}>
              Payment Status: {order.payment_status}
            </p>

          </div>

        </div>

        {/* ITEMS */}
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '25px',
            fontSize: '13px',
          }}
        >

          <thead>

            <tr>

              <th
                style={{
                  textAlign: 'left',
                  borderBottom: '2px solid #333',
                  padding: '10px 5px',
                }}
              >
                Product
              </th>

              <th
                style={{
                  textAlign: 'center',
                  borderBottom: '2px solid #333',
                  padding: '10px 5px',
                }}
              >
                Qty
              </th>

              <th
                style={{
                  textAlign: 'right',
                  borderBottom: '2px solid #333',
                  padding: '10px 5px',
                }}
              >
                Price
              </th>

              <th
                style={{
                  textAlign: 'right',
                  borderBottom: '2px solid #333',
                  padding: '10px 5px',
                }}
              >
                Total
              </th>

            </tr>

          </thead>

          <tbody>

            {items.map((item, index) => (
              <tr key={item.id ?? index}>

                <td
                  style={{
                    borderBottom: '1px solid #ddd',
                    padding: '10px 5px',
                  }}
                >
                  {item.product_name}
                </td>

                <td
                  style={{
                    textAlign: 'center',
                    borderBottom: '1px solid #ddd',
                    padding: '10px 5px',
                  }}
                >
                  {item.quantity}
                </td>

                <td
                  style={{
                    textAlign: 'right',
                    borderBottom: '1px solid #ddd',
                    padding: '10px 5px',
                  }}
                >
                  {formatINR(item.price)}
                </td>

                <td
                  style={{
                    textAlign: 'right',
                    borderBottom: '1px solid #ddd',
                    padding: '10px 5px',
                    fontWeight: 600,
                  }}
                >
                  {formatINR(item.line_total)}
                </td>

              </tr>
            ))}

          </tbody>

        </table>

        {/* TOTALS */}
        <div
          style={{
            marginLeft: 'auto',
            width: '300px',
            fontSize: '14px',
          }}
        >

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 0',
            }}
          >
            <span>Subtotal</span>

            <span>
              {formatINR(order.items_total)}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              padding: '6px 0',
            }}
          >
            <span>Delivery</span>

            <span>
              {order.shipping === 0
                ? 'FREE'
                : formatINR(order.shipping)}
            </span>
          </div>

          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              borderTop: '2px solid #333',
              marginTop: '8px',
              paddingTop: '10px',
              fontSize: '17px',
              fontWeight: 700,
            }}
          >
            <span>Grand Total</span>

            <span>
              {formatINR(order.grand_total)}
            </span>
          </div>

        </div>

        {/* FOOTER */}
        <div
          style={{
            borderTop: '1px solid #ccc',
            marginTop: '40px',
            paddingTop: '15px',
            textAlign: 'center',
            fontSize: '12px',
          }}
        >

          <p style={{ fontWeight: 700 }}>
            Thank you for shopping with Kavis Masala!
          </p>

          <p>
            Payment Status: {order.payment_status}
          </p>

          <p>
            Order Status: {order.status}
          </p>

          <p>
            Contact: {BRAND.phone}
            {BRAND.phone2
              ? ` | ${BRAND.phone2}`
              : ''}
          </p>

        </div>

      </div>
    </>
  );
}