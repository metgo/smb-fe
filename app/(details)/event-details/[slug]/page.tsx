import { eventDetils } from "@/constant/placeholderData"
import { ImageGallery, Title } from "../../_components"

const page = () => {
  return (
    <div className="px-80 py-20">
      <Title title={eventDetils.title} />
      <ImageGallery />
    </div>
  )
}

export default page