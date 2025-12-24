/**
 * Shared UI Components
 *
 * Provides consistent styling primitives across the entire app.
 * All components use CSS variables defined in index.css.
 */

import React from 'react'

/**
 * Card Component
 * Consistent container styling across all screens
 */
export const Card = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`rounded-xl shadow-md ${className}`}
      style={{
        backgroundColor: 'var(--color-bg-card)',
        padding: 'var(--spacing-card)',
        borderRadius: 'var(--radius-card)',
      }}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Button Component
 * Supports primary and secondary variants
 */
export const Button = ({
  children,
  variant = 'primary',
  className = '',
  onClick,
  type = 'button',
  ...props
}) => {
  const isPrimary = variant === 'primary'

  const baseStyles = {
    padding: 'var(--spacing-button)',
    borderRadius: 'var(--radius-button)',
    fontSize: '1.125rem',
    fontWeight: '600',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    border: 'none',
    outline: 'none',
  }

  const [isHovered, setIsHovered] = React.useState(false)

  const primaryStyles = {
    backgroundColor: isHovered
      ? 'var(--color-button-primary-hover)'
      : 'var(--color-button-primary)',
    color: 'white',
  }

  const secondaryStyles = {
    backgroundColor: isHovered
      ? 'var(--color-button-secondary-hover)'
      : 'var(--color-button-secondary)',
    color: 'var(--color-text-primary)',
    border: '2px solid var(--color-button-secondary-border)',
  }

  return (
    <button
      type={type}
      className={className}
      style={{
        ...baseStyles,
        ...(isPrimary ? primaryStyles : secondaryStyles),
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      onClick={onClick}
      {...props}
    >
      {children}
    </button>
  )
}

/**
 * Container Component
 * Full-screen background container
 */
export const Container = ({ children, className = '', ...props }) => {
  return (
    <div
      className={`flex min-h-screen items-center justify-center px-4 ${className}`}
      style={{ backgroundColor: 'var(--color-bg-primary)' }}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * Heading Component
 * Consistent typography for headings
 */
export const Heading = ({
  level = 1,
  children,
  className = '',
  ...props
}) => {
  const Tag = `h${level}`

  const styles = {
    color: 'var(--color-text-primary)',
    fontWeight: 'bold',
    marginBottom: level === 1 ? '0.75rem' : '1.5rem',
    fontSize: level === 1 ? '2.25rem' : level === 2 ? '1.5rem' : '1.25rem',
  }

  return React.createElement(
    Tag,
    { className, style: styles, ...props },
    children
  )
}

/**
 * Text Component
 * Consistent typography for body text
 */
export const Text = ({
  variant = 'primary',
  children,
  className = '',
  ...props
}) => {
  const colorMap = {
    primary: 'var(--color-text-primary)',
    secondary: 'var(--color-text-secondary)',
    tertiary: 'var(--color-text-tertiary)',
  }

  return (
    <p
      className={className}
      style={{ color: colorMap[variant] }}
      {...props}
    >
      {children}
    </p>
  )
}

/**
 * Input Component
 * Consistent form input styling
 */
export const Input = ({
  className = '',
  ...props
}) => {
  return (
    <input
      className={`w-full p-3 font-mono text-sm ${className}`}
      style={{
        borderRadius: 'var(--radius-input)',
        border: '2px solid var(--color-button-secondary-border)',
        backgroundColor: 'white',
        color: 'var(--color-text-primary)',
      }}
      {...props}
    />
  )
}

/**
 * TextArea Component
 * Consistent form textarea styling
 */
export const TextArea = ({
  className = '',
  rows = 6,
  ...props
}) => {
  return (
    <textarea
      className={`w-full p-3 font-mono text-sm ${className}`}
      style={{
        borderRadius: 'var(--radius-input)',
        border: '2px solid var(--color-button-secondary-border)',
        backgroundColor: 'white',
        color: 'var(--color-text-primary)',
      }}
      rows={rows}
      {...props}
    />
  )
}
