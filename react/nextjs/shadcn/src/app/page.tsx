import { Button } from "@/components/ui/button";
import Image from "next/image";

export default function Home() {
  return (
    <div className="h-screen flex items-center justify-center">
      <Button size="xl" className="rounded-full text-custom-color">Click Me</Button>
    </div>
    
  );
}

