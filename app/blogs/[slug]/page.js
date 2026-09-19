"use client";

import Image from "next/image";
import { useParams } from "next/navigation";
import {
  GET_BLOG_BY_SLUG,
  GET_BLOG_CATEGORIES,
  GET_BLOGS,
} from "@/app/graphql/gqlQuery";
import { useQuery } from "@apollo/client/react";
import Link from "next/link";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;
export default function BlogDetail() {
  const { slug } = useParams();

  const { data, loading, error } = useQuery(GET_BLOG_BY_SLUG, {
    variables: {
      slug,
      fetchPolicy: "cache-first",
    },
    skip: !slug,
  });

  const { data: categoryData } = useQuery(GET_BLOG_CATEGORIES);

  const blog = data?.blogBySlug;

  const { data: blogsData } = useQuery(GET_BLOGS);
  const recentBlogs =
    blogsData?.blogs?.filter((item) => item.slug !== slug)?.slice(0, 4) || [];

  const formatDate = (date) => {
    if (!date) return "";

    return new Date(Number(date)).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <section className="relative p-2 sm:p-5 flex w-full flex-col items-center">
        <div className="w-full xl:w-[90%] mb-5">
          <div className="h-12 w-full rounded-full bg-gray-200 animate-pulse" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-1 lg:grid-cols-1 gap-5 w-full xl:w-[90%]">
          {[...Array(1)].map((_, index) => (
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

  if (error || !blog) {
    return <div className="py-20 text-center">Blog not found</div>;
  }

  return (
    <section className="w-full max-w-6xl border border-gray-200 shadow-xl  py-3  sm:px-8 rounded-2xl mx-auto px-4 sm:py-10">
      <div className="flex flex-col gap-2">
        {/* Title */}
        <h1 className="text-lg sm:text-2xl text-center md:text-3xl font-bold text-black">
          {blog.title}
        </h1>

        {/* Meta */}
        <div className="flex items-center justify-center gap-3 text-[10px] sm:text-xs text-gray-600">
          <span>{formatDate(blog.createdAt)}</span>

          <span>• Posted By DhwaniAstro</span>
        </div>

        {/* Categories */}
        {blog.categories?.length > 0 && (
          <div className="flex flex-wrap items-center justify-center gap-2">
            {blog.categories.map((category) => (
              <span
                key={category.id}
                className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-[10px] sm:text-xs"
              >
                {category.name}
              </span>
            ))}
          </div>
        )}
        <div className="grid rounded-2xl overflow-hidden sm:grid-cols-6">
          {blog.featuredImage && (
            <div className="overflow-hidden col-span-4 rounded-xl">
              <Image
                src={`${BASE_URL}${blog.featuredImage}`}
                className="w-full h-45 sm:h-80 rounded-2xl"
                width={400}
                height={200}
                alt={blog.title}
                priority
              />
            </div>
          )}

          <div className="flex flex-col items-center justify-center bg-gray-100 px-2 w-full sm:px-6 py-2 col-span-4 sm:col-span-2 gap-2">
            <h6 class="text-xs sm:text-md text-black font-semibold">
              Need Guidance On Your Problems?
            </h6>
            <p class="text-[10px] sm:text-xs text-black font-semibold">
              Consult With The Best Online Astrologers
            </p>
            <div className="flex flex-col gap-2">
              <button
               onClick={() => router.push("/astrologer/call")}
                type="button"
                className="rounded-full text-xs sm:text-sm px-2 py-1 bg-green-500"
              >
                Talk To Astrologer
              </button>

              <button
                onClick={() => router.push("/astrologer/chat")}
                type="button"
                className="rounded-full text-xs sm:text-sm px-2 py-1 bg-red-500"
              >
                Chat With Astrologer
              </button>
            </div>
          </div>
        </div>
        {/* Content */}
        <div
          className="prose max-w-none text-xs sm:text-sm prose-headings:text-black text-black prose-p:text-black mt-8"
          dangerouslySetInnerHTML={{
            __html: blog.content || "",
          }}
        />
      </div>
    </section>
  );
}
