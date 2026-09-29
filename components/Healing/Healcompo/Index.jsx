"use client";

import { useMemo, useState } from "react";
import Healdetail from "./Healdetail";
import toast from "react-hot-toast";
import CustomButton from "@/components/Custom/CustomButton";
import Forminp from "@/components/Homepagecomp/Consultations/Concompo/Forminp";
import { validateEmail, validatePhone } from "@/app/helper/validation";
import { GET_SERVICE } from "@/app/graphql/gqlQuery";
import { useQuery } from "@apollo/client/react";
import Image from "next/image";

const BASE_URL =
  process.env.NEXT_PUBLIC_BASE_URL || "https://dhwaniastro.com";

const Heal = ({ categorySlug, serviceSlug }) => {
  const [pkgId, setPkgId] = useState(null);
  const [formInput, setFormInput] = useState(false);

  const [formDat, setformDat] = useState({
    name: "",
    dob: "",
    tob: "",
    pob: "",
    mail: "",
    num: "",
    gender: "",
    txt: "",
  });

  const { data, loading, error } = useQuery(GET_SERVICE, {
    variables: {
      slug: serviceSlug,
    },
  });

  const service = data?.getService;

  const startingPrice = useMemo(() => {
    if (!service) return 0;

    if (service.astrologerMappings?.length) {
      const prices = service.astrologerMappings
        .map((astrologer) => Number(astrologer.price))
        .filter((price) => Number.isFinite(price));

      if (prices.length > 0) {
        return Math.min(...prices);
      }
    }

    return Number(service.price) || 0;
  }, [service]);

  if (loading) {
    return (
      <div
        className="flex min-h-[300px] items-center justify-center"
        aria-busy="true"
        aria-live="polite"
      >
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div
        className="flex min-h-[300px] items-center justify-center px-4 text-center text-red-600"
        role="alert"
      >
        Unable to load this astrology service. Please try again later.
      </div>
    );
  }

  if (!service) {
    return (
      <div
        className="flex min-h-[300px] items-center justify-center px-4 text-center"
        role="status"
      >
        Astrology service not found.
      </div>
    );
  }

  const serviceName = service?.name || "Astrology Service";

  const serviceImage = service?.image
    ? `${BASE_URL}${service.image}`
    : "/placeholder.webp";

  const handleBooking = () => {
    setFormInput(true);
    setSData(false);
  };

  const handleForm = () => {
    setFormInput(false);
    setSData(true);
  };

  const goToPay = () => {
    if (
      formDat.name === "" ||
      formDat.dob === "" ||
      formDat.tob === ""
    ) {
      toast.error(
        "Please fill out Name, Date of Birth, and Time of Birth.",
      );
    } else if (!validatePhone(formDat.num)) {
      toast.error("Please enter a valid phone number.");
    } else if (!validateEmail(formDat.mail)) {
      toast.error("Please enter a valid email address.");
    } else {
      // dispatch(
      //   setBookingInput({
      //     name: formDat.name,
      //     dob: formDat.dob,
      //     tob: formDat.tob,
      //     mail: formDat.mail,
      //     number: formDat.num,
      //     gender: formDat.gender,
      //     txt: formDat.txt,
      //     bookingid: 3,
      //   }),
      // );
    }
  };

  return (
    <main
      className="flex w-full flex-col items-center justify-center gap-10 px-2 py-5 sm:px-4 md:py-5"
      aria-label={`${serviceName} astrology service`}
    >
      <article
        className="flex w-[93%] max-w-7xl flex-col items-start overflow-hidden rounded-3xl bg-white shadow-2xl sm:w-[85%] sm:flex-row"
        itemScope
        itemType="https://schema.org/Service"
      >
        <div className="flex flex-col items-center justify-center p-4 md:w-1/2">
          <Image
            className="h-73 w-full bg-center object-cover"
            src={serviceImage}
            alt={`${serviceName} - Dhwani Astro`}
            width={800}
            height={500}
            priority
            itemProp="image"
          />

          {formInput && (
            <div className="name-price mt-6 flex w-full flex-col items-center justify-center rounded-full border border-purple-200 bg-purple-200 px-5 py-2 shadow-lg sm:py-3">
              <div
                className="mb-0 text-center text-xl font-bold text-purple-700 sm:text-2xl"
                itemProp="name"
              >
                {serviceName}
              </div>

              <div className="mt-0 flex items-center space-x-2">
                <span className="text-xs font-semibold text-purple-600 sm:text-base">
                  Starting From: ₹ {startingPrice}
                </span>

                <span className="text-xs text-gray-500">
                  (Per Session)
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="flex w-full flex-col justify-between px-3 py-4 sm:pr-8 md:w-1/2">
          {formInput ? (
            <Forminp
              formDat={formDat}
              setformDat={setformDat}
              onClose={handleForm}
              pagedata={service}
              page_name={service?.slug}
            />
          ) : (
            <Healdetail
              sp={startingPrice}
              data={service}
              pkgId={pkgId}
              setPkgId={setPkgId}
            />
          )}

          {!formInput && (
            <CustomButton
              aria-label={`Book ${serviceName} session`}
              variant="gcircle"
              className="mt-5 w-[40%] place-self-center rounded-full bg-green-500 px-2 py-1 text-xs shadow-xl duration-300 hover:scale-105 hover:bg-green-600 sm:w-[50%] sm:py-2 sm:text-md"
              onClick={handleBooking}
            >
              Book Now
            </CustomButton>
          )}
        </div>
      </article>
    </main>
  );
};

export default Heal;
