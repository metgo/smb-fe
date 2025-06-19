import { emptyStateText } from '@/constant/hebrew'
import Image from 'next/image'

const NoBusinessLayout = () => {
  return (
    <div className="relative w-full h-[94vh] flex items-center justify-center">
      <p className="font-bold text-2xl max-w-[33rem] text-center text-theme">{emptyStateText.noBusiness}</p>

      <Image
        width={300}
        height={300}
        alt="Yellow image"
        src={"/images/yellow.png"}
        className="fixed -bottom-12 -left-24 rotate-30"
      />
    </div>
  )
}

export default NoBusinessLayout