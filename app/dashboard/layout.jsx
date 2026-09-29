export const metadata = {
  title: "Dashboard | Dhwani Astro",

  robots: {
    index: false,
    follow: false,
    googleBot: {
      index: false,
      follow: false,
    },
  },
};

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-145 w-full">
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100">
        {children}
      </div>
    </div>
  );
}
