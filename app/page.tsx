import type { Metadata } from "next";
import Portfolio from "./Portfolio";

export const metadata: Metadata = {
  title: "Marc Mendoza — Full-stack developer & digital builder",
  description:
    "Selected client systems, digital products, and one-page experiences by Marc Mendoza.",
};

export default function Home() {
  return <Portfolio />;
}
