import type { Metadata } from "next";
import { OwlCorner } from "@/components/owl-corner";

export const metadata: Metadata = { title: "Cantinho da Corujinha" };

export default function OwlPage() {
  return <OwlCorner />;
}
