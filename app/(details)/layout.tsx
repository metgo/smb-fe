import Navbar from "@/components/navbar";
import { Footer } from "./_components";

export default function DetailsLayout({ children }: ReactChildNode) {
  return (
    <div>
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
