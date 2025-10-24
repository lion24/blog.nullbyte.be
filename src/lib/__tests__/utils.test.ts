import { cn } from '../utils'

describe('utils', () => {
  describe('cn (className merger)', () => {
    it('should merge class names correctly', () => {
      const result = cn('class1', 'class2')
      expect(result).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      const isActive = true
      const result = cn('base', isActive && 'active')
      expect(result).toBe('base active')
    })

    it('should filter out falsy values', () => {
      const result = cn('class1', false, 'class2', undefined, 'class3', null)
      expect(result).toBe('class1 class2 class3')
    })

    it('should merge Tailwind classes correctly', () => {
      // tailwind-merge should handle conflicting classes
      const result = cn('px-4 py-2', 'px-6')
      expect(result).toBe('py-2 px-6') // Later px value should override
    })

    it('should handle arrays of classes', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('should handle objects with boolean values', () => {
      const result = cn({
        class1: true,
        class2: false,
        class3: true,
      })
      expect(result).toBe('class1 class3')
    })

    it('should return empty string for no arguments', () => {
      const result = cn()
      expect(result).toBe('')
    })

    it('should handle complex combinations', () => {
      const isActive = true
      const isDisabled = false
      const result = cn(
        'base-class',
        'text-sm',
        isActive && 'active',
        isDisabled && 'disabled',
        ['group', 'hover:bg-gray-100']
      )
      expect(result).toBe('base-class text-sm active group hover:bg-gray-100')
    })
  })
})
