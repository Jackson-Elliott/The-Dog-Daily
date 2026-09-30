import Image from "next/image";

const LOGO_SRC = "/images/The Dog Daily_NEW NEW Logo_Thicker.png";
const LOGO_WIDTH = 1631;
const LOGO_HEIGHT = 259;
const LOGO_ALT = "Animal Welfare League NSW — the dog daily";

/**
 * The current lockup. Used on the public header, site password page, admin
 * header, and admin login so every surface shares the same file and size.
 */
export default function BrandLogo({
  invert = false,
  className = "h-auto w-auto max-h-[3.18rem] max-w-full sm:max-h-[4.75rem]",
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
      // Keep the 1631×259 lockup. A fixed height plus a narrower parent
      // (the password form is max-w-sm) was flattening it.
      style={{ width: "auto", height: "auto" }}
      className={invert ? `${className} invert` : className}
    />
  );
}
