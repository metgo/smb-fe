import Navbar from "@/components/navbar";

import { blogLabels } from "@/constant/hebrew";
import { getAllBlogs } from "@/actions/blogActions";
import MobileNavbar from "@/components/mobile/Navbar.mobile";
import BlogFeedCardsLayout from "@/components/layouts/BlogFeedCardsLayout";
import MobileBlogFeedLayout from "@/components/mobile/BlogFeedLayout.mobile";
import NoFeedItemLayout from "@/components/layouts/NoFeedItemLayout";

const page = async () => {
  const blogs = await getAllBlogs();
  if (blogs?.length < 1) return <NoFeedItemLayout />;

  return (
    <>
      <Navbar />
      <MobileNavbar />
      <div className="bg-primary max-sm:hidden md:block">
        <div className="flex items-center justify-center flex-col pt-10">
          <h1 className="font-bold text-[2rem]">
            {blogLabels.theFlourishingBlog}
          </h1>
          <p className="font-normal">{blogLabels.desc}</p>
        </div>
        <BlogFeedCardsLayout blogs={blogs} />
      </div>
      <MobileBlogFeedLayout blogs={blogs} />
    </>
  );
};

export default page;
