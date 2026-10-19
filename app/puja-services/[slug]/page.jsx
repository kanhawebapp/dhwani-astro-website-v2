"use client";

import { gql } from "@apollo/client";
import { useMutation, useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { useParams } from "next/navigation";
import { useState } from "react";
import UpcomingPujas from "../UpcomingPujas";
import CreatePujaReview from "./CreatePujaReview";
const CREATE_PUJA_BOOKING = gql`
  mutation CreatePujaBooking($input: CreatePujaBookingInput!) {
    createPujaBooking(input: $input) {
      id
      pujaId
      mantraOptionId
      mantraOptionName
      quantity
      unitPrice
      totalAmount
      paymentStatus
      bookingStatus
    }
  }
`;
const GET_PUJA_DETAILS = gql`
  query GetPujaDetails($slug: String!) {
    pujaService(slug: $slug) {
      id
      title
      slug
      image
      category
      shortDescription
      description
      benefits
      howToPerform
      packaging
      price
      mrp
      discount
      customersCount
      rating
      mantraOptions {
        id
        name
      }
      faqs {
        id
        question
        answer
      }
      reviews {
        id
        userName
        rating
        comment
        createdAt
      }
    }
  }
`;
const backendUrl = new URL(process.env.NEXT_PUBLIC_BASE_URL).origin;

function Accordion({ title, children, defaultOpen = false }) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-gray-200">
      <button
        type="button"
        onClick={() => setOpen((previous) => !previous)}
        aria-expanded={open}
        className="flex w-full items-center justify-between py-3 text-left text-base font-medium text-gray-900 md:text-sm"
      >
        {title}
        <span className="ml-4 text-lg">{open ? "−" : "+"}</span>
      </button>

      {open && (
        <div className="whitespace-pre-line pb-4 text-sm leading-7 text-gray-600">
          {children || "Information will be updated soon."}
        </div>
      )}
    </div>
  );
}

function PujaDetailsImage({ src, title }) {
  const [failed, setFailed] = useState(false);

  const imageUrl = src
    ? src.startsWith("http")
      ? src
      : `${backendUrl}${src}`
    : null;

  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-xl bg-gray-100 md:aspect-[4/5]">
      {imageUrl && !failed ? (
        <Image
          src={imageUrl}
          alt={title}
          fill
          unoptimized
          priority
          sizes="(max-width: 768px) 100vw, 50vw"
          className="object-cover"
          onError={() => setFailed(true)}
        />
      ) : (
        <div className="flex h-full items-center justify-center text-gray-400">
          Puja image unavailable
        </div>
      )}
    </div>
  );
}

export default function PujaDetailsPage() {
  const params = useParams();
  const slug = params.slug;
  const [quantity, setQuantity] = useState(1);
  const [selectedMantra, setSelectedMantra] = useState("");
  const [message, setMessage] = useState("");
  const [showReviewModal, setShowReviewModal] = useState(false);
  const { data, loading, error, refetch } = useQuery(GET_PUJA_DETAILS, {
    variables: { slug },
    skip: !slug,
    fetchPolicy: "cache-and-network",
  });
  const router = useRouter();
  const puja = data?.pujaService;

  const [createPujaBooking, { loading: bookingLoading }] =
    useMutation(CREATE_PUJA_BOOKING);

const mantraOptionId =
  selectedMantra || puja?.mantraOptions?.[0]?.id || null;

  async function handleBuyNow() {
    setMessage("");

    try {
      const { data } = await createPujaBooking({
        variables: {
          input: {
            pujaId: puja.id,
            quantity,
            mantraOptionId,
          },
        },
      });

      const booking = data?.createPujaBooking;

      if (!booking?.id) {
        throw new Error("Booking could not be created.");
      }

      router.push(`/buy-puja/payment-options/${booking.id}`);
    } catch (error) {
      setMessage(error.message || "Unable to create booking.");
    }
  }

  //   const imageUrl = puja?.image
  //     ? puja.image.startsWith("http")
  //       ? puja.image
  //       : `${API_BASE}${puja.image.startsWith("/") ? "" : "/"}${puja.image}`
  //     : null;

  const price = Number(puja?.price ?? 0);
  const mrp = Number(puja?.mrp ?? 0);

  const discount =
    puja?.discount != null
      ? Number(puja.discount)
      : mrp > price && mrp > 0
        ? Math.round(((mrp - price) / mrp) * 100)
        : 0;

  // function handleAddToCart() {
  //   // Connect your existing cart API/context here.
  //   setMessage(
  //     `${quantity} × ${puja.title} selected. Connect your cart API to save this item.`,
  //   );
  // }

  if (loading && !data) {
    return (
      <main className="mx-auto max-w-7xl animate-pulse px-4 py-10 md:px-8">
        <div className="grid gap-8 md:grid-cols-2">
          <div className="aspect-square rounded-xl bg-gray-200" />
          <div className="space-y-5">
            <div className="h-8 w-3/4 rounded bg-gray-200" />
            <div className="h-5 w-1/2 rounded bg-gray-200" />
            <div className="h-12 rounded bg-gray-200" />
            <div className="h-40 rounded bg-gray-200" />
          </div>
        </div>
      </main>
    );
  }

  if (error) {
    return (
      <main className="px-4 py-20 text-center">
        <p className="font-semibold text-red-600">
          Unable to load puja details.
        </p>
        <p className="mt-2 text-sm text-gray-500">{error.message}</p>
        <Link href="/" className="mt-5 inline-block text-pink-600 underline">
          Go back
        </Link>
      </main>
    );
  }

  if (!puja) {
    return (
      <main className="px-4 py-20 text-center">
        <h1 className="text-xl font-semibold">Puja not found</h1>
        <Link href="/" className="mt-4 inline-block text-pink-600 underline">
          Explore other pujas
        </Link>
      </main>
    );
  }

  return (
    <main className=" w-[80%] bg-white px-4 py-6 md:px-6 md:py-6">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/"
          className="mb-4 inline-block text-xs text-gray-500 hover:text-pink-600"
        >
          ← Back to pujas
        </Link>

        <div className="grid items-start gap-8 md:grid-cols-2 md:gap-12">
          <div>
            <PujaDetailsImage src={puja.image} title={puja.title} />
          </div>

          <div className="min-w-0">
            <h1 className=" text-2xl font-bold leading-tight text-gray-950 md:text-3xl">
              {puja.title}
            </h1>

            {puja.shortDescription && (
              <p className="mt-3 text-sm leading-6 text-gray-600 md:text-base">
                {puja.shortDescription}
              </p>
            )}

            <div className="mt-4 flex flex-wrap items-center gap-2">
              <span className="text-xl tracking-wide text-amber-400">
                {"★".repeat(
                  Math.max(
                    0,
                    Math.min(5, Math.round(Number(puja.rating) || 0)),
                  ),
                )}
                {"☆".repeat(
                  5 -
                    Math.max(
                      0,
                      Math.min(5, Math.round(Number(puja.rating) || 0)),
                    ),
                )}
              </span>

              <span className="font-semibold text-gray-900">
                {Number(puja.rating || 0).toFixed(1)}
              </span>

              <span className="text-sm text-gray-500">
                | {puja.reviews?.length || 0} reviews
              </span>
            </div>

            <div className="mt-3 flex flex-wrap items-center gap-3">
              <span className="text-3xl font-bold text-gray-950">
                ₹{price.toLocaleString("en-IN")}
              </span>

              {mrp > price && (
                <>
                  <span className="text-sm text-gray-400 line-through">
                    ₹{mrp.toLocaleString("en-IN")}
                  </span>

                  {discount > 0 && (
                    <span className="font-semibold text-green-700">
                      {discount}% off
                    </span>
                  )}
                </>
              )}
            </div>

            <p className="mt-1 text-xs text-gray-500">(Incl. of all taxes)</p>

            {/* Reviews */}
            {puja.reviews?.length > 0 && (
              <div className="review-slider mt-6 overflow-hidden">
                <div className="review-track flex gap-4">
                  {[...puja.reviews, ...puja.reviews].map((review, index) => (
                    <div
                      key={`${review.id}-${index}`}
                      className="w-[280px] shrink-0 rounded-xl border border-gray-100 bg-white p-4 shadow-sm md:w-[320px]"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-amber-400">
                          {"★".repeat(
                            Math.max(
                              0,
                              Math.min(5, Number(review.rating) || 0),
                            ),
                          )}
                        </span>

                        <span className="font-semibold text-gray-900">
                          {review.userName}
                        </span>
                      </div>

                      <p className="mt-2 line-clamp-3 text-sm leading-6 text-gray-700">
                        {review.comment}
                      </p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-6 rounded-lg bg-[#f8eaea] px-4 py-3 text-center font-medium text-[#704c32]">
              {puja.customersCount > 0
                ? `Loved by ${Number(puja.customersCount).toLocaleString("en-IN")}+ devotees`
                : "A meaningful ritual for your spiritual journey"}
            </div>

            {/* Mantra options */}
            {puja.mantraOptions?.length > 0 && (
              <div className="mt-6">
                <h2 className="font-bold text-gray-950">Mantra Jaap</h2>

                <div className="mt-3 flex flex-wrap gap-2">
                  {puja.mantraOptions.map((option) => (
                    <button
                      key={option.id}
                      type="button"
                      onClick={() => setSelectedMantra(option.id)}
                      className={`rounded-lg border px-3 py-2 text-sm transition ${
                        selectedMantra === option.id
                          ? "border-[#b99b98] bg-[#b99b98] text-white"
                          : "border-gray-200 text-gray-800 hover:border-[#b99b98]"
                      }`}
                    >
                      {option.name}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Quantity and actions */}
            <div className="mt-7">
              <label className="text-sm font-semibold text-gray-900">
                Quantity
              </label>

              <div className="mt-2 flex text-black flex-wrap items-center gap-3">
                <div className="flex h-12 items-center rounded-full border border-gray-300">
                  <button
                    type="button"
                    aria-label="Decrease quantity"
                    disabled={quantity <= 1}
                    onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                    className="h-full px-4 text-xl disabled:opacity-30"
                  >
                    −
                  </button>

                  <span className="min-w-8 text-center">{quantity}</span>

                  <button
                    type="button"
                    aria-label="Increase quantity"
                    onClick={() => setQuantity((q) => q + 1)}
                    className="h-full px-4 text-xl"
                  >
                    +
                  </button>
                </div>

                {/* <button
                  type="button"
                  onClick={handleAddToCart}
                  className="h-12 flex-1 rounded-full border border-gray-400 px-4 font-medium transition hover:bg-gray-50"
                >
                  Add to cart
                </button> */}

                <button
                  type="button"
                  onClick={handleBuyNow}
                  disabled={bookingLoading}
                  className="h-12 flex-1 rounded-full bg-purple-400 px-4 font-medium text-white transition hover:bg-[#a88986] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {bookingLoading ? "Creating booking..." : "Buy it now"}
                </button>
              </div>

              {message && (
                <p
                  role="status"
                  className="mt-3 rounded-lg bg-amber-50 p-3 text-sm text-amber-900"
                >
                  {message}
                </p>
              )}
            </div>

            {/* Expandable sections */}
            <div className="mt-8">
              <Accordion title="Benefits">{puja.benefits}</Accordion>

              <Accordion title="Description">
                {puja.description || puja.shortDescription}
              </Accordion>

              <Accordion title="How to perform?">{puja.howToPerform}</Accordion>

              <Accordion title="FAQ's">
                {puja.faqs?.length > 0 ? (
                  <div className="space-y-5">
                    {puja.faqs.map((faq) => (
                      <div key={faq.id}>
                        <h3 className="font-semibold text-gray-900">
                          {faq.question}
                        </h3>
                        <p className="mt-1">{faq.answer}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  "No FAQs have been added yet."
                )}
              </Accordion>

              <Accordion title="Packaging">{puja.packaging}</Accordion>
            </div>
          </div>
        </div>

        <div className="relative mt-10 h-90 w-full overflow-hidden rounded-xl md:h-190">
          <Image
            src="/smart-choice-section.jpg"
            alt="Smart choice"
            fill
            unoptimized
            sizes="100vw"
            className="object-cover"
          />
        </div>

        <div className="flex flex-col gap-1 items-center justify-center">
          <h2 className="text-[#2f1254] text-md md:text-2xl py-1 md:pt-8 text-center font-semibold">
            You may also like{" "}
          </h2>
          <UpcomingPujas />
        </div>

        <section className="mt-12 border-t border-gray-200 pt-8">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-2xl font-semibold text-gray-900">
                Customer Reviews
              </h2>

              <p className="mt-2 text-sm text-gray-500">
                {puja.reviews?.length || 0} reviews
              </p>
            </div>

            <button
              type="button"
              onClick={() => setShowReviewModal(true)}
              className="rounded-md bg-amber-400 px-6 py-3 font-medium text-white hover:bg-amber-500"
            >
              Write a review
            </button>
          </div>

          <div className="mt-6 space-y-5">
            {puja.reviews?.length ? (
              puja.reviews.map((review) => (
                <article
                  key={review.id}
                  className="border-b border-gray-100 pb-5"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div>
                      <div className="text-lg tracking-wide text-amber-400">
                        {"★".repeat(Math.max(0, Math.min(5, review.rating)))}
                        {"☆".repeat(
                          5 - Math.max(0, Math.min(5, review.rating)),
                        )}
                      </div>

                      <h3 className="mt-1 font-semibold text-gray-900">
                        {review.title || "Customer review"}
                      </h3>

                      <p className="text-sm text-gray-600">{review.userName}</p>
                    </div>

                    <time className="text-sm text-gray-400">
                      {new Date(Number(review.createdAt)).toLocaleDateString(
                        "en-IN",
                      )}
                    </time>
                  </div>

                  <p className="mt-3 whitespace-pre-line text-gray-700">
                    {review.comment}
                  </p>
                </article>
              ))
            ) : (
              <p className="py-6 text-gray-500">
                No approved reviews yet. Be the first to share your experience.
              </p>
            )}
          </div>
        </section>

        {showReviewModal && (
          <CreatePujaReview
            pujaId={puja.id}
            onClose={() => setShowReviewModal(false)}
            onSubmitted={() => refetch()}
          />
        )}
      </div>
    </main>
  );
}
