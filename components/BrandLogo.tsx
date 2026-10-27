import Image from "next/image";

const LOGO_SRC = "/images/The Dog Daily_NEW NEW NEW Logo.png";
const LOGO_WIDTH = 1631;
const LOGO_HEIGHT = 324;
const LOGO_ALT = "Animal Welfare League NSW — the dog daily";

/**
 * The current lockup. Used on the public header, site password page, admin
 * header, and admin login so every surface shares the same file and size.
 *
 * Width matches the previous 1631×259 mark (3.18rem / 4.75rem tall). This
 * file is the same pixel width and a little taller, so we size by width.
 */
export default function BrandLogo({
  invert = false,
  className = "h-auto w-[20.03rem] max-w-full sm:w-[29.91rem]",
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
      style={{ height: "auto" }}
      className={invert ? `${className} invert` : className}
    />
  );
}
