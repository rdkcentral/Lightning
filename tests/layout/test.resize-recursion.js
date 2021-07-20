import FlexTestUtils from "./src/FlexTestUtils.mjs";

const flexTestUtils = new FlexTestUtils();

describe('layout', () => {

    describe('resize recursion', () => {
        flexTestUtils.addMochaTestForAnnotatedStructure('simple', {
            flex: {alignItems: 'stretch', justifyContent: 'flex-start'}, r: [0, 0, 450, 200], flexItem: {},
            children: [
                {w: 100, h: 200, r: [0, 0, 100, 200]},
                {flex: {direction: 'column', wrap: true}, flexItem: {alignSelf: 'stretch'}, h: 90, r: [100, 0, 50, 200],
                    children: [
                        {w: 50, h: 50, r: [0, 0, 50, 50]},
                        {w: 50, h: 50, r: [0, 50, 50, 50]},
                        {w: 50, h: 50, r: [0, 100, 50, 50]},
                        {w: 50, h: 50, r: [0, 150, 50, 50]},
                    ]
                },
                {w: 100, h: 150, flexItem: {marginRight: 50}, r: [150, 0, 100, 150]},
            ]
        });

        // Recursive resize grow is not supported to prevent infinite loops/slow layout.
        // The horizontal resize of the column (becomes smaller) should not cause the first flex item to grow again.
        flexTestUtils.addMochaTestForAnnotatedStructure('grow', {
            flex: {alignItems: 'stretch', justifyContent: 'flex-start'}, w: 500, r: [0, 0, 500, 200], flexItem: {},
            children: [
                {w: 100, h: 200, r: [0, 0, 150, 200], flexItem: {grow: 1}},
                {flex: {direction: 'column', wrap: true}, flexItem: {alignSelf: 'stretch'}, h: 90, r: [150, 0, 50, 200],
                    children: [
                        {w: 50, h: 50, r: [0, 0, 50, 50]},
                        {w: 50, h: 50, r: [0, 50, 50, 50]},
                        {w: 50, h: 50, r: [0, 100, 50, 50]},
                        {w: 50, h: 50, r: [0, 150, 50, 50]},
                    ]
                },
                {w: 100, h: 150, flexItem: {marginRight: 50}, r: [200, 0, 100, 150]},
            ]
        });

    });

});
