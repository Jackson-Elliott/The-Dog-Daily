import Image from "next/image";

const LOGO_SRC = "/images/logo-combined.png";
const LOGO_WIDTH = 1713;
const LOGO_HEIGHT = 271;
const LOGO_ALT = "Animal Welfare League NSW — the dog daily";

/**
 * The current lockup. Used on the public header, site password page, admin
 * header, and admin login so every surface shares the same file and size.
 */
export default function BrandLogo({
  invert = false,
  className = "h-[3.8rem] w-auto sm:h-[4.75rem]",
}: {
  invert?: boolean;
  className?: string;
}) {
  return (
    <Image
      src={LOGO_SRC}
      alt={LOGO_ALT}
      width={LOGO_WIDTH}
      height={LOGO_HEIGHT}
      priority
      className={invert ? `${className} invert` : className}
    />
  );
}
