'use client';
import {createKundliHash} from "../../../utils/kundliHash"
import { useRouter } from 'next/navigation';
import { useSelector, shallowEqual } from 'react-redux';
import Image from 'next/image';
import useScrollZoom from '@/Hooks/scrollZoom';

export default function Kuninter() {
  useScrollZoom(".head-wrap");
  const router = useRouter();
  const formData = useSelector((state) => state.daUserForm, shallowEqual) || {};


  const kundlicards = [
    {
      name: "Birth Chart/ Kundli",
      img: "/ds-img/k1.png",
      named: "Planet positions & various charts",
      href: "/freeservices/kundali/getKundaliPage/kundliBasic1",
    },
    {
      name: "General Life Prediction",
      img: "/ds-img/fnn.jpg",
      named: "Get to know about your nature",
      href: "/freeservices/kundali/getKundaliPage/general",
    },

    {
      name: "Dosha in Kundli",
      img: "/ds-img/k3.png",
      named: "Do you have any Kundli Dosh?",
      href: "/freeservices/kundali/getKundaliPage/doshas",
    },
    {
      name: "Match Horoscope",
      img: "/ds-img/mh.webp",
      named: "Kundli Milan (Guna Milan)",
      href: "/freeservices/kundali/getKundaliPage/matchkundli",
    },
    {
      name: "Numerology",
      img: "/ds-img/num.webp",
      named: "Your Lucky number is...",
      href: "/freeservices/kundali/getKundaliPage/numerokundli",
    },
    {
      name: "My Day Today",
      img: "/ds-img/k5.webp",
      named: "Get predictions about the day",
      href: "/freeservices/kundali/getKundaliPage/myday",
    },
    // {
    //   name: "Year Analysis",
    //   img: "/ds-img/k6.png",
    //   named: "How will this year for you?",
    //   href: "/freeservices/kundali/getKundaliPage/varshaphal",
    // },
    {
      name: "Nakshatra",
      img: "/ds-img/nak.jpg",
      named: "Get to know about your Nakshatra",
      href: "/freeservices/kundali/getKundaliPage/nakshatra",
    },
    {
      name: "Lal Kitab Horoscope",
      img: "/ds-img/klf.png",
      named: "Get your Life Report as pdf",
      href: "/freeservices/kundali/getKundaliPage/lalkitab",
    },
    {
      name: "Sade Sati",
      img: "/ds-img/k11a.png",
      named: "How Sade Sati effect you?",
      href: "/freeservices/kundali/getKundaliPage/sadhesati",
    },
    {
      name: "Suggestions And Remedies",
      img: "/ds-img/Remedy.webp",
      named: "Free Remedies Suggestion Report",
      href: "/freeservices/kundali/getKundaliPage/suggestions",
    },
    {
      name: "Ascendant Report",
      img: "/ds-img/k5.png",
      named: "Get your Life Report as pdf",
      href: "/freeservices/kundali/getKundaliPage/ascendant",
    },
    // {
    //   name: "GocharPhal (Transit)",
    //   img: "/ds-img/transit.png",
    //   named: "Position of Planets",
    //   href: "/freeservices/kundali/getKundaliPage/gocharphal",
    // },
    {
      name: "Char / Yogini Dasha",
      img: "/ds-img/k11.png",
      named: "Timing events based on planets",
      href: "/freeservices/kundali/getKundaliPage/charyogdasha",
    },
  ];





const handleCardClick = (href) => {
  const requiredFields = [
    "day",
    "month",
    "year",
    "hour",
    "min",
    "lat",
    "lon",
    "tzone",
  ];

  const missingFields = requiredFields.filter(
    (field) => formData?.[field] === undefined || formData?.[field] === null
  );

  if (missingFields.length > 0) {
    alert("Please fill all required form inputs in Kundalimain form first!");
    return;
  }


  const kundliHash = createKundliHash(formData);

  console.log("CLIENT Kundli Hash:", kundliHash, formData);
  console.log("CLIENT Final URL:", `${href}?hash=${kundliHash}`);

  window.scrollTo({ top: 0, behavior: "smooth" });

  
  router.push(`${href}?hash=${kundliHash}`);
};



  return (
    <section className="w-full flex flex-col items-center justify-between  md:p-5 p-2 gap-8">
      <div className="w-full grid md:grid-cols-4 sm:grid-cols-3 grid-cols-2 gap-4">

        {kundlicards.map((kunca, index) => (

          <button aria-label={`Navigate to ${kunca.name}`} key={index} onClick={() => handleCardClick(kunca.href)} className="cursor-pointer head-wrap kundli-cards text-black shadow-lg rounded-2xl hover:scale-102 gap-2 md:p-3 p-2 flex flex-col items-center justify-center">
            <h5 className="text-xs md:text-xs text-center font-normal">{kunca.name}</h5>
            <Image src={kunca.img} alt={kunca.name} width={50} height={50} className="w-10 h-10 md:w-15 md:h-15 rounded-full" />
            <span className="text-center md:text-xs  text-[10px]">{kunca.named}</span>
          </button>
        ))}
      </div>
      {/* <Personal /> */}
      {/* <Callchatsec/> */}
    </section>
  );
}
