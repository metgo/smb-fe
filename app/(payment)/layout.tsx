import Navbar from "@/components/navbar";
import { Footer } from "../(details)/_components";
import MobileNavbar from "@/components/mobile/Navbar.mobile";

export default function CheckoutLayout({ children }: ReactChildNode) {
  return (
    <>
      <Navbar />
      <MobileNavbar />
      <div className="bg-white min-h-[75vh]">{children}</div>
      <Footer />
    </>
  );
}
