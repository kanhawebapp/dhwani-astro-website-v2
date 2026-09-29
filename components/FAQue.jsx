"use client";
import { useState } from "react";
import { useLanguage } from "@/app/context/LangContext";
import useScrollZoom from "@/Hooks/scrollZoom";
import { GET_FAQS } from "@/app/graphql/gqlQuery";
import { useQuery } from "@apollo/client/react";

export default function FAQue() {
  const { messages: t } = useLanguage();
  const { data, loading } = useQuery(GET_FAQS);

  const faqs = data?.getFaqs?.data || [];
  useScrollZoom(".head-wrap");

  const [openIndex, setOpenIndex] = useState(null);

  const toggleFAQ = (index) => {
    setOpenIndex(openIndex === index ? null : index);
  };
  if (loading) {
    return (
      <div className="md:max-w-7xl mx-auto p-6 text-center">
        Loading FAQs...
      </div>
    );
  }

  return (
    <div className="md:max-w-7xl w-full  mx-auto bg-white p-1 sm:p-6 px-4 py-3">
      <h2
        dangerouslySetInnerHTML={{
          __html: t?.faq?.head || "Frequently Asked Questions",
        }}
        className="relative head-wrap text-[#2f1254] text-md sm:text-xl lg:text-2xl sm:py-5 pb-2 text-center font-semibold"
      />
      <div className="space-y-4">
        <div className="faq-sec flex flex-wrap gap-5">
          {faqs.map((faq, index) => (
            <div
              key={index}
              className="border-b-purple-100 head-wrap border-b pb-0 sm:pb-2 w-full"
            >
              <button
                aria-label={`Toggle FAQ: ${faq.question}`}
                className={`rounded-lg p-3 flex justify-between w-full text-xs sm:text-sm lg:text-base font-medium focus:outline-none toggle-faq ${
                  index % 2 === 0 ? "bg-purple-200" : "bg-violet-200"
                }`}
                onClick={() => toggleFAQ(index)}
              >
                <p className="text-black text-start">{faq.question}</p>
                <span className="icon text-black">
                  {openIndex === index ? "-" : "+"}
                </span>
              </button>
              {openIndex === index && (
                <p className="mt-2 text-gray-600 text-xs sm:text-sm lg:text-base">
                  {faq.answer}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
