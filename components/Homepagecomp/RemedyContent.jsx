"use client";

import { useState } from "react";

export default function RemedyContent({ content }) {
  const [openFaq, setOpenFaq] = useState(null);

  if (!content) return null;

  const toggleFaq = (index) => {
    setOpenFaq((prev) => (prev === index ? null : index));
  };

  return (
    <section className="relative mt-14 overflow-hidden text-[#24152d]">
      {/* =========================================================
          BACKGROUND
      ========================================================= */}

      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div
          className="
            absolute -left-32 top-20
            h-80 w-80
            rounded-full
            bg-pink-200/40
            blur-3xl
          "
        />

        <div
          className="
            absolute -right-32 top-[30%]
            h-96 w-96
            rounded-full
            bg-yellow-200/40
            blur-3xl
          "
        />

        <div
          className="
            absolute left-[35%] bottom-[10%]
            h-80 w-80
            rounded-full
            bg-purple-200/30
            blur-3xl
          "
        />

        <div
          className="
            absolute left-[12%] top-[18%]
            h-3 w-3
            rounded-full
            bg-purple-400/50
            shadow-[0_0_20px_rgba(147,51,234,.4)]
          "
        />

        <div
          className="
            absolute right-[15%] top-[12%]
            h-2 w-2
            rounded-full
            bg-pink-400
            shadow-[0_0_20px_rgba(236,72,153,.5)]
          "
        />

        <div
          className="
            absolute right-[30%] bottom-[15%]
            h-3 w-3
            rounded-full
            bg-yellow-400/60
          "
        />
      </div>

      <div className="relative mx-auto max-w-7xl space-y-7 px-4 sm:px-6 lg:px-8">

        {/* =========================================================
            INTRO
        ========================================================= */}

        {content.intro && (
          <article
            className="
              relative overflow-hidden
              rounded-[30px]
              border border-white/80
              bg-white/60
              p-6
              shadow-[0_20px_60px_rgba(65,35,85,.08),inset_0_1px_3px_rgba(255,255,255,.95)]
              backdrop-blur-xl
              sm:p-8
              lg:p-10
            "
          >
            <div
              className="
                pointer-events-none absolute inset-x-0 top-0
                h-24
                bg-gradient-to-b
                from-white/70
                to-transparent
              "
            />

            <div className="relative">
              <span
                className="
                  inline-flex items-center
                  rounded-full
                  border border-purple-200/70
                  bg-purple-50/70
                  px-4 py-1.5
                  text-xs font-semibold tracking-wide
                  text-purple-700
                "
              >
                ✦ ASTROLOGY GUIDE
              </span>

              <h2
                className="
                  mt-4
                  max-w-4xl
                  text-2xl font-bold leading-tight
                  text-[#321842]
                  sm:text-3xl
                  lg:text-4xl
                "
              >
                {content.intro.title}
              </h2>

              <div className="mt-5 h-1 w-20 rounded-full bg-gradient-to-r from-purple-500 via-pink-400 to-yellow-400" />

              <p
                className="
                  mt-6 max-w-5xl
                  text-sm leading-7
                  text-[#6b5d72]
                  sm:text-base
                "
              >
                {content.intro.description}
              </p>
            </div>
          </article>
        )}

        {/* =========================================================
            ABOUT
        ========================================================= */}

        {content.about && (
          <article
            className="
              rounded-[28px]
              border border-white/80
              bg-white/55
              p-6
              shadow-[0_20px_50px_rgba(65,35,85,.07)]
              backdrop-blur-xl
              sm:p-8
              lg:p-10
            "
          >
            <SectionHeading title={content.about.title} />

            <div className="mt-5 space-y-4">
              {content.about.paragraphs?.map((paragraph, index) => (
                <p
                  key={index}
                  className="
                    max-w-5xl
                    text-sm leading-7
                    text-[#6b5d72]
                    sm:text-base
                  "
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </article>
        )}

        {/* =========================================================
            CALCULATOR / HOW TO
        ========================================================= */}

        {content.calculator && (
          <article
            className="
              relative overflow-hidden
              rounded-[30px]
              border border-purple-100/80
              bg-gradient-to-br
              from-purple-50/75
              via-white/65
              to-pink-50/65
              p-6
              shadow-[0_20px_50px_rgba(65,35,85,.07)]
              backdrop-blur-xl
              sm:p-8
              lg:p-10
            "
          >
            <div className="relative">
              <SectionHeading
                title={
                  content.calculator.stepsTitle ||
                  content.calculator.title
                }
              />

              {content.calculator.description && (
                <p
                  className="
                    mt-4 max-w-5xl
                    text-sm leading-7
                    text-[#6b5d72]
                    sm:text-base
                  "
                >
                  {content.calculator.description}
                </p>
              )}

              {content.calculator.steps?.length > 0 && (
                <div
                  className="
                    mt-8
                    grid gap-4
                    sm:grid-cols-2
                    lg:grid-cols-5
                  "
                >
                  {content.calculator.steps.map((step, index) => (
                    <div
                      key={index}
                      className="
                        group relative
                        rounded-2xl
                        border border-white/80
                        bg-white/60
                        p-5
                        shadow-[inset_0_1px_3px_white,0_10px_25px_rgba(65,35,85,.05)]
                        backdrop-blur-md
                        transition-all duration-300
                        hover:-translate-y-1
                        hover:shadow-[0_18px_35px_rgba(65,35,85,.09)]
                      "
                    >
                      <div
                        className="
                          flex h-10 w-10
                          items-center justify-center
                          rounded-xl
                          bg-gradient-to-br
                          from-purple-600
                          to-pink-500
                          text-sm font-bold
                          text-white
                          shadow-[0_8px_18px_rgba(126,34,206,.20)]
                        "
                      >
                        {index + 1}
                      </div>

                      <p
                        className="
                          mt-4
                          text-sm font-semibold leading-6
                          text-[#49304f]
                        "
                      >
                        {step}
                      </p>
                    </div>
                  ))}
                </div>
              )}

              {content.calculator.note && (
                <InfoNote>{content.calculator.note}</InfoNote>
              )}
            </div>
          </article>
        )}

        {/* =========================================================
            REPORT
            Used by Gemstone etc.
        ========================================================= */}

        {content.report && (
          <article
            className="
              rounded-[30px]
              border border-white/80
              bg-white/60
              p-6
              shadow-[0_20px_50px_rgba(65,35,85,.07)]
              backdrop-blur-xl
              sm:p-8
              lg:p-10
            "
          >
            <SectionHeading title={content.report.title} />

            {content.report.description && (
              <p
                className="
                  mt-4 max-w-5xl
                  text-sm leading-7
                  text-[#6b5d72]
                  sm:text-base
                "
              >
                {content.report.description}
              </p>
            )}

            {content.report.items?.length > 0 && (
              <div className="mt-8 grid gap-5 md:grid-cols-3">
                {content.report.items.map((item, index) => (
                  <InfoCard
                    key={index}
                    icon="✦"
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </div>
            )}

            {content.report.note && (
              <InfoNote>{content.report.note}</InfoNote>
            )}
          </article>
        )}

        {/* =========================================================
            GENERIC ITEM COLLECTION
            Works for:
            gemstones
            rudrakshas
            future collections
        ========================================================= */}

        {content.gemstones && (
          <CollectionSection
            data={content.gemstones}
            type="gemstone"
          />
        )}

        {content.rudrakshas && (
          <CollectionSection
            data={content.rudrakshas}
            type="rudraksha"
          />
        )}

        {/* =========================================================
            ASTROLOGY
        ========================================================= */}

        {content.astrology && (
          <TextSection data={content.astrology} />
        )}

        {/* =========================================================
            ZODIAC
        ========================================================= */}

        {content.zodiac && (
          <TextSection data={content.zodiac} />
        )}

        {/* =========================================================
            BENEFITS
        ========================================================= */}

        {content.benefits && (
          <article
            className="
              rounded-[30px]
              border border-white/80
              bg-gradient-to-br
              from-pink-50/60
              via-white/60
              to-purple-50/60
              p-6
              shadow-[0_20px_50px_rgba(65,35,85,.07)]
              backdrop-blur-xl
              sm:p-8
              lg:p-10
            "
          >
            <SectionHeading title={content.benefits.title} />

            {content.benefits.description && (
              <p
                className="
                  mt-4 max-w-5xl
                  text-sm leading-7
                  text-[#6b5d72]
                  sm:text-base
                "
              >
                {content.benefits.description}
              </p>
            )}

            {content.benefits.items?.length > 0 && (
              <div
                className="
                  mt-8
                  grid gap-4
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >
                {content.benefits.items.map((item, index) => (
                  <InfoCard
                    key={index}
                    icon="✦"
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </div>
            )}
          </article>
        )}

        {/* =========================================================
            WEARING
        ========================================================= */}

        {content.wearing && (
          <article
            className="
              rounded-[30px]
              border border-purple-100/80
              bg-white/60
              p-6
              shadow-[0_20px_50px_rgba(65,35,85,.07)]
              backdrop-blur-xl
              sm:p-8
              lg:p-10
            "
          >
            <SectionHeading title={content.wearing.title} />

            {content.wearing.description && (
              <p
                className="
                  mt-4 max-w-5xl
                  text-sm leading-7
                  text-[#6b5d72]
                  sm:text-base
                "
              >
                {content.wearing.description}
              </p>
            )}

            {content.wearing.considerations?.length > 0 && (
              <div
                className="
                  mt-8
                  grid gap-4
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >
                {content.wearing.considerations.map((item, index) => (
                  <div
                    key={index}
                    className="
                      rounded-2xl
                      border border-purple-100
                      bg-white/60
                      p-5
                      shadow-[inset_0_1px_3px_white,0_8px_20px_rgba(65,35,85,.04)]
                      transition-all duration-300
                      hover:-translate-y-1
                    "
                  >
                    <div className="flex items-center gap-3">
                      <span
                        className="
                          flex h-9 w-9 shrink-0
                          items-center justify-center
                          rounded-xl
                          bg-gradient-to-br
                          from-purple-100
                          to-pink-100
                          text-sm font-bold
                          text-purple-700
                        "
                      >
                        ✓
                      </span>

                      <h3 className="font-bold text-[#492650]">
                        {item.title}
                      </h3>
                    </div>

                    <p
                      className="
                        mt-3
                        text-sm leading-6
                        text-[#706176]
                      "
                    >
                      {item.description}
                    </p>
                  </div>
                ))}
              </div>
            )}

            {content.wearing.note && (
              <InfoNote variant="yellow">
                {content.wearing.note}
              </InfoNote>
            )}
          </article>
        )}

        {/* =========================================================
            AUTHENTICITY
        ========================================================= */}

        {content.authenticity && (
          <article
            className="
              rounded-[30px]
              border border-white/80
              bg-gradient-to-br
              from-yellow-50/60
              via-white/65
              to-pink-50/60
              p-6
              shadow-[0_20px_50px_rgba(65,35,85,.07)]
              backdrop-blur-xl
              sm:p-8
              lg:p-10
            "
          >
            <SectionHeading title={content.authenticity.title} />

            {content.authenticity.description && (
              <p
                className="
                  mt-4 max-w-5xl
                  text-sm leading-7
                  text-[#6b5d72]
                  sm:text-base
                "
              >
                {content.authenticity.description}
              </p>
            )}

            {content.authenticity.items?.length > 0 && (
              <div
                className="
                  mt-8
                  grid gap-4
                  sm:grid-cols-2
                  lg:grid-cols-3
                "
              >
                {content.authenticity.items.map((item, index) => (
                  <InfoCard
                    key={index}
                    icon="✓"
                    title={item.title}
                    description={item.description}
                  />
                ))}
              </div>
            )}

            {content.authenticity.note && (
              <InfoNote variant="yellow">
                {content.authenticity.note}
              </InfoNote>
            )}
          </article>
        )}

        {/* =========================================================
            CONSULTATION
        ========================================================= */}

        {content.consultation && (
          <article
            className="
              relative overflow-hidden
              rounded-[30px]
              border border-purple-200/60
              bg-gradient-to-br
              from-purple-100/70
              via-pink-50/70
              to-yellow-50/70
              p-6
              shadow-[0_20px_50px_rgba(65,35,85,.08)]
              backdrop-blur-xl
              sm:p-8
              lg:p-10
            "
          >
            <div
              className="
                pointer-events-none absolute
                -right-20 -top-20
                h-56 w-56
                rounded-full
                bg-purple-300/20
                blur-3xl
              "
            />

            <div className="relative">
              <span
                className="
                  inline-flex rounded-full
                  bg-white/70
                  px-4 py-1.5
                  text-xs font-semibold
                  text-purple-700
                "
              >
                EXPERT GUIDANCE
              </span>

              <h2
                className="
                  mt-4 max-w-3xl
                  text-2xl font-bold
                  text-[#351944]
                  sm:text-3xl
                "
              >
                {content.consultation.title}
              </h2>

              {content.consultation.description && (
                <p
                  className="
                    mt-4 max-w-5xl
                    text-sm leading-7
                    text-[#67586e]
                    sm:text-base
                  "
                >
                  {content.consultation.description}
                </p>
              )}

              {content.consultation.additional && (
                <p
                  className="
                    mt-4 max-w-5xl
                    text-sm leading-7
                    text-[#67586e]
                    sm:text-base
                  "
                >
                  {content.consultation.additional}
                </p>
              )}
            </div>
          </article>
        )}

        {/* =========================================================
            FAQ
        ========================================================= */}

        {content.faqs &&
          ((Array.isArray(content.faqs) && content.faqs.length > 0) ||
            content.faqs.items?.length > 0) && (
            <article
              className="
                rounded-[30px]
                border border-white/80
                bg-white/60
                p-6
                shadow-[0_20px_50px_rgba(65,35,85,.07)]
                backdrop-blur-xl
                sm:p-8
                lg:p-10
              "
            >
              <div className="max-w-4xl">
                <span
                  className="
                    inline-flex rounded-full
                    bg-purple-50
                    px-4 py-1.5
                    text-xs font-semibold
                    text-purple-700
                  "
                >
                  FAQ
                </span>

                <h2
                  className="
                    mt-4
                    text-2xl font-bold
                    text-[#351944]
                    sm:text-3xl
                  "
                >
                  {Array.isArray(content.faqs)
                    ? "Frequently Asked Questions"
                    : content.faqs.title}
                </h2>
              </div>

              <div className="mt-7 space-y-3">
                {(Array.isArray(content.faqs)
                  ? content.faqs
                  : content.faqs.items
                ).map((faq, index) => {
                  const isOpen = openFaq === index;

                  return (
                    <div
                      key={index}
                      className="
                        overflow-hidden
                        rounded-2xl
                        border border-purple-100
                        bg-white/60
                        transition-all duration-300
                      "
                    >
                      <button
                        type="button"
                        onClick={() => toggleFaq(index)}
                        className="
                          flex w-full
                          items-center justify-between
                          gap-5
                          px-5 py-5
                          text-left
                        "
                      >
                        <span
                          className="
                            text-sm font-semibold leading-6
                            text-[#43214d]
                            sm:text-base
                          "
                        >
                          {index + 1}. {faq.question}
                        </span>

                        <span
                          className={`
                            flex h-8 w-8 shrink-0
                            items-center justify-center
                            rounded-full
                            bg-purple-50
                            text-lg font-medium
                            text-purple-600
                            transition-transform duration-300
                            ${isOpen ? "rotate-45" : ""}
                          `}
                        >
                          +
                        </span>
                      </button>

                      {isOpen && (
                        <div
                          className="
                            border-t border-purple-100
                            px-5 pb-5 pt-4
                            text-sm leading-7
                            text-[#706176]
                          "
                        >
                          {faq.answer}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </article>
          )}

        {/* =========================================================
            DISCLAIMER
        ========================================================= */}

        {content.disclaimer && (
          <div
            className="
              rounded-2xl
              border border-purple-100
              bg-purple-50/50
              px-5 py-4
              text-xs leading-6
              text-[#706176]
              sm:text-sm
            "
          >
            <span className="font-semibold text-purple-700">
              Disclaimer:
            </span>{" "}
            {content.disclaimer}
          </div>
        )}
      </div>
    </section>
  );
}


/* ================================================================
   SECTION HEADING
================================================================ */

function SectionHeading({ title }) {
  if (!title) return null;

  return (
    <>
      <h2
        className="
          text-2xl font-bold
          leading-tight
          text-[#351944]
          sm:text-3xl
        "
      >
        {title}
      </h2>

      <div
        className="
          mt-4
          h-1 w-20
          rounded-full
          bg-gradient-to-r
          from-purple-500
          via-pink-400
          to-yellow-400
        "
      />
    </>
  );
}


/* ================================================================
   TEXT SECTION
   Used for Astrology / Zodiac etc.
================================================================ */

function TextSection({ data }) {
  return (
    <article
      className="
        rounded-[30px]
        border border-white/80
        bg-white/60
        p-6
        shadow-[0_20px_50px_rgba(65,35,85,.07)]
        backdrop-blur-xl
        sm:p-8
        lg:p-10
      "
    >
      <SectionHeading title={data.title} />

      <div className="mt-6 space-y-4">
        {data.paragraphs?.map((paragraph, index) => (
          <p
            key={index}
            className="
              max-w-5xl
              text-sm leading-7
              text-[#6b5d72]
              sm:text-base
            "
          >
            {paragraph}
          </p>
        ))}
      </div>
    </article>
  );
}


/* ================================================================
   COLLECTION SECTION
   Gemstones / Rudrakshas / future collections
================================================================ */

function CollectionSection({ data, type }) {
  if (!data) return null;

  const isRudraksha = type === "rudraksha";

  return (
    <article
      className="
        rounded-[30px]
        border border-white/80
        bg-gradient-to-br
        from-yellow-50/55
        via-white/65
        to-pink-50/55
        p-6
        shadow-[0_20px_50px_rgba(65,35,85,.07)]
        backdrop-blur-xl
        sm:p-8
        lg:p-10
      "
    >
      <SectionHeading title={data.title} />

      {data.intro && (
        <p
          className="
            mt-5 max-w-5xl
            text-sm leading-7
            text-[#6b5d72]
            sm:text-base
          "
        >
          {data.intro}
        </p>
      )}

      <div
        className="
          mt-8
          grid gap-5
          sm:grid-cols-2
          lg:grid-cols-3
        "
      >
        {data.items?.map((item, index) => (
          <div
            key={item.number || index}
            className="
              group relative
              overflow-hidden
              rounded-[22px]
              border border-white/80
              bg-white/65
              p-6
              shadow-[inset_0_1px_3px_white,0_12px_30px_rgba(65,35,85,.06)]
              backdrop-blur-md
              transition-all duration-300
              hover:-translate-y-1
              hover:shadow-[0_18px_40px_rgba(65,35,85,.10)]
            "
          >
            {/* Number */}
            {item.number && (
              <div
                className="
                  absolute right-4 top-4
                  flex h-8 w-8
                  items-center justify-center
                  rounded-full
                  bg-purple-50
                  text-xs font-bold
                  text-purple-600
                "
              >
                {String(item.number).padStart(2, "0")}
              </div>
            )}

            {/* Icon */}
            <div
              className="
                flex h-14 w-14
                items-center justify-center
                rounded-2xl
                bg-gradient-to-br
                from-purple-100
                via-pink-50
                to-yellow-100
                text-xl
                text-purple-700
                shadow-[inset_2px_2px_6px_white,4px_5px_15px_rgba(65,35,85,.08)]
              "
            >
              {isRudraksha ? "ॐ" : "✦"}
            </div>

            {/* Title */}
            <h3
              className="
                mt-5 pr-8
                text-lg font-bold
                text-[#42204e]
              "
            >
              {item.name || item.title}
            </h3>

            {/* Secondary information */}
            {(item.hindiName || item.planet || item.deity) && (
              <div className="mt-3 flex flex-wrap gap-2">
                {item.hindiName && (
                  <span
                    className="
                      rounded-full
                      bg-pink-50
                      px-3 py-1
                      text-xs font-medium
                      text-pink-700
                    "
                  >
                    {item.hindiName}
                  </span>
                )}

                {item.planet && (
                  <span
                    className="
                      rounded-full
                      bg-purple-50
                      px-3 py-1
                      text-xs font-semibold
                      text-purple-700
                    "
                  >
                    {item.planet}
                  </span>
                )}

                {item.deity && (
                  <span
                    className="
                      rounded-full
                      bg-yellow-50
                      px-3 py-1
                      text-xs font-semibold
                      text-yellow-800
                    "
                  >
                    {item.deity}
                  </span>
                )}
              </div>
            )}

            {/* Description */}
            {item.description && (
              <p
                className="
                  mt-4
                  text-sm leading-6
                  text-[#706176]
                "
              >
                {item.description}
              </p>
            )}

            {/* Additional */}
            {item.additional && (
              <p
                className="
                  mt-3
                  text-xs leading-5
                  text-[#8a7a91]
                "
              >
                {item.additional}
              </p>
            )}
          </div>
        ))}
      </div>

      {data.note && <InfoNote>{data.note}</InfoNote>}
    </article>
  );
}


/* ================================================================
   INFO CARD
================================================================ */

function InfoCard({ icon = "✦", title, description }) {
  return (
    <div
      className="
        rounded-2xl
        border border-white/80
        bg-white/60
        p-5
        shadow-[inset_0_1px_3px_white,0_12px_30px_rgba(65,35,85,.06)]
        backdrop-blur-md
        transition-all duration-300
        hover:-translate-y-1
      "
    >
      <div
        className="
          flex h-12 w-12
          items-center justify-center
          rounded-2xl
          bg-gradient-to-br
          from-purple-100
          to-pink-100
          text-lg
          text-purple-700
          shadow-[inset_2px_2px_5px_white,4px_5px_12px_rgba(65,35,85,.08)]
        "
      >
        {icon}
      </div>

      <h3
        className="
          mt-5
          text-lg font-bold
          text-[#42204e]
        "
      >
        {title}
      </h3>

      {description && (
        <p
          className="
            mt-3
            text-sm leading-6
            text-[#706176]
          "
        >
          {description}
        </p>
      )}
    </div>
  );
}


/* ================================================================
   INFO NOTE
================================================================ */

function InfoNote({ children, variant = "purple" }) {
  const classes =
    variant === "yellow"
      ? "border-yellow-200 bg-yellow-50/60 text-[#66565d]"
      : "border-purple-100 bg-purple-50/50 text-[#685770]";

  return (
    <div
      className={`
        mt-6
        rounded-2xl
        border
        px-5 py-4
        text-sm leading-6
        ${classes}
      `}
    >
      {children}
    </div>
  );
}