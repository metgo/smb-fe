import { ReactNode } from "react";
import Navbar from "@/components/navbar";
import { CategoryPanel, SubcategoryFilterPanel } from "@/components/cards";


export default function BusinessLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="px-20 py-10 flex items-center justify-center w-full bg-primary">
        {children}
        <div className="w-full fixed bottom-4 right-0 flex flex-col items-center justify-center gap-2">
          <SubcategoryFilterPanel />
          <CategoryPanel />
        </div>
      </div>
    </>
  )
}