import { notFound } from "next/navigation"
import { WorkDemo } from "./WorkDemo"
export default function Page() {
  if (process.env.NODE_ENV !== "development") notFound()
  return <WorkDemo />
}
