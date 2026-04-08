import Image from "next/image";

const Comments = () => {
  return (
    <div className="">
      {/* WRITE */}
      <div className="flex items-center gap-4">
        <Image
          src="https://images.pexels.com/photos/2225673/pexels-photo-2225673.jpeg"
          width={32}
          height={32}
          alt=""
          className="w-8 h-8 rounded-full object-cover"
        />
        <div className="flex flex-1 items-center justify-between bg-slate-100 rounded-lg text-sm px-6 py-2 w-full">
          <input
            type="text"
            placeholder="Write a comment..."
            className="bg-transparent outline-none flex-1"
          />
          <Image
            src="/emoji.png"
            width={16}
            height={16}
            alt=""
            className="cursor-pointer"
          />
        </div>
      </div>
      {/* COMMENTS */}
      <div className="">
        {/* COMMENT */}
        <div className="flex gap-4 justify-between mt-6">
          {/* AVATAR */}
            <Image
              src="https://images.pexels.com/photos/2225673/pexels-photo-2225673.jpeg"
              width={40}
              height={40}
              alt=""
              className="w-10 h-10 rounded-full object-cover"
            />
          {/* DESC */}
          <div className="flex flex-col gap-2 flex-1">
            <span className="font-medium">Hakan</span>
            <p>
              Lorem ipsum dolor sit amet consectetur adipisicing elit. Vel,
              incidunt vitae libero id quibusdam facilis modi, velit magni iste,
              nesciunt cupiditate sint similique dolore veritatis iusto est
              tenetur autem fuga!
            </p>
            <div className="flex items-center gap-8 text-xs text-gray-500 mt-2">
              <div className="flex items-center gap-4">
                <Image
                  src="/like.png"
                  width={12}
                  height={12}
                  alt=""
                  className="w-3 h-3 cursor-pointer"
                />
                <span className="text-gray-300">|</span>
                <span className="text-gray-500">123 Likes</span>
              </div>
              <div className="">Reply</div>
            </div>
          </div>
          {/* ICON */}
          <Image
            src="/more.png"
            width={16}
            height={16}
            alt=""
            className="w-4 h-4 cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default Comments;
