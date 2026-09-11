"use client";
import { useMemo, useState } from "react";
import Healdetail from "./Healdetail";
import toast from "react-hot-toast";
import CustomButton from "@/components/Custom/CustomButton";
import Forminp from "@/components/Homepagecomp/Consultations/Concompo/Forminp";
import { useDispatch } from "react-redux";
import { setBookingInput } from "@/app/redux/reducer/Booking/BookingReducer";
import { validateEmail, validatePhone } from "@/app/helper/validation";
// import Freereport from "@/components/Smcompo/Freereport";
import Searchtop from "@/components/Smcompo/Searchtop";
import { GET_SERVICE } from "@/app/graphql/gqlQuery";
import { useQuery } from "@apollo/client/react";
import Image from "next/image";

const Heal = ({ categorySlug, serviceSlug }) => {
  const dispatch = useDispatch();

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
      return Math.min(
        ...service.astrologerMappings.map((a) => Number(a.price)),
      );
    }

    return service.price;
  }, [service]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error.message}</div>;
  }

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
      formDat["name"] === "" ||
      formDat["dob"] === "" ||
      formDat["tob"] === ""
    ) {
      toast.error("Please fill out Name, Date of Birth, and Time of Birth.");
    } else if (!validatePhone(formDat["num"])) {
      toast.error("Please enter a valid phone number.");
    } else if (!validateEmail(formDat["mail"])) {
      toast.error("Please enter a valid email address.");
    } else {
      dispatch(
        setBookingInput({
          name: formDat["name"],
          dob: formDat["dob"],
          tob: formDat["tob"],
          mail: formDat["mail"],
          number: formDat["num"],
          gender: formDat["gender"],
          txt: formDat["txt"],
          bookingid: 3,
        }),
      );
    }
  };

  return (
    <div className="flex w-full flex-col items-center gap-10 justify-center px-2 sm:px-4  py-5 md:py-5">
      {/* <Searchtop /> */}

      <div className="bg-white shadow-2xl rounded-3xl overflow-hidden max-w-7xl w-[93%] sm:w-[85%]  flex flex-col sm:flex-row items-start">
        <div className="md:w-1/2  flex items-center  flex-col justify-center p-4">
          <Image
            className="object-cover bg-center w-full h-73"
            src={
              service?.image
                ? `https://www.dhwaniastro.com${service.image}`
                : "/placeholder.webp"
            }
            alt={service?.name}
            width={40}
            height={40}
          />
          {formInput && (
            <div className="name-price w-full flex flex-col bg-purple-200 border items-center justify-center border-purple-200 shadow-lg rounded-full px-5 py-2 sm:py-3 mt-6">
              <h1 className="mb-0 text-xl font-bold text-purple-700 sm:text-2xl">
                {service?.name}
              </h1>
              <div className="flex items-center mt-0 space-x-2">
                <span className="text-xs sm:text-base font-semibold text-purple-600 ">
                  Starting From: ₹ {startingPrice}
                </span>
                <span className="text-xs text-gray-500">(Per Session)</span>
              </div>
            </div>
          )}
        </div>

        <div className="md:w-1/2 w-full py-4 px-3  sm:pr-8 flex flex-col justify-between">
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

          {data && !formInput && (
            <CustomButton
              aria-label="Book Healing Session"
              variant={"gcircle"}
              className="mt-5 bg-green-500 rounded-full shadow-xl hover:scale-105 px-2 text-xs sm:text-md py-1 sm:py-2 hover:bg-green-600 duration-300 place-self-center w-[40%] sm:w-[50%]"
              onClick={handleBooking}
            >
              Book Now
            </CustomButton>
          )}
        </div>
      </div>
      {/* <Freereport /> */}
    </div>
  );
};

export default Heal;
