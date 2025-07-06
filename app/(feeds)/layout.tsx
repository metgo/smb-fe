import Navbar from "@/components/navbar";
import { CategoryPanel, SubcategoryFilterPanel } from "@/components/cards";

export default async function BusinessLayout({ children }: ReactChildNode) {
  return (
    <>
      <Navbar showFilterTab />
      <div className="bg-primary">
        {children}
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center gap-2 w-max">
          <SubcategoryFilterPanel />
          <CategoryPanel />
        </div>
      </div>
    </>
  );
}
