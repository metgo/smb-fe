import Navbar from "@/components/navbar";
import { getAllCategory } from "@/actions/businessActions";
import { CategoryPanel, SubcategoryFilterPanel } from "@/components/cards";


export default async function BusinessLayout({ children }: ReactChildNode) {
  const { data } = await getAllCategory()
  return (
    <>
      <Navbar />
      <div className=" bg-primary pt-14">
        {children}
        <div className="w-full fixed bottom-4 right-0 flex flex-col items-center justify-center gap-2">
          <SubcategoryFilterPanel />
          <CategoryPanel categories={data} />
        </div>
      </div>
    </>
  )
}