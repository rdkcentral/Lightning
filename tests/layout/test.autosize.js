import FlexTestUtils from "./src/FlexTestUtils.mjs";

const flexTestUtils = new FlexTestUtils();

// These tests must be performed separately from HTML because we want it to behave differently (more consistently) than HTML.
describe('layout', () => {
    describe('autosize', () => {
        flexTestUtils.addMochaTestForAnnotatedStructure('row: autosize w,h', {
            flex: {},
            r: [0, 0, 1050, 300],
            children: [
                {w: 100, h: 100, r: [0, 0, 100, 100]},
                {w: 200, h: 300, r: [100, 0, 200, 300]},
                {w: 100, h: 100, flexItem:{grow: 1}, r: [300, 0, 100, 100]},
                {w: 150, h: 150, flexItem:{grow: 2}, r: [400, 0, 150, 150]},
                {w: 30, h: 200, r: [550, 0, 30, 200]},
                {w: 70, h: 0, r: [580, 0, 70, 300]},
                {w: 200, h: 10, flexItem: {shrink: 3}, r: [650, 0, 200, 10]},
                {w: 200, h: 100, flexItem: {shrink: 1}, r: [850, 0, 200, 100]}
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('row: autosize w', {
            flex: {},
            h: 89,
            r: [0, 0, 1050, 89],
            children: [
                {w: 100, h: 100, r: [0, 0, 100, 100]},
                {w: 200, h: 300, r: [100, 0, 200, 300]},
                {w: 100, h: 100, flexItem:{grow: 1}, r: [300, 0, 100, 100]},
                {w: 150, h: 150, flexItem:{grow: 2}, r: [400, 0, 150, 150]},
                {w: 30, h: 200, r: [550, 0, 30, 200]},
                {w: 70, h: 0, r: [580, 0, 70, 89]},
                {w: 200, h: 10, flexItem: {shrink: 3}, r: [650, 0, 200, 10]},
                {w: 200, h: 100, flexItem: {shrink: 1}, r: [850, 0, 200, 100]}
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('row: wrapping w, autosize h', {
            flex: {wrap: true},
            w: 400,
            r: [0, 0, 400, 614],
            children: [
                {w: 100, h: 100, r: [0, 0, 100, 100]},
                {w: 200, h: 312, r: [100, 0, 200, 312]},
                {w: 100, h: 100, flexItem:{grow: 1}, r: [300, 0, 100, 100]},
                {w: 150, h: 150, flexItem:{grow: 2}, r: [0, 312, 300, 150]},
                {w: 30, h: 202, r: [300, 312, 30, 202]},
                {w: 70, h: 0, r: [330, 312, 70, 202]},
                {w: 200, h: 10, flexItem: {shrink: 3}, r: [0, 514, 200, 10]},
                {w: 200, h: 100, flexItem: {shrink: 1}, r: [200, 514, 200, 100]}
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('row: non-wrapping w, autosize h', {
            flex: {wrap: true},
            w: 4000,
            r: [0, 0, 4000, 312],
            children: [
                {w: 100, h: 100, r: [0, 0, 100, 100]},
                {w: 200, h: 312, r: [100, 0, 200, 312]},
                {w: 100, h: 100, flexItem:{grow: 1}, r: [300, 0, 1083.33, 100]},
                {w: 150, h: 150, flexItem:{grow: 2}, r: [1383.33, 0, 2116.67, 150]},
                {w: 30, h: 202, r: [3500, 0, 30, 202]},
                {w: 70, h: 0, r: [3530, 0, 70, 312]},
                {w: 200, h: 10, flexItem: {shrink: 3}, r: [3600, 0, 200, 10]},
                {w: 200, h: 100, flexItem: {shrink: 1}, r: [3800, 0, 200, 100]}
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('column: autosize w,h', {
            flex: {direction: 'column'},
            r: [0, 0, 200, 960],
            children: [
                {w: 100, h: 100, r: [0, 0, 100, 100]},
                {w: 200, h: 300, r: [0, 100, 200, 300]},
                {w: 100, h: 100, flexItem:{grow: 1}, r: [0, 400, 100, 100]},
                {w: 150, h: 150, flexItem:{grow: 2}, r: [0, 500, 150, 150]},
                {w: 30, h: 200, r: [0, 650, 30, 200]},
                {w: 70, h: 0, r: [0, 850, 70, 0]},
                {w: 200, h: 10, flexItem: {shrink: 3}, r: [0, 850, 200, 10]},
                {w: 200, h: 100, flexItem: {shrink: 1}, r: [0, 860, 200, 100]}
            ]
        });
    });
});
