import type { ReactNode } from "react"

/** The one page frame every admin screen uses, so they cannot drift apart. */
export function AdminShell({
  heading,
  action,
  children,
}: {
  heading: string
  action?: ReactNode
  children: ReactNode
}) {
  return (
    <section className="bg-paper px-5 py-12 lg:px-14 lg:py-16">
      <div className="mx-auto max-w-[1180px]">
        <div className="mb-9 flex flex-wrap items-end justify-between gap-5 border-b border-ink-900/[.14] pb-6">
          <div>
            <p className="m-0 font-body text-[10.5px] font-bold uppercase leading-none tracking-[.2em] text-umber-800">
              Foundation admin
            </p>
            <h1 className="m-0 mt-3 font-display text-[40px] font-extrabold uppercase leading-[.98] text-ink-900">
              {heading}
            </h1>
          </div>
          {action}
        </div>
        {children}
      </div>
    </section>
  )
}
