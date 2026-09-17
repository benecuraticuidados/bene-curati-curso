import packs from "./lesson-packs.json"

export type LessonUnit = {
  title: string
  objectives: string[]
  points: string[]
  reading: string
}

export type ModulePack = {
  order: number
  title: string
  hours: number
  closingVideo: { url: string; title: string }
  lessons: LessonUnit[]
}

export const MODULE_PACKS = packs as ModulePack[]

/** @deprecated use MODULE_PACKS */
export const MODULE_READINGS = MODULE_PACKS.map((p) => ({
  order: p.order,
  title: p.title,
  video: p.closingVideo.url,
  videoTitle: p.closingVideo.title,
  reading: p.lessons[0]?.reading || "",
}))
