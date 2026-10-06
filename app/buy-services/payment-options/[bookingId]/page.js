"use client";

import { useParams } from "next/navigation";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import PayOPT from "@/components/Smcompo/Paycomp/PayOPT";
import {
  GET_COUPONS,
  GET_SERVICE_BOOKING,
} from "@/app/graphql/gqlQuery";
import { useState } from "react";
import Swal from "sweetalert2";

/*
 * =========================================================
 * VERIFY SERVICE COUPON
 * =========================================================
 *
 * Coupon is verified when user clicks Apply.
 *
 * It is NOT verified inside PayOPT during order creation.
 *
 * Required:
 * - bookingId
 * - couponCode
 * =========================================================
 */

const VERIFY_SERVICE_COUPON = gql`
  mutation VerifyServiceCoupon(
    $input: VerifyServiceCouponInput!
  ) {
    verifyServiceCoupon(input: $input) {
      success
      message

      originalAmount
      discount
      discountedPrice
      cashback
      payableAmount
      gstAmount

      coupon {
        id
        code
        description
        type
        visibility
        couponCount
        applicable
        status
        percentage
        flatAmount
        maxDiscount
        minOrderAmount
        redeemLimit
        usedCount
        startDate
        endDate
      }
    }
  }
`;

/*
 * =========================================================
 * PAGE
 * =========================================================
 */

export default function CartPage() {
  const params = useParams();

  const bookingId = params?.bookingId;

  /*
   * =========================================================
   * COUPON STATE
   * =========================================================
   */

  const [couponCode, setCouponCode] = useState("");

  const [selectedCoupon, setSelectedCoupon] =
    useState(null);

  /*
   * Backend verification result.
   *
   * This contains the authoritative:
   *
   * discount
   * discountedPrice
   * gstAmount
   * payableAmount
   * cashback
   *
   * returned by VERIFY_SERVICE_COUPON.
   */
  const [verifiedCouponData, setVerifiedCouponData] =
    useState(null);

  const [showCouponModal, setShowCouponModal] =
    useState(false);

  const [couponVerifying, setCouponVerifying] =
    useState(false);

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
    skip: !bookingId,
  });

  const booking =
    bookingData?.getServiceBooking;

  /*
   * =========================================================
   * GET COUPONS
   * =========================================================
   */

  const {
    data: couponData,
    loading: couponLoading,
    error: couponError,
  } = useQuery(GET_COUPONS, {
    fetchPolicy: "network-only",
  });

  /*
   * =========================================================
   * VERIFY COUPON MUTATION
   * =========================================================
   */

  const [verifyServiceCoupon] =
    useMutation(VERIFY_SERVICE_COUPON);

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */

  if (loading) {
    return (
      <div className="p-6 text-center">
        Loading...
      </div>
    );
  }

  /*
   * =========================================================
   * ERROR
   * =========================================================
   */

  if (error || !booking) {
    return (
      <div className="p-6 text-center text-red-500">
        Booking not found
      </div>
    );
  }

  /*
   * =========================================================
   * ORIGINAL SERVICE AMOUNT
   * =========================================================
   */

  const amount = Number(
    booking.amount || 0,
  );

  /*
   * =========================================================
   * AVAILABLE SERVICE COUPONS
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
          coupon?.visibility ===
            "VISIBLE" &&
          coupon?.status === true &&
          (
            applicable === "service" ||
            applicable === "services" ||
            applicable === "both"
          )
        );
      },
    );

  /*
   * =========================================================
   * LOCAL DISCOUNT CALCULATION
   * =========================================================
   *
   * This is only used as a fallback/display
   * before backend verification.
   *
   * Once VERIFY_SERVICE_COUPON succeeds,
   * backend values are preferred.
   * =========================================================
   */

  const calculateLocalDiscount = (
    coupon,
  ) => {
    if (
      !coupon ||
      coupon.type !== "DISCOUNT"
    ) {
      return 0;
    }

    let discount = 0;

    /*
     * Percentage discount
     */
    if (
      coupon.percentage !== null &&
      coupon.percentage !== undefined
    ) {
      discount =
        (amount *
          Number(coupon.percentage)) /
        100;
    }

    /*
     * Flat discount
     */
    if (
      coupon.flatAmount !== null &&
      coupon.flatAmount !== undefined
    ) {
      discount =
        Number(coupon.flatAmount);
    }

    /*
     * Maximum discount
     */
    if (
      coupon.maxDiscount !== null &&
      coupon.maxDiscount !== undefined &&
      discount >
        Number(coupon.maxDiscount)
    ) {
      discount =
        Number(coupon.maxDiscount);
    }

    /*
     * Discount cannot exceed amount
     */
    discount = Math.min(
      discount,
      amount,
    );

    return Number(
      discount.toFixed(2),
    );
  };

  /*
   * =========================================================
   * DISCOUNT AMOUNT
   * =========================================================
   *
   * Backend verified amount is preferred.
   * =========================================================
   */

  const discountAmount =
    verifiedCouponData
      ? Number(
          verifiedCouponData.discount ||
            0,
        )
      : calculateLocalDiscount(
          selectedCoupon,
        );

  /*
   * =========================================================
   * DISCOUNTED PRICE
   * =========================================================
   */

  const discountedPrice =
    verifiedCouponData
      ? Number(
          verifiedCouponData.discountedPrice ??
            amount -
              discountAmount,
        )
      : Number(
          (
            amount -
            discountAmount
          ).toFixed(2),
        );

  /*
   * =========================================================
   * GST
   * =========================================================
   */

  const gstAmount =
    verifiedCouponData
      ? Number(
          verifiedCouponData.gstAmount ||
            0,
        )
      : Number(
          (
            (discountedPrice *
              18) /
            100
          ).toFixed(2),
        );

  /*
   * =========================================================
   * FINAL PAYABLE AMOUNT
   * =========================================================
   */

  const finalAmount =
    verifiedCouponData
      ? Number(
          verifiedCouponData.payableAmount ??
            discountedPrice +
              gstAmount,
        )
      : Number(
          (
            discountedPrice +
            gstAmount
          ).toFixed(2),
        );

  /*
   * =========================================================
   * CLOSE COUPON MODAL
   * =========================================================
   */

  const closeCoup = () => {
    setShowCouponModal(false);
    setCouponCode("");
  };

  /*
   * =========================================================
   * APPLY COUPON
   * =========================================================
   *
   * IMPORTANT:
   *
   * VERIFY_SERVICE_COUPON is called HERE.
   *
   * Flow:
   *
   * 1. Frontend basic validation
   * 2. VERIFY_SERVICE_COUPON
   * 3. Backend validates coupon
   * 4. Backend calculates discount
   * 5. Backend calculates GST
   * 6. Backend calculates payable amount
   * 7. Only successful verification applies coupon
   * =========================================================
   */

  const applyCoupon = async (coupon) => {
    if (!coupon) {
      return;
    }

    /*
     * Prevent duplicate verification
     */
    if (couponVerifying) {
      return;
    }

    /*
     * =======================================================
     * CHECK STATUS
     * =======================================================
     */

    if (coupon.status !== true) {
      Swal.fire({
        icon: "error",
        title: "Coupon Inactive",
        text:
          "This coupon is currently inactive.",
        confirmButtonColor:
          "#7c3aed",
      });

      return;
    }

    /*
     * =======================================================
     * CHECK VISIBILITY
     * =======================================================
     */

    if (
      coupon.visibility &&
      coupon.visibility !==
        "VISIBLE"
    ) {
      Swal.fire({
        icon: "error",
        title: "Coupon Not Available",
        text:
          "This coupon is currently not available.",
        confirmButtonColor:
          "#7c3aed",
      });

      return;
    }

    /*
     * =======================================================
     * CHECK APPLICABLE
     * =======================================================
     */

    const applicable =
      coupon.applicable
        ?.trim()
        ?.toLowerCase();

    if (
      applicable &&
      applicable !== "service" &&
      applicable !== "services" &&
      applicable !== "both"
    ) {
      Swal.fire({
        icon: "error",
        title: "Coupon Not Applicable",
        text:
          "This coupon cannot be used for services.",
        confirmButtonColor:
          "#7c3aed",
      });

      return;
    }

    /*
     * =======================================================
     * CHECK MINIMUM ORDER
     * =======================================================
     */

    if (
      coupon.minOrderAmount !==
        null &&
      coupon.minOrderAmount !==
        undefined &&
      amount <
        Number(
          coupon.minOrderAmount,
        )
    ) {
      Swal.fire({
        icon: "error",
        title: "Coupon Not Applicable",
        text: `Minimum order amount should be ₹${Number(
          coupon.minOrderAmount,
        )}`,
        confirmButtonColor:
          "#7c3aed",
      });

      return;
    }

    /*
     * =======================================================
     * CHECK DATE
     * =======================================================
     */

    const now = new Date();

    if (
      coupon.startDate &&
      new Date(coupon.startDate) >
        now
    ) {
      Swal.fire({
        icon: "error",
        title: "Coupon Not Active",
        text: `Coupon will be active from ${new Date(
          coupon.startDate,
        ).toLocaleDateString()}`,
        confirmButtonColor:
          "#7c3aed",
      });

      return;
    }

    if (
      coupon.endDate &&
      new Date(coupon.endDate) <
        now
    ) {
      Swal.fire({
        icon: "error",
        title: "Coupon Expired",
        text: `Coupon expired on ${new Date(
          coupon.endDate,
        ).toLocaleDateString()}`,
        confirmButtonColor:
          "#7c3aed",
      });

      return;
    }

    /*
     * =======================================================
     * CHECK GLOBAL REDEMPTION LIMIT
     * =======================================================
     */

    if (
      coupon.redeemLimit !==
        null &&
      coupon.redeemLimit !==
        undefined &&
      Number(
        coupon.usedCount || 0,
      ) >=
        Number(
          coupon.redeemLimit,
        )
    ) {
      Swal.fire({
        icon: "error",
        title: "Coupon Limit Reached",
        text:
          "This coupon redemption limit has been reached.",
        confirmButtonColor:
          "#7c3aed",
      });

      return;
    }

    /*
     * =======================================================
     * BOOKING ID CHECK
     * =======================================================
     */

    if (!bookingId) {
      Swal.fire({
        icon: "error",
        title: "Booking Not Found",
        text:
          "Booking ID is required to verify this coupon.",
        confirmButtonColor:
          "#7c3aed",
      });

      return;
    }

    /*
     * =======================================================
     * CALL VERIFY_SERVICE_COUPON
     * =======================================================
     */

    try {
      setCouponVerifying(true);

      /*
       * Clear previous verification first.
       */
      setVerifiedCouponData(null);

      const result =
        await verifyServiceCoupon({
          variables: {
            input: {
              bookingId:
                bookingId,
              couponCode:
                coupon.code,
            },
          },
        });

      const verification =
        result?.data
          ?.verifyServiceCoupon;

      /*
       * =====================================================
       * VERIFICATION FAILED
       * =====================================================
       */

      if (!verification?.success) {
        throw new Error(
          verification?.message ||
            "Coupon verification failed",
        );
      }

      /*
       * =====================================================
       * BACKEND VERIFIED COUPON
       * =====================================================
       */

      const verifiedCoupon =
        verification?.coupon ||
        coupon;

      /*
       * =====================================================
       * SAVE VERIFIED DATA
       * =====================================================
       */

      setSelectedCoupon(
        verifiedCoupon,
      );

      setVerifiedCouponData(
        verification,
      );

      /*
       * Close modal
       */
      setShowCouponModal(false);

      setCouponCode("");

      /*
       * =====================================================
       * SUCCESS
       * =====================================================
       */

      if (
        verifiedCoupon.type ===
        "CASHBACK"
      ) {
        Swal.fire({
          icon: "success",
          title: "Coupon Applied 🎉",
          text: `Cashback coupon ${verifiedCoupon.code} applied successfully.`,
          confirmButtonColor:
            "#7c3aed",
        });
      } else {
        Swal.fire({
          icon: "success",
          title: "Congratulations 🎉",
          text: `Coupon ${verifiedCoupon.code} applied successfully.`,
          confirmButtonColor:
            "#7c3aed",
        });
      }
    } catch (error) {
      console.error(
        "VERIFY_SERVICE_COUPON error:",
        error,
      );

      /*
       * IMPORTANT:
       *
       * Do NOT apply coupon if verification fails.
       */

      setSelectedCoupon(null);
      setVerifiedCouponData(null);

      Swal.fire({
        icon: "error",
        title: "Coupon Not Applied",
        text:
          error?.message ||
          "Unable to verify coupon.",
        confirmButtonColor:
          "#7c3aed",
      });
    } finally {
      setCouponVerifying(false);
    }
  };

  /*
   * =========================================================
   * APPLY COUPON BY CODE
   * =========================================================
   */

  const applyCouponByCode = async () => {
    const code =
      couponCode
        .trim()
        .toUpperCase();

    if (!code) {
      Swal.fire({
        icon: "warning",
        title: "Enter Coupon Code",
        confirmButtonColor:
          "#7c3aed",
      });

      return;
    }

    const coupon =
      availableCoupons.find(
        (item) =>
          item?.code
            ?.trim()
            ?.toUpperCase() ===
          code,
      );

    if (!coupon) {
      Swal.fire({
        icon: "error",
        title: "Invalid Coupon",
        text:
          "Coupon code not found or coupon is not applicable.",
        confirmButtonColor:
          "#7c3aed",
      });

      return;
    }

    /*
     * VERIFY happens inside applyCoupon()
     */
    await applyCoupon(coupon);
  };

  /*
   * =========================================================
   * REMOVE COUPON
   * =========================================================
   */

  const removeCoupon = () => {
    setSelectedCoupon(null);

    /*
     * Very important:
     *
     * Clear backend verification data also.
     */
    setVerifiedCouponData(null);

    setCouponCode("");

    Swal.fire({
      icon: "success",
      title: "Coupon Removed",
      text:
        "Coupon has been removed successfully.",
      confirmButtonColor:
        "#7c3aed",
      timer: 1200,
      showConfirmButton: false,
    });
  };

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */

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

            {/* ITEM */}

            <div className="flex justify-between">
              <span>
                Item
              </span>

              <span className="font-semibold">
                {booking.service?.name}
              </span>
            </div>

            {/* ASTROLOGER */}

            <div className="flex justify-between">
              <span>
                Astrologer
              </span>

              <span>
                {booking.astrologer?.displayName}
              </span>
            </div>

            {/* ORIGINAL AMOUNT */}

            <div className="flex justify-between">
              <span>
                Amount
              </span>

              <span>
                ₹ {amount.toFixed(2)}
              </span>
            </div>

            {/* DISCOUNT */}

            {selectedCoupon?.type ===
              "DISCOUNT" && (
              <div className="flex justify-between text-green-600">

                <span>
                  Coupon Discount
                </span>

                <span>
                  - ₹
                  {discountAmount.toFixed(
                    2,
                  )}
                </span>

              </div>
            )}

            {/* DISCOUNTED PRICE */}

            {selectedCoupon?.type ===
              "DISCOUNT" && (
              <div className="flex justify-between">

                <span>
                  Price After Discount
                </span>

                <span>
                  ₹
                  {discountedPrice.toFixed(
                    2,
                  )}
                </span>

              </div>
            )}

            {/* GST */}

            <div className="flex justify-between">

              <span>
                GST @18%
              </span>

              <span>
                ₹
                {gstAmount.toFixed(
                  2,
                )}
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
                      type="button"
                      disabled={
                        couponVerifying
                      }
                      onClick={() =>
                        setShowCouponModal(
                          true,
                        )
                      }
                      className="text-white bg-purple-600 rounded-full px-3 py-1 text-xs cursor-pointer font-semibold disabled:opacity-50"
                    >
                      Change
                    </button>

                    <button
                      type="button"
                      disabled={
                        couponVerifying
                      }
                      onClick={
                        removeCoupon
                      }
                      className="text-red-600 text-xs bg-red-100 px-2 py-1 rounded-full cursor-pointer font-semibold disabled:opacity-50"
                    >
                      Remove
                    </button>

                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() =>
                      setShowCouponModal(
                        true,
                      )
                    }
                    className="text-white bg-green-500 rounded-full px-2 py-1 text-xs sm:text-sm cursor-pointer font-semibold"
                  >
                    Apply
                  </button>
                )}

              </div>
            </div>

            <hr />

            {/* CASHBACK */}

            {selectedCoupon?.type ===
              "CASHBACK" && (
              <div className="flex justify-between text-green-600">

                <span>
                  Cashback
                </span>

                <span>
                  {verifiedCouponData?.cashback ??
                    selectedCoupon.percentage ??
                    0}
                  %
                </span>

              </div>
            )}

            {/* FINAL AMOUNT */}

            <div className="flex justify-between font-bold text-sm sm:text-base">

              <span>
                Total Payable
              </span>

              <span>
                ₹
                {finalAmount.toFixed(
                  2,
                )}
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

          oriamount={
            booking.amount
          }

          coupon_id={
            selectedCoupon?.id ??
            null
          }

          couponprice={
            discountAmount
          }

          coupon_code={
            selectedCoupon?.code ??
            null
          }

          coupon_type={
            selectedCoupon?.type ??
            null
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
                type="button"
                className="cursor-pointer hover:scale-104"
                onClick={
                  closeCoup
                }
                disabled={
                  couponVerifying
                }
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
                disabled={
                  couponVerifying
                }
                onChange={(e) =>
                  setCouponCode(
                    e.target.value.toUpperCase(),
                  )
                }
                onKeyDown={(e) => {
                  if (
                    e.key ===
                    "Enter"
                  ) {
                    applyCouponByCode();
                  }
                }}
                placeholder="Enter coupon code"
                className="flex-1 rounded-full border border-gray-300 px-4 py-1 sm:py-2 text-sm outline-none focus:border-purple-500 disabled:bg-gray-100"
              />

              <button
                type="button"
                disabled={
                  couponVerifying
                }
                onClick={
                  applyCouponByCode
                }
                className="rounded-full bg-purple-600 text-white px-5 py-1 sm:py-2 text-xs sm:text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-50"
              >
                {couponVerifying
                  ? "Verifying..."
                  : "Apply"}
              </button>

            </div>

            {/* =================================================
                VERIFY LOADING
            ================================================= */}

            {couponVerifying && (
              <div className="text-center text-sm text-purple-600 mt-5 font-semibold">
                Verifying coupon...
              </div>
            )}

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
              availableCoupons.length ===
                0 && (
                <div className="text-center text-sm text-gray-500 mt-5">
                  No coupons available for this service.
                </div>
              )}

            {/* =================================================
                COUPON LIST
            ================================================= */}

            {!couponVerifying &&
              availableCoupons.map(
                (coupon) => {
                  const isSelected =
                    selectedCoupon?.id ===
                    coupon.id;

                  return (
                    <div
                      key={coupon.id}
                      onClick={() =>
                        applyCoupon(
                          coupon,
                        )
                      }
                      className={`border text-black border-gray-300 rounded-2xl shadow-xl p-3 mb-3 mt-5 cursor-pointer transition ${
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

                      {coupon.description && (
                        <div className="text-xs sm:text-sm text-gray-600 mt-1">
                          {
                            coupon.description
                          }
                        </div>
                      )}

                      <div className="text-xs sm:text-sm text-gray-600 mt-1">

                        {coupon.type ===
                          "DISCOUNT" &&
                          coupon.flatAmount !==
                            null &&
                          coupon.flatAmount !==
                            undefined &&
                          `₹${coupon.flatAmount} OFF`}

                        {coupon.type ===
                          "DISCOUNT" &&
                          coupon.percentage !==
                            null &&
                          coupon.percentage !==
                            undefined &&
                          `${coupon.percentage}% OFF`}

                        {coupon.type ===
                          "CASHBACK" &&
                          coupon.percentage !==
                            null &&
                          coupon.percentage !==
                            undefined &&
                          `${coupon.percentage}% Cashback`}

                      </div>

                      {coupon.minOrderAmount !==
                        null &&
                        coupon.minOrderAmount !==
                          undefined && (
                          <div className="text-xs text-gray-500 mt-1">
                            Minimum order: ₹
                            {
                              coupon.minOrderAmount
                            }
                          </div>
                        )}

                      {coupon.type ===
                        "DISCOUNT" &&
                        coupon.maxDiscount !==
                          null &&
                        coupon.maxDiscount !==
                          undefined && (
                          <div className="text-xs text-gray-500 mt-1">
                            Maximum discount: ₹
                            {
                              coupon.maxDiscount
                            }
                          </div>
                        )}

                    </div>
                  );
                },
              )}

          </div>
        </div>
      )}

    </div>
  );
}