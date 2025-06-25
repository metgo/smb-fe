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
        <div className="fixed bottom-4 left-1/2 -translate-x-1/2 flex flex-col items-center justify-center gap-2 w-max">
          <SubcategoryFilterPanel />
          <CategoryPanel categories={data} />
        </div>
      </div>
    </>
  )
}