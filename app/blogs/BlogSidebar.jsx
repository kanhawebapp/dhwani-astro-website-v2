"use client";

import Image from "next/image";
import Link from "next/link";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function BlogSidebar({ categories, recentBlogs, loading }) {
    if (loading) {
    return (
      <section className="relative p-2 sm:p-5 flex w-full flex-col items-center">
        <div className="w-full xl:w-[90%] mb-5">
          <div className="h-12 w-full rounded-full bg-gray-200 animate-pulse" />
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 w-full xl:w-[90%]">
          {[...Array(4)].map((_, index) => (
            <div
              key={index}
              className="rounded-3xl overflow-hidden shadow bg-white"
            >
              <div className="h-35 sm:h-50 bg-gray-200 animate-pulse" />

              <div className="p-3">
                <div className="h-5 w-3/4 mx-auto rounded bg-gray-200 animate-pulse mb-4" />

                <div className="h-9 w-[60%] mx-auto rounded-full bg-gray-200 animate-pulse" />
              </div>
            </div>
          ))}
        </div>
      </section>
    );
  }
  return (
    <div className="space-y-10 my-5">
      {/* Categories */}

      <div className="blog-cat-nw hidden sm:flex rounded-2xl md:block">
        <h6 className="text-xl font-semibold text-center  text-black">
          Category
        </h6>
        <div className="bl-cat-main-nw  grid grid-cols-3 lg:grid-cols-2 gap-3">
          {categories.map((category) => (
            <Link
              href={`/blogs/category/${category.slug}`}
              key={category.id}
              className="category-nw flex flex-col items-center justify-center"
            >
              <div className="bl-cat-nw">{category.name?.charAt(0)}</div>

              <h6 className="text-xs md:font-semibold text-black text-center">
                {category.name}
              </h6>
            </Link>
          ))}
        </div>
      </div>

      <div className="blog-cat zoom-image bg-purple-200 rounded-xl p-2">
        <h5 className="text-center  text-black text-lg font-semibold py-2">
          Recent Blogs{" "}
        </h5>
        <div className="flex flex-col gap-2">
          {recentBlogs.map((item) => (
            <Link key={item.id} href={`/blogs/${item.slug}`}>
              <div className="bg-[#ffffffba] pr-2 rounded-full flex gap-2 items-center hover:scale-102">
                <div className="trend-bi w-14 h-14 rounded-full overflow-hidden">
                  <Image
                    src={`${BASE_URL}${item.featuredImage}`}
                    width={100}
                    height={100}
                    alt={item.title}
                    unoptimized
                    className="object-cover w-full h-full"
                  />
                </div>

                <p className="text-[12px] sm:text-sm w-60 text-gray-600 line-clamp-2">
                  {item.title}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
