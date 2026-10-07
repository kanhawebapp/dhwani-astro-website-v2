"use client";

import { useParams } from "next/navigation";
import { gql } from "@apollo/client";
import { useQuery, useMutation } from "@apollo/client/react";
import PayOPT from "@/components/Smcompo/Paycomp/PayOPT";
import { GET_COUPONS } from "@/app/graphql/gqlQuery";
import { useState } from "react";
import Swal from "sweetalert2";

/*
 * =========================================================
 * GET SINGLE RECHARGE PACK
 * =========================================================
 */
const GET_SINGLE_PACK = gql`
  query GetRechargePackById($id: ID!) {
    getRechargePackById(id: $id) {
      id
      name
      price
      coins
      talktime
      validityDays
    }
  }
`;

/*
 * =========================================================
 * VERIFY RECHARGE COUPON
 * =========================================================
 *
 * This API is called when the user applies a coupon.
 *
 * Backend validates:
 *
 * - Authentication
 * - Recharge pack
 * - Coupon existence
 * - Coupon status
 * - Visibility
 * - Date
 * - Applicability
 * - Minimum order amount
 * - Redemption limit
 * - User redemption
 * - Discount
 * - Cashback
 * - GST
 * - Final payable amount
 */
const VERIFY_RECHARGE_COUPON = gql`
  mutation VerifyRechargeCoupon($input: VerifyRechargeCouponInput!) {
    verifyRechargeCoupon(input: $input) {
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

export default function CartPage() {
  const params = useParams();

  const packId = params?.id;

  const [couponCode, setCouponCode] = useState("");

  const [selectedCoupon, setSelectedCoupon] = useState(null);

  const [showCouponModal, setShowCouponModal] = useState(false);

  /*
   * =========================================================
   * VERIFIED COUPON AMOUNT
   * =========================================================
   *
   * These values come from backend verification.
   *
   * We don't trust frontend calculation for payment.
   */
  const [verifiedCouponData, setVerifiedCouponData] = useState(null);

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
   * GET RECHARGE PACK
   * =========================================================
   */
  const { data, loading, error } = useQuery(GET_SINGLE_PACK, {
    variables: {
      id: packId,
    },
    skip: !packId,
  });

  /*
   * =========================================================
   * VERIFY RECHARGE COUPON MUTATION
   * =========================================================
   */
  const [verifyRechargeCoupon, { loading: verifyingCoupon }] = useMutation(
    VERIFY_RECHARGE_COUPON,
  );

  const pack = data?.getRechargePackById;

  /*
   * =========================================================
   * LOADING
   * =========================================================
   */
  if (loading) {
    return <div className="p-6 text-center">Loading pack details...</div>;
  }

  /*
   * =========================================================
   * ERROR
   * =========================================================
   */
  if (error || !pack) {
    return (
      <div className="p-6 text-center text-red-500">Invalid Recharge Pack</div>
    );
  }

  /*
   * =========================================================
   * ORIGINAL PRODUCT PRICE
   * =========================================================
   */
  const packPrice = Number(pack.price || 0);

  /*
   * =========================================================
   * AVAILABLE COUPONS
   * =========================================================
   *
   * We still filter on frontend for display.
   *
   * Backend VERIFY_RECHARGE_COUPON remains
   * the final authority.
   */

  const availableCoupons = (couponData?.getCoupons ?? []).filter((coupon) => {
    if (!coupon) {
      return false;
    }

    // Visibility
    if (coupon.visibility !== "VISIBLE") {
      return false;
    }

    // Status
    if (coupon.status !== true) {
      return false;
    }

    // Normalize applicable value
    const applicable = String(coupon.applicable ?? "")
      .trim()
      .toLowerCase();

    // Recharge page:
    // Only recharge, recharges, and both are allowed
    const isRechargeCoupon = ["recharge", "recharges", "both"].includes(
      applicable,
    );

    console.log("RECHARGE COUPON FILTER:", {
      code: coupon.code,
      applicable: coupon.applicable,
      normalized: applicable,
      isRechargeCoupon,
    });

    return isRechargeCoupon;
  });

  /*
   * =========================================================
   * CHECK COUPON DATE
   * =========================================================
   *
   * This is only frontend display validation.
   *
   * Backend verifies again.
   */
  const isCouponDateValid = (coupon) => {
    const now = new Date();

    if (coupon?.startDate) {
      const startDate = new Date(coupon.startDate);

      if (startDate > now) {
        return false;
      }
    }

    if (coupon?.endDate) {
      const endDate = new Date(coupon.endDate);

      if (endDate < now) {
        return false;
      }
    }

    return true;
  };

  /*
   * =========================================================
   * FRONTEND FALLBACK DISCOUNT
   * =========================================================
   *
   * Used only before backend verification.
   *
   * Once coupon is verified, backend values are used.
   */
  const calculateCouponDiscount = (coupon) => {
    if (!coupon || coupon.type !== "DISCOUNT") {
      return 0;
    }

    let discount = 0;

    /*
     * Percentage discount
     */
    if (coupon.percentage !== null && coupon.percentage !== undefined) {
      discount = (packPrice * Number(coupon.percentage)) / 100;
    }

    /*
     * Flat discount
     */
    if (coupon.flatAmount !== null && coupon.flatAmount !== undefined) {
      discount = Number(coupon.flatAmount);
    }

    /*
     * Maximum discount
     */
    if (
      coupon.maxDiscount !== null &&
      coupon.maxDiscount !== undefined &&
      discount > Number(coupon.maxDiscount)
    ) {
      discount = Number(coupon.maxDiscount);
    }

    /*
     * Discount cannot exceed pack price.
     */
    discount = Math.min(discount, packPrice);

    return Number(discount.toFixed(2));
  };

  /*
   * =========================================================
   * DISCOUNT AMOUNT
   * =========================================================
   *
   * IMPORTANT:
   *
   * If backend verification exists,
   * backend amount wins.
   */
  const discountAmount = verifiedCouponData
    ? Number(verifiedCouponData.discount || 0)
    : calculateCouponDiscount(selectedCoupon);

  /*
   * =========================================================
   * PRICE AFTER DISCOUNT
   * =========================================================
   */
  const discountedPrice = verifiedCouponData
    ? Number(verifiedCouponData.discountedPrice || 0)
    : Number((packPrice - discountAmount).toFixed(2));

  /*
   * =========================================================
   * GST
   * =========================================================
   */
  const gstAmount = verifiedCouponData
    ? Number(verifiedCouponData.gstAmount || 0)
    : Number(((discountedPrice * 18) / 100).toFixed(2));

  /*
   * =========================================================
   * FINAL PAYABLE AMOUNT
   * =========================================================
   */
  const finalAmount = verifiedCouponData
    ? Number(verifiedCouponData.payableAmount || 0)
    : Number((discountedPrice + gstAmount).toFixed(2));

  /*
   * =========================================================
   * CASHBACK
   * =========================================================
   */
  const cashbackAmount = verifiedCouponData
    ? Number(verifiedCouponData.cashback || 0)
    : selectedCoupon?.type === "CASHBACK"
      ? Number(
          ((packPrice * Number(selectedCoupon?.percentage || 0)) / 100).toFixed(
            2,
          ),
        )
      : 0;

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
   * VERIFY + APPLY COUPON
   * =========================================================
   *
   * THIS IS THE IMPORTANT CHANGE.
   *
   * When user clicks a coupon:
   *
   * Coupon
   *    ↓
   * Frontend basic checks
   *    ↓
   * VERIFY_RECHARGE_COUPON
   *    ↓
   * Backend validation
   *    ↓
   * Success
   *    ↓
   * Apply coupon
   */
  const applyCoupon = async (coupon) => {
    if (!coupon) {
      return;
    }

    /*
     * Prevent duplicate request
     */
    if (verifyingCoupon) {
      return;
    }

    /*
     * =====================================================
     * VISIBILITY
     * =====================================================
     */
    if (coupon.visibility !== "VISIBLE") {
      Swal.fire({
        icon: "error",
        title: "Coupon not available",
        text: "This coupon is currently not available.",
        confirmButtonColor: "#7c3aed",
      });

      return;
    }

    /*
     * =====================================================
     * STATUS
     * =====================================================
     */
    if (coupon.status === false) {
      Swal.fire({
        icon: "error",
        title: "Coupon inactive",
        text: "This coupon is currently inactive.",
        confirmButtonColor: "#7c3aed",
      });

      return;
    }

    /*
     * =====================================================
     * APPLICABLE
     * =====================================================
     */
    const applicable = String(coupon?.applicable ?? "")
      .trim()
      .toLowerCase();

    if (!["recharge", "recharges", "both"].includes(applicable)) {
      Swal.fire({
        icon: "error",
        title: "Coupon not applicable",
        text: "This coupon cannot be used for this recharge.",
        confirmButtonColor: "#7c3aed",
      });

      return;
    }

    /*
     * =====================================================
     * DATE
     * =====================================================
     */
    if (!isCouponDateValid(coupon)) {
      Swal.fire({
        icon: "error",
        title: "Coupon expired",
        text: "This coupon is no longer valid.",
        confirmButtonColor: "#7c3aed",
      });

      return;
    }

    /*
     * =====================================================
     * MINIMUM ORDER
     * =====================================================
     */
    if (
      coupon.minOrderAmount !== null &&
      coupon.minOrderAmount !== undefined &&
      packPrice < Number(coupon.minOrderAmount)
    ) {
      Swal.fire({
        icon: "error",
        title: "Coupon not applicable",
        text: `Minimum order amount should be ₹${coupon.minOrderAmount}`,
        confirmButtonColor: "#7c3aed",
      });

      return;
    }

    /*
     * =====================================================
     * REDEEM LIMIT
     * =====================================================
     */
    if (
      coupon.redeemLimit !== null &&
      coupon.redeemLimit !== undefined &&
      Number(coupon.usedCount || 0) >= Number(coupon.redeemLimit)
    ) {
      Swal.fire({
        icon: "error",
        title: "Coupon unavailable",
        text: "This coupon has reached its redemption limit.",
        confirmButtonColor: "#7c3aed",
      });

      return;
    }

    /*
     * =====================================================
     * CALL BACKEND VERIFICATION
     * =====================================================
     */
    try {
      const result = await verifyRechargeCoupon({
        variables: {
          input: {
            rechargePackId: pack.id,

            couponCode: coupon.code,
          },
        },
      });

      const verification = result?.data?.verifyRechargeCoupon;

      /*
       * ===================================================
       * VERIFICATION FAILED
       * ===================================================
       */
      if (!verification?.success) {
        throw new Error(verification?.message || "Coupon verification failed");
      }

      /*
       * ===================================================
       * BACKEND VERIFIED COUPON
       * ===================================================
       */
      const verifiedCoupon = verification?.coupon;

      if (!verifiedCoupon) {
        throw new Error(
          "Coupon verification succeeded but coupon details were not returned",
        );
      }

      /*
       * ===================================================
       * STORE VERIFIED DATA
       * ===================================================
       *
       * We store the complete backend response.
       *
       * This means UI uses:
       *
       * backend discount
       * backend GST
       * backend payableAmount
       * backend cashback
       */
      setVerifiedCouponData(verification);

      setSelectedCoupon(verifiedCoupon);

      setShowCouponModal(false);

      setCouponCode("");

      /*
       * ===================================================
       * SUCCESS MESSAGE
       * ===================================================
       */
      if (verifiedCoupon.type === "CASHBACK") {
        Swal.fire({
          icon: "success",
          title: "Coupon Applied 🎉",
          text: `Cashback coupon ${verifiedCoupon.code} applied successfully.`,
          confirmButtonColor: "#7c3aed",
        });

        return;
      }

      Swal.fire({
        icon: "success",
        title: "Congratulations 🎉",
        text: `Coupon ${verifiedCoupon.code} applied successfully.`,
        confirmButtonColor: "#7c3aed",
      });
    } catch (error) {
      console.error("Verify recharge coupon error:", error);

      /*
       * Important:
       *
       * Don't apply coupon if backend verification fails.
       */
      setSelectedCoupon(null);

      setVerifiedCouponData(null);

      Swal.fire({
        icon: "error",
        title: "Coupon Not Applied",
        text: error?.message || "Unable to verify coupon",
        confirmButtonColor: "#7c3aed",
      });
    }
  };

  /*
   * =========================================================
   * APPLY COUPON BY CODE
   * =========================================================
   */
  const applyCouponByCode = async () => {
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      Swal.fire({
        icon: "warning",
        title: "Enter Coupon Code",
        confirmButtonColor: "#7c3aed",
      });

      return;
    }

    /*
     * Find coupon from available list.
     */
    const coupon = availableCoupons.find(
      (item) => item?.code?.toUpperCase() === code,
    );

    if (!coupon) {
      Swal.fire({
        icon: "error",
        title: "Invalid Coupon",
        text: "Coupon code not found or coupon is not applicable.",
        confirmButtonColor: "#7c3aed",
      });

      return;
    }

    /*
     * IMPORTANT:
     *
     * This calls VERIFY_RECHARGE_COUPON.
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

    setVerifiedCouponData(null);

    setCouponCode("");

    Swal.fire({
      icon: "success",
      title: "Coupon Removed",
      text: "Coupon has been removed successfully.",
      confirmButtonColor: "#7c3aed",
      timer: 1500,
      showConfirmButton: false,
    });
  };

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */
  return (
    <div className="text-gray-500 lg:w-[80%] w-full md:p-4 p-2 bg-white rounded-xl shadow-md flex flex-col gap-3 my-8 place-self-center">
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {/* ==================================================
            RECHARGE SUMMARY
        ================================================== */}
        <div className="p-4 shadow-xl rounded-xl bg-white">
          <h3 className="bg-gradient-to-r from-purple-400 to-purple-600 py-2 px-3 text-white rounded-lg font-bold mb-4">
            Recharge Summary
          </h3>

          <div className="space-y-3 text-black">
            {/* Selected Pack */}
            <div className="flex justify-between">
              <span>Selected Pack</span>

              <span className="font-semibold">{pack.name}</span>
            </div>

            {/* Original Amount */}
            <div className="flex justify-between">
              <span>Amount</span>

              <span>₹ {packPrice.toFixed(2)}</span>
            </div>

            {/* Coupon Discount */}
            {selectedCoupon?.type === "DISCOUNT" && (
              <div className="flex justify-between text-green-600">
                <span>Coupon Discount</span>

                <span>- ₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            {/* Price After Discount */}
            {selectedCoupon?.type === "DISCOUNT" && (
              <div className="flex justify-between">
                <span>Price After Discount</span>

                <span>₹ {discountedPrice.toFixed(2)}</span>
              </div>
            )}

            {/* GST */}
            <div className="flex justify-between">
              <span>GST @18%</span>

              <span>₹ {gstAmount.toFixed(2)}</span>
            </div>

            {/* ==================================================
                COUPON
            ================================================== */}
            <div className="mt-4">
              <div className="border border-gray-300 rounded-2xl px-3 py-3">
                <div className="flex justify-between items-center">
                  <span className="text-purple-500 font-semibold text-sm">
                    {selectedCoupon
                      ? `${selectedCoupon.code} Applied`
                      : "Apply Coupon"}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Change / Apply */}
                    <button
                      type="button"
                      disabled={verifyingCoupon}
                      onClick={() => setShowCouponModal(true)}
                      className="text-white bg-green-500 rounded-full px-3 py-1 text-xs cursor-pointer font-semibold disabled:opacity-50"
                    >
                      {selectedCoupon ? "Change" : "Apply"}
                    </button>

                    {/* Remove */}
                    {selectedCoupon && (
                      <button
                        type="button"
                        disabled={verifyingCoupon}
                        onClick={removeCoupon}
                        className="text-red-600 text-xs bg-red-100 px-2 py-1 rounded-full cursor-pointer font-semibold disabled:opacity-50"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <hr />

            {/* ==================================================
                CASHBACK
            ================================================== */}
            {selectedCoupon?.type === "CASHBACK" && (
              <div className="flex justify-between text-green-600">
                <span>Cashback</span>

                <span>₹ {cashbackAmount.toFixed(2)}</span>
              </div>
            )}

            {/* ==================================================
                TOTAL
            ================================================== */}
            <div className="flex justify-between font-bold text-lg">
              <span>Total Payable</span>

              <span>₹ {finalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* ==================================================
            PAYMENT
        ================================================== */}
        <PayOPT
          type="RECHARGE"
          /*
           * This amount is now based on the
           * backend verified coupon.
           */
          amount={finalAmount}
          oriamount={packPrice}
          packid={pack.id}
          coupon_id={selectedCoupon?.id ?? null}
          couponprice={discountAmount}
          coupon_code={selectedCoupon?.code ?? null}
          coupon_type={selectedCoupon?.type ?? null}
          cashback={cashbackAmount}
        />
      </div>

      {/* ====================================================
          COUPON MODAL
      ==================================================== */}
      {showCouponModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-[90%] max-w-md p-5 max-h-[90vh] overflow-y-auto">
            {/* HEADER */}
            <div className="flex bg-purple-200 rounded-2xl px-4 py-2 text-black items-center justify-between">
              <h2 className="font-bold text-md">Available Coupons</h2>

              <button
                type="button"
                className="cursor-pointer hover:scale-105"
                onClick={closeCoup}
                aria-label="Close coupon modal"
                disabled={verifyingCoupon}
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

            {/* ==================================================
                COUPON INPUT
            ================================================== */}
            <div className="flex items-center gap-2 mt-4">
              <input
                type="text"
                value={couponCode}
                disabled={verifyingCoupon}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    applyCouponByCode();
                  }
                }}
                placeholder="Enter coupon code"
                className="flex-1 rounded-full border border-gray-300 px-4 py-2 text-sm outline-none focus:border-purple-500 disabled:bg-gray-100"
              />

              <button
                type="button"
                disabled={verifyingCoupon}
                onClick={applyCouponByCode}
                className="rounded-full bg-purple-600 text-white px-5 py-2 text-sm font-semibold hover:bg-purple-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {verifyingCoupon ? "Verifying..." : "Apply"}
              </button>
            </div>

            {/* ==================================================
                VERIFYING
            ================================================== */}
            {verifyingCoupon && (
              <div className="text-purple-600 text-sm mt-4 text-center font-semibold">
                Verifying coupon...
              </div>
            )}

            {/* ==================================================
                ERROR
            ================================================== */}
            {couponError && (
              <div className="text-red-500 text-sm mt-4 text-center">
                Unable to load coupons.
              </div>
            )}

            {/* ==================================================
                LOADING
            ================================================== */}
            {couponLoading && (
              <div className="text-gray-500 text-sm mt-5 text-center">
                Loading coupons...
              </div>
            )}

            {/* ==================================================
                EMPTY
            ================================================== */}
            {!couponLoading &&
              !couponError &&
              availableCoupons.length === 0 && (
                <div className="text-gray-500 text-sm mt-5 text-center">
                  No coupons available.
                </div>
              )}

            {/* ==================================================
                COUPON LIST
            ================================================== */}
            {!couponLoading &&
              !couponError &&
              availableCoupons.map((coupon) => {
                const isSelected = selectedCoupon?.id === coupon.id;

                return (
                  <div
                    key={coupon.id}
                    onClick={() => !verifyingCoupon && applyCoupon(coupon)}
                    className={`border text-black border-gray-300 rounded-2xl shadow-xl p-3 mb-3 mt-5 cursor-pointer transition ${
                      isSelected
                        ? "bg-purple-300 border-purple-600"
                        : "bg-gradient-to-r from-purple-200 via-violet-200 to-indigo-200 hover:bg-gray-100"
                    } ${
                      verifyingCoupon ? "opacity-60 cursor-not-allowed" : ""
                    }`}
                  >
                    {/* CODE */}
                    <div className="flex justify-between items-center">
                      <div className="font-semibold text-base">
                        {coupon.code}
                      </div>

                      {isSelected && (
                        <span className="text-xs bg-green-600 text-white px-2 py-1 rounded-full">
                          Applied
                        </span>
                      )}
                    </div>

                    {/* DESCRIPTION */}
                    {coupon.description && (
                      <div className="text-xs text-gray-600 mt-1">
                        {coupon.description}
                      </div>
                    )}

                    {/* TYPE */}
                    <div className="text-sm text-gray-500 mt-1">
                      {coupon.type === "DISCOUNT" &&
                        coupon.percentage !== null &&
                        coupon.percentage !== undefined &&
                        `${coupon.percentage}% OFF`}

                      {coupon.type === "DISCOUNT" &&
                        coupon.flatAmount !== null &&
                        coupon.flatAmount !== undefined &&
                        `₹${coupon.flatAmount} OFF`}

                      {coupon.type === "CASHBACK" &&
                        coupon.percentage !== null &&
                        coupon.percentage !== undefined &&
                        `${coupon.percentage}% Cashback`}
                    </div>

                    {/* MINIMUM ORDER */}
                    {coupon.minOrderAmount !== null &&
                      coupon.minOrderAmount !== undefined && (
                        <div className="text-xs text-gray-500 mt-1">
                          Minimum order: ₹{coupon.minOrderAmount}
                        </div>
                      )}

                    {/* MAX DISCOUNT */}
                    {coupon.type === "DISCOUNT" &&
                      coupon.maxDiscount !== null &&
                      coupon.maxDiscount !== undefined && (
                        <div className="text-xs text-gray-500 mt-1">
                          Maximum discount: ₹{coupon.maxDiscount}
                        </div>
                      )}
                  </div>
                );
              })}
          </div>
        </div>
      )}
    </div>
  );
}
