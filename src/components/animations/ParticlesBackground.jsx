import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

// Animated floating particles canvas for Login page background
export default function ParticlesBackground() {
  const canvasRef = useRef(null)

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let particles = []
    let mouse = { x: -1000, y: -1000 }

    const resize = () => {
      canvas.width = canvas.offsetWidth
      canvas.height = canvas.offsetHeight
    }

    class Particle {
      constructor() { this.reset() }
      reset() {
        this.x = Math.random() * canvas.width
        this.y = Math.random() * canvas.height
        this.size = Math.random() * 3 + 1
        this.speedX = (Math.random() - 0.5) * 0.6
        this.speedY = (Math.random() - 0.5) * 0.6
        this.opacity = Math.random() * 0.6 + 0.2
        this.color = Math.random() > 0.5 ? '255,255,255' : '122,184,245'
      }
      update() {
        this.x += this.speedX
        this.y += this.speedY
        if (this.x < 0 || this.x > canvas.width) this.speedX *= -1
        if (this.y < 0 || this.y > canvas.height) this.speedY *= -1
      }
      draw() {
        ctx.beginPath()
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2)
        ctx.fillStyle = `rgba(${this.color}, ${this.opacity})`
        ctx.fill()
      }
    }

    const init = () => {
      particles = Array.from({ length: 80 }, () => new Particle())
    }

    const drawConnections = () => {
      particles.forEach((p1, i) => {
        particles.slice(i + 1).forEach(p2 => {
          const dist = Math.hypot(p1.x - p2.x, p1.y - p2.y)
          if (dist < 120) {
            ctx.beginPath()
            ctx.moveTo(p1.x, p1.y)
            ctx.lineTo(p2.x, p2.y)
            ctx.strokeStyle = `rgba(255,255,255,${0.15 * (1 - dist / 120)})`
            ctx.lineWidth = 0.5
            ctx.stroke()
          }
        })
      })
    }

    // Chemical formulas floating
    const formulas = ['H₂SO₄', 'NaOH', 'C₆H₁₂O₆', 'HCl', 'NH₃', 'H₂O₂', 'CH₃OH', 'CuSO₄']
    const floatingTexts = formulas.map((f, i) => ({
      text: f,
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      speed: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.3 + 0.1,
    }))

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)
      particles.forEach(p => { p.update(); p.draw() })
      drawConnections()

      // Draw floating formulas
      floatingTexts.forEach(t => {
        t.y -= t.speed
        if (t.y < -30) t.y = canvas.height + 30
        ctx.font = '12px Inter, monospace'
        ctx.fillStyle = `rgba(255,255,255,${t.opacity})`
        ctx.fillText(t.text, t.x, t.y)
      })

      animId = requestAnimationFrame(animate)
    }

    resize()
    init()
    animate()
    window.addEventListener('resize', () => { resize(); init() })
    return () => {
      cancelAnimationFrame(animId)
      window.removeEventListener('resize', resize)
    }
  }, [])

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full"
      style={{ zIndex: 1 }}
    />
  )
}

// Molecule Atom component for 3D-like CSS animation
export function FloatingMolecule() {
  return (
    <motion.div
      className="absolute bottom-10 right-10 opacity-20"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      style={{ zIndex: 1 }}
    >
      <svg width="200" height="200" viewBox="0 0 200 200" fill="none">
        <circle cx="100" cy="100" r="8" fill="white" />
        <circle cx="100" cy="40" r="6" fill="white" opacity="0.8" />
        <circle cx="155" cy="70" r="6" fill="white" opacity="0.8" />
        <circle cx="155" cy="130" r="6" fill="white" opacity="0.8" />
        <circle cx="100" cy="160" r="6" fill="white" opacity="0.8" />
        <circle cx="45" cy="130" r="6" fill="white" opacity="0.8" />
        <circle cx="45" cy="70" r="6" fill="white" opacity="0.8" />
        <line x1="100" y1="100" x2="100" y2="40" stroke="white" strokeWidth="1.5" opacity="0.5" />
        <line x1="100" y1="100" x2="155" y2="70" stroke="white" strokeWidth="1.5" opacity="0.5" />
        <line x1="100" y1="100" x2="155" y2="130" stroke="white" strokeWidth="1.5" opacity="0.5" />
        <line x1="100" y1="100" x2="100" y2="160" stroke="white" strokeWidth="1.5" opacity="0.5" />
        <line x1="100" y1="100" x2="45" y2="130" stroke="white" strokeWidth="1.5" opacity="0.5" />
        <line x1="100" y1="100" x2="45" y2="70" stroke="white" strokeWidth="1.5" opacity="0.5" />
        {/* Ring */}
        <ellipse cx="100" cy="100" rx="60" ry="25" stroke="white" strokeWidth="1" fill="none" opacity="0.3" />
        <ellipse cx="100" cy="100" rx="25" ry="60" stroke="white" strokeWidth="1" fill="none" opacity="0.3" />
      </svg>
    </motion.div>
  )
}
