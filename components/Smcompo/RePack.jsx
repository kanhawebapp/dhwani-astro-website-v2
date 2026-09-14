"use client";

import CartPage from "../Healing/CartPage";
import { useEffect, useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { fetchPack } from "../../app/redux/reducer/payment/packSlice";
import { getUserFetch } from "../../app/redux/reducer/auth/userSlice";

import CustomButton from "../Custom/CustomButton";
import { useLanguage } from "@/app/context/LangContext";



const RePack = ({ setShowProDetail }) => {
  const {messages:t} = useLanguage(); 
  const dispatch = useDispatch();
  const [cart, setCart] = useState(false);
  const [pack, setPack] = useState("");

  const { packData = [], loading } = useSelector((state) => state.packrecharge);
  const { loading: packLoading, userData } = useSelector(
    (state) => state.getuserDetail
  );

  const handleSelect = (id) => {
    const singldata = packData?.find((item) => item.id === id);
    setPack(singldata);
    setCart(true);
  };

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("user") || "{} ");

    if (user.name) {
      dispatch(getUserFetch());
    } else {
    }
  }, []);

  useEffect(() => {

    if (!packData || packData.length === 0) {
      dispatch(fetchPack());
    }
  }, [dispatch, packData]);

  return (
    <div className="p-6 w-7xl">
      {!cart ? (
        <div>
          <div className="flex flex-col justify-between gap-4 mb-8 md:flex-row md:items-center">
            <div className="relative flex items-center justify-center w-full p-6 overflow-hidden bg-white rounded-lg shadow-lg">
              <div className="absolute top-0 left-0 z-0 w-full h-full overflow-hidden">
                <div className="wave "></div>
                <div className="wave"></div>
                <div className="wave "></div>
              </div>

              <div className="relative z-10 flex items-center justify-between w-full space-y-4">
                <div className="text-lg font-semibold text-gray-800 ">
                  <span className="text-xl font-semibold">
                    {t?.astrocard?.add || "Add Money to Wallet"}
                  </span>
                </div>



              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 ">
            {packData.map((pack, idx) => (
              <div
                key={idx}
                className="relative flex flex-col justify-between p-5 overflow-hidden bg-white border border-gray-200 shadow-lg rounded-xl"
              >
                <span className="rotate-[-42deg] w-28 text-center absolute top-[17px] left-[-27px] bg-linear-to-r from-yellow-400 to-orange-400 text-[0.6rem]  text-white px-2 py-1 rounded-tr-lg rounded-bl-lg shadow">
               {t?.astrocard?.offer || "Special Offer"}
                </span>
                <div className="text-center">
                  <h3 className="mb-1 text-lg font-semibold text-purple-700">
                    {pack?.package_name}
                  </h3>
                  <p className="text-2xl font-bold text-gray-900">
                    ₹ {pack.package_amount}
                  </p>
                </div>


                <CustomButton aria-label={`Select Pack ${pack?.package_name} for ₹${pack.package_amount}`}
                  className="w-full px-4 py-2 mt-4 text-sm font-medium text-white transition-colors rounded-lg cursor-pointer bg-linear-to-r from-purple-600 to-indigo-600 hover:from-purple-700 hover:to-indigo-700"
                  variant="green"
                  onClick={() => handleSelect(pack?.id)}>
                  <h5 className="text-white"> {t?.astrocard?.pack || "Select Pack"}</h5>
                </CustomButton>


              </div>
            ))}
          </div>
        </div>
      ) : (
        <CartPage className="place-self-center" rechargedata={pack} />
      )}
    </div>
  );
};

export default RePack;
