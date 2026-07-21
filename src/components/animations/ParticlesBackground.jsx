import React, { useEffect, useRef } from 'react'
import { motion } from 'framer-motion'

// Animated floating particles canvas for auth page backgrounds
// formulas prop: array of chemical formula strings to float upward
export default function ParticlesBackground({ formulas }) {
  const canvasRef = useRef(null)
  const formulaSet = formulas || ['H₂SO₄', 'NaOH', 'C₆H₁₂O₆', 'HCl', 'NH₃', 'H₂O₂', 'CH₃OH', 'CuSO₄']

  useEffect(() => {
    const canvas = canvasRef.current
    const ctx = canvas.getContext('2d')
    let animId
    let particles = []

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

    // Use the passed-in or default formula set
    const floatingTexts = formulaSet.map((f) => ({
      text: f,
      x: Math.random() * (canvas.width || 300),
      y: Math.random() * (canvas.height || 600),
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

// molecule prop: 'hexagonal' (default, benzene-like) | 'triangular' (3-atom) | 'linear' (2-atom bent)
export function FloatingMolecule({ molecule = 'hexagonal' }) {
  const getMolecule = () => {
    if (molecule === 'triangular') {
      // NaOH / water-like — 3 atoms in a triangle
      return (
        <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
          <circle cx="90" cy="35" r="10" fill="white" />
          <circle cx="145" cy="130" r="8" fill="white" opacity="0.8" />
          <circle cx="35" cy="130" r="8" fill="white" opacity="0.8" />
          <line x1="90" y1="35" x2="145" y2="130" stroke="white" strokeWidth="2" opacity="0.5" />
          <line x1="90" y1="35" x2="35" y2="130" stroke="white" strokeWidth="2" opacity="0.5" />
          <line x1="145" y1="130" x2="35" y2="130" stroke="white" strokeWidth="2" opacity="0.5" />
          <ellipse cx="90" cy="95" rx="55" ry="22" stroke="white" strokeWidth="1" fill="none" opacity="0.25" />
        </svg>
      )
    }

    if (molecule === 'linear') {
      // H₂O₂ / HCl-like — linear molecule
      return (
        <svg width="180" height="180" viewBox="0 0 180 180" fill="none">
          <circle cx="90" cy="90" r="10" fill="white" />
          <circle cx="90" cy="30" r="7" fill="white" opacity="0.85" />
          <circle cx="90" cy="150" r="7" fill="white" opacity="0.85" />
          <circle cx="35" cy="90" r="6" fill="white" opacity="0.7" />
          <circle cx="145" cy="90" r="6" fill="white" opacity="0.7" />
          <line x1="90" y1="90" x2="90" y2="30" stroke="white" strokeWidth="2" opacity="0.5" />
          <line x1="90" y1="90" x2="90" y2="150" stroke="white" strokeWidth="2" opacity="0.5" />
          <line x1="90" y1="90" x2="35" y2="90" stroke="white" strokeWidth="1.5" opacity="0.4" />
          <line x1="90" y1="90" x2="145" y2="90" stroke="white" strokeWidth="1.5" opacity="0.4" />
          <ellipse cx="90" cy="90" rx="50" ry="18" stroke="white" strokeWidth="1" fill="none" opacity="0.2" />
          <ellipse cx="90" cy="90" rx="18" ry="50" stroke="white" strokeWidth="1" fill="none" opacity="0.2" />
        </svg>
      )
    }

    // Default: hexagonal benzene-like
    return (
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
        <ellipse cx="100" cy="100" rx="60" ry="25" stroke="white" strokeWidth="1" fill="none" opacity="0.3" />
        <ellipse cx="100" cy="100" rx="25" ry="60" stroke="white" strokeWidth="1" fill="none" opacity="0.3" />
      </svg>
    )
  }

  return (
    <motion.div
      className="absolute bottom-10 right-10 opacity-20"
      animate={{ rotate: 360 }}
      transition={{ duration: 20, repeat: Infinity, ease: 'linear' }}
      style={{ zIndex: 1 }}
    >
      {getMolecule()}
    </motion.div>
  )
}

