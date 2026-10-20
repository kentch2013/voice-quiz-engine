import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { SvgShape } from '../SvgShape';

describe('SvgShape Component', () => {
  it('renders circle shape', () => {
    const { container } = render(<SvgShape shape="circle" color="#ff0000" size={180} />);

    const circle = container.querySelector('circle');
    expect(circle).not.toBeNull();
    expect(circle?.getAttribute('fill')).toBe('#ff0000');
    expect(screen.getByText('circle')).toBeDefined();
  });

  it('renders square shape', () => {
    const { container } = render(<SvgShape shape="square" color="#00ff00" />);

    const rect = container.querySelector('rect');
    expect(rect).not.toBeNull();
    expect(rect?.getAttribute('fill')).toBe('#00ff00');
    expect(screen.getByText('square')).toBeDefined();
  });

  it('renders triangle shape with polygon points', () => {
    const { container } = render(<SvgShape shape="triangle" size={180} />);

    const polygon = container.querySelector('polygon');
    expect(polygon).not.toBeNull();

    const points = polygon?.getAttribute('points');
    expect(points).toBeDefined();

    expect(points?.split(' ').length).toBe(3);
    expect(screen.getByText('triangle')).toBeDefined();
  });

  it('renders rectangle shape', () => {
    const { container } = render(<SvgShape shape="rectangle" />);

    const rect = container.querySelector('rect');
    expect(rect).not.toBeNull();
    expect(screen.getByText('rectangle')).toBeDefined();
  });

  it('renders oval shape', () => {
    const { container } = render(<SvgShape shape="oval" />);

    const ellipse = container.querySelector('ellipse');
    expect(ellipse).not.toBeNull();
    expect(screen.getByText('oval')).toBeDefined();
  });

  it('renders diamond shape', () => {
    const { container } = render(<SvgShape shape="diamond" />);

    const polygon = container.querySelector('polygon');
    expect(polygon).not.toBeNull();
    expect(polygon?.getAttribute('points')?.split(' ').length).toBe(4);
    expect(screen.getByText('diamond')).toBeDefined();
  });

  it('renders star shape with 10 polygon points', () => {
    const { container } = render(<SvgShape shape="star" />);

    const polygon = container.querySelector('polygon');
    expect(polygon).not.toBeNull();
    expect(polygon?.getAttribute('points')?.split(' ').length).toBe(10);
    expect(screen.getByText('star')).toBeDefined();
  });

  it('renders heart shape with path', () => {
    const { container } = render(<SvgShape shape="heart" />);

    const path = container.querySelector('path');
    expect(path).not.toBeNull();
    expect(screen.getByText('heart')).toBeDefined();
  });

  it('renders pentagon shape with 5 polygon points', () => {
    const { container } = render(<SvgShape shape="pentagon" />);

    const polygon = container.querySelector('polygon');
    expect(polygon).not.toBeNull();
    expect(polygon?.getAttribute('points')?.split(' ').length).toBe(5);
    expect(screen.getByText('pentagon')).toBeDefined();
  });

  it('renders hexagon shape with 6 polygon points', () => {
    const { container } = render(<SvgShape shape="hexagon" size={180} />);

    const polygon = container.querySelector('polygon');
    expect(polygon).not.toBeNull();

    const points = polygon?.getAttribute('points');
    expect(points).toBeDefined();

    const pointList = points?.split(' ') ?? [];
    expect(pointList.length).toBe(6);
    expect(screen.getByText('hexagon')).toBeDefined();
  });

  it('renders octagon shape with 8 polygon points', () => {
    const { container } = render(<SvgShape shape="octagon" />);

    const polygon = container.querySelector('polygon');
    expect(polygon).not.toBeNull();
    expect(polygon?.getAttribute('points')?.split(' ').length).toBe(8);
    expect(screen.getByText('octagon')).toBeDefined();
  });

  it('renders sphere shape', () => {
    const { container } = render(<SvgShape shape="sphere" />);

    const circle = container.querySelector('circle');
    expect(circle).not.toBeNull();
    expect(screen.getByText('sphere')).toBeDefined();
  });

  it('renders cylinder shape with paths and ellipse', () => {
    const { container } = render(<SvgShape shape="cylinder" />);

    const paths = container.querySelectorAll('path');
    const ellipse = container.querySelector('ellipse');

    expect(paths.length).toBe(2);
    expect(paths[0].getAttribute('d')).toContain('M');
    expect(ellipse).not.toBeNull();
    expect(screen.getByText('cylinder')).toBeDefined();
  });

  it('renders cone shape', () => {
    const { container } = render(<SvgShape shape="cone" />);

    const paths = container.querySelectorAll('path');
    expect(paths.length).toBeGreaterThan(0);
    expect(screen.getByText('cone')).toBeDefined();
  });

  it('renders cube shape with 3 face polygons', () => {
    const { container } = render(<SvgShape shape="cube" />);

    const polygons = container.querySelectorAll('polygon');
    expect(polygons.length).toBe(3); // top, left, right faces

    polygons.forEach((poly) => {
      expect(poly.getAttribute('points')).not.toBeNull();
    });

    expect(screen.getByText('cube')).toBeDefined();
  });

  it('applies rotation transform when rotation prop is passed', () => {
    const { container } = render(<SvgShape shape="triangle" rotation={45} />);

    const svg = container.querySelector('svg');
    expect(svg?.style.transform).toBe('rotate(45deg)');
  });
});
