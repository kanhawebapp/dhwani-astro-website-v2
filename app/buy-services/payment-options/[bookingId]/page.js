"use client";

import { useParams, useSearchParams } from "next/navigation";
import { useQuery } from "@apollo/client/react";
import PayOPT from "@/components/Smcompo/Paycomp/PayOPT";
import {
  GET_COUPONS,
  GET_SERVICE_BOOKING,
} from "@/app/graphql/gqlQuery";
import { useState } from "react";
import Swal from "sweetalert2";

export default function CartPage() {
  const searchParams = useSearchParams();
  const params = useParams();

  const bookingId = params.bookingId;

  /*
   * =========================================================
   * GET SERVICE BOOKING
   * =========================================================
   */
  const {
    data: bookingData,
    loading,
    error,
  } = useQuery(GET_SERVICE_BOOKING, {
    variables: {
      bookingId,
    },
  });

  const booking = bookingData?.getServiceBooking;

  /*
   * =========================================================
   * COUPON STATE
   * =========================================================
   */
  const [couponCode, setCouponCode] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);

  /*
   * =========================================================
   * GET COUPONS
   * =========================================================
   */
  const {
    data: couponData,
    loading: couponLoading,
    error: couponError,
  } = useQuery(GET_COUPONS);

  /*
   * =========================================================
   * APPLY COUPON BY CODE
   * =========================================================
   */
  const applyCouponByCode = () => {
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      Swal.fire({
        icon: "warning",
        title: "Enter Coupon Code",
      });

      return;
    }

    const coupons = couponData?.getCoupons || [];

    const coupon = coupons.find(
      (item) =>
        item?.code?.trim()?.toUpperCase() === code
    );

    if (!coupon) {
      Swal.fire({
        icon: "error",
        title: "Invalid Coupon",
        text: "Coupon code not found.",
      });

      return;
    }

    applyCoupon(coupon);

    setCouponCode("");
  };

  /*
   * =========================================================
   * LOADING / ERROR
   * =========================================================
   */
  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !booking) {
    return <div>Booking not found</div>;
  }

  /*
   * =========================================================
   * ORIGINAL SERVICE AMOUNT
   *
   * IMPORTANT:
   * GST is calculated AFTER coupon discount.
   * =========================================================
   */
  const amount = Number(booking.amount || 0);

  /*
   * =========================================================
   * DISCOUNT CALCULATION
   * =========================================================
   */
  let discountAmount = 0;

  if (selectedCoupon) {
    /*
     * ---------------------------------------------------------
     * DISCOUNT COUPON
     * ---------------------------------------------------------
     */
    if (selectedCoupon.type === "DISCOUNT") {
      /*
       * Percentage discount on ORIGINAL service amount
       */
      if (
        selectedCoupon.percentage !== null &&
        selectedCoupon.percentage !== undefined
      ) {
        discountAmount =
          (amount *
            Number(selectedCoupon.percentage)) /
          100;
      }

      /*
       * Flat discount
       */
      if (
        selectedCoupon.flatAmount !== null &&
        selectedCoupon.flatAmount !== undefined
      ) {
        discountAmount =
          Number(selectedCoupon.flatAmount);
      }

      /*
       * Maximum discount
       */
      if (
        selectedCoupon.maxDiscount !== null &&
        selectedCoupon.maxDiscount !== undefined &&
        discountAmount >
          Number(selectedCoupon.maxDiscount)
      ) {
        discountAmount =
          Number(selectedCoupon.maxDiscount);
      }

      /*
       * Discount cannot exceed original amount
       */
      discountAmount = Math.min(
        discountAmount,
        amount
      );
    }
  }

  /*
   * =========================================================
   * PRICE AFTER COUPON
   * =========================================================
   */
  const discountedPrice =
    amount - discountAmount;

  /*
   * =========================================================
   * GST AFTER DISCOUNT
   * =========================================================
   */
  const gstAmount =
    (discountedPrice * 18) / 100;

  /*
   * =========================================================
   * FINAL PAYABLE
   * =========================================================
   */
  const finalAmount =
    discountedPrice + gstAmount;

  /*
   * =========================================================
   * APPLY COUPON
   * =========================================================
   */
  const applyCoupon = (coupon) => {
    if (!coupon) {
      return;
    }

    /*
     * ---------------------------------------------------------
     * CHECK COUPON STATUS
     * ---------------------------------------------------------
     */
    if (!coupon.status) {
      Swal.fire({
        icon: "error",
        title: "Coupon Inactive",
        text: "This coupon is currently inactive.",
      });

      return;
    }

    /*
     * ---------------------------------------------------------
     * CHECK VISIBILITY
     * ---------------------------------------------------------
     */
    if (
      coupon.visibility &&
      coupon.visibility !== "VISIBLE"
    ) {
      Swal.fire({
        icon: "error",
        title: "Coupon Not Available",
        text: "This coupon is currently not available.",
      });

      return;
    }

    /*
     * ---------------------------------------------------------
     * CHECK APPLICABLE
     *
     * Database may contain:
     *
     * services
     * service
     * both
     *
     * ---------------------------------------------------------
     */
    const applicable =
      coupon.applicable?.trim()?.toLowerCase();

    if (
      applicable &&
      applicable !== "service" &&
      applicable !== "services" &&
      applicable !== "both"
    ) {
      Swal.fire({
        icon: "error",
        title: "Coupon Not Applicable",
        text: "This coupon cannot be used for services.",
      });

      return;
    }

    /*
     * ---------------------------------------------------------
     * CHECK MINIMUM ORDER
     *
     * IMPORTANT:
     * Check against ORIGINAL amount.
     * GST is not included.
     * ---------------------------------------------------------
     */
    if (
      coupon.minOrderAmount !== null &&
      coupon.minOrderAmount !== undefined &&
      amount <
        Number(coupon.minOrderAmount)
    ) {
      Swal.fire({
        icon: "error",
        title: "Coupon Not Applicable",
        text: `Minimum order amount should be ₹${Number(
          coupon.minOrderAmount
        )}`,
      });

      return;
    }

    /*
     * ---------------------------------------------------------
     * CHECK DATE
     * ---------------------------------------------------------
     */
    const now = new Date();

    if (
      coupon.startDate &&
      new Date(coupon.startDate) > now
    ) {
      Swal.fire({
        icon: "error",
        title: "Coupon Not Active",
        text: `Coupon will be active from ${new Date(
          coupon.startDate
        ).toLocaleDateString()}`,
      });

      return;
    }

    if (
      coupon.endDate &&
      new Date(coupon.endDate) < now
    ) {
      Swal.fire({
        icon: "error",
        title: "Coupon Expired",
        text: `Coupon expired on ${new Date(
          coupon.endDate
        ).toLocaleDateString()}`,
      });

      return;
    }

    /*
     * ---------------------------------------------------------
     * CHECK GLOBAL REDEMPTION LIMIT
     * ---------------------------------------------------------
     */
    if (
      coupon.redeemLimit !== null &&
      coupon.redeemLimit !== undefined &&
      Number(coupon.usedCount || 0) >=
        Number(coupon.redeemLimit)
    ) {
      Swal.fire({
        icon: "error",
        title: "Coupon Limit Reached",
        text: "This coupon redemption limit has been reached.",
      });

      return;
    }

    /*
     * ---------------------------------------------------------
     * APPLY COUPON
     * ---------------------------------------------------------
     */
    setSelectedCoupon(coupon);
    setShowCouponModal(false);

    Swal.fire({
      icon: "success",
      title: "Congratulations 🎉",
      text: `Coupon ${coupon.code} applied successfully.`,
      confirmButtonColor: "#7c3aed",
    });
  };

  /*
   * =========================================================
   * REMOVE COUPON
   * =========================================================
   */
  const removeCoupon = () => {
    setSelectedCoupon(null);

    Swal.fire({
      icon: "success",
      title: "Coupon Removed",
      timer: 1200,
      showConfirmButton: false,
    });
  };

  /*
   * =========================================================
   * CLOSE COUPON MODAL
   * =========================================================
   */
  const closeCoup = () => {
    setShowCouponModal(false);
  };

  /*
   * =========================================================
   * AVAILABLE SERVICE COUPONS
   *
   * THIS IS THE IMPORTANT FIX.
   *
   * Your API returns:
   *
   * "applicable": "services"
   *
   * But your old frontend was checking:
   *
   * coupon.applicable === "recharge"
   *
   * Therefore nothing was rendered.
   * =========================================================
   */
  const availableCoupons =
    (couponData?.getCoupons || []).filter(
      (coupon) => {
        const applicable =
          coupon?.applicable
            ?.trim()
            ?.toLowerCase();

        return (
          coupon?.visibility === "VISIBLE" &&
          coupon?.status === true &&
          (
            applicable === "service" ||
            applicable === "services" ||
            applicable === "both"
          )
        );
      }
    );

  return (
    <div className="text-gray-500 lg:w-[80%] w-full md:p-4 p-2 bg-white rounded-xl shadow-md flex flex-col gap-3 my-4 sm:my-8 place-self-center">

      <div className="grid grid-cols-1 w-full sm:gap-6 md:grid-cols-3">

        {/* =====================================================
            PAYMENT SUMMARY
        ===================================================== */}
        <div className="p-4 shadow-xl w-full mb-5 sm:mb-0 rounded-xl bg-white">

          <h3 className="bg-gradient-to-r text-sm sm:text-md text-center from-purple-400 to-purple-600 py-2 px-3 text-white rounded-lg font-bold mb-4">
            Dhwani Services Payment
          </h3>

          <div className="sm:space-y-3 space-y-2 text-sm sm:text-md w-full text-black">

            <div className="flex justify-between">
              <span>Item</span>

              <span className="font-semibold">
                {booking.service?.name}
              </span>
            </div>

            <div className="flex justify-between">
              <span>Astrologer</span>

              <span>
                {booking.astrologer?.displayName}
              </span>
            </div>

            {/* ORIGINAL AMOUNT */}
            <div className="flex justify-between">
              <span>Amount</span>

              <span>
                ₹ {amount.toFixed(2)}
              </span>
            </div>

            {/* DISCOUNT */}
            {selectedCoupon && (
              <div className="flex justify-between text-green-600">
                <span>
                  Coupon Discount
                </span>

                <span>
                  - ₹{discountAmount.toFixed(2)}
                </span>
              </div>
            )}

            {/* DISCOUNTED PRICE */}
            {selectedCoupon && (
              <div className="flex justify-between">
                <span>
                  Price After Discount
                </span>

                <span>
                  ₹ {discountedPrice.toFixed(2)}
                </span>
              </div>
            )}

            {/* GST */}
            <div className="flex justify-between">
              <span>
                GST @18%
              </span>

              <span>
                ₹ {gstAmount.toFixed(2)}
              </span>
            </div>

            {/* =================================================
                COUPON BUTTON
            ================================================= */}
            <div className="sm:mt-4 mt-2">

              <div className="border border-gray-300 rounded-2xl px-3 sm:py-3 py-1 flex justify-between items-center">

                <span className="text-purple-400 font-semibold text-xs sm:text-sm">
                  {selectedCoupon
                    ? `${selectedCoupon.code} Applied`
                    : "Apply Coupon"}
                </span>

                {selectedCoupon ? (
                  <div className="flex gap-2">

                    <button
                      onClick={() =>
                        setShowCouponModal(true)
                      }
                      className="text-white bg-purple-600 rounded-full px-3 py-1 text-xs cursor-pointer font-semibold"
                    >
                      Change
                    </button>

                    <button
                      onClick={removeCoupon}
                      className="text-red-600 text-xs bg-red-100 px-2 py-1 rounded-full cursor-pointer font-semibold"
                    >
                      Remove
                    </button>

                  </div>
                ) : (
                  <button
                    onClick={() =>
                      setShowCouponModal(true)
                    }
                    className="text-white bg-green-500 rounded-full px-2 py-1 text-xs sm:text-sm cursor-pointer font-semibold"
                  >
                    Apply
                  </button>
                )}

              </div>
            </div>

            <hr />

            {/* FINAL AMOUNT */}
            <div className="flex justify-between font-bold text-sm sm:text-base">

              <span>
                Total Payable
              </span>

              <span>
                ₹ {finalAmount.toFixed(2)}
              </span>

            </div>

          </div>
        </div>

        {/* =====================================================
            PAYMENT OPTIONS
        ===================================================== */}
        <PayOPT
          type="SERVICE"
          bookingId={booking.id}
          amount={finalAmount}
          oriamount={booking.amount}
          coupon_id={
            selectedCoupon?.id ?? null
          }
          couponprice={
            discountAmount
          }
          coupon_code={
            selectedCoupon?.code ?? null
          }
          coupon_type={
            selectedCoupon?.type ?? null
          }
        />

      </div>

      {/* =======================================================
          COUPON MODAL
      ======================================================= */}
      {showCouponModal && (

        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">

          <div className="bg-white rounded-xl w-80 sm:w-[400px] p-5 max-h-[80vh] overflow-y-auto">

            {/* HEADER */}
            <div className="flex bg-purple-200 rounded-2xl px-4 py-2 text-black items-center justify-between">

              <h2 className="font-bold text-sm sm:text-base">
                Available Coupons
              </h2>

              <button
                className="cursor-pointer hover:scale-104"
                onClick={closeCoup}
              >
                <svg
                  height={22}
                  width={22}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#c80c0c"
                  viewBox="0 0 640 640"
                >
                  <path d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM231 231C240.4 221.6 255.6 221.6 264.9 231L319.9 286L374.9 231C384.3 221.6 399.5 221.6 408.8 231C418.1 240.4 418.2 255.6 408.8 264.9L353.8 319.9L408.8 374.9C418.2 384.3 418.2 399.5 408.8 408.8C399.4 418.1 384.2 418.2 374.9 408.8L319.9 353.8L264.9 408.8C255.5 418.2 240.3 418.2 231 408.8C221.7 399.4 221.6 384.2 231 374.9z" />
                </svg>
              </button>

            </div>

            {/* =================================================
                ENTER COUPON CODE
            ================================================= */}
            <div className="flex items-center gap-2 mt-4">

              <input
                type="text"
                value={couponCode}
                onChange={(e) =>
                  setCouponCode(
                    e.target.value.toUpperCase()
                  )
                }
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyCouponByCode();
                  }
                }}
                placeholder="Enter coupon code"
                className="flex-1 rounded-full border border-gray-300 px-4 py-1 sm:py-2 text-sm outline-none focus:border-purple-500"
              />

              <button
                onClick={applyCouponByCode}
                className="rounded-full bg-purple-600 text-white px-5 py-1 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-purple-700 transition"
              >
                Apply
              </button>

            </div>

            {/* =================================================
                LOADING
            ================================================= */}
            {couponLoading && (
              <div className="text-center text-sm text-purple-600 mt-5">
                Loading coupons...
              </div>
            )}

            {/* =================================================
                API ERROR
            ================================================= */}
            {couponError && (
              <div className="text-center text-sm text-red-500 mt-5">
                Failed to load coupons.
              </div>
            )}

            {/* =================================================
                NO COUPONS
            ================================================= */}
            {!couponLoading &&
              !couponError &&
              availableCoupons.length === 0 && (
                <div className="text-center text-sm text-gray-500 mt-5">
                  No coupons available for this service.
                </div>
              )}

            {/* =================================================
                COUPON LIST
            ================================================= */}
            {availableCoupons.map(
              (coupon) => {

                const isSelected =
                  selectedCoupon?.id ===
                  coupon.id;

                return (
                  <div
                    key={coupon.id}
                    onClick={() =>
                      applyCoupon(coupon)
                    }
                    className={`border text-black border-gray-300 rounded-2xl shadow-xl p-3 mb-3 mt-5 cursor-pointer transition
                    ${
                      isSelected
                        ? "bg-green-100 border-green-500"
                        : "bg-gradient-to-r from-purple-200 via-violet-200 to-indigo-200 hover:bg-gray-100"
                    }`}
                  >

                    <div className="flex justify-between items-center">

                      <div className="font-semibold text-sm">
                        {coupon.code}
                      </div>

                      {isSelected && (
                        <span className="text-xs text-green-700 font-bold">
                          Applied
                        </span>
                      )}

                    </div>

                    <div className="text-xs sm:text-sm text-gray-600 mt-1">
                      {coupon.type === "FLAT"
                        ? `₹${coupon.flatAmount} OFF`
                        : `${coupon.percentage}% OFF`}
                    </div>

                    {coupon.description && (
                      <div className="text-xs text-gray-500 mt-1">
                        {coupon.description}
                      </div>
                    )}

                    {coupon.minOrderAmount !== null &&
                      coupon.minOrderAmount !== undefined && (
                        <div className="text-xs text-gray-500 mt-1">
                          Minimum order: ₹
                          {coupon.minOrderAmount}
                        </div>
                    )}

                  </div>
                );
              }
            )}

          </div>
        </div>
      )}

    </div>
  );
}