
"use client";

import Image from "next/image";
import Script from "next/script";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";

import { CREATE_HEALING_ORDER } from "@/app/graphql/gqlQuery";

/*
 * =========================================================
 * CREATE RECHARGE ORDER
 * =========================================================
 *
 * Backend CreateOrderResponse currently returns only:
 *
 * success
 * orderId
 * amount
 * currency
 *
 * IMPORTANT:
 * amount is returned by Razorpay in PAISE.
 */
const CREATE_ORDER = gql`
  mutation CreateOrder($input: CreateOrderInput!) {
    createOrder(input: $input) {
      success
      orderId
      amount
      currency
    }
  }
`;

export default function PayOPT({
  type,
  amount,
  oriamount,
  coupon_code,
  coupon_id,
  couponprice,
  coupon_type,
  cashback,
  packid,
  bookingId,
}) {
  /*
   * =========================================================
   * GEO INFORMATION
   * =========================================================
   */
  const [geoInfo, setGeoInfo] = useState({
    ip: "",
    city: "",
    state: "",
    country: "",
  });

  /*
   * =========================================================
   * PAYMENT LOADING
   * =========================================================
   */
  const [loading, setLoading] = useState(false);

  /*
   * =========================================================
   * USER
   * =========================================================
   */
  const [user, setUserData] = useState(null);

  const route = useRouter();

  /*
   * =========================================================
   * GEO INFORMATION
   * =========================================================
   */
  useEffect(() => {
    const getGeo = async () => {
      try {
        const res = await fetch(
          "https://ipapi.co/json/",
        );

        const data = await res.json();

        setGeoInfo({
          ip: data.ip || "",
          city: data.city || "",
          state: data.region || "",
          country:
            data.country_name || "",
        });
      } catch (err) {
        console.error(
          "Geo fetch failed",
          err,
        );
      }
    };

    getGeo();
  }, []);

  /*
   * =========================================================
   * CREATE RECHARGE ORDER
   * =========================================================
   */
  const [createOrder] =
    useMutation(CREATE_ORDER);

  /*
   * =========================================================
   * CREATE HEALING ORDER
   * =========================================================
   */
  const [createHealingOrder] =
    useMutation(CREATE_HEALING_ORDER);

  /*
   * =========================================================
   * PAYMENT AMOUNT
   * =========================================================
   *
   * For SERVICE:
   *
   * page.js
   *   ↓
   * VERIFY_SERVICE_COUPON
   *   ↓
   * payableAmount
   *   ↓
   * PayOPT
   *
   * Therefore PayOPT does NOT verify coupon again.
   */
  const payAmount = Number(
    amount || 0,
  );

  /*
   * =========================================================
   * CHECKOUT
   * =========================================================
   */
  const handleCheckout = async () => {
    try {
      setLoading(true);

      let order;

      /*
       * =====================================================
       * RECHARGE
       * =====================================================
       */
      if (type === "RECHARGE") {
        /*
         * Backend handles recharge coupon validation.
         *
         * The backend CreateOrder response is:
         *
         * {
         *   success,
         *   orderId,
         *   amount,     // Razorpay amount in paise
         *   currency
         * }
         */
        const result =
          await createOrder({
            variables: {
              input: {
                rechargePackId:
                  packid,

                coupan_code:
                  coupon_code || "",
              },
            },
          });

        order =
          result?.data?.createOrder;

        console.log(
          "Recharge order result:",
          result,
        );
      }

      /*
       * =====================================================
       * SERVICE / HEALING
       * =====================================================
       */
      else if (
        type === "SERVICE"
      ) {
        /*
         * IMPORTANT:
         *
         * Coupon has ALREADY been verified
         * inside service page.js when user clicked
         * Apply Coupon.
         *
         * Therefore:
         *
         * DO NOT call VERIFY_SERVICE_COUPON here.
         */

        if (!bookingId) {
          throw new Error(
            "Booking ID is required",
          );
        }

        const result =
          await createHealingOrder({
            variables: {
              input: {
                bookingId:
                  bookingId,

                /*
                 * This is the amount already
                 * calculated after coupon verification.
                 */
                amount:
                  payAmount,

                /*
                 * Send the verified coupon code.
                 */
                couponCode:
                  coupon_code || "",
              },
            },
          });

        order =
          result?.data
            ?.createHealingOrder;

        console.log(
          "Healing order result:",
          result,
        );
      }

      /*
       * =====================================================
       * UNKNOWN PAYMENT TYPE
       * =====================================================
       */
      else {
        throw new Error(
          `Unsupported payment type: ${type}`,
        );
      }

      /*
       * =====================================================
       * CHECK ORDER
       * =====================================================
       */
      if (!order?.success) {
        toast.error(
          order?.message ||
            "Error creating order",
        );

        setLoading(false);

        return;
      }

      /*
       * =====================================================
       * RAZORPAY AMOUNT
       * =====================================================
       *
       * IMPORTANT FOR RECHARGE:
       *
       * Backend returns:
       *
       * order.amount = Razorpay amount in PAISE
       *
       * Example:
       *
       * ₹531
       * ↓
       * 53100 paise
       *
       * Therefore DO NOT multiply order.amount by 100.
       */
      let razorpayAmount;

      if (type === "RECHARGE") {
        razorpayAmount = Number(
          order.amount || 0,
        );
      } else {
        /*
         * Keep SERVICE handling based on the
         * existing healing-order response.
         *
         * If healing backend returns amount in paise,
         * this value should be used directly.
         */
        razorpayAmount = Number(
          order.amount || 0,
        );
      }

      /*
       * =====================================================
       * VALIDATE RAZORPAY AMOUNT
       * =====================================================
       */
      if (
        !razorpayAmount ||
        razorpayAmount <= 0
      ) {
        throw new Error(
          "Invalid payment amount received from server",
        );
      }

      /*
       * =====================================================
       * RAZORPAY OPTIONS
       * =====================================================
       */
      const options = {
        key:
          process.env
            .NEXT_PUBLIC_RAZORPAY_KEY_ID,

        /*
         * IMPORTANT:
         *
         * order.amount is already in PAISE.
         *
         * DO NOT:
         *
         * Math.round(razorpayAmount * 100)
         *
         * because that would multiply the amount twice.
         */
        amount:
          razorpayAmount,

        currency:
          order.currency || "INR",

        order_id:
          order.orderId,

        name:
          "Dhwani Astro LLP",

        description:
          type === "RECHARGE"
            ? "Wallet Recharge"
            : "Healing Service",

        prefill: {
          name: "",
          email: "",
          contact: "",
        },

        /*
         * ===================================================
         * RAZORPAY NOTES
         * ===================================================
         */
        notes:
          type === "RECHARGE"
            ? {
                userId:
                  user?.id || "",

                rechargePackId:
                  packid,

                couponId:
                  coupon_id || "",

                couponCode:
                  coupon_code || "",

                couponType:
                  coupon_type || "",

                /*
                 * These values come from the frontend
                 * coupon calculation/display.
                 *
                 * Backend createOrder does NOT return
                 * originalAmount or discount anymore.
                 */
                originalAmount:
                  Number(
                    oriamount || 0,
                  ),

                discount:
                  Number(
                    couponprice || 0,
                  ),

                cashback:
                  Number(
                    cashback || 0,
                  ),

                /*
                 * Convert Razorpay paise to INR
                 * only for the note value.
                 *
                 * Example:
                 * 53100 paise / 100 = ₹531
                 */
                finalAmount:
                  razorpayAmount / 100,

                ipAddress:
                  geoInfo.ip,

                state:
                  geoInfo.state,

                city:
                  geoInfo.city,

                country:
                  geoInfo.country,

                platform:
                  "WEB",
              }
            : {
                userId:
                  user?.id || "",

                bookingId:
                  bookingId,

                couponId:
                  coupon_id || "",

                couponCode:
                  coupon_code || "",

                couponType:
                  coupon_type || "",

                discount:
                  Number(
                    couponprice || 0,
                  ),

                cashback:
                  Number(
                    cashback || 0,
                  ),

                originalAmount:
                  Number(
                    oriamount || 0,
                  ),

                /*
                 * Service order amount is assumed
                 * to be returned in paise as well.
                 */
                finalAmount:
                  razorpayAmount / 100,

                ipAddress:
                  geoInfo.ip,

                state:
                  geoInfo.state,

                city:
                  geoInfo.city,

                country:
                  geoInfo.country,

                platform:
                  "WEB",
              },

        /*
         * ===================================================
         * PAYMENT SUCCESS
         * ===================================================
         *
         * Actual payment success should be confirmed
         * by Razorpay/backend webhook.
         *
         * This handler only redirects UI.
         */
        handler:
          async function (
            response,
          ) {
            console.log(
              "Razorpay payment response:",
              response,
            );

            toast.success(
              "Payment Successful",
            );

            route.push("/");
          },

        /*
         * ===================================================
         * PAYMENT CANCEL
         * ===================================================
         */
        modal: {
          ondismiss:
            function () {
              setLoading(false);

              toast.error(
                "Payment Cancelled",
              );
            },
        },

        /*
         * ===================================================
         * RAZORPAY THEME
         * ===================================================
         */
        theme: {
          color: "#fff49e",
        },
      };

      /*
       * =====================================================
       * STOP OUR LOADING
       * =====================================================
       *
       * Razorpay itself now handles payment loading.
       */
      setLoading(false);

      /*
       * =====================================================
       * BROWSER CHECK
       * =====================================================
       */
      if (
        typeof window ===
        "undefined"
      ) {
        throw new Error(
          "Browser window not available",
        );
      }

      /*
       * =====================================================
       * RAZORPAY SDK CHECK
       * =====================================================
       */
      if (!window.Razorpay) {
        throw new Error(
          "Razorpay SDK is not loaded yet. Please try again.",
        );
      }

      /*
       * =====================================================
       * OPEN RAZORPAY
       * =====================================================
       */
      const razor =
        new window.Razorpay(
          options,
        );

      razor.open();
    } catch (error) {
      console.error(
        "Checkout Error:",
        error,
      );

      setLoading(false);

      toast.error(
        error?.message ||
          "Payment failed",
      );
    }
  };

  /*
   * =========================================================
   * RENDER
   * =========================================================
   */
  return (
    <div className="col-span-2">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />

      <h3 className="mb-4 text-base font-bold text-center sm:text-lg">
        Payment Options
      </h3>

      {loading && (
        <div className="text-center text-purple-600 font-semibold mb-3">
          Processing payment...
        </div>
      )}

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          {
            name: "Paytm",
            icon: "/prblm/pa-1.png",
          },
          {
            name: "Freecharge",
            icon: "/prblm/pa-2.png",
          },
          {
            name: "MobiKwik",
            icon: "/prblm/pa-4n.png",
          },
          {
            name: "Credit/Debit Card",
            icon: "/prblm/pc-a.png",
          },
          {
            name: "Net Banking",
            icon: "/prblm/pa-5.png",
          },
          {
            name: "Rupay UPI",
            icon: "/prblm/pa-6.png",
          },
          {
            name: "GooglePay",
            icon: "/prblm/pg-a.png",
          },
          {
            name: "PhonePay",
            icon: "/prblm/ph-a.png",
          },
          {
            name: "Bhim UPI",
            icon: "/prblm/bh-a.png",
          },
        ].map(
          (method, idx) => (
            <button
              type="button"
              aria-label={`Pay with ${method.name}`}
              disabled={loading}
              onClick={
                handleCheckout
              }
              key={idx}
              className="bg-[linear-gradient(to_right,#a65ed677_54%,#ba38cb67_100%)] rounded-lg p-2 flex flex-col gap-1 items-center hover:scale-105 transition-transform shadow disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Image
                src={method.icon}
                alt={method.name}
                width={100}
                height={100}
                className="sm:h-8 sm:w-10.5 h-5.7 w-7"
              />

              <span className="text-xs font-semibold text-center text-white sn:font-bold">
                {method.name}
              </span>
            </button>
          ),
        )}
      </div>
    </div>
  );
}
