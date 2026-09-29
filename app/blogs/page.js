"use client";

import Image from "next/image";
import Link from "next/link";
import { useEffect } from "react";

import Searchtop from "@/components/Smcompo/Searchtop";
import { useBlog } from "../context/blogContext";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function Blogcomp() {
const blogContext = useBlog() || {};

const {
  blogs = [],
  categories = [],
} = blogContext;
  const formatDate = (date) => {
    if (!date) return "";

    const timestamp = parseInt(date, 10);

    if (Number.isNaN(timestamp)) {
      return "";
    }

    return new Date(timestamp).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  useEffect(() => {
    const blogWrappers = document.querySelectorAll(
      ".most-wrapper, .rec-wrapper, .fol-wrapper, .blog-bx-wrapper, .callcaht-wrap"
    );

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
          } else {
            entry.target.classList.remove("in-view");
          }
        });
      },
      {
        threshold: 0.5,
      }
    );

    blogWrappers.forEach((wrapper) => {
      observer.observe(wrapper);
    });

    return () => {
      blogWrappers.forEach((wrapper) => {
        observer.unobserve(wrapper);
      });

      observer.disconnect();
    };
  }, []);

  return (
    <main className="relative p-0 sm:pt-4 pt-1 sm:p-5 w-full sm:w-[95%] flex gap-1 flex-col items-center self-center">
      {/* Mobile Categories */}
      {categories.length > 0 && (
        <nav
          aria-label="Blog categories"
          className="sm:hidden w-full mb-1 overflow-hidden"
        >
          <div className="bl-cat-main-nw flex overflow-auto gap-1">
            {categories.map((category, index) => {
              /**
               * Use category.slug when your API provides it.
               *
               * If your category object currently doesn't contain
               * slug, this falls back to "#".
               */
              const categorySlug = category?.slug;

              const categoryHref = categorySlug
                ? `/blogs/category/${categorySlug}`
                : "#";

              return (
                <Link
                  href={categoryHref}
                  key={category?.id || categorySlug || index}
                  className="text-decoration-none"
                  aria-label={`Read ${category?.name || "blog"} blogs`}
                >
                  <div className="category-nw p-1 sm:w-25 w-21 md:w-30 flex flex-col items-center justify-center">
                    <div
                      className="bl-cat-nw text-center rounded-full text-xl flex items-center justify-center h-10 w-10"
                      aria-hidden="true"
                    >
                      {category?.name?.slice(0, 1)?.toUpperCase() || "B"}
                    </div>

                    <h2 className="text-[10px] md:font-semibold text-black text-center">
                      {category?.name}
                    </h2>
                  </div>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* Blog Search */}
      <Searchtop />

      {/* Main Blog Section */}
      <section
        aria-labelledby="blogs-heading"
        className="blog-category-main flex flex-col lg:flex-row w-full md:w-[90%] lg:w-full py-5 gap-5"
      >
        <div className="blog-sec-callchat flex flex-col gap-3 md:gap-5 basis-3/4 items-center justify-start">
          <header className="w-full">
            <h1
              id="blogs-heading"
              className="text-xl sm:text-2xl md:text-3xl font-semibold text-[#2f1254] text-center"
            >
              Astrology Blogs
            </h1>

            <p className="mt-2 text-sm sm:text-base text-gray-600 text-center max-w-3xl mx-auto">
              Explore astrology articles, horoscope insights, Kundli guidance,
              numerology, relationships, Vedic astrology, and spiritual
              knowledge from Dhwani Astro.
            </p>
          </header>

          {blogs.length > 0 ? (
            <div className="blog-main-box grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 md:gap-5 content-start w-full">
              {blogs.map((blog, index) => {
                const imageUrl = blog?.featuredImage
                  ? `${BASE_URL || ""}${blog.featuredImage}`
                  : "/images/default-blog.jpg";

                const blogTitle =
                  blog?.title || "Astrology Blog - Dhwani Astro";

                const blogHref = blog?.slug
                  ? `/blogs/${blog.slug}`
                  : "/blogs";

                return (
                  <article
                    key={blog?.id || blog?.slug || index}
                    className="blog-and-gem blog-bx-wrapper"
                  >
                    <Link
                      href={blogHref}
                      className="block"
                      aria-label={`Read ${blogTitle}`}
                    >
                      <div className="blog-bx-nw gap-2 md:gap-0 grid grid-cols-5 hover:scale-102 md:flex flex-col">
                        {/* Blog Image */}
                        <div className="col-span-2">
                          <Image
                            src={imageUrl}
                            alt={`${blogTitle} - Dhwani Astro`}
                            width={400}
                            height={240}
                            sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, 300px"
                            className="bl-img-nw md:h-42 h-24 w-full object-cover hover:scale-102"
                          />
                        </div>

                        {/* Blog Content */}
                        <div className="bl-con-nw col-span-3 flex flex-col p-2 justify-between">
                          <div className="decoration-none">
                            <h2 className="text-xs font-semibold line-clamp-2 md:text-sm text-start text-[#4c307a]">
                              {blogTitle}
                            </h2>

                            {blog?.createdAt && (
                              <time
                                dateTime={new Date(
                                  Number(blog.createdAt)
                                ).toISOString()}
                                className="block mt-1 text-[10px] text-gray-500"
                              >
                                {formatDate(blog.createdAt)}
                              </time>
                            )}
                          </div>

                          {/* Views */}
                          <div className="review_upper_image-nw flex items-center mt-2">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 640 640"
                              aria-hidden="true"
                              className="w-4 h-4"
                            >
                              <path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z"
                              />
                            </svg>

                            <span>
                              <span className="pvc_stats font-semibold total_only text-xs text-[#0008] md:text-white">
                                {blog?.views ?? 4185}
                              </span>
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="w-full py-10 text-center">
              <p className="text-gray-500">
                No astrology blogs are available right now.
              </p>
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
