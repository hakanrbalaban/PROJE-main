import Image from "next/image";
import Link from "next/link";

const UserInfoCard = ({ userId }: { userId: string }) => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md text-sm flex flex-col gap-4">
      {/* TOP */}
      <div className="flex items-center justify-between font-medium">
        <span className="text-gray-500">User Information</span>
        <Link href="/" className="text-blue-500 text-xs">
          See all
        </Link>
      </div>
      {/* BOTTOM */}
      <div className="flex flex-col gap-4 text-gray-500">
        <div className="flex items-center gap-2">
          <span className="text-xl text-black">Hakan Rustu Balaban</span>
          <span className="text-sm">@Hakan</span>
        </div>
        <p>
          Lorem ipsum dolor sit amet consectetur adipisicing elit. Autem, nemo.
          Vitae molestiae ut accusamus modi illo.
        </p>
        <div className="flex items-center gap-2">
          <Image src="/map.png" width={16} height={16} alt="" />
          <span className="">Living in <b>Mugla, Turkey</b></span>
        </div>
        <div className="flex items-center gap-2">
          <Image src="/school.png" width={16} height={16} alt="" />
          <span className="">Went to <b>Mugla University</b></span>
        </div>
        <div className="flex items-center gap-2">
          <Image src="/work.png" width={16} height={16} alt="" />
          <span className="">Works at <b>ROKETSAN</b></span>
        </div>
        <div className="flex items-center justify-between flex-wrap">
            <div className="flex gap-1 items-center">
                <Image src="/link.png" width={16} height={16} alt="" />
                <Link href="https://www.trportal.com.tr/" className="text-blue-500 font-medium">trportal.com.tr</Link>
            </div>
            <div className="flex gap-1 items-center">
                <Image src="/date.png" width={16} height={16} alt="" />
                <span className="font-medium">Joined November 2022</span>
            </div>
        </div>
        <button className="bg-blue-500 text-white text-sm rounded-md p-2">Follow</button>
        <span className="text-red-400 self-end text-xs cursor-pointer">Block User</span>
      </div>
    </div>
  );
};

export default UserInfoCard;
