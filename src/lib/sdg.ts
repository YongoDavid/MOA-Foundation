// The seventeen UN Sustainable Development Goals.
//
// `label` is the abbreviated form the tile grid can fit; `title` is the full
// official name, kept for the `title` attribute and screen-reader text so
// abbreviating never loses meaning (spec §6).

export type Goal = { n: number; label: string; title: string }

export const GOALS: Goal[] = [
  { n: 1, label: "No poverty", title: "No Poverty" },
  { n: 2, label: "Zero hunger", title: "Zero Hunger" },
  { n: 3, label: "Health", title: "Good Health and Well-being" },
  { n: 4, label: "Quality education", title: "Quality Education" },
  { n: 5, label: "Gender equality", title: "Gender Equality" },
  { n: 6, label: "Water", title: "Clean Water and Sanitation" },
  { n: 7, label: "Energy", title: "Affordable and Clean Energy" },
  { n: 8, label: "Decent work", title: "Decent Work and Economic Growth" },
  { n: 9, label: "Industry", title: "Industry, Innovation and Infrastructure" },
  { n: 10, label: "Inequality", title: "Reduced Inequalities" },
  { n: 11, label: "Cities", title: "Sustainable Cities and Communities" },
  { n: 12, label: "Consumption", title: "Responsible Consumption and Production" },
  { n: 13, label: "Climate", title: "Climate Action" },
  { n: 14, label: "Oceans", title: "Life Below Water" },
  { n: 15, label: "Land", title: "Life on Land" },
  { n: 16, label: "Peace & justice", title: "Peace, Justice and Strong Institutions" },
  { n: 17, label: "Partnerships", title: "Partnerships for the Goals" },
]
