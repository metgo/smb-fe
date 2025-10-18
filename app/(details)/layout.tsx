import Navbar from "@/components/navbar";
import { Footer } from "./_components";
import MobileNavbar from "@/components/mobile/Navbar.mobile";

export default function DetailsLayout({ children }: ReactChildNode) {
  return (
    <div>
      <MobileNavbar />
      <Navbar />
      {children}
      <Footer />
    </div>
  );
}
