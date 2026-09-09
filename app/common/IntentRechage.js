"use client";

import React, { useEffect, useState, memo } from 'react'
import { useDispatch, useSelector } from 'react-redux';
import AlertLoading from './AlertLoading';
import { useRouter } from 'next/navigation';
import { sendPaymentDetail, resetStatusCode } from '../redux/reducer/payment/rechargeSlice';

import Script from "next/script";
import toast from 'react-hot-toast';
import dynamic from 'next/dynamic';





function IntentRechage({ showrecharge = false, astro_id, reqmode }) {

    const offers = [50, 100, 200, 500];
    const dispatch = useDispatch();

    const [user, setUserData] = useState("");



    const { userData } = useSelector((state) => state.getuserDetail);

    const { statusCode } = useSelector((state) => state.recharge_payment);

    useEffect(() => {

        if (userData) {
            setUserData(userData);
        }
    }, [userData]);

    const router = useRouter();

    const [loading, setLoading] = useState(false);



    useEffect(() => {
        if (statusCode === 200) {
            setLoading(false);
            toast.success("Payment Add successfully Enjoy Chat!");
            if (reqmode === "call") {
                router.push(`/callrequest/${astro_id}`);
            } else {
                router.push(`/chatrequest/${astro_id}`);
            }
            dispatch(resetStatusCode());

        }
    }, [statusCode, astro_id, dispatch, reqmode, router]);


    const handleCheckout = async (amount) => {
        try {
            setLoading(true);
            const res = await fetch("/api/createOrder", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ amount: amount }),
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
                description: "Recharge Payment",
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
                        const totalamount = amount || 0;
                        const method = order.paymentmethod;

                        const res = dispatch(sendPaymentDetail({ userId, paymentId, totalamount, method }));
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


    ``
    return (
        <div>
            <Script
                src="https://checkout.razorpay.com/v1/checkout.js"
                strategy="afterInteractive"
            />
            {
                showrecharge &&
                <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
                    <div className="bg-white rounded-2xl flex flex-col gap-1 shadow-lg w-full max-w-xl p-6 relative">
                        <button aria-label="Close Recharge Modal" className="justify-end place-self-end">
                           <svg width={18} height={18} viewBox="0 0 640 640"><path d="M320 576C461.4 576 576 461.4 576 320C576 178.6 461.4 64 320 64C178.6 64 64 178.6 64 320C64 461.4 178.6 576 320 576zM231 231C240.4 221.6 255.6 221.6 264.9 231L319.9 286L374.9 231C384.3 221.6 399.5 221.6 408.8 231C418.1 240.4 418.2 255.6 408.8 264.9L353.8 319.9L408.8 374.9C418.2 384.3 418.2 399.5 408.8 408.8C399.4 418.1 384.2 418.2 374.9 408.8L319.9 353.8L264.9 408.8C255.5 418.2 240.3 418.2 231 408.8C221.7 399.4 221.6 384.2 231 374.9L286 319.9L231 264.9C221.6 255.5 221.6 240.3 231 231z"/></svg>
                        </button>
                        <h2 className="text-2xl my-2  text-center font-bold text-red-600 mb-1">
                            ⚠️ Low Balance
                        </h2>
                        <span className="font-semibold my-2 text-gray-500">To continue enjoying our services, please recharge using one of the payment options below.</span>

                        <div className="grid grid-cols-1 sm:grid-cols-4 mt-4 gap-6 w-full max-w-3xl">
                            {offers.map((amount, index) => (
                                <button aria-label={`Recharge with amount ${amount}`}
                                    key={index}
                                    className="bg-purple-200 relative rounded-full shadow-lg px-6 py-2 flex flex-col items-center justify-center hover:scale-105 transition-transform cursor-pointer border border-gray-200"
                                    onClick={() => handleCheckout(amount)}>
                                    <p className="text-lg font-bold text-purple-600 ">₹{amount}</p>
                                    <h3 className="absolute top-[-8] left-6 rounded-2xl text-xs  px-2 bg-red-400 text-white">50% OFF</h3>

                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            }
            <AlertLoading show={loading} title="Please Waiting..." />

        </div>
    )
}


export default React.memo(IntentRechage);