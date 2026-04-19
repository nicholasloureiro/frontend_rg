/**
 * Vitest setup — runs before every test file.
 * Registers @testing-library/jest-dom matchers and resets DOM after each test.
 */
import '@testing-library/jest-dom/vitest'
import { cleanup } from '@testing-library/react'
import { afterEach } from 'vitest'

afterEach(() => {
  cleanup()
})
