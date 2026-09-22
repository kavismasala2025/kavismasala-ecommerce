import { useEffect, useState } from 'react';
import {
  Minus,
  Plus,
  ShoppingCart,
  Check,
  ChevronRight,
  Leaf,
  ShieldCheck,
  Truck,
} from 'lucide-react';

import {
  subscribeToProducts,
  loadProductsCatalog,
  supabase,
} from '../lib/supabase';

import type { Product } from '../lib/types';
import { formatINR } from '../lib/format';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { Link, useRouter } from '../lib/router';
import ProductCard from '../components/ProductCard';

declare global {
  interface Window {
    instgrm?: {
      Embeds: {
        process: () => void;
      };
    };
  }
}
type Review = {
  id: string;
  product_id: string;
  user_id: string;
  rating: number;
  title: string | null;
  body: string;
  is_verified: boolean;
  created_at?: string;
};

export default function ProductDetail({ slug }: { slug: string }) {
  const { add } = useCart();
  const { navigate } = useRouter();
  const { user } = useAuth();

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [qty, setQty] = useState(1);
  const [loading, setLoading] = useState(true);
  const [added, setAdded] = useState(false);

  // Reviews
  const [reviews, setReviews] = useState<Review[]>([]);
  const [rating, setRating] = useState(5);
  const [reviewTitle, setReviewTitle] = useState('');
  const [reviewBody, setReviewBody] = useState('');
  const [reviewLoading, setReviewLoading] = useState(false);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  /*
   * LOAD PRODUCT
   */
  useEffect(() => {
    let active = true;

    const loadProduct = async () => {
      setLoading(true);

      const mapped = await loadProductsCatalog();

      const currentProduct =
        mapped.find(
          (product) =>
            product.slug === slug && product.is_active
        ) ?? null;

      if (!active) return;

      setProduct(currentProduct);

      if (currentProduct) {
        const relatedProducts = mapped
          .filter((product) => {
            if (
              !product.is_active ||
              product.id === currentProduct.id
            ) {
              return false;
            }

            if (
              product.category_id &&
              currentProduct.category_id
            ) {
              return (
                product.category_id ===
                currentProduct.category_id
              );
            }

            return (
              product.category === currentProduct.category
            );
          })
          .slice(0, 4);

        setRelated(relatedProducts);
      } else {
        setRelated([]);
      }

      setLoading(false);
    };

    loadProduct();

    const unsubscribe = subscribeToProducts(() => {
      loadProduct();
    });

    return () => {
      active = false;
      unsubscribe();
    };
  }, [slug]);
    /*
   * PROCESS INSTAGRAM REEL
   */
  useEffect(() => {
    const timer = setTimeout(() => {
      if (window.instgrm) {
        window.instgrm.Embeds.process();
      }
    }, 500);

    return () => clearTimeout(timer);
  }, [product]);

  /*
   * LOAD REVIEWS
   */
  useEffect(() => {
    const loadReviews = async () => {
      if (!product) return;

      setReviewsLoading(true);

      const { data, error } = await supabase
        .from('reviews')
        .select(
          'id, product_id, user_id, rating, title, body, is_verified, created_at'
        )
        .eq('product_id', product.id)
        .order('created_at', {
          ascending: false,
        });

      if (error) {
        console.error(
          '[REVIEWS] LOAD ERROR:',
          error
        );
        setReviews([]);
      } else {
        setReviews(
          (data as Review[] | null) ?? []
        );
      }

      setReviewsLoading(false);
    };

    loadReviews();
  }, [product]);

  /*
   * SUBMIT REVIEW
   */
  const submitReview = async (
    e: React.FormEvent
  ) => {
    e.preventDefault();

    if (!user) {
      alert('Please login to write a review.');
      navigate('/account');
      return;
    }

    if (!product) {
      return;
    }

    if (!reviewBody.trim()) {
      alert('Please enter your review.');
      return;
    }

    if (rating < 1 || rating > 5) {
      alert('Please select a rating.');
      return;
    }

    setReviewLoading(true);

    try {
      const { error } = await supabase
        .from('reviews')
        .insert({
          product_id: product.id,
          user_id: user.id,
          rating,
          title:
            reviewTitle.trim() || null,
          body: reviewBody.trim(),
          is_verified: false,
        });

      if (error) {
        console.error(
          '[REVIEWS] INSERT ERROR:',
          error
        );

        alert(
          `Failed to submit review: ${error.message}`
        );

        return;
      }

      // Clear form
      setRating(5);
      setReviewTitle('');
      setReviewBody('');

      // Reload reviews
      const { data, error: reloadError } =
        await supabase
          .from('reviews')
          .select(
            'id, product_id, user_id, rating, title, body, is_verified, created_at'
          )
          .eq('product_id', product.id)
          .order('created_at', {
            ascending: false,
          });

      if (reloadError) {
        console.error(
          '[REVIEWS] RELOAD ERROR:',
          reloadError
        );
      } else {
        setReviews(
          (data as Review[] | null) ?? []
        );
      }

      alert('Review submitted successfully!');
    } catch (error) {
      console.error(
        '[REVIEWS] SUBMIT ERROR:',
        error
      );

      alert(
        'Something went wrong while submitting the review.'
      );
    } finally {
      setReviewLoading(false);
    }
  };

  /*
   * LOADING
   */
  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="h-96 bg-stone-100 rounded-2xl animate-pulse" />
      </div>
    );
  }

  /*
   * PRODUCT NOT FOUND
   */
  if (!product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-16 text-center">
        <h1 className="text-2xl font-bold text-stone-900">
          Product not found
        </h1>

        <Link
          to="/shop"
          className="text-maroon-700 font-semibold mt-3 inline-block hover:underline"
        >
          Back to shop
        </Link>
      </div>
    );
  }

  const out = product.stock <= 0;

  /*
   * ADD TO CART
   */
  const handleAdd = () => {
    if (out) return;

    add(product, qty);
    setAdded(true);

    setTimeout(() => {
      setAdded(false);
    }, 1500);
  };

  /*
   * BUY NOW
   */
  const buyNow = () => {
    if (out) return;

    add(product, qty);
    navigate('/cart');
  };

  /*
   * REVIEW AVERAGE
   */
  const averageRating =
    reviews.length > 0
      ? reviews.reduce(
          (sum, review) =>
            sum + review.rating,
          0
        ) / reviews.length
      : 0;

  return (
    <div className="bg-cream-50 min-h-screen">

      {/* Breadcrumb */}
      <div className="bg-maroon-800 text-white py-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <nav className="flex items-center gap-1.5 text-sm text-white/70">

            <Link
              to="/"
              className="hover:text-cream-300"
            >
              Home
            </Link>

            <ChevronRight className="w-3.5 h-3.5" />

            <Link
              to="/shop"
              className="hover:text-cream-300"
            >
              Shop
            </Link>

            <ChevronRight className="w-3.5 h-3.5" />

            <span className="text-white truncate">
              {product.name}
            </span>

          </nav>
        </div>
      </div>


      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">

        {/* PRODUCT SECTION */}
        <div className="grid md:grid-cols-2 gap-8 lg:gap-12">

          {/* IMAGE */}
          <div className="rounded-2xl overflow-hidden bg-cream-100 aspect-square shadow-md
  transition-all duration-300
  hover:shadow-xl
  active:scale-[0.99]">

            {product.image_url ? (
              <img
                src={product.image_url}
                alt={product.name}
                className="w-full h-full object-cover
  transition-transform duration-500
  hover:scale-105"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-maroon-300 text-7xl font-bold">
                {product.name.charAt(0)}
              </div>
            )}

          </div>


          {/* PRODUCT INFORMATION */}
          <div>

            <div className="text-maroon-700 font-semibold text-sm uppercase tracking-wider">
              Product
            </div>

            <h1 className="text-3xl md:text-4xl font-bold text-stone-900 mt-1">
              {product.name}
            </h1>

            {product.weight && (
              <div className="text-stone-500 mt-2">
                Pack size: {product.weight}
              </div>
            )}

            {/* Rating summary */}
            {reviews.length > 0 && (
              <div className="flex items-center gap-2 mt-3">

                <div className="text-yellow-500">
                  {'★'.repeat(
                    Math.round(averageRating)
                  )}
                  {'☆'.repeat(
                    5 - Math.round(averageRating)
                  )}
                </div>

                <span className="text-sm text-stone-500">
                  {averageRating.toFixed(1)} (
                  {reviews.length}{' '}
                  {reviews.length === 1
                    ? 'review'
                    : 'reviews'}
                  )
                </span>

              </div>
            )}

            <div className="mt-4 text-3xl font-bold text-maroon-900">
              {formatINR(product.price)}
            </div>

            <div className="text-sm text-stone-500 mt-1">
              Inclusive of all taxes
            </div>

            <p className="mt-5 text-stone-600 leading-relaxed">
              {product.description ??
                'No description available.'}
            </p>


            {/* QUANTITY */}
            <div className="mt-6 flex items-center gap-3">

              <div className="flex items-center border-2 border-maroon-200 rounded-full">

                <button
                  onClick={() =>
                    setQty((q) =>
                      Math.max(1, q - 1)
                    )
                  }
               className="p-3 text-stone-600 hover:text-maroon-700
  active:scale-90 active:bg-maroon-50
  transition-all duration-150
  disabled:opacity-40"
                  disabled={out}
                >
                  <Minus className="w-4 h-4" />
                </button>

                <span className="w-10 text-center font-bold">
                  {qty}
                </span>

                <button
                  onClick={() =>
                    setQty((q) => q + 1)
                  }
                  className="p-3 text-stone-600 hover:text-maroon-700
  active:scale-90 active:bg-maroon-50
  transition-all duration-150
  disabled:opacity-40"
                  disabled={
                    out ||
                    qty >= product.stock
                  }
                >
                  <Plus className="w-4 h-4" />
                </button>

              </div>


              <div className="text-sm">

                {out ? (
                  <span className="text-red-600 font-semibold">
                    Out of stock
                  </span>
                ) : (
                  <span className="text-green-600 font-medium">
                    {product.stock} in stock
                  </span>
                )}

              </div>

            </div>


            {/* CART BUTTONS */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3">

              <button
                onClick={handleAdd}
                disabled={out}
                
                  className={`flex-1 inline-flex items-center justify-center gap-2
font-semibold px-6 py-3.5 rounded-full
transition-all duration-150
active:scale-[0.97]
hover:shadow-lg ${
                    out ? 'bg-stone-100 text-stone-400 cursor-not-allowed'
                    : added
                      ? 'bg-green-600 text-white'
                      : 'bg-maroon-800 text-white hover:bg-maroon-900'
                }`}
              >

                {added ? (
                  <Check className="w-5 h-5" />
                ) : (
                  <ShoppingCart className="w-5 h-5" />
                )}

                {added
                  ? 'Added to cart'
                  : 'Add to cart'}

              </button>


              <button
                onClick={buyNow}
                disabled={out}
               className="flex-1 inline-flex items-center justify-center gap-2
font-semibold px-6 py-3.5 rounded-full
border-2 border-maroon-800 text-maroon-800
hover:bg-maroon-50
hover:shadow-md
active:scale-[0.97]
active:bg-maroon-100
transition-all duration-150
disabled:opacity-40"
              >
                Buy now
              </button>

            </div>


            {/* FEATURES */}
            <div className="mt-8 grid grid-cols-3 gap-3 text-center">

              <div className="p-3 rounded-xl bg-cream-100">
                <Leaf className="w-5 h-5 text-maroon-700 mx-auto mb-1" />
                <div className="text-xs text-stone-700 font-medium">
                  100% Natural
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cream-100">
                <ShieldCheck className="w-5 h-5 text-maroon-700 mx-auto mb-1" />
                <div className="text-xs text-stone-700 font-medium">
                  FSSAI Certified
                </div>
              </div>

              <div className="p-3 rounded-xl bg-cream-100">
                <Truck className="w-5 h-5 text-maroon-700 mx-auto mb-1" />
                <div className="text-xs text-stone-700 font-medium">
                  Fast Shipping
                </div>
              </div>

            </div>

          </div>

        </div>


        {/* ===================================================== */}
        {/* REVIEWS */}
        {/* ===================================================== */}

        <section className="mt-16">

          <div className="flex items-center justify-between flex-wrap gap-3 mb-6">

            <div>
              <h2 className="text-2xl font-bold text-stone-900">
                Customer Reviews
              </h2>

              {reviews.length > 0 && (
                <div className="flex items-center gap-2 mt-1">

                  <span className="text-yellow-500 font-semibold">
                    ★ {averageRating.toFixed(1)}
                  </span>

                  <span className="text-sm text-stone-500">
                    from {reviews.length}{' '}
                    {reviews.length === 1
                      ? 'review'
                      : 'reviews'}
                  </span>

                </div>
              )}

            </div>

          </div>


          {/* WRITE REVIEW */}
          {user ? (

            <form
              onSubmit={submitReview}
              className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6 mb-8"
            >

              <h3 className="font-bold text-lg text-stone-900 mb-4">
                Write a Review
              </h3>


              {/* STAR RATING */}
              <div className="mb-5">

                <label className="text-sm font-medium text-stone-700">
                  Your Rating
                </label>

                <div className="flex gap-1 mt-2">

                  {[1, 2, 3, 4, 5].map(

                    (star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() =>
                          setRating(star)
                        }
className={`text-3xl transition-all duration-150
active:scale-90 hover:scale-110 ${                          star <= rating
                            ? 'text-yellow-500'
                            : 'text-stone-300'
                        } hover:text-yellow-500`}
                        aria-label={`${star} star rating`}
                      >
                        ★
                      </button>
                    )
                  )}

                </div>

              </div>


              {/* TITLE */}
              <div className="mb-4">

                <label className="text-sm font-medium text-stone-700">
                  Review Title
                </label>

                <input
                  type="text"
                  value={reviewTitle}
                  onChange={(e) =>
                    setReviewTitle(
                      e.target.value
                    )
                  }
                  placeholder="Example: Very tasty"
                  maxLength={100}
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-stone-200 focus:border-maroon-500 focus:outline-none text-sm"
                />

              </div>


              {/* BODY */}
              <div className="mb-5">

                <label className="text-sm font-medium text-stone-700">
                  Your Review *
                </label>

                <textarea
                  value={reviewBody}
                  onChange={(e) =>
                    setReviewBody(
                      e.target.value
                    )
                  }
                  placeholder="Tell us about this product..."
                  rows={4}
                  maxLength={1000}
                  required
                  className="mt-1 w-full px-3 py-2.5 rounded-lg border border-stone-200 focus:border-maroon-500 focus:outline-none text-sm resize-none"
                />

              </div>


              <button
                type="submit"
                disabled={reviewLoading}
                className="inline-flex items-center justify-center bg-maroon-800 hover:bg-maroon-900 text-white font-semibold px-6 py-3 rounded-full disabled:opacity-50 transition"
              >

                {reviewLoading
                  ? 'Submitting...'
                  : 'Submit Review'}

              </button>

            </form>

          ) : (

            <div className="bg-white rounded-2xl border border-stone-100 p-5 sm:p-6 mb-8">

              <p className="text-stone-600">
                Please login to write a review.
              </p>

              <button
                onClick={() =>
                  navigate('/account')
                }
                className="mt-3 text-maroon-700 font-semibold hover:underline"
              >
                Login to Review
              </button>

            </div>

          )}


      {/* EXISTING REVIEWS */}

{reviewsLoading && (
  <div className="py-2 text-center text-stone-400 text-xs">
    Loading...
  </div>
)}
</section>
{/* ===================================================== */}
{/* INSTAGRAM CUSTOMER FEEDBACK */}
{/* ===================================================== */}

{product.name.toLowerCase().includes('mudakathan') && (
  <section className="mt-8">

    <h2 className="text-lg font-bold text-stone-900 mb-3 text-center">
      Customer Feedback
    </h2>

    <div className="flex justify-center">

     <div className="w-[300px] h-[320px] rounded-xl overflow-hidden shadow-md bg-white">

        <blockquote
          className="instagram-media"
          data-instgrm-permalink="https://www.instagram.com/reel/DFxWpqoy9rc/"
          data-instgrm-version="14"
          style={{
            background: '#fff',
            border: 0,
            borderRadius: '8px',
            margin: 0,
            padding: 0,
            width: '100%',
            minWidth: '0',
          }}
        />

      </div>

    </div>

    <p className="text-xs text-stone-500 mt-2 text-center">
      Tap to watch on Instagram
    </p>

  </section>
)}
        {/* ===================================================== */}
        {/* RELATED PRODUCTS */}
        {/* ===================================================== */}

        {related.length > 0 && (
          <section className="mt-16">

            <h2 className="text-2xl font-bold text-stone-900 mb-6">
              You may also like
            </h2>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              {related.map((p) => (
                <ProductCard
                  key={p.id}
                  product={p}
                />
              ))}
            </div>

          </section>
        )}

      </div>
    </div>
  );
}   