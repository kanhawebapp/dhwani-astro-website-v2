"use client";

import { useParams, useSearchParams } from "next/navigation";
import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";
import PayOPT from "@/components/Smcompo/Paycomp/PayOPT";
import { GET_COUPONS, GET_SERVICE_BOOKING } from "@/app/graphql/gqlQuery";
import { useState } from "react";
import Swal from "sweetalert2";

export default function CartPage() {
  const searchParams = useSearchParams();
  const params = useParams();


  const bookingId = params.bookingId;


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

  const [couponCode, setCouponCode] = useState("");
  const [selectedCoupon, setSelectedCoupon] = useState(null);
  const [showCouponModal, setShowCouponModal] = useState(false);

  const { data: couponData } = useQuery(GET_COUPONS);

  const applyCouponByCode = () => {
    const code = couponCode.trim().toUpperCase();

    if (!code) {
      Swal.fire({
        icon: "warning",
        title: "Enter Coupon Code",
      });
      return;
    }

    const coupon = couponData?.getCoupons?.find(
      (item) => item.code.toUpperCase() === code,
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

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error || !booking) {
    return <div>Booking not found</div>;
  }

  const amount = Number(booking.amount);

  const gstAmount = (amount * 18) / 100;

  const totalBeforeDiscount = amount + gstAmount;

  let discountAmount = 0;

  if (selectedCoupon) {
    if (selectedCoupon.type === "FLAT") {
      discountAmount = selectedCoupon.flatAmount;
    } else {
      discountAmount = (totalBeforeDiscount * selectedCoupon.percentage) / 100;

      if (
        selectedCoupon.maxDiscount &&
        discountAmount > selectedCoupon.maxDiscount
      ) {
        discountAmount = selectedCoupon.maxDiscount;
      }
    }

    discountAmount = Math.min(discountAmount, totalBeforeDiscount);
  }

  const finalAmount = totalBeforeDiscount - discountAmount;
  const closeCoup = () => {
    setShowCouponModal(false);
  };
  const applyCoupon = (coupon) => {
    if (coupon.minOrderAmount && totalBeforeDiscount < coupon.minOrderAmount) {
      Swal.fire({
        icon: "error",
        title: "Coupon not applicable",
        text: `Minimum order amount should be ₹${coupon.minOrderAmount}`,
      });
      return;
    }
    const now = new Date();

    if (new Date(coupon.startDate) > now || new Date(coupon.endDate) < now) {
      Swal.fire({
        icon: "error",
        title: "Coupon expired",
      });
      return;
    }

    setSelectedCoupon(coupon);
    setShowCouponModal(false);

    Swal.fire({
      icon: "success",
      title: "Congratulations 🎉",
      text: `Coupon ${coupon.code} applied successfully.`,
      confirmButtonColor: "#7c3aed",
    });
  };

  return (
    <div className="text-gray-500 lg:w-[80%] w-full md:p-4 p-2 bg-white rounded-xl shadow-md flex flex-col gap-3 my-4 sm:my-8 place-self-center">
      <div className="grid grid-cols-1 w-full sm:gap-6 md:grid-cols-3">
        <div className="p-4 shadow-xl w-full mb-5 sm:mb-0 rounded-xl bg-white">
          <h3 className="bg-gradient-to-r text-sm sm:text-md text-center from-purple-400 to-purple-600 py-2 px-3 text-white rounded-lg font-bold mb-4">
            Dhwani Services Payment
          </h3>

          <div className="sm:space-y-3 space-y-2 text-sm sm:text-md w-full text-black">
            <div className="flex justify-between">
              <span>Item</span>
              <span className="font-semibold">{booking.service.name}</span>
            </div>
            <div className="flex justify-between">
              <span>Astrologer</span>
              <span>{booking.astrologer.displayName}</span>
            </div>

            <div className="flex justify-between">
              <span>Amount</span>
              <span>₹ {amount}</span>
            </div>

            <div className="flex justify-between">
              <span>GST @18%</span>
              <span>₹ {gstAmount.toFixed(2)}</span>
            </div>
            <div className="sm:mt-4 mt-2">
              <div className="border border-gray-300 rounded-2xl px-3 sm:py-3 py-1 flex justify-between items-center">
                <span className="text-purple-400 font-semibold text-xs sm:text-sm">
                  {selectedCoupon
                    ? `${selectedCoupon.code} Applied`
                    : "Apply Coupon"}
                </span>

                {selectedCoupon ? (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedCoupon(null);
                    }}
                    className="text-red-600 text-xs bg-red-100 px-2 py-1 rounded-full cursor-pointer font-extralight"
                  >
                    Remove
                  </button>
                ) : (
                  <button
                    onClick={() => setShowCouponModal(true)}
                    className="text-white bg-green-500 rounded-full px-2 py-1 text-xs sm:text-sm cursor-pointer font-semibold"
                  >
                    Apply
                  </button>
                )}
              </div>
            </div>

            <hr />
            {selectedCoupon && (
              <div className="flex text-xs sm:text-base justify-between text-green-600">
                <span>Coupon Discount</span>
                <span>- ₹{discountAmount.toFixed(2)}</span>
              </div>
            )}

            <div className="flex justify-between font-bold text-sm sm:text-base">
              <span>Total Payable</span>
              <span>₹ {finalAmount.toFixed(2)}</span>
            </div>
          </div>
        </div>

        <PayOPT
          type="SERVICE"
          bookingId={booking.id}
          amount={finalAmount}
          oriamount={booking.amount}
          coupon_id={selectedCoupon?.id ?? null}
          couponprice={discountAmount}
          coupon_code={selectedCoupon?.code ?? null}
        />
      </div>
       {showCouponModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl w-80 sm:w-100 p-5">
            <div className="flex bg-purple-200 rounded-2xl px-4 py-2 text-black items-center justify-between">
              <h2 className="font-bold text-sm sm:text-base">Available Coupons R</h2>
              <button
                className="cursor-pointer hover:scale-104"
                onClick={() => closeCoup()}
              >
                <svg
                  height={22}
                  width={22}
                  xmlns="http://www.w3.org/2000/svg"
                  fill="#c80c0c"
                  viewBox="0 0 640 640"
                >
                  <path d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM231 231C240.4 221.6 255.6 221.6 264.9 231L319.9 286L374.9 231C384.3 221.6 399.5 221.6 408.8 231C418.1 240.4 418.2 255.6 408.8 264.9L353.8 319.9L408.8 374.9C418.2 384.3 418.2 399.5 408.8 408.8C399.4 418.1 384.2 418.2 374.9 408.8L319.9 353.8L264.9 408.8C255.5 418.2 240.3 418.2 231 408.8C221.7 399.4 221.6 384.2 231 374.9L286 319.9L231 264.9C221.6 255.5 221.6 240.3 231 231z" />
                </svg>
              </button>
            </div>
            <div className="flex items-center gap-2 mt-4">
              <input
                type="text"
                value={couponCode}
                onChange={(e) => setCouponCode(e.target.value.toUpperCase())}
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

            {couponData?.getCoupons
              ?.filter(
                (coupon) =>
                  coupon.visibility === "VISIBLE" &&
                  coupon.applicable === "recharge",
              )
              .map((coupon) => (
                <div
                  key={coupon.id}
                  onClick={() => applyCoupon(coupon)}
                  className="border text-black border-gray-300 bg-linear-to-r from-purple-200 via-violet-200 to-indigo-200 rounded-2xl shadow-xl p-3 mb-3 mt-5 cursor-pointer hover:bg-gray-100"
                >
                  <div className="font-semibold text-sm sm:text-sm ">{coupon.code}</div>

                  <div className="text-xs sm:text-sm text-gray-500">
                    {coupon.type === "FLAT"
                      ? `₹${coupon.flatAmount} OFF`
                      : `${coupon.percentage}% OFF`}
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}
    </div>
  );
}
