import { ReactNode } from "react";
import Navbar from "@/components/navbar";
import { CategoryPanel, SubcategoryFilterPanel } from "@/components/cards";
import { getAllCategory } from "@/actions/businessActions";


export default async function BusinessLayout({ children }: ReactChildNode) {
  const categories = await getAllCategory()
  return (
    <>
      <Navbar />
      <div className=" bg-primary pt-14">
        {children}
        <div className="w-full fixed bottom-4 right-0 flex flex-col items-center justify-center gap-2">
          <SubcategoryFilterPanel />
          <CategoryPanel {...categories} />
        </div>
      </div>
    </>
  )
}