"use client";

import { useTheme } from "next-themes";
import Image from "next/image";

export default function ImageBackground() {
  const { theme } = useTheme();

  const isDark = theme === "dark";
  const logoSrc = isDark ? "/bg-dark.webp" : "/bg-light.webp";

  return (
    <Image src={logoSrc} fill alt="Axon Background" className="object-cover" />
  );
}
