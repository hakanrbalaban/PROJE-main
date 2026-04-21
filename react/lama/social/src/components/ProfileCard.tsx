import Image from "next/image"

const ProfileCard = () => {
  return (
    <div className='p-4 bg-white rounded-lg shadow-md text-sm flex flex-col gap-6'>
      <div className="h-20 relative">
        <Image
          src="https://images.pexels.com/photos/31681689/pexels-photo-31681689.jpeg"
          alt="Avatar"
          fill
          className="object-cover rounded-md"
        />  
        <Image
          src="https://images.pexels.com/photos/2225673/pexels-photo-2225673.jpeg"
          width={48}
          height={48} 
          alt="Edit"
          className="rounded-full object-cover w-12 h-12 absolute left-0 right-0 m-auto -bottom-6 ring-1 ring-white z-10"
        />
      </div>
      <div className="h-20 flex flex-col gap-2 items-center">
        <div className="font-semibold">Hakan Balaban</div>
        <div className="flex items-center gap-4">
          <div className="flex">
            <Image src="https://images.pexels.com/photos/19578755/pexels-photo-19578755/free-photo-of-woman-watching-birds-and-landscape.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load" width={12} height={12} alt=""  className="rounded-full object-cover w-3 h-3"/>
            <Image src="https://images.pexels.com/photos/19578755/pexels-photo-19578755/free-photo-of-woman-watching-birds-and-landscape.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load" width={12} height={12} alt=""  className="rounded-full object-cover w-3 h-3"/>
            <Image src="https://images.pexels.com/photos/19578755/pexels-photo-19578755/free-photo-of-woman-watching-birds-and-landscape.jpeg?auto=compress&cs=tinysrgb&w=800&lazy=load" width={12} height={12} alt=""  className="rounded-full object-cover w-3 h-3"/>
          </div>
          <span className="text-xstext-gray-500">500 Followers</span>
        </div>
        <button className="bg-blue-500 text-white text-xs p-2 rounded-md">My Profile</button>
      </div>
    </div>
  )
}

export default ProfileCard