import type { Metadata } from "next";
import { isAdmin } from "@/lib/cms/auth";
import { AdminPanel } from "./panel";
import "./admin.css";
export const dynamic = "force-dynamic";
export const metadata: Metadata = {
  title: "Business Workspace",
  robots: { index: false, follow: false },
};
export default async function Admin() {
  return <AdminPanel authenticated={await isAdmin()} />;
}
