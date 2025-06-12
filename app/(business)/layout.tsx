import { ReactNode } from "react";
import Navbar from "@/components/navbar";
import CategoryPanel from "@/components/category-panel";


export default function BusinessLayout({ children }: { children: ReactNode }) {
  return (
    <>
      <Navbar />
      <div className="px-20 py-10 flex items-center justify-center w-full ">
        {children}
        <CategoryPanel />
      </div>
    </>
  )
}