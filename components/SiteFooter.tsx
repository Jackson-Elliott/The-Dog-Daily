import type { Imagery } from "@/lib/imagery";

const AWL_NSW_URL = "https://www.awlnsw.com.au/";

const PHOTO_DISCLAIMER =
  "This website is a creative showcase for a radio advertising campaign. Any third-party images featured are used for illustrative purposes only. We do not claim ownership or copyright in these images, which remain the property of their respective rights holders.";

const COLLAGE_MIX_DISCLAIMER =
  "This website is a creative showcase for a radio advertising campaign. All images are created using AI, guided by human creativity and direction. Any third-party images featured are used for illustrative purposes only. We do not claim ownership or copyright over these images, which remain the property of their respective rights holders.";

const ILLUSTRATION_DISCLAIMER =
  "All illustrations featured on this website are created using AI, guided by human creativity, direction and a hands-on artistic touch.";

function disclaimerFor(imagery: Imagery) {
  if (imagery === "illustrations") return ILLUSTRATION_DISCLAIMER;
  if (imagery === "collage" || imagery === "mix") return COLLAGE_MIX_DISCLAIMER;
  return PHOTO_DISCLAIMER;
}

/**
 * Static footer under the story grid. The AWL adopt line sits between two
 * hairline rules; the smaller disclaimer below changes with the imagery mode.
 */
export default function SiteFooter({ imagery = "photos" }: { imagery?: Imagery }) {
  return (
    <footer className="mx-auto w-full max-w-5xl px-4 pb-16">
      <div className="border-t border-black pt-3 pb-3">
        <p className="text-center text-sm font-semibold text-black">
          Only humans do these things.{" "}
          <br className="sm:hidden" aria-hidden="true" />
          And yet somehow, dogs still love us.{" "}
          <br className="sm:hidden" aria-hidden="true" />
          Adopt a little unconditional love{" "}
          <br className="sm:hidden" aria-hidden="true" />
          from the{" "}
          <a
            href={AWL_NSW_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="underline hover:no-underline"
          >
            Animal Welfare League NSW
          </a>
          .
        </p>
      </div>
      <div className="border-t border-black" />
      <p className="mx-auto max-w-2xl pt-12 pb-4 text-center text-[11px] leading-relaxed text-black/25">
        {disclaimerFor(imagery)}
      </p>
    </footer>
  );
}
