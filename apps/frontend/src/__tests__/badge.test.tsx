import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Badge } from '@/components/ui/badge'

describe('Badge', () => {
  it('renders children', () => {
    render(<Badge>exposition</Badge>)
    expect(screen.getByText('exposition')).toBeInTheDocument()
  })

  it('applies default variant', () => {
    render(<Badge>default</Badge>)
    expect(screen.getByText('default').className).toMatch(/bg-cobalt/)
  })

  it('applies outline variant', () => {
    render(<Badge variant="outline">outline</Badge>)
    expect(screen.getByText('outline').className).toMatch(/border/)
  })

  it('applies success variant', () => {
    render(<Badge variant="success">Confirmée</Badge>)
    expect(screen.getByText('Confirmée').className).toMatch(/bg-green/)
  })

  it('applies destructive variant', () => {
    render(<Badge variant="destructive">Annulée</Badge>)
    expect(screen.getByText('Annulée').className).toMatch(/bg-red/)
  })
})
