import { describe, it, expect } from 'vitest';
import { cn } from '../utils';

describe('cn utility', () => {
  it('should merge class names', () => {
    expect(cn('class1', 'class2')).toBe('class1 class2');
  });

  it('should handle conditional classes', () => {
    const isIncluded = true;
    const isExcluded = false;
    expect(cn('base', isIncluded && 'included', isExcluded && 'excluded')).toBe('base included');
  });

  it('should handle undefined values', () => {
    expect(cn('base', undefined, 'other')).toBe('base other');
  });

  it('should handle null values', () => {
    expect(cn('base', null, 'other')).toBe('base other');
  });

  it('should merge tailwind classes correctly', () => {
    expect(cn('px-2 py-1', 'px-4')).toBe('py-1 px-4');
  });

  it('should handle conflicting tailwind classes', () => {
    expect(cn('bg-red-500', 'bg-blue-500')).toBe('bg-blue-500');
  });

  it('should handle empty inputs', () => {
    expect(cn()).toBe('');
  });

  it('should handle array of classes', () => {
    expect(cn(['class1', 'class2'])).toBe('class1 class2');
  });

  it('should handle object syntax', () => {
    expect(cn({ active: true, disabled: false })).toBe('active');
  });

  it('should handle complex combinations', () => {
    const result = cn(
      'base-class',
      { active: true, hidden: false },
      ['array-class'],
      undefined,
      'final-class'
    );
    expect(result).toContain('base-class');
    expect(result).toContain('active');
    expect(result).toContain('array-class');
    expect(result).toContain('final-class');
    expect(result).not.toContain('hidden');
  });
});
