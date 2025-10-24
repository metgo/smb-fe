import ShareUrlBtnModal from "@/components/ShareUrlBtnModal";
import { ImageGallery, ReturnToPrevPageBtn } from "../../_components";
import NoFeedItemLayout from "@/components/layouts/NoFeedItemLayout";
import { getBlogById } from "@/actions/blogActions";
import MobileImageGallery from "@/components/mobile/ImageGallery.mobile";
import MobileActionIcons from "@/components/mobile/ActionIcons.mobile";
import { shuffleArray } from "@/lib/helpers";

const page = async ({ params }: PageProps) => {
  const { slug } = await params;

  if (!slug || slug === "undefined") return <NoFeedItemLayout />;
  const articleDetails = await getBlogById(slug);

  return (
    <div>
      <ReturnToPrevPageBtn />
      <div className="max-sm:mx-0 md:mx-20 py-12">
        <MobileActionIcons />
        <div className="mb-4.5 max-sm:px-12">
          <h1 className="font-bold max-sm:text-6xl md:text-[2.5rem]">
            {articleDetails.title}
          </h1>
          <div className="flex items-center justify-between">
            <p className="font-normal max-sm:text-2xl max-sm:text-theme max-sm:mt-4">
              {articleDetails.subTitle}
            </p>
            <ShareUrlBtnModal />
          </div>
        </div>

        <ImageGallery
          images={shuffleArray(articleDetails.images)}
          primaryCategoryId="6566e31ca77d2a477266d2d6"
        />
        <MobileImageGallery images={articleDetails.images} />

        <div
          className="max-sm:px-6 max-w-[50rem] mx-auto mt-16 font-normal"
          dangerouslySetInnerHTML={{ __html: articleDetails?.content }}
        />
      </div>
    </div>
  );
};

export default page;
