'use client';

import CustomButton from "../Custom/CustomButton";
import { useRouter } from "next/navigation";
import UserDetFD from "../Smcompo/UserDetFD";
import { useDispatch, useSelector } from "react-redux";
import { setMatchData } from "../../app/redux/services/daUserFormSlice";
import Image from "next/image";
import { useLanguage } from "@/app/context/LangContext";
export default function Formdcalc({ slug }) {
  const { messages: t } = useLanguage();
  const router = useRouter();
  const dispatch = useDispatch();

  const matchData = useSelector((state) => state.daUserForm.matchForm);

  const handleBoyChange = (e) => {
    dispatch(
      setMatchData({
        boyData: { ...matchData.boyData, [e.target.name]: e.target.value },
        girlData: matchData.girlData,
      })
    );
  };

  const handleGirlChange = (e) => {
    dispatch(
      setMatchData({
        boyData: matchData.boyData,
        girlData: { ...matchData.girlData, [e.target.name]: e.target.value },
      })
    );
  };


  const handleBoyLocationSelect = (loc) => {
    dispatch(
      setMatchData({
        boyData: {
          ...(matchData?.boyData || {}),
          birthplace: loc?.label || "",
          lat: loc?.lat || 0,
          lon: loc?.lon || 0,
        },
        girlData: matchData?.girlData || {},
      })
    );

  };

  const handleGirlLocationSelect = (loc) => {
    dispatch(
      setMatchData({
        boyData: matchData?.boyData || {},
        girlData: {
          ...(matchData?.girlData || {}),
          birthplace: loc?.label || "",
          lat: loc?.lat || 0,
          lon: loc?.lon || 0,
        },
      })
    );
  };


  const handleSubmit = (e) => {
    e.preventDefault();

    if (
      !matchData?.boyData?.name ||
      !matchData?.girlData?.name ||
      !matchData?.boyData?.dob ||
      !matchData?.girlData?.dob
    ) {
      alert("⚠️ Please fill the form first.");
      return;
    }

    const payload = {
      boyData: matchData.boyData,
      girlData: matchData.girlData,
    };

    router.push(`/doubleform/doubleresult/${slug}`);
  };

  return (
    <div className="basic-kundli-charts max-w-7xl flex flex-col gap-3 md:col-span-4 items-center">
      <div className="kundli-img-txt  flex  items-center  bg-linear-to-r from-pink-100 to-yellow-100 shadow-lg rounded-b-2xl p-5">
        <Image
          alt="ganesh ji image"
          className="kundli-imgs hidden md:block w-45 h-42 "
          loading="lazy"
          width={100}
          height={100}
          unoptimized
          src="/ds-img/ganeshji.png"
        />
        <div className="kundli-para text-black flex flex-col text-sm mt-2">
          <h4 className="text-md sm:text-2xl text-center font-bold uppercase">
            {t?.comfree?.kuhead || "Get Free Online Kundli Matching"}
          </h4>
          <p className="text-xs sm:text-sm">
            Kundli is an astrological chart that shows the exact positions of heavenly bodies and planets at a specific time...
          </p>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="basic-details-main w-full">
        <div className="flex flex-col gap-5 w-full p-5 shadow-lg rounded-lg">
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <UserDetFD
              title={t?.comfree?.boy || "Your Details"}
              formData={matchData.boyData || {}}
              handleChange={handleBoyChange}
              handleLocationSelect={handleBoyLocationSelect}
            />
            <UserDetFD
              title={t?.comfree?.girl || "Partner Details"}
              formData={matchData.girlData || {}}
              handleChange={handleGirlChange}
              handleLocationSelect={handleGirlLocationSelect}
            />
          </div>

          <button aria-label="Show Match Details"
            type="submit"
            className="w-[50%] text-xs sm:text-sm cursor-pointer place-self-center mx-auto bg-purple-600 hover:bg-purple-700 text-white py-2 rounded-full shadow-lg">
            {t?.comfree?.kumatch || "Show Match Details"}
          </button>
        </div>
      </form>
    </div>
  );
}
