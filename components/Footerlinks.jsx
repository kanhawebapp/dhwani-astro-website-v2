"use client";

import Image from "next/image";
import {
  FaInstagram,
  FaFacebookF,
  FaLinkedinIn,
  FaYoutube,
} from "react-icons/fa";
import Link from "next/link";
import { useLanguage } from "../app/context/LangContext";

export default function Footerlinks() {
  const { messages: t } = useLanguage();
  const footlink = [
    { id: 1, ulname: `${t.footer.horo1}`, link: "/freeservices/horoscope" },
    {
      id: 2,
      ulname: `${t.footer.horo2}`,
      link: "/freeservices/horoscope#zodiac",
    },
    {
      id: 3,
      ulname: `${t.footer.horo3}`,
      link: "/freeservices/horoscope#zodiac",
    },
  ];
  const implink = [
    { id: 1, ulname: `${t.footer.li1}`, link: "/astrologer/chat" },
    { id: 2, ulname: `${t.footer.li2}`, link: "/astrologer/call" },
    { id: 3, ulname: `${t.footer.li3}`, link: "https://shop.dhwaniastro.com/" },
    { id: 4, ulname: `${t.footer.li4}`, link: "/freeservices/kundali" },
    { id: 5, ulname: `${t.footer.li5}`, link: "/freeservices/numerology" },
    { id: 6, ulname: `${t.footer.li6}`, link: "/blogs" },
    { id: 7, ulname: `${t.footer.li7}`, link: "/" },
    { id: 8, ulname: `${t.footer.li8}`, link: "/freeservices/panchang" },
  ];
  const problink = [
    {
      id: 1,
      ulname: `${t.footer.p1}`,
      link: "/dhwani-services/consultation/marriage",
    },
    {
      id: 2,
      ulname: `${t.footer.p2}`,
      link: "/dhwani-services/consultation/education",
    },
    {
      id: 3,
      ulname: `${t.footer.p3}`,
      link: "/dhwani-services/consultation/moneyandfame",
    },
  ];

  return (
    <footer>
      <section className="footer-new flex flex-col items-center bg-linear-to-r from-purple-900  to-purple-900  footer-mb pt-8">
        <div className="flex flex-col items-center justify-center gap-2">
          <Image
            src="/ds-img/logo.webp"
            unoptimized
            width={100}
            height={100}
            className="h-auto w-36 sm:w-40"
            alt="Dhwani Astro"
          />

          <p className="max-w-md text-center font-serif text-sm italic tracking-wide text-yellow-400 sm:text-base">
            "{t?.footer?.main || "Unlock the wisdom of the stars"}"
          </p>
        </div>
        <div className="w-[90%] flex flex-col place-self-center self-center justify-center p-1 md:p-2 gap-4">
          <div className="flex flex-wrap items-start justify-around ds-imp-links">
            <div className="flex flex-col items-start w-1/2 imp-links sm:w-1/4">
              <div className="flex flex-col items-start">
                <h2 className="text-sm sm:text-base underline ab-po-h underline-offset-4">
                  {t?.footer?.link1 || "Important Links"}
                </h2>

                <ul className="footer_head">
                  {implink.map((impli) => (
                    <li key={impli.id} className="flex items-center gap-0.5">
                      <svg
                        width={15}
                        height={15}
                        viewBox="0 0 50 50"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          fill="#fdc700"
                          d="M15.563,40.836c0.195,0.195,0.451,0.293,0.707,0.293s0.512-0.098,0.707-0.293l15-15c0.391-0.391,0.391-1.023,0-1.414l-15-15c-0.391-0.391-1.023-0.391-1.414,0s-0.391,1.023,0,1.414l14.293,14.293L15.563,39.422C15.172,39.813,15.172,40.446,15.563,40.836z"
                        />
                      </svg>
                      <Link
                        href={impli.link}
                        className="text-xs sm:text-sm lg:text-sm"
                      >
                        {impli.ulname}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-start w-1/2 imp-links sm:w-1/4">
              <div className="flex flex-col items-start">
                <h2 className="text-sm sm:text-base underline ab-po-h underline-offset-4">
                  {t?.footer?.link2 || "Problem Links"}
                </h2>

                <ul className="footer_head">
                  {problink.map((otlin) => (
                    <li key={otlin.id} className="flex items-center gap-0.5">
                      <svg
                        width={15}
                        height={15}
                        viewBox="0 0 50 50"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          fill="#fdc700"
                          d="M15.563,40.836c0.195,0.195,0.451,0.293,0.707,0.293s0.512-0.098,0.707-0.293l15-15c0.391-0.391,0.391-1.023,0-1.414l-15-15c-0.391-0.391-1.023-0.391-1.414,0s-0.391,1.023,0,1.414l14.293,14.293L15.563,39.422C15.172,39.813,15.172,40.446,15.563,40.836z"
                        />
                      </svg>
                      <Link
                        href={
                          otlin.slug
                            ? `${otlin.link}?slug=${otlin.slug}`
                            : otlin.link
                        }
                        className="text-xs sm:text-sm lg:text-sm"
                      >
                        {otlin.ulname}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-start w-1/2 horo-links my-2 sm:my-0 sm:w-1/4">
              <div className="flex flex-col items-start">
                <h2 className="text-sm sm:text-base underline ab-po-h underline-offset-4">
                  {t?.footer?.link3 || "Horoscope Links"}
                </h2>

                <ul className="text-sm foot-horo-link ">
                  {footlink.map((flink) => (
                    <li
                      key={flink.id}
                      className="flex items-center gap-0.5 text-sm"
                    >
                      <svg
                        width={15}
                        height={15}
                        viewBox="0 0 50 50"
                        xmlns="http://www.w3.org/2000/svg"
                        aria-hidden="true"
                      >
                        <path
                          fill="#fdc700"
                          d="M15.563,40.836c0.195,0.195,0.451,0.293,0.707,0.293s0.512-0.098,0.707-0.293l15-15c0.391-0.391,0.391-1.023,0-1.414l-15-15c-0.391-0.391-1.023-0.391-1.414,0s-0.391,1.023,0,1.414l14.293,14.293L15.563,39.422C15.172,39.813,15.172,40.446,15.563,40.836z"
                        />
                      </svg>
                      <Link
                        href={flink.link}
                        className="text-xs sm:text-sm lg:text-sm"
                      >
                        {flink.ulname}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-start w-1/2 imp-links my-2 sm:my-0  sm:w-1/4">
              <div className="flex flex-col items-start">
                <h2 className="text-sm sm:text-base underline ab-po-h underline-offset-4">
                  {t?.footer?.link4 || "Dhwani Astro Links"}
                </h2>
                <ul className="footer_head">
                  <li className="flex items-center gap-0.5">
                    <svg
                      width={15}
                      height={15}
                      viewBox="0 0 50 50"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        fill="#fdc700"
                        d="M15.563,40.836c0.195,0.195,0.451,0.293,0.707,0.293s0.512-0.098,0.707-0.293l15-15c0.391-0.391,0.391-1.023,0-1.414l-15-15c-0.391-0.391-1.023-0.391-1.414,0s-0.391,1.023,0,1.414l14.293,14.293L15.563,39.422C15.172,39.813,15.172,40.446,15.563,40.836z"
                      />
                    </svg>
                    <Link
                      href="https://astro-panel.onrender.com/"
                      className="text-xs sm:text-sm lg:text-base"
                    >
                      {t?.footer?.astro2 || "Astrologer Login"}
                    </Link>
                  </li>
                  <li className="flex items-center gap-0.5">
                    <svg
                      width={15}
                      height={15}
                      viewBox="0 0 50 50"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        fill="#fdc700"
                        d="M15.563,40.836c0.195,0.195,0.451,0.293,0.707,0.293s0.512-0.098,0.707-0.293l15-15c0.391-0.391,0.391-1.023,0-1.414l-15-15c-0.391-0.391-1.023-0.391-1.414,0s-0.391,1.023,0,1.414l14.293,14.293L15.563,39.422C15.172,39.813,15.172,40.446,15.563,40.836z"
                      />
                    </svg>
                    <Link
                      href="/astrologerRegistration"
                      target="_blank"
                      className="text-xs sm:text-sm lg:text-sm"
                    >
                      {t?.footer?.astro3 || "Astrologer Registration"}
                    </Link>
                  </li>

                  <li className="flex items-center gap-0.5">
                    <svg
                      width={15}
                      height={15}
                      viewBox="0 0 50 50"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        fill="#fdc700"
                        d="M15.563,40.836c0.195,0.195,0.451,0.293,0.707,0.293s0.512-0.098,0.707-0.293l15-15c0.391-0.391,0.391-1.023,0-1.414l-15-15c-0.391-0.391-1.023-0.391-1.414,0s-0.391,1.023,0,1.414l14.293,14.293L15.563,39.422C15.172,39.813,15.172,40.446,15.563,40.836z"
                      />
                    </svg>
                    <Link
                      href="/static/disclaimer"
                      className="text-xs sm:text-sm lg:text-sm"
                    >
                      {t?.footer?.astro4 || "Disclaimer"}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap items-start justify-around  foot-con-trst">
            <div className="flex flex-col items-start w-1/2 contact_list sm:w-1/4">
              <div className="flex flex-col items-start">
                <h2 className="text-sm sm:text-base underline ab-po-h underline-offset-4">
                  {t?.footer?.contact || "Contact Us"}
                </h2>
                <ul className="footer_head text-white">
                  <li className="flex items-start gap-1">
                    <svg
                      width={12}
                      height={12}
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                    >
                      <path
                        fill="#fdc700"
                        d="M8,0 C11.3137,0 14,2.68629 14,6 C14,7.33918 13.5613,8.57588 12.8197,9.57422 L7.99994,16 L3.1803,9.57422 C2.43873,8.57588 2,7.33918 2,6 C2,2.68629 4.68629,0 8,0 Z M8,2 C5.79086,2 4,3.79086 4,6 C4,6.89363 4.29068,7.71358 4.78334,8.37826 L7.99996,12.6668 L11.2167,8.37817 C11.7093,7.71351 12,6.89359 12,6 C12,3.79086 10.2091,2 8,2 Z M8,4 C9.10457,4 10,4.89543 10,6 C10,7.10457 9.10457,8 8,8 C6.89543,8 6,7.10457 6,6 C6,4.89543 6.89543,4 8,4 Z"
                      />
                    </svg>
                    <span
                      dangerouslySetInnerHTML={{
                        __html:
                          t?.footer?.add ||
                          "908, 9th Floor, Mercantile <br /> House, KG Marg, New Delhi",
                      }}
                      className="text-xs sm:text-sm lg:text-sm"
                    ></span>
                  </li>
                  <li className="flex items-center gap-1">
                    <svg
                      fill="#fdc700"
                      width={12}
                      height={12}
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                    >
                      <path d="M19 7h-14c-1.104 0-2 .896-2 2v9c0 1.104.896 2 2 2h14c1.104 0 2-.896 2-2v-9c0-1.104-.896-2-2-2zm-9.684 7.316l1.602 1.4c.305.266.691.398 1.082.398s.777-.133 1.082-.398l1.602-1.4-.037.037 3.646 3.646h-12.586l3.646-3.646-.037-.037zm-4.316 2.977v-6.753l3.602 3.151-3.602 3.602zm10.398-3.602l3.602-3.151v6.75l-3.602-3.599zm3.602-4.691v.21l-6.576 5.754c-.227.198-.621.198-.848 0l-6.576-5.754v-.21h14z" />
                    </svg>{" "}
                    <span
                      href="mailto:support@dhwaniastro.com"
                      className="text-xs sm:text-sm lg:text-sm"
                    >
                      support@dhwaniastro.com
                    </span>
                  </li>
                  <li className="flex items-center gap-1">
                    <svg
                      width={12}
                      height={12}
                      viewBox="0 0 16 16"
                      aria-hidden="true"
                      className="si-glyph si-glyph-call"
                    >
                      <g
                        stroke="none"
                        strokeWidth="1"
                        fill="none"
                        fillRule="evenodd"
                      >
                        <path
                          d="M14.031,11.852 C13.603,11.313 12.908,10.532 12.313,10.458 C11.951,10.413 11.535,10.713 11.125,10.996 C11.045,11.036 10.427,11.404 10.352,11.426 C9.956,11.539 9.111,11.572 8.6,11.106 C8.108,10.656 7.33,9.823 6.702,9.06 C6.102,8.274 5.473,7.329 5.151,6.749 C4.815,6.148 5.057,5.353 5.265,5.003 C5.303,4.94 5.763,4.467 5.866,4.357 L5.881,4.375 C6.262,4.055 6.661,3.73 6.706,3.378 C6.78,2.792 6.181,1.939 5.753,1.399 C5.325,0.858 4.662,-0.089 3.759,0.045 C3.419,0.095 3.126,0.214 2.837,0.385 L2.829,0.376 C2.823,0.38 2.795,0.402 2.781,0.413 C2.772,0.418 2.764,0.421 2.756,0.426 L2.759,0.43 C2.593,0.558 2.119,0.912 2.065,0.96 C1.479,1.481 0.597,2.708 1.279,4.915 C1.785,6.555 2.864,8.481 4.334,10.429 L4.326,10.436 C4.398,10.53 4.472,10.615 4.547,10.706 C4.617,10.799 4.686,10.891 4.758,10.983 L4.768,10.976 C6.328,12.855 7.964,14.357 9.457,15.243 C11.467,16.435 12.896,15.898 13.556,15.471 C13.618,15.43 14.09,15.063 14.25,14.942 L14.254,14.946 C14.26,14.94 14.264,14.932 14.272,14.926 C14.284,14.917 14.31,14.897 14.315,14.893 L14.309,14.885 C14.551,14.651 14.745,14.401 14.879,14.086 C15.23,13.257 14.459,12.393 14.031,11.852 L14.031,11.852 Z"
                          fill="#fdc700"
                          className="si-glyph-fill"
                        ></path>
                      </g>
                    </svg>
                    <span
                      href="tel:916366526901"
                      className="text-xs sm:text-sm lg:text-sm"
                    >
                      {" "}
                      +91 6366526901
                    </span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-start content-start w-1/2 ab-pr-po sm:w-1/4 text-end">
              <div className="flex flex-col items-start">
                <h2 className="text-sm sm:text-base underline ab-po-h underline-offset-4">
                  {t?.footer?.business || "Business Information"}
                </h2>

                <ul className="flex flex-col items-start footer_head">
                  <li className="flex items-center gap-0.5">
                    <svg
                      width={15}
                      height={15}
                      viewBox="0 0 50 50"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        fill="#fdc700"
                        d="M15.563,40.836c0.195,0.195,0.451,0.293,0.707,0.293s0.512-0.098,0.707-0.293l15-15c0.391-0.391,0.391-1.023,0-1.414l-15-15c-0.391-0.391-1.023-0.391-1.414,0s-0.391,1.023,0,1.414l14.293,14.293L15.563,39.422C15.172,39.813,15.172,40.446,15.563,40.836z"
                      />
                    </svg>
                    <Link
                      href="/static/about"
                      className="text-xs sm:text-sm lg:text-sm"
                    >
                      {t?.footer?.about || "About Us"}
                    </Link>
                  </li>
                  <li className="flex items-center gap-0.5">
                    <svg
                      width={15}
                      height={15}
                      viewBox="0 0 50 50"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        fill="#fdc700"
                        d="M15.563,40.836c0.195,0.195,0.451,0.293,0.707,0.293s0.512-0.098,0.707-0.293l15-15c0.391-0.391,0.391-1.023,0-1.414l-15-15c-0.391-0.391-1.023-0.391-1.414,0s-0.391,1.023,0,1.414l14.293,14.293L15.563,39.422C15.172,39.813,15.172,40.446,15.563,40.836z"
                      />
                    </svg>
                    <Link
                      href="/static/privacy"
                      className="text-xs sm:text-sm lg:text-sm"
                    >
                      {t?.footer?.privacy || "Privacy Policy"}
                    </Link>
                  </li>
                  <li className="flex items-center gap-0.5">
                    <svg
                      width={15}
                      height={15}
                      viewBox="0 0 50 50"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden="true"
                    >
                      <path
                        fill="#fdc700"
                        d="M15.563,40.836c0.195,0.195,0.451,0.293,0.707,0.293s0.512-0.098,0.707-0.293l15-15c0.391-0.391,0.391-1.023,0-1.414l-15-15c-0.391-0.391-1.023-0.391-1.414,0s-0.391,1.023,0,1.414l14.293,14.293L15.563,39.422C15.172,39.813,15.172,40.446,15.563,40.836z"
                      />
                    </svg>
                    <Link
                      href="/static/refund"
                      className="text-xs sm:text-sm lg:text-sm"
                    >
                      {t?.footer?.refund || "Refund Policy"}
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-start w-1/2 my-2 sm:my-0 footer-trust sm:w-1/4">
              <div className="flex flex-col items-start">
                <h2 className="text-sm sm:text-base underline ab-po-h underline-offset-4">
                  {t?.footer?.why || "Trust & Safety"}
                </h2>

                <ul className="flex flex-col fot_link">
                  <li className="foot-li sm:px-[5px]">
                    <div href="#" className="flex items-center gap-1">
                      <Image
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        src="/ds-img/Privacy.webp"
                        alt="logo image"
                        loading="lazy"
                        height={120}
                        width={120}
                      />
                      <span className="flex items-center foot-trst-spn">
                        <h3
                          dangerouslySetInnerHTML={{
                            __html: t?.footer?.w1 || "100%",
                          }}
                          className="text-xs foot-h-sp sm:text-xs lg:text-sm"
                        />
                      </span>
                    </div>
                  </li>

                  <li className="foot-li sm:px-[5px]">
                    <div href="#" className="flex items-center gap-1">
                      <Image
                        className="w-5 h-5 sm:w-6 sm:h-5"
                        src="/ds-img/verifide-icon.webp"
                        alt="logo image"
                        loading="lazy"
                        height={120}
                        width={120}
                      />
                      <span className="flex items-center foot-trst-spn">
                        <h3
                          dangerouslySetInnerHTML={{
                            __html: t?.footer?.w2 || "100%",
                          }}
                          className="text-xs foot-h-sp sm:text-xs lg:text-sm"
                        />
                      </span>
                    </div>
                  </li>

                  <li className="foot-li sm:px-[5px]">
                    <div href="#" className="flex items-center gap-1">
                      <Image
                        className="w-5 h-5 sm:w-6 sm:h-6"
                        src="/ds-img/foot-sure-img.webp"
                        alt="logo image"
                        loading="lazy"
                        height={120}
                        width={120}
                      />
                      <span className="flex items-center foot-trst-spn">
                        <h3
                          dangerouslySetInnerHTML={{
                            __html: t?.footer?.w3 || "100%",
                          }}
                          className="text-xs foot-h-sp sm:text-xs lg:text-sm"
                        />
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>

            <div className="flex flex-col items-start justify-start w-1/2 my-2 sm:my-0 gap-2 app-down sm:w-1/4">
              <div className="flex flex-col items-start">
                <h2 className="text-sm sm:text-base underline ab-po-h underline-offset-4">
                  {t?.footer?.dwn || "Download App"}
                </h2>

                <div className="flex flex-col gap-3  items-center justify-center ">
                  <Link
                    href="https://play.google.com/store/apps/details?id=com.DhwaniAstro.app"
                    target="_blank"
                  >
                    <Image
                      className="dwonloadd-img"
                      src="/ds-img/gply.png"
                      alt="Play store"
                      loading="lazy"
                      height={120}
                      width={120}
                    />
                  </Link>

                  <Link
                    href="https://apps.apple.com/in/app/dhwaniastro/id6467093479"
                    target="_blank"
                  >
                    <Image
                      className="dwonload-img"
                      src="/ds-img/apd.webp"
                      alt="Apple Store"
                      loading="lazy"
                      height={120}
                      width={120}
                    />
                  </Link>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-5 border-t border-white/10 pt-4 sm:pt-8">
            <div className="flex flex-col items-center justify-center gap-6">
              <div className="text-center">
                <p className="text-xs sm:text-sm font-medium text-white/70">
                  Connect with Dhwani Astro
                </p>
                <p className="mt-1 text-[10px] text-xs text-white/40">
                  Follow us for daily astrology insights
                </p>
              </div>

              <div className="flex items-center justify-center gap-3">
                <Link
                  href="https://www.youtube.com/@dhwaniastro"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="YouTube"
                  className="group flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/50 text-white transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.2)]"
                >
                  <FaYoutube className="text-[12px] sm:text-[16px] transition-transform duration-300 group-hover:scale-110" />
                </Link>

                <Link
                  href="https://www.facebook.com/dhwaniastro"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Facebook"
                  className="group flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/50 text-white transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.2)]"
                >
                  <FaFacebookF className="text-[12px] sm:text-[16px] transition-transform duration-300 group-hover:scale-110" />
                </Link>

                <Link
                  href="https://www.linkedin.com/company/dhwani-astro11/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="LinkedIn"
                  className="group flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/50 text-white transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.2)]"
                >
                  <FaLinkedinIn className="text-[12px] sm:text-[16px] transition-transform duration-300 group-hover:scale-110" />
                </Link>

                <Link
                  href="https://www.instagram.com/healer.dhwaaani/"
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label="Instagram"
                  className="group flex h-8 w-8 sm:h-11 sm:w-11 items-center justify-center rounded-full border border-white/50 text-white transition-all duration-300 hover:border-yellow-400 hover:bg-yellow-400/10 hover:text-yellow-400 hover:shadow-[0_0_20px_rgba(250,204,21,0.2)]"
                >
                  <FaInstagram className="text-[12px] sm:text-[16px] transition-transform duration-300 group-hover:scale-110" />
                </Link>
              </div>
            </div>

            <div className="mt-4 sm:mt-8 border-t border-white/10 pt-5 text-center">
              <p className="text-xs text-white/50 sm:text-sm">
                © 2026 Dhwani Astro. All Rights Reserved.
              </p>
            </div>
          </div>
        </div>
      </section>

      <div className="foot-down-app" id="foot-down-app">
        <div className="download-app">
          <div className="flex items-center justify-between dwn-app-img">
            <Image
              className="dwn-app-image"
              src="/ds-img/logo.webp"
              loading="lazy"
              height={120}
              width={120}
              alt="logo-2 image"
            />
            <h3 className="dwn-span">
              Unlock more features by downloading the Dhwani Astro app today!
            </h3>
            <div className="dwn-btn-open">
              <button aria-label="Open App" className="open-btn">
                App
              </button>
            </div>
            <span className="dwn-icon">
              <i className="text-white fa-regular fa-circle-xmark"></i>
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
