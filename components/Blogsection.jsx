"use client";

import Image from "next/image";
import Link from "next/link";

import { Swiper, SwiperSlide } from "swiper/react";
import "swiper/css";
import "swiper/css/navigation";

import { Navigation, Autoplay } from "swiper/modules";
import { useLanguage } from "@/app/context/LangContext";
import CustomButton from "./Custom/CustomButton";
import useScrollZoom from "@/Hooks/scrollZoom";
import { GET_BLOGS } from "@/app/graphql/gqlQuery";
import { useQuery } from "@apollo/client/react";
import { useRouter } from "next/navigation";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function Blogsection() {
  const router = useRouter();
  const { messages: t } = useLanguage();

  useScrollZoom(".head-wrap");

  const { data, loading, error } = useQuery(GET_BLOGS);

  const blogs = data?.blogs || [];

  const formatDate = (date) => {
    const timestamp = parseInt(date, 10);

    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return <section className="py-10 text-center">Loading blogs...</section>;
  }

  if (error) {
    return (
      <section className="py-10 text-center text-red-500">
        Failed to load blogs
      </section>
    );
  }
  return (
    <section className="flex flex-col gap-4 w-full items-center self-center sm:max-w-7xl sm:my-4 p-3 ">
      <div className="py-3 flex flex-col gap-2">
        <h1
          dangerouslySetInnerHTML={{ __html: t?.hblog?.head || "Latest Blogs" }}
          className="relative head-wrap text-[#2f1254] text-md sm:text-xl lg:text-2xl text-center font-semibold"
        />

        <span className="relative head-wrap text-[#2f1254] text-xs sm:text-sm text-center  ">
          {t?.hblog?.tag || "Tag line"}
        </span>
      </div>
      <div className="slider-astrocard-home  w-full relative">
        <div className="absolute top-[59%] sm:left-[-5px] -left-2 lg:left-[-50px] transform -translate-y-1/2 z-10">
          <button aria-label="Previous Blog" className="swiper-button-prev-blg">
            ‹
          </button>
        </div>
        <div className="absolute top-[59%] sm:right-[-5px] -right-2 lg:right-[-50px] transform -translate-y-1/2 z-10">
          <button aria-label="Next Blog" className="swiper-button-next-blg">
            ›
          </button>
        </div>
        <Swiper
          modules={[Navigation, Autoplay]}
          spaceBetween={20}
          slidesPerView={2}
          navigation={{
            nextEl: ".swiper-button-next-blg",
            prevEl: ".swiper-button-prev-blg",
          }}
          // pagination={{ clickable: true }}
          autoplay={false}
          loop={true}
          resizeObserver={false}
          observer={false}
          observeParents={false}
          className="mySiperblog"
          style={{
            "--swiper-navigation-color": "#fff",
            "--swiper-navigation-size": "25px",
          }}
          breakpoints={{
            320: {
              slidesPerView: 2,
              spaceBetween: 10,
            },
            480: {
              slidesPerView: 2,
              spaceBetween: 15,
            },
            768: {
              slidesPerView: 3,
              spaceBetween: 15,
            },
            1024: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
            1280: {
              slidesPerView: 3,
              spaceBetween: 20,
            },
          }}
        >
          {blogs.map((blog, i) => (
            <SwiperSlide key={blog.id}>
              <Link href={`/blogs/${blog.slug}`} className="head-wrap">
                <div className="blog-bx rounded-2xl flex flex-col w-[90%] mx-auto">
                  <Image
                    src={
                      blog.featuredImage?.startsWith("http")
                        ? blog.featuredImage
                        : `${BASE_URL}${blog.featuredImage}`
                    }
                    className="w-full sm:h-55 h-25 rounded-2xl"
                    width={400}
                    height={400}
                    alt={blog.title}
                  />

                  <div className="bl-con px-2 flex flex-col justify-between">
                    <h6 className="bl-h line-clamp-2">{blog.title}</h6>

                    <div className="flex flex-col sm:flex-row w-full items-center justify-between sm:gap-2 sm:py-1">
                      <span className="bl-d-t flex items-center text-black">
                        <svg
                          fill="#000000"
                          width="15px"
                          height="15px"
                          viewBox="0 0 24 24"
                        >
                          <path d="M2,19c0,1.7,1.3,3,3,3h14c1.7,0,3-1.3,3-3v-8H2V19z M19,4h-2V3c0-0.6-0.4-1-1-1s-1,0.4-1,1v1H9V3c0-0.6-0.4-1-1-1S7,2.4,7,3v1H5C3.3,4,2,5.3,2,7v2h20V7C22,5.3,20.7,4,19,4z" />
                        </svg>
                        &nbsp;
                        {formatDate(blog.createdAt)}
                      </span>

                      <span className="bl-d-c text-black">
                        • Posted By DhwaniAstro
                      </span>
                    </div>

                    <div onClick={() => router.push(`/blogs/${blog.slug}`)}>
                      <CustomButton
                        aria-label="Read Blog"
                        variant="purple"
                        className="text-xs w-fit sm:px-5 px-4 py-1 rounded-full place-self-center"
                      >
                        Read Blog
                      </CustomButton>
                    </div>
                  </div>

                  {/* {blog.categories?.length > 0 && (
                    <div className="review_upper_image">
                      <span>{blog.categories[0]?.category?.name}</span>
                    </div>
                  )} */}
                </div>
              </Link>
            </SwiperSlide>
          ))}
        </Swiper>
      </div>

      <Link
        href={`/blogs`}
        className="underline shadow-bottom-xl font-extralight px-3 py-2  text-gray-600"
      >
        View More
      </Link>
    </section>
  );
}
