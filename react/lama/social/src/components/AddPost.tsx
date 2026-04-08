import Image from "next/image";

const AddPost = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md flex gap-4 justify-between text-sm">
      {/* AVATAR */}
      <div className="">
        <Image
          src="https://images.pexels.com/photos/2225673/pexels-photo-2225673.jpeg"
          width={48}
          height={48}
          alt="Avatar"
          className="w-12 h-12 rounded-full object-cover"
        />
      </div>
      {/* POST */}
      <div className="flex-1">
        {/* TEXT INPUT */}
        <div className="flex gap-4">
          <textarea
            placeholder="What's on your mind?"
            className="flex-1 p-2 bg-slate-100 rounded-lg outline-none"
          ></textarea>
          <Image
            src="/emoji.png"
            width={20}
            height={20}
            alt=""
            className="w-5 h-5 cursor-pointer self-end"
          />
        </div>
        {/* POST OPTIONS */}
        <div className="flex items-center gap-4 mt-4 text-gray-400 flex-wrap">
          <div className=" flex items-center gap-2 cursor-pointer">
            <Image src="/addimage.png" width={20} height={20} alt="" />
            Photo
          </div>
          <div className=" flex items-center gap-2 cursor-pointer">
            <Image src="/addVideo.png" width={20} height={20} alt="" />
            Video
          </div>
          <div className=" flex items-center gap-2 cursor-pointer">
            <Image src="/poll.png" width={20} height={20} alt="" />
            Poll
          </div>
          <div className=" flex items-center gap-2 cursor-pointer">
            <Image src="/addevent.png" width={20} height={20} alt="" />
            Event
          </div>
        </div>
      </div>
    </div>
  );
};

export default AddPost;
