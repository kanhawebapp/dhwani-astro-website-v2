"use client";
import CustomInput from "@/components/Custom/CustomInput";
import CustomButton from "@/components/Custom/CustomButton";
import { useRouter } from "next/navigation";
import { usePathname } from "next/navigation";

import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { validateEmail, validatePhone } from "@/app/helper/validation";
import { encryptData } from "@/app/helper/cryptoHelper";
import {
  CREATE_SERVICE_BOOKING,
  GET_ASTROLOGERS_USER,
  UPDATE_BOOKING_ASTROLOGER,
} from "@/app/graphql/gqlQuery";
import { useMutation, useQuery } from "@apollo/client/react";
import Selectastro from "@/components/Healing/Selectastro";
import { gql } from "@apollo/client";
import Script from "next/script";
export default function Forminp({
  formDat,
  setformDat,
  onClose,
  pagedata,
  page_name,
}) {
  const router = useRouter();
  const pathname = usePathname();

  const pageContent = pagedata || null;
  const [showAstroModal, setShowAstroModal] = useState(false);
  const [creatingOrder, setCreatingOrder] = useState(false);
  const [bookingId, setBookingId] = useState(null);
  const [paymentData, setPaymentData] = useState(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("ONLINE");
  // ONLINE | WALLET
  const { data: astroData, loading: astroLoading } = useQuery(
    GET_ASTROLOGERS_USER,
    {
      variables: {
        searchInput: {
          page: 1,
          limit: 20,
        },
      },
      skip: !showAstroModal,
    },
  );


  const CREATE_HEALING_ORDER = gql`
    mutation CreateHealingOrder($bookingId: ID!, $useWallet: Boolean!) {
      createHealingOrder(bookingId: $bookingId, useWallet: $useWallet) {
        success
        orderId
        bookingId
        currency
        totalAmount
        walletAmount
        payableAmount
      }
    }
  `;

  const GET_USER_WALLET = gql`
    query GetUserWallet {
      getUserWallet {
        balanceCoins
        lockedCoins
      }
    }
  `;
  const CONFIRM_WALLET_BOOKING = gql`
  mutation ConfirmWalletBooking(
    $bookingId: ID!
    $astrologerId: ID!
    $walletAmount: Float!
  ) {
    confirmWalletBooking(
      bookingId: $bookingId
      astrologerId: $astrologerId
      walletAmount: $walletAmount
    ) {
      success
      message
      booking {
        id
        bookingStatus
        paymentStatus
      }
    }
  }
`;
  const [createHealingOrder] = useMutation(CREATE_HEALING_ORDER);
  const { data: walletData } = useQuery(GET_USER_WALLET);

  const [createBooking, { loading: bookingLoading }] = useMutation(
    CREATE_SERVICE_BOOKING,
  );
  const [updateBookingAstrologer] = useMutation(UPDATE_BOOKING_ASTROLOGER);
  const [confirmWalletBooking] = useMutation(CONFIRM_WALLET_BOOKING);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setformDat((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validatePhone(formDat.num)) {
      toast.error("Please enter a valid phone number");
      return;
    }

    if (!validateEmail(formDat.mail)) {
      toast.error("Please enter a valid email");
      return;
    }

    if (
      formDat.name === "" ||
      formDat.dob === "" ||
      formDat.tob === "" ||
      formDat.pob === "" ||
      formDat.mail === "" ||
      formDat.num === "" ||
      formDat.gender === "" ||
      formDat.txt === ""
    ) {
      toast.error("Please fill all required fields");
      return;
    }

    try {
      const { data } = await createBooking({
        variables: {
          input: {
            serviceId: pageContent.id,

            name: formDat.name,
            email: formDat.mail,
            phone: formDat.num,

            dob: formDat.dob,
            tob: formDat.tob,
            pob: formDat.pob,

            gender: formDat.gender,

            concern: formDat.txt,
          },
        },
      });

      const booking = data?.createServiceBooking;

      setBookingId(booking.id);
      setShowAstroModal(true);
    } catch (err) {
      toast.error(err.message);
    }
  };

  
  const handleAstrologerSelect = async (astrologer) => {
    try {
      const { data } = await updateBookingAstrologer({
        variables: {
          bookingId,
          astrologerId: astrologer.id,
        },
      });

      const booking = data?.updateBookingAstrologer;

      setShowAstroModal(false); // add this

      setPaymentData({
        bookingId: booking.id,
        astrologerId: astrologer.id,
        totalAmount: booking.amount || pageContent.price,
        walletBalance: walletData?.getUserWallet?.balanceCoins || 0,
      });

      setShowPaymentModal(true);
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handlePaymentMethodContinue = async () => {
    try {
      
      setCreatingOrder(true);

      const orderRes = await createHealingOrder({
        variables: {
          bookingId: paymentData.bookingId,
          useWallet: paymentMethod === "WALLET",
        },
      });

      const order = orderRes?.data?.createHealingOrder;

      if (!order) {
        toast.error("Failed to create order");
        return;
      }

     if (order.payableAmount <= 0) {
  const walletUsed =
    Number(order.walletAmount || 0);

  const confirmRes = await confirmWalletBooking({
    variables: {
      bookingId: paymentData.bookingId,
      astrologerId: paymentData.astrologerId,
      walletAmount: walletUsed,
    },
  });

  if (
    confirmRes?.data?.confirmWalletBooking?.success
  ) {
    toast.success(
      confirmRes.data.confirmWalletBooking.message ||
        "Booking Confirmed"
    );

   // router.push("/payment-success");
  } else {
    toast.error("Failed to confirm booking");
  }

  return;
}

      handleRazorpay(order);
    } catch (err) {
      toast.error(err.message);
    } finally {
      setCreatingOrder(false);
    }
  };
 const handleRazorpay = (order) => {
  try {
    if (!window.Razorpay) {
      toast.error("Razorpay SDK not loaded");
      return;
    }


    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

      amount: Number(order.payableAmount) * 100,

      currency: order.currency || "INR",

      name: "Dhwani Astro LLP",

      description: "Healing Service Payment",

      order_id: order.orderId,

      notes: {
        bookingId: paymentData.bookingId,
        astrologerId: paymentData.astrologerId,
        serviceType: "SERVICE",
      },

      handler: async function (response) {

        toast.success("Payment Successful");

        router.push("/payment-success");
      },

      modal: {
        ondismiss: function () {
          toast.error("Payment Cancelled");
        },
      },

      theme: {
        color: "#C89B3C",
      },
    };

    const razorpay = new window.Razorpay(options);

    razorpay.on("payment.failed", function (response) {
      console.error("Payment Failed", response.error);

      toast.error(response.error.description);
    });

    razorpay.open();
  } catch (error) {
    console.error("Razorpay Error", error);
    toast.error("Unable to open payment gateway");
  }
};
  

  return (
    <>
      <div
        className={`flex text-black flex-col w-full border border-gray-100 bg-white max-w-5xl shadow-lg rounded-2xl px-4 py-5
        ${pathname.startsWith("/inHealing") ? "mt-0 " : "mt-30"} `}
      >
        <Script
          src="https://checkout.razorpay.com/v1/checkout.js"
          strategy="afterInteractive"
        />
        <div className="flex items-center justify-between ">
          <h5 className="text-xl place-self-center  font-semibold text-black justify-center text-center py-2">
            Basic Details :
          </h5>
          <div className="flex ">
            <button aria-label="Close Form" type="button" onClick={onClose}>
              <svg
                fill="#000000"
                width={25}
                height={25}
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path d="m20.48 3.512c-2.172-2.171-5.172-3.514-8.486-3.514-6.628 0-12.001 5.373-12.001 12.001 0 3.314 1.344 6.315 3.516 8.487 2.172 2.171 5.172 3.514 8.486 3.514 6.628 0 12.001-5.373 12.001-12.001 0-3.314-1.344-6.315-3.516-8.487zm-1.542 15.427c-1.777 1.777-4.232 2.876-6.943 2.876-5.423 0-9.819-4.396-9.819-9.819 0-2.711 1.099-5.166 2.876-6.943 1.777-1.777 4.231-2.876 6.942-2.876 5.422 0 9.818 4.396 9.818 9.818 0 2.711-1.099 5.166-2.876 6.942z" />
                <path d="m13.537 12 3.855-3.855c.178-.194.287-.453.287-.737 0-.603-.489-1.091-1.091-1.091-.285 0-.544.109-.738.287l.001-.001-3.855 3.855-3.855-3.855c-.193-.178-.453-.287-.737-.287-.603 0-1.091.489-1.091 1.091 0 .285.109.544.287.738l-.001-.001 3.855 3.855-3.855 3.855c-.218.2-.354.486-.354.804 0 .603.489 1.091 1.091 1.091.318 0 .604-.136.804-.353l.001-.001 3.855-3.855 3.855 3.855c.2.218.486.354.804.354.603 0 1.091-.489 1.091-1.091 0-.318-.136-.604-.353-.804l-.001-.001z" />
              </svg>
            </button>
          </div>
        </div>
        <form onSubmit={handleSubmit} className="flex flex-col">
          <div className="space-y-2 grid md:grid-cols-2 place-content-center px-5 gap-5">
            <div className="flex flex-col items-start justify-between">
              <CustomInput
                name="name"
                label="Your Name"
                type="text"
                placeholder="Write your good name"
                value={formDat.name}
                onChange={handleChange}
                bgredcolor="white"
                className="w-[100%] md:w-[80%] "
              />
            </div>

            <div className="flex flex-col items-start justify-between">
              <CustomInput
                name="dob"
                label="  Date of Birth"
                type="date"
                value={formDat.dob}
                onChange={handleChange}
                bgredcolor="white"
                required
                className="w-[100%] md:w-[80%] "
              />
            </div>

            <div className="flex flex-col items-start justify-between">
              <CustomInput
                name="tob"
                label="Time of Birth"
                type="time"
                value={formDat.tob}
                onChange={handleChange}
                bgredcolor="white"
                required
                className="w-[100%] md:w-[80%] "
              />
            </div>

            <div className="flex flex-col items-start ">
              <CustomInput
                name="pob"
                label=" Place of Birth"
                type="text"
                value={formDat.pob}
                onChange={handleChange}
                bgredcolor="white"
                required
                className="w-[100%] md:w-[80%] "
                placeholder="Write City/Town, State, Country of Birth"
              />
            </div>

            <div className="flex flex-col  items-start ">
              <CustomInput
                name="mail"
                label=" Email Address"
                type="email"
                value={formDat.mail}
                onChange={handleChange}
                bgredcolor="white"
                required
                className="w-[100%] md:w-[80%] "
                placeholder="Enter your email address"
              />
            </div>
            <div className="flex flex-col">
              <label className="block text-gray-700  text-sm md:text-sm mb-1">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="flex gap-2">
                <select className="border border-gray-600 h-auto  rounded-l-md p-1 text-base bg-white w-15 mb-1">
                  <option value="+91">IN</option>
                </select>
                <CustomInput
                  name="num"
                  type="tel"
                  value={formDat.num}
                  pattern="[0-9]{10}"
                  onChange={handleChange}
                  bgredcolor="white"
                  required
                  className="w-[100%] md:w-[80%] rounded-l-md "
                  placeholder="123456789"
                />
              </div>
            </div>

            <div className="space-y-2 text-sm md:text-sm">
              <label className="block text-gray-700 font-semibold text-sm md:text-sm mb-1">
                Gender <span className="text-red-500">*</span>
              </label>
              <div className="flex text-black flex-col gap-2">
                {["Male", "Female", "Others"].map((gender) => (
                  <label key={gender} className="flex items-center gap-2">
                    <input
                      name="gender"
                      value={gender}
                      checked={formDat.gender === gender}
                      onChange={(e) =>
                        setformDat({
                          ...formDat,
                          gender: e.target.value,
                        })
                      }
                      type="radio"
                    />

                    {gender}
                  </label>
                ))}
              </div>
            </div>

            <div className="flex flex-col text-sm md:text-sm">
              <label className="block text-gray-700 font-semibold text-sm md:text-sm mb-1">
                Your Detailed Concern <span className="text-red-500">*</span>
              </label>
              <textarea
                value={formDat.txt}
                onChange={(e) =>
                  setformDat({ ...formDat, txt: e.target.value })
                }
                rows="4"
                className=" placeholder:text-sm border border-gray-300 text-black  rounded-md p-1"
                placeholder="Enter your text here....."
              ></textarea>
            </div>
          </div>

          <CustomButton type="submit" disabled={bookingLoading || astroLoading}>
            {bookingLoading ? "Processing..." : "Continue"}
          </CustomButton>
        </form>

        <Selectastro
          open={showAstroModal}
          astrologers={astroData?.getAstrologerListForUser?.data || []}
          loading={astroLoading}
          onSelect={handleAstrologerSelect}
          onClose={() => setShowAstroModal(false)}
        />
      </div>
      {showPaymentModal && paymentData && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-md p-6 shadow-2xl">
            <h2 className="text-2xl font-bold text-center mb-5">
              Choose Payment Method
            </h2>

            <div className="bg-gray-50 rounded-xl p-4 mb-5">
              <div className="flex justify-between">
                <span>Service Amount</span>
                <span className="font-semibold">
                  ₹{paymentData.totalAmount}
                </span>
              </div>

              <div className="flex justify-between mt-2 text-green-600">
                <span>Wallet Balance</span>
                <span>₹{paymentData.walletBalance}</span>
              </div>
            </div>

            <div className="space-y-3">
              <label className="border rounded-xl p-4 flex gap-3 cursor-pointer">
                <input
                  type="radio"
                  checked={paymentMethod === "WALLET"}
                  onChange={() => setPaymentMethod("WALLET")}
                />

                <div>
                  <p className="font-semibold">Wallet + Online Payment</p>

                  <p className="text-sm text-green-600">
                    Available ₹{paymentData.walletBalance}
                  </p>
                  {paymentMethod === "WALLET" && (
                    <div className="mt-2 text-xs text-green-600">
                      Wallet balance will be used first. Remaining amount will
                      be collected online.
                    </div>
                  )}
                </div>
              </label>

              <label
                className={`border rounded-xl p-4 flex gap-3 ${
                  paymentData.walletBalance <= 0
                    ? "opacity-50 cursor-not-allowed"
                    : "cursor-pointer"
                }`}
              >
                <input
                  type="radio"
                  checked={paymentMethod === "ONLINE"}
                  onChange={() => setPaymentMethod("ONLINE")}
                />

                <div>
                  <p className="font-semibold">Pay Online</p>

                  <p className="text-sm text-gray-500">
                    UPI • Cards • Net Banking
                  </p>
                </div>
              </label>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPaymentModal(false)}
                className="flex-1 border rounded-xl py-3"
              >
                Cancel
              </button>

              <button
                disabled={creatingOrder}
                onClick={handlePaymentMethodContinue}
                className="flex-1 bg-[#C89B3C] text-white rounded-xl py-3 disabled:opacity-50"
              >
                {creatingOrder ? "Processing..." : "Continue"}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
