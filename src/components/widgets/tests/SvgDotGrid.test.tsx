import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SvgDotGrid } from '../SvgDotGrid';

describe('SvgDotGrid Component', () => {
  it('renders exactly N circle counters in grid layout without spoiler text', () => {
    const count = 7;
    const { container } = render(<SvgDotGrid count={count} layout="grid" />);

    // Grid layout uses rounded-full divs
    const counterElements = container.querySelectorAll('.rounded-full');
    expect(counterElements.length).toBe(count);

    // Verify spoiler label is removed
    expect(screen.queryByText(`Dot Array (${count})`)).toBeNull();
  });

  it('renders exactly N circle counters in scattered layout without spoiler text', () => {
    const count = 5;
    const { container } = render(<SvgDotGrid count={count} layout="scattered" />);

    // Scattered layout renders SVG circles
    const circles = container.querySelectorAll('circle');
    expect(circles.length).toBe(count);

    // Verify spoiler label is removed
    expect(screen.queryByText(`Count the dots (${count})`)).toBeNull();
  });

  it('clamps count between 1 and 20', () => {
    const { container: c1 } = render(<SvgDotGrid count={0} layout="grid" />);
    expect(c1.querySelectorAll('.rounded-full').length).toBe(1);

    const { container: c2 } = render(<SvgDotGrid count={25} layout="grid" />);
    expect(c2.querySelectorAll('.rounded-full').length).toBe(20);
  });
});
