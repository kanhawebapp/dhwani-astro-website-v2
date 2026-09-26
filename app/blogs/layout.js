"use client";

import { useQuery } from "@apollo/client/react";
import { GET_BLOG_CATEGORIES, GET_BLOGS } from "../graphql/gqlQuery";

import BlogSidebar from "./BlogSidebar";
import { BlogProvider } from "../context/blogContext";
import Callchatsec from "@/components/Smcompo/Callchatsec";

export default function BlogLayout({ children }) {
  const { data: categoryData } = useQuery(GET_BLOG_CATEGORIES);

  const { data: blogsData,  loading: blogsLoading } = useQuery(GET_BLOGS);

  const blogs = blogsData?.blogs || [];

  const categories = categoryData?.blogCategories || [];

  const recentBlogs = blogs.slice(0, 5);

  return (
    <div className="sm:px-10 px-3 shadow-xl  py-2">
    <BlogProvider
      value={{
        blogs,
        categories,
        recentBlogs,
        blogsLoading
      }}
    >
      <div className="container mx-auto sm:py-10">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          <div className="lg:col-span-3">{children}</div>

          <BlogSidebar categories={categories} recentBlogs={recentBlogs} />
        </div>
        <Callchatsec/>
      </div>
    </BlogProvider>
    </div>
  );
}
