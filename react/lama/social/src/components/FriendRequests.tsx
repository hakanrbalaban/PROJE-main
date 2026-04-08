import Image from "next/image";
import Link from "next/link";

const FriendRequests = () => {
  return (
    <div className="p-4 bg-white rounded-lg shadow-md text-sm flex flex-col gap-4">
      {/* TOP */}
      <div className="flex items-center justify-between font-medium">
        <span className="text-gray-500">Friend Requests</span>
        <Link href="/" className="text-blue-500 text-xs">
          See all
        </Link>
      </div>
      {/* USER */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="https://images.pexels.com/photos/2225673/pexels-photo-2225673.jpeg"
            width={40}
            height={40}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="font-semibold">Hakan</span>
        </div>
        <div className="flex gap-3 justify-end">
          <Image
            src="/accept.png"
            width={20}
            height={20}
            alt="Accept"
            className="cursor-pointer"
          />
          <Image
            src="/reject.png"
            width={20}
            height={20}
            alt="Reject"
            className="cursor-pointer"
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="https://images.pexels.com/photos/2225673/pexels-photo-2225673.jpeg"
            width={40}
            height={40}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="font-semibold">Hakan</span>
        </div>
        <div className="flex gap-3 justify-end">
          <Image
            src="/accept.png"
            width={20}
            height={20}
            alt="Accept"
            className="cursor-pointer"
          />
          <Image
            src="/reject.png"
            width={20}
            height={20}
            alt="Reject"
            className="cursor-pointer"
          />
        </div>
      </div>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Image
            src="https://images.pexels.com/photos/2225673/pexels-photo-2225673.jpeg"
            width={40}
            height={40}
            alt="Avatar"
            className="w-10 h-10 rounded-full object-cover"
          />
          <span className="font-semibold">Hakan</span>
        </div>
        <div className="flex gap-3 justify-end">
          <Image
            src="/accept.png"
            width={20}
            height={20}
            alt="Accept"
            className="cursor-pointer"
          />
          <Image
            src="/reject.png"
            width={20}
            height={20}
            alt="Reject"
            className="cursor-pointer"
          />
        </div>
      </div>
    </div>
  );
};

export default FriendRequests;
