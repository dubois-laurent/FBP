import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { Button } from '@/components/ui/button'

describe('Button', () => {
  it('renders children', () => {
    render(<Button>Cliquer</Button>)
    expect(screen.getByRole('button', { name: 'Cliquer' })).toBeInTheDocument()
  })

  it('is disabled when disabled prop is set', () => {
    render(<Button disabled>Désactivé</Button>)
    expect(screen.getByRole('button')).toBeDisabled()
  })

  it('applies primary variant by default', () => {
    render(<Button>Test</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toMatch(/bg-cobalt/)
  })

  it('applies outline variant', () => {
    render(<Button variant="outline">Outline</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toMatch(/border/)
  })

  it('applies destructive variant', () => {
    render(<Button variant="destructive">Supprimer</Button>)
    const btn = screen.getByRole('button')
    expect(btn.className).toMatch(/bg-red/)
  })

  it('renders as child element with asChild', () => {
    render(
      <Button asChild>
        <a href="/test">Lien</a>
      </Button>,
    )
    expect(screen.getByRole('link', { name: 'Lien' })).toBeInTheDocument()
  })
})
