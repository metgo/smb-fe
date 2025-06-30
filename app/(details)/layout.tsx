import Navbar from "@/components/navbar";

export default function DetailsLayout({ children }: ReactChildNode) {
  return (
    <div>
      <Navbar />
      {children}
    </div>
  );
}
