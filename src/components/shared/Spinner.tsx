import  { Activity } from 'react'
import { Loader} from 'lucide-react'

const Spinner = ({isLoading}: {isLoading: boolean}) => {
  return (
    <Activity mode={isLoading ? "visible" : "hidden"}>
      <div className='w-full h-full bg-black/20 drop-shadow-background absolute top-0 left-0 z-50 flex items-center justify-center rounded-xl'>
        <Loader className="w-12 h-12 text-teal-500 animate-spin" />
      </div>
    </Activity>
  )
}

export default Spinner