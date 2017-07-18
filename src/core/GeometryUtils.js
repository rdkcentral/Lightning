class GeometryUtils {

    static dotprod(ux, uy, vx, vy) {
        return ux * vx + uy * vy;
    };

    /**
     * Returns true if the specified point lies within the convex polygon.
     * @param {number[]} a
     * @param {number} x
     * @param {number} y
     * @return {boolean}
     */
    static pointInConvex(a, x, y) {
        let i, n, ax, ay;
        n = a.length;
        for (i = 0; i <= a.length - 2; i += 2) {
            ax = a[(i + 2) % n] - a[i];
            ay = a[(i + 3) % n] - a[i + 1];

            if (GeometryUtils.dotprod(x - a[i], y - a[i + 1], -ay, ax) <= 0) {
                return false;
            }
        }
        return true;
    };

    /**
     * Returns the (convex) intersection of 2 convex polygons.
     * @see Suther-Hodgman algorithm
     * @param {number[]} a
     * @param {number[]} b
     * @return {number[]}
     *   The intersection polygon. Empty if there is no intersection polygon.
     */
    static intersectConvex(a, b) {
        let i, j, n, m;

        n = a.length;

        // Intersection result. We'll slice off the invisible vertices.
        let c = b;
        let nc;

        let anyIntersections = false;

        // Traverse all edges of a.
        for (i = 0; i <= n - 2; i += 2) {
            // Get unit vector for edge of a.
            let ax = a[(i + 2) % n] - a[i];
            let ay = a[(i + 3) % n] - a[i + 1];
            let l = Math.sqrt(ax * ax + ay * ay);
            ax /= l;
            ay /= l;

            m = c.length;
            nc = [];

            let firstOffsetY, prevOffsetY, firstWasInside, prevWasInside, inside;
            for (j = 0; j <= m - 2; j += 2) {
                let dx = c[j] - a[i];
                let dy = c[j + 1] - a[i + 1];

                // Calculate offset of vertex perpendicular to a-edge.
                let offsetY = GeometryUtils.dotprod(dx, dy, -ay, ax);

                // Count as 'inside' if the point lies within the polygon or on one of the edges.
                // We need to include a small margin for rounding errors which may cause 'double' points when
                // traversing parallel edges.
                inside = (offsetY >= -1e-9);

                if (j >= 2) {
                    if (prevWasInside != inside) {
                        // Add additional intersection point.

                        // Calculate intersection offset.
                        let prevOffsetX = GeometryUtils.dotprod(c[j - 2] - a[i], c[j - 1] - a[i + 1], ax, ay);
                        let offsetX = GeometryUtils.dotprod(dx, dy, ax, ay);

                        let dxdy = (offsetX - prevOffsetX) / (offsetY - prevOffsetY);
                        let isect = (prevOffsetX - dxdy * prevOffsetY);

                        let isectX = a[i] + isect * ax;
                        let isectY = a[i + 1] + isect * ay;

                        nc.push(isectX, isectY);

                        anyIntersections = true;
                    }
                } else {
                    // Remember for last vertex.
                    firstWasInside = inside;
                    firstOffsetY = offsetY;
                }

                if (inside) {
                    // Add vertex.
                    nc.push(c[j], c[j + 1]);
                }

                if (j == m - 2) {
                    // Complete the polygon with the edge from last to first.
                    if (inside != firstWasInside) {
                        // Add additional intersection point.
                        let firstOffsetX = GeometryUtils.dotprod(c[0] - a[i], c[1] - a[i + 1], ax, ay);

                        let offsetX = GeometryUtils.dotprod(dx, dy, ax, ay);

                        let dxdy = (offsetX - firstOffsetX) / (offsetY - firstOffsetY);
                        let isect = (firstOffsetX - dxdy * firstOffsetY);

                        let isectX = a[i] + isect * ax;
                        let isectY = a[i + 1] + isect * ay;

                        nc.push(isectX, isectY);

                        anyIntersections = true;
                    }
                }

                prevWasInside = inside;
                prevOffsetY = offsetY;
            }

            c = nc;
        }

        if (c.length) {
            if (!anyIntersections) {
                // The output polygon matches b. Return it by reference so that we can check for clipping activity.
                return b;
            } else {
                return c;
            }
        } else {
            // This is a special case which occurs if there are no intersections of any of the edges.

            // Check which polygon lies inside the other.

            // Get bounding box of a.
            let minAx = a[0];
            let maxAx = a[0];
            let minAy = a[1];
            let maxAy = a[1];

            // Get average point of a.
            let avgAx = a[0], avgAy = a[1];
            for (i = 2; i <= n - 2; i += 2) {
                avgAx += a[i];
                avgAy += a[i + 1];

                if (a[i] < minAx) minAx = a[i];
                if (a[i] > maxAx) maxAx = a[i];
                if (a[i + 1] < minAy) minAy = a[i + 1];
                if (a[i + 1] > maxAy) maxAy = a[i + 1];
            }
            avgAx /= 0.5 * n;
            avgAy /= 0.5 * n;


            // Get bounding box of b.
            let minBx = b[0];
            let maxBx = b[0];
            let minBy = b[1];
            let maxBy = b[1];

            // Get average point of a.
            m = b.length;
            let avgBx = b[0], avgBy = b[1];
            for (i = 2; i <= m - 2; i += 2) {
                avgBx += b[i];
                avgBy += b[i + 1];

                if (b[i] < minBx) minBx = b[i];
                if (b[i] > maxBx) maxBx = b[i];
                if (b[i + 1] < minBy) minBy = b[i + 1];
                if (b[i + 1] > maxBy) maxBy = b[i + 1];
            }
            avgBx /= 0.5 * m;
            avgBy /= 0.5 * m;

            if (GeometryUtils.pointInConvex(b, avgAx, avgAy)) {
                if (GeometryUtils.pointInConvex(a, avgBx, avgBy)) {
                    // Average points both within other polygon: we must check the bbox.
                    if (minBx < minAx || minBy < minAy || maxBx > maxAx || maxBy > maxAy) {
                        // Polygon b encapsulates polygon a.
                        return a;
                    } else if (minBx > minAx || minBy > minAy || maxBx < maxAx || maxBy < maxAy) {
                        // Polygon a encapsulates polygon b.
                        return b;
                    } else {
                        // Identical bounds. We must test all corner points individually.
                        for (i = 0; i <= n - 2; i += 2) {
                            if (!GeometryUtils.pointInConvex(b, a[i], a[i + 1])) {
                                return b;
                            }
                        }
                        return a;
                    }
                } else {
                    return a;
                }
            } else {
                if (GeometryUtils.pointInConvex(a, avgBx, avgBy)) {
                    return b;
                } else {
                    // No intersection: empty result.
                    return [];
                }
            }
        }
    }
}
