import { cn } from './utils'
import React from 'react'

export const AuroraBackground = ({
  className,
  children,
  showRadialGradient = true,
  ...props
}) => {
  return (
    <main>
      <div
        className={cn(
          'transition-bg relative flex h-[100vh] flex-col items-center justify-center',
          className,
        )}
        style={{
          backgroundColor: 'var(--color-bg-primary)',
          color: 'var(--color-text-primary)',
        }}
        {...props}
      >
        <div className="absolute inset-0 overflow-hidden">
          <div
            className={cn(
              `
            after:animate-aurora
            pointer-events-none
            absolute
            -inset-[10px]
            opacity-30
            blur-[10px]
            filter will-change-transform [--aurora:repeating-linear-gradient(100deg,#019AA8_10%,#C9E5E9_15%,#019AA8_20%,#C9E5E9_25%,#019AA8_30%)] [--subtle-gradient:repeating-linear-gradient(100deg,var(--color-bg-primary)_0%,var(--color-bg-primary)_7%,transparent_10%,transparent_12%,var(--color-bg-primary)_16%)]
            [background-image:var(--subtle-gradient),var(--aurora)] [background-position:50%_50%,50%_50%] [background-size:300%,_200%]
            after:absolute
            after:inset-0
            after:mix-blend-soft-light after:content-[""] after:[background-attachment:fixed]
            after:[background-image:var(--subtle-gradient),var(--aurora)]
            after:[background-size:200%,_100%]`,

              showRadialGradient &&
                `[mask-image:radial-gradient(ellipse_at_100%_0%,black_10%,transparent_70%)]`,
            )}
          ></div>
        </div>
        {children}
      </div>
    </main>
  )
}
