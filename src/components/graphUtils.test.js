import { buildCrossSectionData, buildSurfaceData } from './graphUtils';

describe('graphUtils multi-variable helpers', () => {
  it('buildSurfaceData returns a 2D grid for a surface expression', () => {
    const result = buildSurfaceData('sin(x) * cos(y)', [-1, 1], [-1, 1], 5, {});

    expect(result.xValues).toHaveLength(5);
    expect(result.yValues).toHaveLength(5);
    expect(result.zValues).toHaveLength(5);
    expect(result.zValues[0]).toHaveLength(5);
    expect(result.zValues[2][2]).toBeCloseTo(0, 5);
  });

  it('buildCrossSectionData returns a one-dimensional slice for a fixed value', () => {
    const result = buildCrossSectionData('x^2 + y^2', { orientation: 'y', fixedValue: 1, range: [-2, 2], points: 5, scope: {} });

    expect(result.xValues).toHaveLength(5);
    expect(result.yValues).toHaveLength(5);
    expect(result.yValues[1]).toBeCloseTo(2, 5);
  });
});
