"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { useMutation, useQuery } from "@apollo/client/react";

import Healdetail from "./Healdetail";
import CustomButton from "@/components/Custom/CustomButton";
import { GET_SERVICE } from "@/app/graphql/gqlQuery";
import {
  CREATE_SERVICE_BOOKING,
  UPDATE_BOOKING_ASTROLOGER,
} from "@/app/graphql/gqlQuery";

import Image from "next/image";
import Selectastro from "../Selectastro";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://dhwaniastro.com";

const Heal = ({ categorySlug, serviceSlug }) => {
  const router = useRouter();

  const [pkgId, setPkgId] = useState(null);
  const [showAstroModal, setShowAstroModal] = useState(false);
  const [bookingId, setBookingId] = useState(null);

  // =========================
  // GET SERVICE
  // =========================

  const { data, loading, error } = useQuery(GET_SERVICE, {
    variables: {
      slug: serviceSlug,
    },
  });

  const service = data?.getService;

  // =========================
  // CREATE BOOKING
  // =========================

  const [createBooking, { loading: bookingLoading }] = useMutation(
    CREATE_SERVICE_BOOKING
  );

  // =========================
  // UPDATE BOOKING ASTROLOGER
  // =========================

  const [updateBookingAstrologer, { loading: updatingAstrologer }] =
    useMutation(UPDATE_BOOKING_ASTROLOGER);

  // =========================
  // STARTING PRICE
  // =========================

  const startingPrice = useMemo(() => {
    if (!service) return 0;

    if (service.astrologerMappings?.length) {
      const prices = service.astrologerMappings
        .map((astrologer) => Number(astrologer.price))
        .filter((price) => Number.isFinite(price));

      if (prices.length > 0) {
        return Math.min(...prices);
      }
    }

    return Number(service.price) || 0;
  }, [service]);

  // =========================
  // LOADING
  // =========================

  if (loading) {
    return (
      <div
        className="flex min-h-[300px] items-center justify-center"
        aria-busy="true"
        aria-live="polite"
      >
        Loading...
      </div>
    );
  }

  // =========================
  // ERROR
  // =========================

  if (error) {
    return (
      <div
        className="flex min-h-[300px] items-center justify-center px-4 text-center text-red-600"
        role="alert"
      >
        Unable to load this astrology service. Please try again later.
      </div>
    );
  }

  // =========================
  // SERVICE NOT FOUND
  // =========================

  if (!service) {
    return (
      <div
        className="flex min-h-[300px] items-center justify-center px-4 text-center"
        role="status"
      >
        Astrology service not found.
      </div>
    );
  }

  const serviceName = service?.name || "Astrology Service";

  const serviceImage = service?.image
    ? `${BASE_URL}${service.image}`
    : "/placeholder.webp";

  // =====================================================
  // BOOK NOW
  // CREATE BOOKING FIRST
  // THEN OPEN ASTROLOGER SELECTION
  // =====================================================

  const handleBooking = async () => {
    if (!service?.id) {
      toast.error("Service information is missing.");
      return;
    }

    try {
      const { data } = await createBooking({
        variables: {
          input: {
            serviceId: service.id,

            // Form removed.
            // Send defaults only if these fields are optional
            // in your backend schema.
            name: "xxxx",
            email: "xxxx",
            phone: "9999999999",
            dob: "999",
            tob: "9999",
            pob: "9999",
            gender: "male",
            concern: "male",
          },
        },
      });

      const booking = data?.createServiceBooking;

      if (!booking?.id) {
        toast.error("Unable to create booking.");
        return;
      }

      // Save booking ID because update API needs it
      setBookingId(booking.id);

      // Now show astrologer selection
      setShowAstroModal(true);
    } catch (err) {
      console.error("Create booking error:", err);

      toast.error(
        err?.message || "Unable to create booking. Please try again."
      );
    }
  };

  // =====================================================
  // ASTROLOGER SELECT
  // UPDATE BOOKING
  // THEN REDIRECT TO PAYMENT
  // =====================================================

  const handleAstrologerSelect = async (mapping) => {
    const astrologerId = mapping?.astrologer?.id;

    if (!bookingId) {
      toast.error("Booking ID is missing.");
      return;
    }

    if (!astrologerId) {
      toast.error("Astrologer information is missing.");
      return;
    }

    try {
      const { data } = await updateBookingAstrologer({
        variables: {
          bookingId: bookingId,
          astrologerId: astrologerId,
        },
      });

      const booking = data?.updateBookingAstrologer;

      if (!booking?.id) {
        toast.error("Unable to assign astrologer.");
        return;
      }

      setShowAstroModal(false);

      // Go to payment
      router.push(`/buy-services/payment-options/${booking.id}`);
    } catch (err) {
      console.error("Update astrologer error:", err);

      toast.error(
        err?.message || "Unable to select astrologer. Please try again."
      );
    }
  };

  return (
    <main
      className="flex w-full flex-col items-center justify-center gap-10 px-2 py-5 sm:px-4 md:py-5"
      aria-label={`${serviceName} astrology service`}
    >
      <article
        className="flex w-[93%] max-w-7xl flex-col items-start overflow-hidden rounded-3xl bg-white shadow-2xl sm:w-[85%] sm:flex-row"
        itemScope
        itemType="https://schema.org/Service"
      >
        {/* IMAGE */}
        <div className="flex flex-col items-center justify-center p-4 md:w-1/2">
          <Image
            className="h-73 w-full bg-center object-cover"
            src={serviceImage}
            alt={`${serviceName} - Dhwani Astro`}
            width={800}
            height={500}
            priority
            itemProp="image"
          />
        </div>

        {/* DETAILS */}
        <div className="flex w-full flex-col justify-between px-3 py-4 sm:pr-8 md:w-1/2">
          <Healdetail
            sp={startingPrice}
            data={service}
            pkgId={pkgId}
            setPkgId={setPkgId}
          />

          <CustomButton
            aria-label={`Book ${serviceName} session`}
            variant="gcircle"
            className="mt-5 w-[40%] place-self-center rounded-full bg-green-500 px-2 py-1 text-xs shadow-xl duration-300 hover:scale-105 hover:bg-green-600 sm:w-[50%] sm:py-2 sm:text-md"
            onClick={handleBooking}
            disabled={bookingLoading}
          >
            {bookingLoading ? "Creating..." : "Book Now"}
          </CustomButton>
        </div>
      </article>

      {/* ASTROLOGER SELECTION */}
      <Selectastro
        open={showAstroModal}
        astrologers={service?.astrologerMappings || []}
        loading={updatingAstrologer}
        onSelect={handleAstrologerSelect}
        onClose={() => setShowAstroModal(false)}
      />
    </main>
  );
};

export default Heal;