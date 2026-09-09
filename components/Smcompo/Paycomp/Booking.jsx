"use client";
import Image from "next/image";
import Script from "next/script";
import { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { AlertLoading } from "../../../app/common";
import { useRouter } from "next/navigation";
import { useDispatch, useSelector } from "react-redux";


import { ResetCode, setPaymentInput } from "@/app/redux/reducer/Booking/PaymentSlice";
import { decryptData } from "@/app/helper/cryptoHelper";
import { bookingResetCode } from "@/app/redux/reducer/Booking/BookingReducer";

export default function Booking({ amount, generateid }) {

    const router = useRouter();


    const payAmount = amount || 0;
    const dispatch = useDispatch();

    const { resp, statusCode } = useSelector((state) => state.payment);
    const [user, setUserData] = useState("");
    const [loading, setLoading] = useState(false);
     const { userData } = useSelector((state) => state.getuserDetail);
    useEffect(() => {
        if (userData) {
            setUserData(userData);
        }
    }, [userData]);

    useEffect(() => {



        if (statusCode === 200) {
            setLoading(false);
            toast.success("Thank you for your booking. Your service has been scheduled successfully.");

            const timeout = setTimeout(() => {
                router.push("/chat-with-astrologer");
                dispatch(ResetCode());
                dispatch(bookingResetCode());
            }, 4000);


            return () => clearTimeout(timeout);
        }
    }, [resp, statusCode]);
    const route = useRouter();
    const handleCheckout = async () => {
        try {
            setLoading(true);
            const res = await fetch("/api/createOrder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: payAmount }),
            });

            const order = await res.json();

            if (order.error) {
                alert("Error creating order");
                setLoading(false);

                return;
            }
            const options = {
                key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_live_3zT42YgMgCfOim",
                amount: order.amount,
                currency: order.currency,
                name: "Dhwani Astro LLp",
                description: "Booking Service Payment",
                order_id: order.id,
                handler: async function (response) {
                    setLoading(true);

                    const res = await fetch("/api/verifypayment", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({
                            razorpay_payment_id: response.razorpay_payment_id,
                            razorpay_order_id: response.razorpay_order_id,
                            razorpay_signature: response.razorpay_signature,
                        }),
                    });
                    const order = await res.json();




                    if (order.success) {

                        const userId = user?.id;
                        const paymentId = order.payment_id;
                        const totalamount = order.paymentamount;
                        const method = order.paymentmethod;
                        const paystaus = order.paymentstatus;

                        const res = dispatch(setPaymentInput({
                            oty: 1,
                            orderId: generateid,
                            amount: parseInt(amount),
                            totalamount: parseInt(totalamount),
                            txt_id: paymentId,
                            method: method,
                            pay_status: paystaus
                        }))


                    } else {
                        alert(order);
                    }
                },
                prefill: {
                    name: "",
                    email: "",
                    contact: "",
                },
                theme: {
                    color: "#fff49e",
                },
            };

            setLoading(false);

            const razor = new window.Razorpay(options);
            razor.open();
        } catch (error) {
            alert("Error processing payment: " + error.message);
        } finally {
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
                    <button aria-label={`Pay with ${method.name}`}
                        onClick={handleCheckout}
                        key={idx}
                        className="bg-[linear-gradient(to_right,#a65ed677_54%,#ba38cb67_100%)] rounded-lg p-2  flex flex-col gap-1 items-center hover:scale-105 transition-transform shadow"
                    >
                        <Image
                            src={method.icon}
                            alt={method.name}
                            width={100}
                            height={100}
                            className="sm:h-8 sm:w-10.5  h-5.7 w-7"
                        />
                        <span className="text-xs font-semibold text-center text-white sn:font-bold">
                            {method.name}
                        </span>
                    </button>
                ))}

                <AlertLoading show={loading} title="Please Wait.." />
            </div>
        </div>
    );
}
