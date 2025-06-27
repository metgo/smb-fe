import Image from "next/image"

const col1 = [0]
const col2 = [1, 2]
const col3 = [3, 4]


const layout = [
  { width: 635, height: 450 },
  { width: 312.5, height: 220 },
  { width: 312.5, height: 220 },
  { width: 312.5, height: 220 },
  { width: 312.5, height: 220 },
]


const ImageCard = ({ width = 312.5, height = 220, className = "" }: { width?: number, height?: number, className?: string }) => (
  <div>
    <Image
      src={"/images/video-thumbnail.png"}
      alt="abc"
      width={width}
      height={height}
      className={className}
    />
  </div>
)
const ImageGallery = () => {


  return (
    <div>

      <div className="flex items-center gap-2.5">
        <ImageCard
          width={635}
          height={450}
          className=" rounded-tr-[10px] rounded-br-[10px]"
        />
        <div className="space-y-2.5">
          <ImageCard />
          <ImageCard />
        </div>
        <div className="space-y-2.5">
          <ImageCard className=" rounded-tl-[10px]" />
          <ImageCard className=" rounded-bl-[10px]" />
        </div>
      </div>
    </div>
  )
}

export default ImageGallery