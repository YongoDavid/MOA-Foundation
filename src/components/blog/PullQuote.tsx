// Pull-quote block, mockup 1b. violet-050 panel, violet-900 text, uppercase
// violet-600 attribution.
export default function PullQuote({
  text,
  attribution,
}: {
  text: string
  attribution?: string
}) {
  return (
    <figure
      className="my-0 rounded-2xl px-[26px] py-6"
      style={{ background: "var(--blog-violet-050)" }}
    >
      <blockquote
        className="m-0 text-[19px] font-semibold leading-[1.6] tracking-[-.01em]"
        style={{ color: "var(--blog-violet-900)" }}
      >
        {text}
      </blockquote>
      {attribution ? (
        <figcaption
          className="mt-3 text-[12px] font-bold uppercase leading-none tracking-[.06em]"
          style={{ color: "var(--blog-violet-600)" }}
        >
          {attribution}
        </figcaption>
      ) : null}
    </figure>
  )
}
