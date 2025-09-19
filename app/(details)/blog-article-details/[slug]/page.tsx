import ShareUrlBtnModal from "@/components/ShareUrlBtnModal";
import { ImageGallery, ReturnToPrevPageBtn } from "../../_components";
import NoFeedItemLayout from "@/components/layouts/NoFeedItemLayout";
import { getBlogById } from "@/actions/blogActions";

const page = async ({ params }: PageProps) => {
  const { slug } = await params;

  if (!slug || slug === "undefined") return <NoFeedItemLayout />;
  const articleDetails = await getBlogById(slug);

  return (
    <div>
      <ReturnToPrevPageBtn />
      <div className="mx-20 py-12">
        <div className="mb-4.5">
          <h1 className="font-bold text-[2.5rem]">{articleDetails.title}</h1>
          <div className="flex items-center justify-between">
            <p className="font-normal">{articleDetails.subTitle}</p>
            <ShareUrlBtnModal />
          </div>
        </div>

        <ImageGallery images={articleDetails.images} primaryCategoryId="" />
        <div
          className="max-w-[50rem] mx-auto mt-16 font-normal"
          dangerouslySetInnerHTML={{ __html: articleDetails?.content }}
        ></div>
      </div>
    </div>
  );
};

export default page;
