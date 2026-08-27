// Foundation content (spec v2.0 §11).
//
// The mandate and vision are VERBATIM — the client's own words, never edited
// in code. They appear on both the homepage and /about; both read from here so
// the two can never drift apart.

export const MANDATE =
  "To inspire guide and equip African youths with the right knowledge, skills, ethics and moral values required to discover their full potentials, develop their skills and talents to become valuable in the global market being the best version of themselves. We aim at creating opportunities for mentorship, education and leadership that nurture responsible citizens and visionary leaders who will drive sustainable economic, social and political development across the continent and beyond."

export const VISION =
  "To build a continent where every young African has access to education, mentorship and empowerment, enabling them to rise as confident leaders, peace advocates, innovators and change makers who contribute to the sustainable development of Africa and also thrive globally."

/** Eight vision items, verbatim. Rendered numbered on the homepage vision band. */
export const VISION_ITEMS = [
  "To inspire African emerging leaders for impact driven leadership, high ethics, moral values and integrity.",
  "To raise transformational leaders, entrepreneurs and new captains of industries who are keen to transparency, accountability and patriotism. Ensuring equity, justice and fairness",
  "To always project and protect the good image of Africa worldwide",
  "To raise Ambassadors for global peace to fight insecurity, terrorism and social instability.",
  "To groom African youths to become creators and innovators of goods and services not only influencers.",
  "To fight political a-party: encourage young Africans to participate in politics, run for office, protect and vote during and after election.",
  "To influence government policies to transform the youths dreams and vision into realities by advocacy",
  "To build a continent where every young African's are intentional in making impact locally and also thriving globally",
] as const

/**
 * Ten specific objectives — real, already-published content.
 *
 * The spec's stop-block warns these read "Objective one — paste verbatim text"
 * and says to ship the band switched off. That note predates the v3 mockup,
 * whose objectives are these ten, verified word-for-word against the previous
 * site. Confirmed with the client 27 Aug: band 05 ships visible.
 */
export const OBJECTIVES = [
  "Harnessing youth potential through professional mentorship.",
  "Public enlightenment via seminars, workshops, and outreaches.",
  "Advocacy for human and food security via agricultural education.",
  "Promoting transparent, free, and fair elections across Africa.",
  "Championing gender inclusion and fighting gender-based violence.",
  "Advocating for human rights, rule of law, equity, and justice.",
  "Fostering peace across ethnic and religious lines.",
  "Demanding good governance, transparency, and accountability.",
  "Utilizing technology for personal growth and national development.",
  "Encouraging creativity and forward-thinking solutions.",
] as const

/** Five bodies whose frameworks the programme follows. Named as text, not logos —
 *  written permission for marks was never confirmed. */
export const ALIGNMENT = [
  { name: "United Nations", role: "SDG framework" },
  { name: "African Union", role: "Youth agenda" },
  { name: "The Commonwealth", role: "Peace advocacy" },
  { name: "UNESCO", role: "Education standards" },
  { name: "Save the Children", role: "Child protection" },
] as const

/** Content flags (spec §4). Wired to content, not constants. */
export const FLAGS = {
  /** Band 05. True — the objectives are real content, see OBJECTIVES above. */
  showObjectives: true,
  /** Both woven pull-quotes: vision list and pathways. */
  showQuotes: true,
} as const
