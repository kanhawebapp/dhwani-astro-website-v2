"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import { gql } from "@apollo/client";
import { useQuery } from "@apollo/client/react";

const BlogContext = createContext(null);

const GET_BLOGS = gql`
  query GetBlogs {
    blogs {
      id
      title
      slug
      featuredImage
      createdAt
      categories {
        id
        name
        slug
      }
    }
  }
`;

const GET_BLOG_CATEGORIES = gql`
  query GetBlogCategories {
    blogCategories {
      id
      name
      slug
    }
  }
`;

export function BlogProvider({ children }) {
  const [blogs, setBlogs] = useState([]);
  const [categories, setCategories] = useState([]);

  const {
    data: blogData,
    loading: blogsLoading,
    error: blogsError,
  } = useQuery(GET_BLOGS, {
    fetchPolicy: "cache-and-network",
  });

  const {
    data: categoryData,
    loading: categoriesLoading,
    error: categoriesError,
  } = useQuery(GET_BLOG_CATEGORIES, {
    fetchPolicy: "cache-and-network",
  });

  useEffect(() => {
    if (blogData?.blogs) {
      setBlogs(blogData.blogs);
    }
  }, [blogData]);

  useEffect(() => {
    if (categoryData?.blogCategories) {
      setCategories(categoryData.blogCategories);
    }
  }, [categoryData]);

  const value = {
    blogs,
    categories,
    blogsLoading,
    categoriesLoading,
    blogsError,
    categoriesError,
  };

  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  return useContext(BlogContext);
}