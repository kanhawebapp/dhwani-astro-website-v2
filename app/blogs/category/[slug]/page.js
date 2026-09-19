"use client";

import { useParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useQuery } from "@apollo/client/react";
import { useBlog } from "@/app/context/blogContext";
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL;

export default function CategoryBlogsPage() {
  const { slug } = useParams();

const { blogs, blogsLoading } = useBlog();
 

  const filteredBlogs = blogs.filter((blog) =>
    blog.categories?.some((category) => category.slug === slug),
  );

  if (blogsLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
      {filteredBlogs.map((blog,index) => (
        <Link
          href={`/blogs/${blog.slug}`}
          key={index}
          className="blog-and-gem blog-bx-wrapper "
        >
          <div className="blog-bx-nw gap-2 /md:gap-0  grid grid-cols-5 hover:scale-102   md:flex flex-col">
            <div className="col-span-2 ">
              <Image
                src={`${BASE_URL}${blog.featuredImage}`}
                alt="image here"
                width={100}
                height={100}
                className="bl-img-nw md:h-42 h-26 hover:scale-102"
              />
            </div>

            <div className="bl-con-nw col-span-3 flex flex-col p-2  justify-between">
              <div className="decoration-none">
                <h6 className="text-sm font-semibold line-clamp-2 md:text-sm text-start text-[#4c307a]">
                  {blog.title}
                </h6>
              </div>

              <div className="review_upper_image-nw">
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 640">
                  <path d="M320 96C239.2 96 174.5 132.8 127.4 176.6C80.6 220.1 49.3 272 34.4 307.7C31.1 315.6 31.1 324.4 34.4 332.3C49.3 368 80.6 420 127.4 463.4C174.5 507.1 239.2 544 320 544C400.8 544 465.5 507.2 512.6 463.4C559.4 419.9 590.7 368 605.6 332.3C608.9 324.4 608.9 315.6 605.6 307.7C590.7 272 559.4 220 512.6 176.6C465.5 132.9 400.8 96 320 96zM176 320C176 240.5 240.5 176 320 176C399.5 176 464 240.5 464 320C464 399.5 399.5 464 320 464C240.5 464 176 399.5 176 320zM320 256C320 291.3 291.3 320 256 320C244.5 320 233.7 317 224.3 311.6C223.3 322.5 224.2 333.7 227.2 344.8C240.9 396 293.6 426.4 344.8 412.7C396 399 426.4 346.3 412.7 295.1C400.5 249.4 357.2 220.3 311.6 224.3C316.9 233.6 320 244.4 320 256z" />
                </svg>
                <span>
                  <p className="pvc_stats font-semibold total_only text-xs text-[#0008] md:text-white">
                    &nbsp;4185&nbsp;
                  </p>
                </span>
              </div>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
