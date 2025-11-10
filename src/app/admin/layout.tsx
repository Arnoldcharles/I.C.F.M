"use client";
import Link from "next/link";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <aside className="w-64 bg-gray-800 text-white p-4 space-y-4">
        <h2 className="text-xl font-bold mb-4">I.C.F.M Admin</h2>
        <nav className="flex flex-col space-y-2">
          <Link href="/admin" className="hover:underline">
            Home
          </Link>
          <Link href="/admin/events" className="hover:underline">
            Events
          </Link>
          <Link href="/admin/sermons" className="hover:underline">
            Sermons
          </Link>
          <Link href="/admin/members" className="hover:underline">
            Members
          </Link>
          <Link href="/admin/videos" className="hover:underline">
            Videos
          </Link>
          <Link href="/admin/blog" className="hover:underline">
            Blog
          </Link>
          <Link href="/admin/testimonies" className="hover:underline">
            Testimonies
          </Link>
          <Link href="/admin/about" className="hover:underline">
            About
          </Link>
        </nav>
      </aside>
      <main className="flex-1 bg-gray-100">{children}</main>
    </div>
  );
}
