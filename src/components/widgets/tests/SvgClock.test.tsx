import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SvgClock } from '../SvgClock';

describe('SvgClock Component', () => {
  it('renders correct hand coordinates for 3:00', () => {
    const { container } = render(<SvgClock hours={3} minutes={0} showDigital={true} />);

    const lines = container.querySelectorAll('line');
    expect(lines.length).toBe(2);

    const hourHand = lines[0]; // stroke="#312e81"
    const minuteHand = lines[1]; // stroke="#e11d48"

    // 3:00 -> Hour hand points right (12 o'clock + 90 deg -> x = 144, y = 100)
    expect(Number(hourHand.getAttribute('x1'))).toBe(100);
    expect(Number(hourHand.getAttribute('y1'))).toBe(100);
    expect(Number(hourHand.getAttribute('x2'))).toBeCloseTo(144, 0);
    expect(Number(hourHand.getAttribute('y2'))).toBeCloseTo(100, 0);

    // 3:00 -> Minute hand points straight up (0 deg -> x = 100, y = 34)
    expect(Number(minuteHand.getAttribute('x1'))).toBe(100);
    expect(Number(minuteHand.getAttribute('y1'))).toBe(100);
    expect(Number(minuteHand.getAttribute('x2'))).toBeCloseTo(100, 0);
    expect(Number(minuteHand.getAttribute('y2'))).toBeCloseTo(34, 0);

    // Check digital display
    expect(screen.getByText('3:00')).toBeDefined();
  });

  it('renders correct hand coordinates for 6:30', () => {
    const { container } = render(<SvgClock hours={6} minutes={30} showDigital={true} />);

    const lines = container.querySelectorAll('line');
    const minuteHand = lines[1];

    // 30 mins -> Minute hand points straight down (180 deg -> x = 100, y = 166)
    expect(Number(minuteHand.getAttribute('x2'))).toBeCloseTo(100, 0);
    expect(Number(minuteHand.getAttribute('y2'))).toBeCloseTo(166, 0);

    expect(screen.getByText('6:30')).toBeDefined();
  });

  it('renders numerals 1 through 12', () => {
    render(<SvgClock hours={12} minutes={0} showDigital={false} />);

    for (let i = 1; i <= 12; i++) {
      expect(screen.getByText(i.toString())).toBeDefined();
    }

    expect(screen.queryByText('12:00')).toBeNull();
  });
});
