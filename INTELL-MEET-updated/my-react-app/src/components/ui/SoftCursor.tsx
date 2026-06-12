import { useEffect, useRef } from "react"

export default function SoftCursor() {
  const cursorRef = useRef<HTMLDivElement>(null)
  const mouse = useRef({ x: 0, y: 0 })
  const pos = useRef({ x: 0, y: 0 })

  useEffect(() => {
    const move = (e: MouseEvent) => {
      mouse.current = { x: e.clientX, y: e.clientY }
    }

    window.addEventListener("mousemove", move)

    const animate = () => {
      pos.current.x += (mouse.current.x - pos.current.x) * 0.15
      pos.current.y += (mouse.current.y - pos.current.y) * 0.15

      if (cursorRef.current) {
        cursorRef.current.style.transform =
          `translate(${pos.current.x}px, ${pos.current.y}px)`
      }

      requestAnimationFrame(animate)
    }

    animate()

    return () =>
      window.removeEventListener("mousemove", move)
  }, [])

  return (
    <div
      ref={cursorRef}
      className="fixed pointer-events-none z-[9999] h-3 w-3 rounded-full bg-indigo-500 shadow-[0_0_24px_rgba(79,70,229,0.35)]"
    />
  )
}
