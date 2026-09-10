"use client";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import toast from "react-hot-toast";
import { AlertLoading } from "@/app/common";
import { useRouter } from "next/navigation";
import Script from "next/script";
import { GET_GIFTS } from "@/app/graphql/gqlQuery";
import { useQuery, useMutation } from "@apollo/client/react";
import { gql } from "@apollo/client";
import CustomButton from "../Custom/CustomButton";
const GET_RECHARGE_PACKS = gql`
  query GetRechargePacks {
    getRechargePacks {
      data {
        id
        name
        description
        price
        talktime
      }
      totalCount
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
export const SEND_GIFT = gql`
  mutation SendGift($input: SendGiftInput!) {
    sendGift(input: $input) {
      success
      message
      userBalance
      astrologerBalance
      giftPrice
      commissionPercent
      astrologerEarning
      platformEarning
    }
  }
`;
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

export default function GiftPop({ open, onClose, astrologername, astro_id }) {
  const dispatch = useDispatch();
  const [alert, setAlert] = useState(false);
  const router = useRouter();
  const [selected, setSelected] = useState(null);
  const { loading, successMessage, responsedata } = useSelector(
    (state) => state.gift,
  );

  const [priceupdate, setPriceUpdate] = useState(0);
  const [showAlert, setShowAlert] = useState(false);

  let userData = JSON.parse(localStorage.getItem("user") || "{}");
  const {
    data: giftsResponse,
    loading: giftsLoading,
    error: giftsError,
  } = useQuery(GET_GIFTS, {
    fetchPolicy: "network-only",
  });

  const {
    data: rechargeResponse,
    loading: rechargeLoading,
    error: rechargeError,
  } = useQuery(GET_RECHARGE_PACKS, {
    fetchPolicy: "network-only",
  });

  const rechargePacks = rechargeResponse?.getRechargePacks?.data || [];
  const {
    data: walletData,
    loading: walletLoading,
    error: walletError,
    refetch,
  } = useQuery(GET_USER_WALLET, {
    fetchPolicy: "network-only",
  });

  const gifts = giftsResponse?.getGifts?.data || [];
  useEffect(() => {
    if (!open) return;

    const originalOverflow = document.body.style.overflow;

    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [open]);
  const { statusCode } = useSelector((state) => state.recharge_payment);
  useEffect(() => {}, [userData, responsedata]);

  const [sendGiftMutation] = useMutation(SEND_GIFT);
  const [createOrder] = useMutation(CREATE_ORDER);

  const sendGift = async () => {
    if (!selected) {
      toast.error("Please select one gift");
      return;
    }

    const giftPrice = Number(selected?.amount || selected?.price || 0);

    const walletBalance = Number(walletData?.getUserWallet?.balanceCoins || 0);

    if (walletBalance < giftPrice) {
      toast.error("Insufficient wallet balance");
      return;
    }

    const payload = {
      astro_id,
      giftname: selected?.name,
      giftprice: giftPrice,
      gift_id: selected?.id,
      user_name: userData?.name,
      astro_name: astrologername,
      user_id: userData?.id,
    };

    try {
      const { data } = await sendGiftMutation({
        variables: {
          input: payload,
        },
      });

      toast.success(data.sendGift.message);

      await refetch();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const handleCheckout = async (amount, packId) => {
    try {
      setAlert(true);

      const { data } = await createOrder({
        variables: {
          input: {
            rechargePackId: packId,
          },
        },
      });

      const order = data?.createOrder;

      console.log("GraphQL Order:", order);

      if (!order?.success) {
        toast.error("Error creating order");
        setAlert(false);
        return;
      }

      const options = {
        key:
          process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || "rzp_test_SNXjhTOgP1CIx0",

        amount: order.amount,

        currency: order.currency,

        name: "Dhwani Astro LLP",

        description: "Recharge Payment",

        order_id: order.orderId,

        notes: {
          userId: userData?.id || "guest",
          rechargePackId: packId,
        },

        handler: async function (response) {
          console.log("Payment Success:", response);

          toast.success("Payment Successful");

          await refetch();
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

      setAlert(false);

      const razor = new window.Razorpay(options);

      razor.open();
    } catch (error) {
      console.error("Checkout Error:", error);

      setAlert(false);

      toast.error(error.message || "Payment failed");
    }
  };
  const handleClose = () => {
    console.log("Closing Gift Popup");
    onClose?.();
  };
  if (!open) return null;
const storedUser = localStorage.getItem("user");

  return (
    <div className="fixed inset-0 z-9999 flex items-center justify-center bg-black/10 overflow-y-auto">
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="afterInteractive"
      />
      <div className="relative w-[92%] sm:w-[70%] max-w-md sm:max-w-xl max-h-[90vh] overflow-y-auto rounded-3xl p-3 sm:p-6 bg-white backdrop-blur-lg border border-white/30 shadow-[8px_8px_20px_#bebebe,-8px_-8px_20px_#ffffff1a]">
        {" "}
        <button
          aria-label="Close Gift Popup"
          onClick={handleClose}
          className="absolute cursor-pointer font-bold top-4 right-4 text-gray-800 hover:text-red-600 transition-all"
        >
          <svg
            fill="#000000"
            width={18}
            height={18}
            viewBox="-6 -6 24 24"
            xmlns="http://www.w3.org/2000/svg"
            preserveAspectRatio="xMinYMin"
            className="pointer-events-none"
          >
            <path d="M7.314 5.9l3.535-3.536A1 1 0 1 0 9.435.95L5.899 4.485 2.364.95A1 1 0 1 0 .95 2.364l3.535 3.535L.95 9.435a1 1 0 1 0 1.414 1.414l3.535-3.535 3.536 3.535a1 1 0 1 0 1.414-1.414L7.314 5.899z" />
          </svg>
        </button>
        <h2 className="sm:text-xl text-sm font-bold text-center text-[#2f1254] sm:mb-4 mb-2 drop-shadow">
          Send Gifts
        </h2>
        <div className="grid grid-cols-4 sm:grid-cols-4 gap-3 px-3 py-2 bg-purple-50 rounded-xl sm:gap-4 justify-items-center mb-5">
          {gifts.map((gift, i) => (
            <div
              key={i}
              onClick={() => setSelected(gift)}
              className={`cursor-pointer flex flex-col items-center justify-center w-17.5 sm:w-27.5 h-25   rounded-2xl  hover:scale-110 transition-all border ${
                selected?.name === gift.name
                  ? "border-yellow-500 shadow-inner"
                  : "border-transparent "
              }`}
            >
              <Image
                src={
                  gift?.image
                    ? `https://www.dhwaniastro.com${gift.image}`
                    : "/default-gift.png"
                }
                alt={gift.name}
                width={40}
                height={40}
                className="object-contain"
              />
              <p className="text-xs sm:text-xs text-center mt-1 font-medium text-gray-800">
                {gift.name}
              </p>
              <p className="text-[11px] text-gray-500">₹{gift.amount || 0}</p>
            </div>
          ))}
        </div>
        {/* <div className="w-full bg-white/40 p-3 rounded-xl shadow-inner border border-white/40 mb-4">
          <p className="text-center text-sm font-semibold text-[#2f1254] mb-2">
            Recharge to seek blessing
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {rechargePacks.map((pack) => (
              <div
                key={pack.id}
                onClick={() => handleCheckout(pack.price, pack.id)}
                className="cursor-pointer p-3 rounded-xl border border-yellow-300 bg-yellow-50 hover:bg-yellow-100 transition"
              >
                <p className="font-bold text-[#2f1254]">₹{pack.price}</p>

                <p className="text-xs text-gray-600">{pack.name}</p>

                <p className="text-[11px] text-green-700">
                  {pack.talktime} Min
                </p>
              </div>
            ))}
          </div>
        </div> */}
      <div className="flex justify-between items-center">
  <div>
    {storedUser ? (
      responsedata?.update_price ? (
        <p className="text-gray-700 text-xs font-semibold">
          ₹
          {(
            Number(responsedata?.update_price || 0) +
            Number(priceupdate || 0)
          ).toFixed(2)}
        </p>
      ) : (
        <p className="text-gray-700 text-xs font-semibold">
          ₹
          {(
            Number(walletData?.getUserWallet?.balanceCoins || 0) +
            Number(priceupdate || 0)
          ).toFixed(2)}
        </p>
      )
    ) : null}

    {storedUser && (
      <p className="text-[10px] sm:text-xs text-gray-500">
        Wallet Balance
      </p>
    )}
  </div>

  <CustomButton
    aria-label="Send Gift"
    className="px-6 py-1 text-xs sm:py-2 bg-yellow-400 hover:bg-yellow-500 text-black font-semibold rounded-full shadow-[4px_4px_10px_#b9b9b9,-4px_-4px_10px_#ffffffa0] transition-all"
    onClick={sendGift}
  >
    Send
  </CustomButton>
</div>
      </div>
      <AlertLoading show={showAlert} title="Please Wait.." />
    </div>
  );
}
