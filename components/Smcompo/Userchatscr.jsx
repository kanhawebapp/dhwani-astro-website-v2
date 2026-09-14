

'use client';
import Image from "next/image";

import { useState } from "react";
import CustomButton from "../Custom/CustomButton";
import dynamic from "next/dynamic";

const loadmd = (name) =>    dynamic(() => import("react-icons/md").then((mod) => mod[name]));
const MdDoneAll = loadmd("MdDoneAll");
export default function Userchatscr() {
    const [message, setMessage] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

    const roomid = "demo-room-id";
    const astroid = "demo-astro-id";

    const handleSend = async () => {
        if (!message.trim()) return;

        try {
            setIsLoading(true);
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 500));
            setMessage("");
            setError(null);
        } catch (e) {
            // console.error("Failed to send message:", e);
            setError("Failed to send message");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="md:w-3/5 w-full top-0 bg-white shadow-lg rounded-lg md:p-4 p-2 flex flex-col md:h-[81vh] h-screen pt-5 mx-auto">
            {/* Header */}
            <div className="flex flex-col">
                <div className="flex justify-between items-center p-2 md:px-4 px-2 bg-[#2f1254] rounded-t-lg">
                    <div className="flex items-center gap-2 md:gap-4">
                        <Image src="/chatimg/bg.png" alt="Logo" width={40} height={40} className="h-auto rounded-full md:w-10 w-7" />
                        <div className="flex flex-col text-sm text-white">
                            <span className="md:text-[14px] text-[12px] font-semibold">Astrologer Name</span>
                            <span className="text-yellow-400 text-[10px]">Typing Status...</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3 time-end">
                        <div className="flex items-center gap-2">
                            <span className="text-yellow-400 font-semibold text-[10px]">Balance :</span>
                            <span className="border  text-yellow-400  ouline-none shadow-lg rounded-full px-2 py-1 text-[10px]">Time</span>
                        </div>
                        <button className="px-4 py-1 text-xs font-semibold text-black bg-yellow-400 border-2 border-yellow-400 rounded-full shadow-lg ouline-none">
                            End
                        </button>
                    </div>
                </div>
                <div className="flex items-center text-black justify-between w-full bg-linear-to-r from-yellow-100 to-yellow-200 rounded-b-lg px-10 py-2">
                    <div className="flex flex-col gap">
                        <span className="text-[12px] text-red-500 font-semibold ">Your balance is running low (under 5 mins). Recharge quickly?</span>
                        <span className="text-[11px] text-black font-light "><b>Note:</b> Majority of users recharge with at least 10 minutes.</span>

                    </div>
                    <div className="flex justify-center gap-3 items-cener">
                        <CustomButton aria-label="Recharge ₹50" variant={"redc"}>₹ 50</CustomButton>
                        <CustomButton aria-label="Recharge ₹100" variant={"redc"}>100</CustomButton>
                        <CustomButton aria-label="Recharge ₹200" variant={"redc"} className="">200</CustomButton>
                        <CustomButton aria-label="Recharge ₹500" variant={"redc"} className="">500</CustomButton>

                    </div>
                </div>
            </div>

            {/* Chat Body */}
            <div className="relative grow overflow-y-auto">
                <div className="absolute inset-0 flex items-center justify-center">
                    <div
                        className="w-full h-full bg-center bg-cover opacity-50"
                        style={{ backgroundImage: "url('/chatimg/bg-dsw.webp')" }}
                    ></div>
                </div>
                <div className="relative p-4 space-y-2">
                    <div className="flex flex-col gap-2 msgs-boxs">
                        {/* User Message */}
                        <div className="flex flex-col self-end bg-purple-200 rounded-lg px-3 py-2 text-black md:text-xs text-[10px] w-fit gap-1">
                            <div className="flex flex-col gap-1 msgs-det">
                                <span className="flex items-center gap-2">
                                    <span>Name : </span> <span>Happy</span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <span>Gender : </span> <span>Male</span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <span>DOB : </span> <span>12-03-1990</span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <span>TOB : </span> <span>11:12:50 AM</span>
                                </span>
                                <span className="flex items-center gap-2">
                                    <span>Place : </span> <span>Jhajjar, Haryana, India</span>
                                </span>
                            </div>
                            <div className="flex items-center self-end gap-1 time-check">
                                <span className="text-gray-500 text-[10px]">12:30 AM</span>
                                <MdDoneAll className="text-blue-400" size={14} />
                            </div>
                        </div>

                        {/* Astrologer Messages */}
                        <div className="flex flex-col gap-2 astro-msgs-left">
                            {["Welcome to Dhwani Astro", "Astrologer will join in 10 secs.", "Please share your questions in the meanwhile."].map((msg, idx) => (
                                <div key={idx} className="flex flex-col self-start bg-yellow-100 rounded-lg px-3 py-2 text-black md:text-xs text-[10px] w-fit gap-0">
                                    <div className="flex flex-col gap-1 msgs-det">
                                        <span>{msg}</span>
                                    </div>
                                    <div className="flex items-center self-end gap-1 time-check">
                                        <span className="text-gray-500 text-[10px]">12:30 AM</span>
                                    </div>
                                    <div className="flex flex-col gap-1 msgs-det">
                                        <span>{msg}</span>
                                    </div>
                                    <div className="flex items-center self-end gap-1 time-check">
                                        <span className="text-gray-500 text-[10px]">12:30 AM</span>
                                    </div>
                                    <div className="flex flex-col gap-1 msgs-det">
                                        <span>{msg}</span>
                                    </div>
                                    <div className="flex items-center self-end gap-1 time-check">
                                        <span className="text-gray-500 text-[10px]">12:30 AM</span>
                                    </div>
                                    <div className="flex flex-col gap-1 msgs-det">
                                        <span>{msg}</span>
                                    </div>
                                    <div className="flex items-center self-end gap-1 time-check">
                                        <span className="text-gray-500 text-[10px]">12:30 AM</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Message Input */}
            <div className="flex gap-2 p-2 border-t">
                <div className="flex items-center w-full gap-2 px-5 border rounded-full inp-attach">
                    <input
                        type="text"
                        placeholder="Type your message..."
                        className="grow px-2 py-1 border-none md:py-2 focus:outline-none "
                        value={message}
                        onChange={e => setMessage(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && handleSend()}
                        disabled={isLoading}
                    />
                    <div className="flex items-center gap-5 right-items">
                        <Image src="/chatimg/kundli.webp" width={20} height={20} className="w-4 h-4 md:w-7 md:h-7" alt="" />
                        <svg width={18} height={18} viewBox="0 0 17 17" version="1.1" >
                            <path d="M12.021 4.234v8.498h-1v-8.498c0-1.091-0.799-2.266-2.554-2.266-1.941 0-2.459 1.424-2.459 2.266v8.121h0.007v1.457c0 0.62 0.693 1.206 1.426 1.206 0.844 0 1.567-0.683 1.567-1.241v-0.27h-0.003l0.008-7.617c0-0.874-0.247-0.874-0.466-0.874-0.369 0-0.547 0.035-0.547 0.823v5.146h-1v-5.146c0-0.451 0-1.823 1.547-1.823 0.669 0 1.466 0.325 1.466 1.875l-0.007 6.43h0.002v1.457c0 1.173-1.224 2.241-2.567 2.241-1.292 0-2.426-1.031-2.426-2.206v-0.074h-0.007v-9.505c0-1.573 1.082-3.266 3.459-3.266 2.333 0.001 3.554 1.643 3.554 3.266z" fill="#000000" />
                        </svg>
                    </div>
                </div>
                <button aria-label="Send Message"
                    className="px-6 py-0 text-xs text-white bg-green-500 rounded-full hover:bg-green-600"
                    onClick={handleSend}
                    disabled={isLoading}
                >
                    <svg width={18} height={18} viewBox="0 0 64 64" stroke-width="3" stroke="#000000" fill="none"><path d="M38.61,54.93,27.94,35.57,9.08,25.38a1,1,0,0,1,.2-1.8L54.08,8.64a1,1,0,0,1,1.27,1.27L40.41,54.73A1,1,0,0,1,38.61,54.93Z" /><line x1="55.13" y1="8.91" x2="27.94" y2="35.57" stroke-linecap="round" /></svg>
                </button>
            </div>

            {/* Error Message */}
            {error && <div className="p-2 text-xs text-red-500">{error}</div>}
        </div>
    );
}
