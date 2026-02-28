import { Navbar } from "@/components/navbar"
import { LeftSidebar } from "@/components/left-sidebar"
import { RightSidebar } from "@/components/right-sidebar"

export default function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <Navbar />
      <div className="mx-auto flex w-full max-w-[1280px] flex-1">
        <LeftSidebar />
        <main className="flex-1 overflow-hidden">{children}</main>
        <RightSidebar />
      </div>
    </div>
  )
}
