"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";

import { useBlog } from "@/app/context/blogContext";
import { BASE_URL } from "@/utils/siteConfig";

export default function CategoryBlogsPage() {
  const { slug } = useParams();

  const blogContext = useBlog() || {};

  const blogs = Array.isArray(blogContext.blogs)
    ? blogContext.blogs
    : [];

  const blogsLoading = blogContext.blogsLoading;

  const filteredBlogs = blogs.filter((blog) =>
    blog?.categories?.some(
      (category) => category?.slug === slug
    )
  );

  const categoryName =
    filteredBlogs[0]?.categories?.find(
      (category) => category?.slug === slug
    )?.name || slug;

  if (blogsLoading) {
    return (
      <main className="w-full py-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((item) => (
            <div
              key={item}
              className="h-64 rounded-xl bg-gray-200 animate-pulse"
            />
          ))}
        </div>
      </main>
    );
  }

  return (
    <main className="w-full px-3 py-5 sm:px-5">
      <section
        aria-labelledby="blog-category-heading"
        className="w-full"
      >
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
              className="text-gray-700"
              aria-current="page"
            >
              {categoryName}
            </li>
          </ol>
        </nav>

        {/* Category Heading */}
        <header className="mb-8">
          <h1
            id="blog-category-heading"
            className="text-2xl sm:text-3xl md:text-4xl font-bold text-black"
          >
            {categoryName} Astrology Blogs
          </h1>

          <p className="mt-3 text-sm sm:text-base text-gray-600 max-w-3xl">
            Explore astrology articles and useful insights about{" "}
            {categoryName}. Read the latest astrology guidance,
            predictions and information from Dhwani Astro.
          </p>
        </header>

        {/* No Blogs */}
        {filteredBlogs.length === 0 ? (
          <div className="py-16 text-center">
            <h2 className="text-xl font-semibold text-gray-800">
              No articles found
            </h2>

            <p className="mt-2 text-gray-600">
              There are currently no blog articles in this
              category.
            </p>

            <Link
              href="/blogs"
              className="inline-block mt-5 px-5 py-2 rounded-full bg-purple-600 text-white"
            >
              View All Blogs
            </Link>
          </div>
        ) : (
          <>
            {/* Blog Listing */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              {filteredBlogs.map((blog) => {
                const imageUrl = blog.featuredImage
                  ? blog.featuredImage.startsWith("http://") ||
                    blog.featuredImage.startsWith("https://")
                    ? blog.featuredImage
                    : `${BASE_URL}${
                        blog.featuredImage.startsWith("/")
                          ? ""
                          : "/"
                      }${blog.featuredImage}`
                  : null;

                return (
                  <article
                    key={blog.id || blog.slug}
                    className="blog-and-gem blog-bx-wrapper"
                  >
                    <Link
                      href={`/blogs/${blog.slug}`}
                      className="block"
                    >
                      <div className="blog-bx-nw gap-2 md:gap-0 grid grid-cols-5 hover:scale-102 md:flex flex-col transition-transform">
                        {/* Image */}
                        {imageUrl && (
                          <div className="col-span-2 overflow-hidden">
                            <Image
                              src={imageUrl}
                              alt={`${blog.title} - ${categoryName} Astrology`}
                              width={400}
                              height={220}
                              className="bl-img-nw md:h-42 h-26 w-full object-cover"
                            />
                          </div>
                        )}

                        {/* Content */}
                        <div className="bl-con-nw col-span-3 flex flex-col p-2 justify-between">
                          <div>
                            <h2 className="text-sm font-semibold line-clamp-2 md:text-sm text-start text-[#4c307a]">
                              {blog.title}
                            </h2>
                          </div>

                          <div
                            className="review_upper_image-nw"
                            aria-label="Blog views"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              viewBox="0 0 640 640"
                              aria-hidden="true"
                              className="w-4 h-4"
                            >
                              <path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z"
                              />
                            </svg>

                            <span className="text-xs text-gray-500">
                              4185
                            </span>
                          </div>
                        </div>
                      </div>
                    </Link>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>
    </main>
  );
}
