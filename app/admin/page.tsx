import type { Metadata } from "next";
import AdminDashboard from "./AdminDashboard";
import "./admin.css";

export const metadata: Metadata = {
  title: "Portfolio Studio — Marc Mendoza",
  description: "Private project management for Marc Mendoza's portfolio.",
  robots: {
    index: false,
    follow: false,
    noarchive: true,
    nosnippet: true,
    noimageindex: true,
  },
};

export default function AdminPage() {
  return <AdminDashboard />;
}
