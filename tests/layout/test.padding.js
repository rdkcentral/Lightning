import FlexTestUtils from "./src/FlexTestUtils.mjs";

const flexTestUtils = new FlexTestUtils();

describe('layout', () => {
    describe('padding', () => {

        flexTestUtils.addMochaTestForAnnotatedStructure('no wrap', {
            flex: {paddingLeft: 100, paddingTop: 120, paddingRight: 50, paddingBottom: 20},
            w: 1000,
            r: [0, 0, 1150, 440],
            flexItem: {},
            children: [
                {w: 200, h: 300, r: [100, 120, 200, 300]},
                {w: 100, h: 100, r: [300, 120, 100, 100]},
                {w: 150, h: 150, r: [400, 120, 150, 150]}
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('wrap', {
            flex: {padding: 100, wrap: true}, w: 250, r: [0, 0, 450, 650], flexItem: {},
            children: [
                {w: 200, h: 300, r: [100, 100, 200, 300]},
                {w: 100, h: 100, r: [100, 400, 100, 100]},
                {w: 150, h: 150, r: [200, 400, 150, 150]}
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('no wrap, shrink', {
            flex: {},
            w: 200,
            r: [0, 0, 200, 500],
            children: [
                {
                    flex: {padding: 100, wrap: false}, w: 1000, r: [0, 0, 650, 500], flexItem: {},
                    children: [
                        {w: 200, h: 300, r: [100, 100, 200, 300]},
                        {w: 100, h: 100, r: [300, 100, 100, 100]},
                        {w: 150, h: 150, r: [400, 100, 150, 150]}
                    ]
                }
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('wrap, grow', {
            flex: {},
            r: [0, 0, 600, 650],
            w: 600,
            children: [
                {
                    flex: {padding: 100, wrap: true}, w: 250, r: [0, 0, 600, 650], flexItem: {grow: 1},
                    children: [
                        {w: 200, h: 300, r: [100, 100, 200, 300]},
                        {w: 100, h: 100, r: [300, 100, 100, 100]},
                        {w: 150, h: 150, r: [100, 400, 150, 150]}
                    ]
                }
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('reverse', {
            flex: {direction: 'row-reverse', paddingLeft: 100, paddingRight: 50, paddingTop: 100, wrap: false},
            r: [0, 0, 600, 400],
            flexItem: {},
            children: [
                {w: 200, h: 300, r: [350, 100, 200, 300]},
                {w: 100, h: 100, r: [250, 100, 100, 100]},
                {w: 150, h: 150, r: [100, 100, 150, 150]}
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('stretch', {
            flex: {alignItems: 'stretch', alignContent: 'stretch', wrap: true},
            w: 600,
            h: 600,
            r: [0, 0, 600, 600],
            children: [
                {
                    flex: {padding: 100, wrap: false}, r: [0, 0, 400, 400],
                    children: [
                        {w: 100, h: 0, r: [100, 100, 100, 200]},
                        {w: 100, h: 100, r: [200, 100, 100, 100]}
                    ]
                },
                {w: 150, h: 100, r: [400, 0, 150, 100]},
                {w: 300, h: 100, r: [0, 400, 300, 100]},
            ]
        });


        flexTestUtils.addMochaTestForAnnotatedStructure('advanced', {
            flex: {paddingTop: 5, paddingLeft: 7},
            r: [0, 0, 477, 605],
            children: [
                {
                    flex: {padding: 100, alignItems: 'flex-end'}, r: [7, 5, 470, 600],
                    children: [
                        {
                            flex: {direction: 'column-reverse', paddingLeft: 50}, r: [100, 100, 150, 400], h: 400,
                            children: [
                                {w: 100, h: 100, r: [50, 300, 100, 100]},
                                {w: 100, h: 100, r: [50, 200, 100, 100]},
                                {w: 100, h: 100, r: [50, 0, 100, 200], flexItem: {grow: 1}}
                            ]
                        },
                        {
                            flex: {padding: 10}, r: [250, 280, 120, 220],
                            children: [
                                {w: 100, h: 200, r: [10, 10, 100, 200]}
                            ]
                        }
                    ]
                }
            ]
        });

    });
});