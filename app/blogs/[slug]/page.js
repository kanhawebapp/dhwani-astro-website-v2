"use client";

import Image from "next/image";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { useQuery } from "@apollo/client/react";

import {
  GET_BLOG_BY_SLUG,
  GET_BLOGS,
} from "@/app/graphql/gqlQuery";

import { BASE_URL } from "@/utils/siteConfig";

export default function BlogDetail() {
  const { slug } = useParams();
  const router = useRouter();

  const { data, loading, error } = useQuery(GET_BLOG_BY_SLUG, {
    variables: {
      slug,
    },
    skip: !slug,
    fetchPolicy: "cache-first",
  });

  const { data: blogsData } = useQuery(GET_BLOGS);

  const blog = data?.blogBySlug;

  const recentBlogs =
    blogsData?.blogs
      ?.filter((item) => item.slug !== slug)
      ?.slice(0, 4) || [];

  const formatDate = (date) => {
    if (!date) {
      return "";
    }

    let parsedDate;

    if (typeof date === "string" && /^\d+$/.test(date)) {
      parsedDate = new Date(Number(date));
    } else {
      parsedDate = new Date(date);
    }

    if (Number.isNaN(parsedDate.getTime())) {
      return "";
    }

    return parsedDate.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getDateTime = (date) => {
    if (!date) {
      return undefined;
    }

    let parsedDate;

    if (typeof date === "string" && /^\d+$/.test(date)) {
      parsedDate = new Date(Number(date));
    } else {
      parsedDate = new Date(date);
    }

    if (Number.isNaN(parsedDate.getTime())) {
      return undefined;
    }

    return parsedDate.toISOString();
  };

  const getImageUrl = (image) => {
    if (!image) {
      return "";
    }

    if (
      image.startsWith("http://") ||
      image.startsWith("https://")
    ) {
      return image;
    }

    return `${BASE_URL}${image.startsWith("/") ? "" : "/"}${image}`;
  };

  /**
   * Keep the blog page limited to one primary H1.
   *
   * The blog title is the page H1.
   * If the CMS/database content contains H1 tags,
   * convert them to H2 before rendering.
   */
  const sanitizeBlogContent = (content) => {
    if (!content) {
      return "";
    }

    return content
      .replace(/<h1(\s[^>]*)?>/gi, "<h2$1>")
      .replace(/<\/h1>/gi, "</h2>");
  };

  if (loading) {
    return (
      <main className="relative p-2 sm:p-5 flex w-full flex-col items-center">
        <div className="w-full xl:w-[90%] mb-5">
          <div className="h-12 w-full rounded-full bg-gray-200 animate-pulse" />
        </div>

        <div className="w-full xl:w-[90%]">
          <div className="rounded-3xl overflow-hidden shadow bg-white">
            <div className="h-52 bg-gray-200 animate-pulse" />

            <div className="p-5">
              <div className="h-6 w-3/4 mx-auto rounded bg-gray-200 animate-pulse mb-4" />

              <div className="h-4 w-1/2 mx-auto rounded bg-gray-200 animate-pulse mb-6" />

              <div className="space-y-3">
                <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-full rounded bg-gray-200 animate-pulse" />
                <div className="h-4 w-5/6 rounded bg-gray-200 animate-pulse" />
              </div>
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !blog) {
    return (
      <main className="py-20 text-center">
        <h1 className="text-2xl font-semibold">
          Blog not found
        </h1>

        <p className="mt-2 text-gray-600">
          The requested article could not be found.
        </p>

        <Link
          href="/blogs"
          className="inline-block mt-5 px-5 py-2 rounded-full bg-purple-600 text-white"
        >
          View All Blogs
        </Link>
      </main>
    );
  }

  const featuredImage = getImageUrl(blog.featuredImage);

  const createdDateTime = getDateTime(blog.createdAt);

  const blogContent = sanitizeBlogContent(blog.content);

  return (
    <main className="w-full px-3 py-5 sm:px-5">
      <article className="w-full max-w-6xl border border-gray-200 shadow-xl py-4 sm:px-8 rounded-2xl mx-auto sm:py-10 bg-white">

        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-5 text-xs sm:text-sm text-gray-500"
        >
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link
                href="/"
                className="hover:text-purple-600"
              >
                Home
              </Link>
            </li>

            <li aria-hidden="true">/</li>

            <li>
              <Link
                href="/blogs"
                className="hover:text-purple-600"
              >
                Astrology Blogs
              </Link>
            </li>

            <li aria-hidden="true">/</li>

            <li
              className="text-gray-700 truncate max-w-[250px]"
              aria-current="page"
            >
              {blog.title}
            </li>
          </ol>
        </nav>

        {/* Article Header */}
        <header className="flex flex-col gap-3">
          {/* Primary page heading - keep exactly one H1 */}
          <h1 className="text-xl sm:text-3xl md:text-4xl text-center font-bold text-black leading-tight">
            {blog.title}
          </h1>

          <div className="flex flex-wrap items-center justify-center gap-2 text-[10px] sm:text-xs text-gray-600">
            {createdDateTime && (
              <time dateTime={createdDateTime}>
                {formatDate(blog.createdAt)}
              </time>
            )}

            <span aria-hidden="true">•</span>

            <span>Posted by Dhwani Astro</span>
          </div>

          {/* Categories */}
          {blog.categories?.length > 0 && (
            <div className="flex flex-wrap items-center justify-center gap-2">
              {blog.categories.map((category) => (
                <Link
                  key={category.id}
                  href={`/blogs/category/${
                    category.slug || category.id
                  }`}
                  className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 text-[10px] sm:text-xs hover:bg-purple-200"
                >
                  {category.name}
                </Link>
              ))}
            </div>
          )}
        </header>

        {/* Featured Image + CTA */}
        <div className="grid rounded-2xl overflow-hidden mt-6 sm:grid-cols-6 gap-3">

          {featuredImage && (
            <div className="overflow-hidden sm:col-span-4 rounded-xl">
              <Image
                src={featuredImage}
                className="w-full h-52 sm:h-80 object-cover rounded-2xl"
                width={1200}
                height={630}
                alt={`${blog.title} - Dhwani Astro`}
                priority
              />
            </div>
          )}

          <aside className="flex flex-col items-center justify-center bg-gray-100 px-4 sm:px-6 py-6 rounded-xl sm:col-span-2 gap-3">
            <h2 className="text-sm sm:text-md text-black font-semibold text-center">
              Need Guidance On Your Problems?
            </h2>

            <p className="text-[10px] sm:text-xs text-black font-semibold text-center">
              Consult With Online Astrologers
            </p>

            <div className="flex flex-col gap-2 w-full">
              <button
                onClick={() => router.push("/astrologer/call")}
                type="button"
                className="rounded-full text-xs sm:text-sm px-4 py-2 bg-green-500 text-white hover:bg-green-600"
              >
                Talk To Astrologer
              </button>

              <button
                onClick={() => router.push("/astrologer/chat")}
                type="button"
                className="rounded-full text-xs sm:text-sm px-4 py-2 bg-red-500 text-white hover:bg-red-600"
              >
                Chat With Astrologer
              </button>
            </div>
          </aside>
        </div>

        {/* Article Content */}
        <div
          className="prose max-w-none text-xs sm:text-sm prose-headings:text-black text-black prose-p:text-black mt-8"
          dangerouslySetInnerHTML={{
            __html: blogContent,
          }}
        />

        {/* Recent Blogs */}
        {recentBlogs.length > 0 && (
          <section
            aria-labelledby="recent-blogs"
            className="mt-12 pt-8 border-t border-gray-200"
          >
            <h2
              id="recent-blogs"
              className="text-xl sm:text-2xl font-bold text-black mb-5"
            >
              More Astrology Articles
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {recentBlogs.map((item) => (
                <Link
                  key={item.id || item.slug}
                  href={`/blogs/${item.slug}`}
                  className="border rounded-xl overflow-hidden hover:shadow-lg transition-shadow"
                >
                  {item.featuredImage && (
                    <Image
                      src={getImageUrl(item.featuredImage)}
                      width={400}
                      height={220}
                      alt={`${item.title} - Dhwani Astro`}
                      className="w-full h-40 object-cover"
                    />
                  )}

                  <div className="p-3">
                    <h3 className="font-semibold text-sm text-gray-800 line-clamp-2">
                      {item.title}
                    </h3>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}
      </article>
    </main>
  );
}
