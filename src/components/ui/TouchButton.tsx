'use client'

import { ButtonHTMLAttributes, useState } from 'react'

interface TouchButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'luxury'
  soundEnabled?: boolean
}

export function TouchButton({ 
  children, 
  variant = 'primary', 
  soundEnabled = true,
  className = '',
  onClick,
  ...props 
}: TouchButtonProps) {
  const [isPressed, setIsPressed] = useState(false)

  const playSound = () => {
    if (soundEnabled) {
      const audio = new Audio('/sounds/click.mp3')
      audio.volume = 0.3
      audio.play().catch(() => {})
    }
  }

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    playSound()
    setIsPressed(true)
    setTimeout(() => setIsPressed(false), 150)
    onClick?.(e)
  }

  const variants = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-600 hover:bg-gray-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    luxury: 'bg-gradient-to-r from-luxury-gold to-luxury-darkGold hover:from-luxury-darkGold hover:to-luxury-gold text-luxury-black font-bold'
  }

  return (
    <button
      onClick={handleClick}
      className={`
        px-6 py-3 rounded-lg font-medium
        transition-all duration-150
        active:scale-95
        ${variants[variant]}
        ${isPressed ? 'animate-touch-scale' : ''}
        ${className}
      `}
      {...props}
    >
      {children}
    </button>
  )
}
