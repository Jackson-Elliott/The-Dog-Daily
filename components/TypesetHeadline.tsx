import { Fragment } from "react";
import { typesetHeadline } from "@/lib/format";

/**
 * Widow / hanging-"to" / comma line-break rules. Applied from the `sm`
 * breakpoint up (the desktop headline size); mobile keeps the browser's
 * natural wrap so large type doesn't get odd forced breaks.
 */
export default function TypesetHeadline({ text }: { text: string }) {
  const lines = typesetHeadline(text).split("\n");
  return (
    <>
      <span className="sm:hidden">{text}</span>
      <span className="hidden sm:inline">
        {lines.map((line, index) => (
          <Fragment key={index}>
            {index > 0 ? <br /> : null}
            {line}
          </Fragment>
        ))}
      </span>
    </>
  );
}
