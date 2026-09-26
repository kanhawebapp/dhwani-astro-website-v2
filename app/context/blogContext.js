"use client";

import { createContext, useContext } from "react";

const BlogContext = createContext(null);

export function BlogProvider({ children, value }) {
  return (
    <BlogContext.Provider value={value}>
      {children}
    </BlogContext.Provider>
  );
}

export function useBlog() {
  return useContext(BlogContext);
}