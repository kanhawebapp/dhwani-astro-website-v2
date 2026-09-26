import Link from "next/link";

export default function DashboardLayout({ children }) {
  return (
    <div className="flex h-145 w-full">
      {/* SIDEBAR */}
     

      {/* CONTENT */}
      <div className="flex-1 overflow-y-auto p-4 sm:p-6 bg-gray-100">{children}</div>
    </div>
  );
}
