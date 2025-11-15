import Navbar from "@/components/navbar";
import MobileNavbar from "@/components/mobile/Navbar.mobile";
import { CategoryPanel, SubcategoryFilterPanel } from "@/components/cards";
import MobileCategoryPanel from "@/components/mobile/CategoryPanel.mobile";

export default async function BusinessLayout({ children }: ReactChildNode) {
  return (
    <>
      <Navbar showFilterTab />
      <MobileNavbar />
      <div className="bg-primary">
        {children}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center gap-2 w-max">
          <SubcategoryFilterPanel />
          <CategoryPanel />
        </div>
      </div>
      <MobileCategoryPanel />
    </>
  );
}
