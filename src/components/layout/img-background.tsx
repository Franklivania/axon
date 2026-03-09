import Image from "next/image";

export default function ImageBackground() {
  return (
    <>
      <Image
        src="/bg-dark.webp"
        fill
        alt="Axon Background"
        className="object-cover hidden dark:block"
        loading="eager"
      />
      <Image
        src="/bg-light.webp"
        fill
        alt="Axon Background"
        className="object-cover block dark:hidden"
        loading="eager"
      />
    </>
  );
}
