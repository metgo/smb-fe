import { emptyStateText } from '@/constant/hebrew'

const NoBusinessLayout = () => {
  return (
    <div className="relative w-full h-[94vh] flex items-center justify-center">
      <p className="font-bold text-2xl max-w-[33rem] text-center text-theme">{emptyStateText.noBusiness}</p>
    </div>
  )
}

export default NoBusinessLayout