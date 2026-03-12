
import Link from "next/link";
import MobileMenu from "./MobileMenu";
import Image from "next/image";
import {
  ClerkLoaded,
  ClerkLoading,
  SignedIn,
  SignedOut,
  UserButton,
} from "@clerk/nextjs";

const Navbar = () => {
  return (
    <div className="h-24 flex items-center justify-between">
      {/* LEFT */}
      <div className="md:hidden lg:block w-[20%]">
        <Link href="/" className="font-bold text-xl text-blue-600">
          LAMASOCIAL
        </Link>
      </div>
      {/* CENTER */}
      <div className="hidden md:flex w-[50%] text-sm items-center justify-between">
        {/* LINKS */}
        <div className="flex gap-6 text-gray-600">
          <Link href="/" className="flex gap-2 items-center">
            <Image
              src="/home.png"
              width={16}
              height={16}
              alt="Homepage"
              className="w-4 h-4"
            />
            <span>Home</span>
          </Link>
          <Link href="/friends" className="flex gap-2 items-center">
            <Image
              src="/friends.png"
              width={16}
              height={16}
              alt="Friends"
              className="w-4 h-4"
            />
            <span>Friends</span>
          </Link>
          <Link href="/stories" className="flex gap-2 items-center">
            <Image
              src="/stories.png"
              width={16}
              height={16}
              alt="Stories"
              className="w-4 h-4"
            />
            <span>Stories</span>
          </Link>
        </div>
        <div className="hidden xl:flex p-2 bg-slate-100 items-center rounded-xl">
          <input type="text" placeholder="search..." className="bg-transparent outline-none"/>
          <Image src="/search.png" width={16} height={16} alt="search" />
        </div>
      </div>
      {/* RIGHT */}
      <div className="w-[30%] flex items-center gap-4 xl:gap-8 justify-end">
        <ClerkLoading>
          <div className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-gray-500 border-solid border-current border-e-transparent align-[-0.125em] text-surface motion-reduce:animate-[spin_1.5s_linear_infinite] dark:text-white" />
        </ClerkLoading>
        <ClerkLoaded>
          <SignedIn>
            <div className="cursor-pointer">
              <Image src="/people.png" width={20} height={20} alt="signin" />
            </div>
            <div className="cursor-pointer">
              <Image
                src="/messages.png"
                width={20}
                height={20}
                alt="messages"
              />
            </div>
            <div className="cursor-pointer">
              <Image
                src="/notifications.png"
                width={20}
                height={20}
                alt="notify"
              />
            </div>
            <UserButton />
          </SignedIn>
          <SignedOut>
            <div className="flex items-center gap-2 text-sm">
              <Image src="/login.png" width={20} height={20} alt="login" />
              <Link href="/sign-in">Login/Register</Link>
            </div>
          </SignedOut>
        </ClerkLoaded>
        <MobileMenu />
      </div>
    </div>
  );
};

export default Navbar;
