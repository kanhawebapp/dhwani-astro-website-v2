"use client";

import Image from "next/image";
import Script from "next/script";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AlertLoading } from "../../../app/common";
import { useRouter, useSearchParams } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";
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

export default function PayOPT({
  type,
  amount,
  oriamount,
  coupon_code,
  packid,
  bookingId,
}) {
  const [geoInfo, setGeoInfo] = useState({
    ip: "",
    city: "",
    state: "",
    country: "",
  });
  useEffect(() => {
    const getGeo = async () => {
      try {
        const res = await fetch("https://ipapi.co/json/");
        const data = await res.json();
        console.log("ghjghjgjhjg", data);

        setGeoInfo({
          ip: data.ip,
          city: data.city,
          state: data.region,
          country: data.country_name,
        });
      } catch (err) {
        console.error("Geo fetch failed", err);
      }
    };

    getGeo();
  }, []);
  const searchParams = useSearchParams();

  const payAmount = amount || 0;

  const { statusCode } = useSelector((state) => state.recharge_payment);

  const { userData } = useSelector((state) => state.getuserDetail);

  const [user, setUserData] = useState("");

  const route = useRouter();

  const [loading, setLoading] = useState(false);

  const [createOrder] = useMutation(CREATE_ORDER);

  const [createHealingOrder] = useMutation(CREATE_HEALING_ORDER);

  useEffect(() => {
    if (userData) {
      setUserData(userData);
    }
  }, [userData]);

  useEffect(() => {}, [oriamount]);

  useEffect(() => {
    if (statusCode === 200) {
      setLoading(false);

      toast.success("Payment Add successfully!");

      route.push("/chat-with-astrologer");
    }
  }, [statusCode]);

  const handleCheckout = async () => {
    try {
      setLoading(true);

      let order;

      if (type === "RECHARGE") {
        const { data } = await createOrder({
          variables: {
            input: {
              rechargePackId: packid,
              coupan_code: coupon_code || "",
            },
          },
        });

        order = data.createOrder;
      } else {
        const { data } = await createHealingOrder({
          variables: {
            input: {
              bookingId,
              couponCode: coupon_code || "",
                amount: payAmount,
            },
          },
        });

        order = data.createHealingOrder;
      }

      console.log("GraphQL Order:", order);

      if (!order?.success) {
        toast.error("Error creating order");

        setLoading(false);

        return;
      }

      const options = {
        key:
          process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_3zT42YgMgCfOim",

       amount: order.payableAmount * 100,
        currency: order.currency,
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
                couponCode: coupon_code || "testing",
                originalAmount: order.originalAmount,
                discount: order.discount,
                finalAmount: order.finalAmount,
                ipAddress: geoInfo.ip,
                state: geoInfo.state,
                city: geoInfo.city,
                country: geoInfo.country,
                platform:"WEB",
              }
            : {
                userId: user.id,
                bookingId,
              },
        handler: async function (response) {
          if (type === "RECHARGE") {
            route.push("/");
          }
          if (type === "SERVICE") {
            route.push("/");
          }
          console.log("Razorpay Response:", response);

          toast.success("Payment Successful");
        },

        modal: {
          ondismiss: function () {
            toast.error("Payment Cancelled");
          },
        },

        theme: {
          color: "#fff49e",
        },
      };

      setLoading(false);

      const razor = new window.Razorpay(options);

      razor.open();
    } catch (error) {
      console.error("Checkout Error:", error);

      setLoading(false);

      toast.error(error.message || "Payment failed");
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

      <div className="grid grid-cols-3 gap-3 sm:gap-4">
        {[
          { name: "Paytm", icon: "/prblm/pa-1.png" },
          { name: "Freecharge", icon: "/prblm/pa-2.png" },
          { name: "MobiKwik", icon: "/prblm/pa-4n.png" },
          { name: "Credit/Debit Card", icon: "/prblm/pc-a.png" },
          { name: "Net Banking", icon: "/prblm/pa-5.png" },
          { name: "Rupay UPI", icon: "/prblm/pa-6.png" },
          { name: "GooglePay", icon: "/prblm/pg-a.png" },
          { name: "PhonePay", icon: "/prblm/ph-a.png" },
          { name: "Bhim UPI", icon: "/prblm/bh-a.png" },
        ].map((method, idx) => (
          <button
            aria-label={`Pay with ${method.name}`}
            onClick={handleCheckout}
            key={idx}
            className="bg-[linear-gradient(to_right,#a65ed677_54%,#ba38cb67_100%)] rounded-lg p-2 flex flex-col gap-1 items-center hover:scale-105 transition-transform shadow"
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

        <AlertLoading show={loading} title="Please Waiting..." />
      </div>
    </div>
  );
}
