const AWL_NSW_URL = "https://www.awlnsw.com.au/";

/**
 * Static footer under the story grid. The AWL adopt line sits between two
 * hairline rules; a smaller disclaimer below notes that news photos are
 * used without rights and that the site exists to show the radio campaign.
 */
export default function SiteFooter() {
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
        This website is a creative showcase for a radio advertising campaign.
        Any third-party images featured are used for illustrative purposes only.
        We do not claim ownership or copyright in these images, which remain the
        property of their respective rights holders.
      </p>
    </footer>
  );
}
