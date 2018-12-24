import FlexTestUtils from "./src/FlexTestUtils.mjs";

const flexTestUtils = new FlexTestUtils();

// These tests must be performed separately from HTML because we want it to behave differently (more consistently) than HTML.
describe('layout', () => {
    describe('sizing', () => {
        flexTestUtils.addMochaTestForAnnotatedStructure('minSize', {
            flex: {},
            r: [0, 0, 200, 300],
            w: 200,
            children: [
                {
                    flex: {}, w: 2000, r: [0, 0, 520, 300], flexItem: {minSize: 520},
                    children: [
                        {w: 200, h: 300, r: [0, 0, 200, 300]},
                        {w: 100, h: 100, r: [200, 0, 100, 100]},
                        {w: 150, h: 150, r: [300, 0, 150, 150]}
                    ]
                }
            ]
        });
    });

    describe('force stretch', () => {
        flexTestUtils.addMochaTestForAnnotatedStructure('alignSelf:stretch', {
            flex: {},
            r: [0, 0, 450, 300],
            children: [
                {
                    flex: {alignItems: 'flex-end'}, r: [0, 0, 450, 300],
                    children: [
                        {w: 200, h: 300, r: [0, 0, 200, 300]},
                        {w: 100, h: 100, r: [200, 0, 100, 300], flexItem: {alignSelf: 'stretch'}},
                        {w: 150, h: 150, r: [300, 150, 150, 150]}
                    ]
                }
            ]
        });
    });

    flexTestUtils.addMochaTestForAnnotatedStructure('borders', {
        flex: {direction: 'column'},
        r: [0, 0, 420, 420],
        children: [
            {w: 0, h: 10, r: [0, 0, 420, 10]},
            {
                flex: {direction: 'row'}, r: [0, 10, 420, 400], children: [
                    {w: 10, h: 0, r: [0, 0, 10, 400]},
                    {w: 400, h: 400, r: [10, 0, 400, 400]},
                    {w: 10, h: 0, r: [410, 0, 10, 400]}
                ]
            },
            {w: 0, h: 10, r: [0, 410, 420, 10]}
        ]
    });

    flexTestUtils.addMochaTestForAnnotatedStructure('flex offset', {
        flex: {direction: 'column'},
        offsetX: 100,
        offsetY: 120,
        r: [100, 120, 420, 420],
        children: [
            {w: 0, h: 10, r: [0, 0, 420, 10]},
            {
                flex: {direction: 'row'}, r: [0, 10, 420, 400], children: [
                    {w: 10, h: 0, r: [0, 0, 10, 400]},
                    {w: 400, h: 400, r: [10, 0, 400, 400]},
                    {w: 10, h: 0, r: [410, 0, 10, 400]}
                ]
            },
            {w: 0, h: 10, r: [0, 410, 420, 10]}
        ]
    });

    flexTestUtils.addMochaTestForAnnotatedStructure('flex item offset', {
        flex: {direction: 'column'},
        offsetX: 100,
        offsetY: 120,
        r: [100, 120, 420, 420],
        children: [
            {w: 0, h: 10, r: [0, 0, 420, 10]},
            {
                flex: {direction: 'row'}, r: [0, 10, 420, 400], children: [
                    {offsetX: 100, offsetY: 10, w: 10, h: 0, r: [100, 10, 10, 400]},
                    {w: 400, h: 400, r: [10, 0, 400, 400]},
                    {offsetX: 1, offsetY: -10, w: 10, h: 0, r: [411, -10, 10, 400]}
                ]
            },
            {w: 0, h: 10, r: [0, 410, 420, 10]}
        ]
    });
});
