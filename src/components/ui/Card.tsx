'use client'

interface CardProps {
  children: React.ReactNode
  className?: string
  onClick?: () => void
  hover?: boolean
}

export function Card({ children, className = '', onClick, hover = false }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-luxury-gray rounded-xl p-6 border border-luxury-lightGray
        ${hover ? 'hover:border-luxury-gold transition-all cursor-pointer active:scale-98' : ''}
        ${className}
      `}
    >
      {children}
    </div>
  )
}
