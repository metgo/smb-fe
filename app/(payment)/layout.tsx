import Navbar from "@/components/navbar";
import { Footer } from "../(details)/_components";

export default function CheckoutLayout({ children }: ReactChildNode) {
  return (
    <>
      <Navbar />
      <div className="bg-[#f4f4f4] min-h-[75vh]">{children}</div>
      <Footer />
    </>
  );
}
