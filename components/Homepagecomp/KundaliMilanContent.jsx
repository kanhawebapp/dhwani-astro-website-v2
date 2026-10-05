"use client";

import React from "react";

export default function KundaliMilanContent({ content }) {
  if (!content) return null;

  return (
    <section className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
      <div className="space-y-8">

        {/* ================= INTRO ================= */}
        {content.intro && (
          <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-purple-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#32143f] mb-5">
              {content.intro.title}
            </h2>

            <div className="space-y-4 text-sm sm:text-base leading-7 text-gray-700">
              {content.intro.paragraphs?.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>
        )}

        {/* ================= CALCULATOR ================= */}
        {content.calculator && (
          <section className="rounded-3xl bg-gradient-to-r from-purple-50 to-pink-50 p-6 sm:p-8 border border-purple-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#32143f] mb-4">
              {content.calculator.title}
            </h2>

            <p className="text-sm sm:text-base leading-7 text-gray-700">
              {content.calculator.description}
            </p>
          </section>
        )}

        {/* ================= ABOUT ================= */}
        {content.about && (
          <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-purple-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#32143f] mb-5">
              {content.about.title}
            </h2>

            <div className="space-y-4 text-sm sm:text-base leading-7 text-gray-700">
              {content.about.paragraphs?.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>
        )}

        {/* ================= HOW IT WORKS ================= */}
        {content.howToUse && (
          <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-purple-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#32143f] mb-5">
              {content.howToUse.title}
            </h2>

            <div className="space-y-4 text-sm sm:text-base leading-7 text-gray-700">
              {content.howToUse.paragraphs?.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {content.howToUse.points?.length > 0 && (
              <ul className="mt-5 space-y-3 list-disc pl-6 text-sm sm:text-base text-gray-700">
                {content.howToUse.points.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            )}

            {content.howToUse.conclusion && (
              <p className="mt-5 text-sm sm:text-base leading-7 text-gray-700">
                {content.howToUse.conclusion}
              </p>
            )}
          </section>
        )}

        {/* ================= ASHTAKOOT / 36 GUNA ================= */}
        {content.ashtakoot && (
          <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-purple-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#32143f] mb-5">
              {content.ashtakoot.title}
            </h2>

            <div className="space-y-4 text-sm sm:text-base leading-7 text-gray-700">
              {content.ashtakoot.paragraphs?.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {/* Responsive table */}
            {content.ashtakoot.table?.length > 0 && (
              <div className="mt-6 overflow-x-auto rounded-2xl border border-purple-100">
                <table className="w-full min-w-[650px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-purple-50">
                      <th className="border-b border-purple-100 px-4 py-4 text-left font-bold text-[#32143f]">
                        Koota
                      </th>

                      <th className="border-b border-purple-100 px-4 py-4 text-center font-bold text-[#32143f]">
                        Maximum Points
                      </th>

                      <th className="border-b border-purple-100 px-4 py-4 text-left font-bold text-[#32143f]">
                        Traditional Association
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {content.ashtakoot.table.map((item, index) => (
                      <tr
                        key={index}
                        className={
                          item.name === "Total"
                            ? "bg-purple-50 font-bold"
                            : "bg-white"
                        }
                      >
                        <td className="border-b border-purple-50 px-4 py-4 text-gray-700">
                          {item.name}
                        </td>

                        <td className="border-b border-purple-50 px-4 py-4 text-center text-gray-700">
                          {item.points}
                        </td>

                        <td className="border-b border-purple-50 px-4 py-4 text-gray-700">
                          {item.association}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {content.ashtakoot.note && (
              <p className="mt-5 rounded-2xl bg-gray-50 p-4 text-xs sm:text-sm leading-6 text-gray-600">
                {content.ashtakoot.note}
              </p>
            )}
          </section>
        )}

        {/* ================= SCORE ================= */}
        {content.score && (
          <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-purple-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#32143f] mb-5">
              {content.score.title}
            </h2>

            {content.score.paragraphs?.map((paragraph, index) => (
              <p
                key={index}
                className="mb-4 text-sm sm:text-base leading-7 text-gray-700"
              >
                {paragraph}
              </p>
            ))}

            {content.score.table?.length > 0 && (
              <div className="mt-6 overflow-x-auto rounded-2xl border border-purple-100">
                <table className="w-full min-w-[600px] border-collapse text-sm">
                  <thead>
                    <tr className="bg-purple-50">
                      <th className="border-b border-purple-100 px-4 py-4 text-left font-bold text-[#32143f]">
                        Gun Milan Score
                      </th>

                      <th className="border-b border-purple-100 px-4 py-4 text-left font-bold text-[#32143f]">
                        Common Traditional Interpretation
                      </th>
                    </tr>
                  </thead>

                  <tbody>
                    {content.score.table.map((item, index) => (
                      <tr key={index}>
                        <td className="border-b border-purple-50 px-4 py-4 font-medium text-gray-700">
                          {item.score}
                        </td>

                        <td className="border-b border-purple-50 px-4 py-4 text-gray-700">
                          {item.interpretation}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {content.score.note && (
              <p className="mt-5 rounded-2xl bg-amber-50 p-4 text-xs sm:text-sm leading-6 text-gray-700">
                {content.score.note}
              </p>
            )}
          </section>
        )}

        {/* ================= EIGHT KOOTAS ================= */}
        {content.kootas && (
          <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-purple-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#32143f] mb-6">
              {content.kootas.title}
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {content.kootas.items?.map((item, index) => (
                <article
                  key={index}
                  className="rounded-2xl border border-purple-100 bg-gradient-to-br from-white to-purple-50/50 p-5"
                >
                  <h3 className="text-base sm:text-lg font-bold text-[#32143f] mb-3">
                    {item.title}
                  </h3>

                  <p className="text-sm leading-6 text-gray-700">
                    {item.description}
                  </p>
                </article>
              ))}
            </div>
          </section>
        )}

        {/* ================= NADI DOSHA ================= */}
        {content.nadiDosha && (
          <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-purple-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#32143f] mb-5">
              {content.nadiDosha.title}
            </h2>

            <div className="space-y-4 text-sm sm:text-base leading-7 text-gray-700">
              {content.nadiDosha.paragraphs?.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>
        )}

        {/* ================= BHAKOOT DOSHA ================= */}
        {content.bhakootDosha && (
          <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-purple-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#32143f] mb-5">
              {content.bhakootDosha.title}
            </h2>

            <div className="space-y-4 text-sm sm:text-base leading-7 text-gray-700">
              {content.bhakootDosha.paragraphs?.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>
          </section>
        )}

        {/* ================= MARRIAGE COMPATIBILITY ================= */}
        {content.marriage && (
          <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-purple-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#32143f] mb-5">
              {content.marriage.title}
            </h2>

            <div className="space-y-4 text-sm sm:text-base leading-7 text-gray-700">
              {content.marriage.paragraphs?.map((paragraph, index) => (
                <p key={index}>{paragraph}</p>
              ))}
            </div>

            {content.marriage.points?.length > 0 && (
              <ul className="mt-5 space-y-3 list-disc pl-6 text-sm sm:text-base text-gray-700">
                {content.marriage.points.map((point, index) => (
                  <li key={index}>{point}</li>
                ))}
              </ul>
            )}

            {content.marriage.conclusion && (
              <p className="mt-5 text-sm sm:text-base leading-7 text-gray-700">
                {content.marriage.conclusion}
              </p>
            )}
          </section>
        )}

        {/* ================= FAQ ================= */}
        {content.faqs?.length > 0 && (
          <section className="rounded-3xl bg-white p-6 sm:p-8 shadow-sm border border-purple-100">
            <h2 className="text-2xl sm:text-3xl font-bold text-[#32143f] mb-6">
              Frequently Asked Questions
            </h2>

            <div className="space-y-4">
              {content.faqs.map((faq, index) => (
                <details
                  key={index}
                  className="group rounded-2xl border border-purple-100 bg-purple-50/30 p-4 sm:p-5"
                >
                  <summary className="cursor-pointer list-none pr-8 text-sm sm:text-base font-semibold text-[#32143f] relative">
                    {faq.q}

                    <span className="absolute right-0 top-0 text-xl transition-transform duration-200 group-open:rotate-45">
                      +
                    </span>
                  </summary>

                  <p className="mt-4 text-sm leading-6 text-gray-700">
                    {faq.a}
                  </p>
                </details>
              ))}
            </div>
          </section>
        )}

        {/* ================= DISCLAIMER ================= */}
        {content.disclaimer && (
          <section className="rounded-2xl bg-gray-50 border border-gray-200 p-5 sm:p-6">
            <h2 className="text-lg sm:text-xl font-bold text-[#32143f] mb-3">
              Disclaimer
            </h2>

            <p className="text-xs sm:text-sm leading-6 text-gray-600">
              {content.disclaimer}
            </p>
          </section>
        )}
      </div>
    </section>
  );
}