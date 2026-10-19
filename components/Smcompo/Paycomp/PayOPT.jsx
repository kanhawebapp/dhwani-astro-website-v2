"use client";

import Image from "next/image";
import Script from "next/script";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { useRouter } from "next/navigation";
import { useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";

import { CREATE_HEALING_ORDER } from "@/app/graphql/gqlQuery";

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

export const CREATE_PUJA_ORDER = gql`
  mutation CreatePujaOrder($input: CreatePujaOrderInput!) {
    createPujaOrder(input: $input) {
      success
      message
      orderId
      amount
      currency
      bookingId
      pujaTitle
      totalAmount
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
  pujaName,
}) {
  console.log(
    "xxxxxxxxxxxxxxxxxxxxxx",
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
    pujaName,
  );

  const [geoInfo, setGeoInfo] = useState({
    ip: "",
    city: "",
    state: "",
    country: "",
  });

  const [loading, setLoading] = useState(false);

  const [user, setUserData] = useState(null);

  const route = useRouter();

  useEffect(() => {
    const getGeo = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");

        const data = await res.json();

        setGeoInfo({
          ip: data.ip || "",
          city: data.city || "",
          state: data.region || "",
          country: data.country_name || "",
        });
      } catch (err) {
        console.error("Geo fetch failed", err);
      }
    };

    getGeo();
  }, []);

  const [createOrder] = useMutation(CREATE_ORDER);

  const [createHealingOrder] = useMutation(CREATE_HEALING_ORDER);

  const [createPujaOrder] = useMutation(CREATE_PUJA_ORDER);
  console.log("sssssssssssssssssssssssssssssss", amount, oriamount);
  const payAmount = Number(oriamount || 0);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      let order;

      if (type === "RECHARGE") {
        const result = await createOrder({
          variables: {
            input: {
              rechargePackId: packid,

              coupan_code: coupon_code || "",
            },
          },
        });

        order = result?.data?.createOrder;
        console.log("order------recharge----", order);
        console.log("Recharge order result:", result);
      } else if (type === "PUJA") {
        if (!bookingId) {
          throw new Error("Booking ID is required");
        }

        const result = await createPujaOrder({
          variables: {
            input: {
              bookingId: bookingId,
              couponCode: coupon_code || "",
            },
          },
        });

        order = result?.data?.createPujaOrder;

        console.log("puja order result:", result);

        console.log("puja order order:", order);
      } else if (type === "SERVICE") {
        if (!bookingId) {
          throw new Error("Booking ID is required");
        }

        const result = await createHealingOrder({
          variables: {
            input: {
              bookingId: bookingId,

              amount: payAmount,

              couponCode: coupon_code || "",
            },
          },
        });

        order = result?.data?.createHealingOrder;

        console.log("Healing order result:", result);

        console.log("Healing order order:", order);
      } else {
        throw new Error(`Unsupported payment type: ${type}`);
      }

      if (!order?.success) {
        toast.error(order?.message || "Error creating order");

        setLoading(false);

        return;
      }

      let razorpayAmount;

      if (type === "RECHARGE") {
        razorpayAmount = Number(order.amount || 0);
      } else {
        razorpayAmount = Number(order.amount || 0);
      }

      if (!razorpayAmount || razorpayAmount <= 0) {
        throw new Error("Invalid payment amount received from server");
      }

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

        amount: razorpayAmount,

        currency: order.currency || "INR",

        order_id: order.orderId,

        name: "Dhwani Astro LLP",

        description:
          type === "RECHARGE" ? "Wallet Recharge" : "Healing Service",

        prefill: {
          name: "",
          email: "",
          contact: "",
        },

        notes:
          type === "RECHARGE"
            ? {
                userId: user?.id || "",

                rechargePackId: packid,

                couponId: coupon_id || "",

                couponCode: coupon_code || "",

                couponType: coupon_type || "",

                originalAmount: Number(oriamount || 0),

                discount: Number(couponprice || 0),

                cashback: Number(cashback || 0),

                finalAmount: razorpayAmount / 100,

                ipAddress: geoInfo.ip,

                state: geoInfo.state,

                city: geoInfo.city,

                country: geoInfo.country,

                platform: "WEB",
              }
            : {
                userId: user?.id || "",

                bookingId: bookingId,

                couponId: coupon_id || "",

                couponCode: coupon_code || "",

                couponType: coupon_type || "",

                discount: Number(couponprice || 0),

                cashback: Number(cashback || 0),

                originalAmount: Number(oriamount || 0),

                /*
                 * Service order amount is assumed
                 * to be returned in paise as well.
                 */
                finalAmount: razorpayAmount / 100,

                ipAddress: geoInfo.ip,

                state: geoInfo.state,

                city: geoInfo.city,

                country: geoInfo.country,

                platform: "WEB",
              },

        handler: async function (response) {
          console.log("Razorpay payment response:", response);

          toast.success("Payment Successful");

          route.push("/");
        },

        modal: {
          ondismiss: function () {
            setLoading(false);

            toast.error("Payment Cancelled");
          },
        },

        theme: {
          color: "#fff49e",
        },
      };

      setLoading(false);

      if (typeof window === "undefined") {
        throw new Error("Browser window not available");
      }

      if (!window.Razorpay) {
        throw new Error("Razorpay SDK is not loaded yet. Please try again.");
      }

      const razor = new window.Razorpay(options);

      razor.open();
    } catch (error) {
      console.error("Checkout Error:", error);

      setLoading(false);

      toast.error(error?.message || "Payment failed");
    }
  };

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
        ].map((method, idx) => (
          <button
            type="button"
            aria-label={`Pay with ${method.name}`}
            disabled={loading}
            onClick={handleCheckout}
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
        ))}
      </div>
    </div>
  );
}
