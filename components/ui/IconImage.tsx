import Image from 'next/image'

type IconImageProps = {
  icon: string;
  width?: number;
  height?: number;
  onClick?: () => void;
}

const IconImage = ({ icon, onClick, width = 24, height = 24 }: IconImageProps) => {
  return (
    <Image
      alt={icon}
      width={width}
      height={height}
      onClick={onClick}
      src={`/images/icons/${icon}.svg`}
      className='cursor-pointer hover:opacity-80 transition-opacity duration-200'
    />
  )
}

export default IconImage