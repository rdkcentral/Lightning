import FlexTestUtils from "./src/FlexTestUtils.mjs";

const flexTestUtils = new FlexTestUtils();

describe('layout', () => {
    describe('margins', () => {

        flexTestUtils.addMochaTestForAnnotatedStructure('main axis margins, no wrap', {
            flex: {}, r: [0, 0, 770, 315], flexItem: {},
            children: [
                {
                    w: 200,
                    h: 300,
                    flexItem: {marginLeft: 100, marginRight: 70, marginTop: 5, marginBottom: 10},
                    r: [100, 5, 200, 300],
                    q: true
                },
                {w: 100, h: 100, flexItem: {margin: 50}, r: [420, 50, 100, 100]},
                {w: 150, h: 150, flexItem: {marginRight: 50}, r: [570, 0, 150, 150]}
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('wrap', {
            flex: {wrap: true}, w: 300, r: [0, 0, 300, 570], flexItem: {},
            children: [
                {w: 200, h: 300, r: [50, 50, 200, 300], flexItem: {margin: 50}},
                {w: 100, h: 100, r: [20, 420, 100, 100], flexItem: {margin: 20}},
                {w: 80, h: 150, r: [150, 410, 80, 150], flexItem: {margin: 10}}
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('no wrap, shrink', {
            flex: {},
            w: 200,
            r: [0, 0, 200, 320],
            children: [
                {
                    flex: {wrap: false}, w: 1000, r: [0, 0, 510, 320], flexItem: {},
                    children: [
                        {w: 200, h: 300, flexItem: {margin: 10}, r: [10, 10, 200, 300]},
                        {w: 100, h: 100, flexItem: {margin: 10}, r: [230, 10, 100, 100]},
                        {w: 150, h: 150, flexItem: {margin: 10}, r: [350, 10, 150, 150]}
                    ]
                }
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('reverse', {
            w: 483,
            flex: {direction: 'row-reverse', wrap: false}, r: [0, 0, 483, 300], flexItem: {},
            children: [
                {w: 200, h: 300, flexItem: {marginLeft: 4, marginRight: 7}, r: [276, 0, 200, 300]},
                {w: 100, h: 100, flexItem: {marginLeft: 3, marginRight: 8}, r: [164, 0, 100, 100]},
                {w: 150, h: 150, flexItem: {marginLeft: 2, marginRight: 9}, r: [2, 0, 150, 150]}
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
                        {w: 100, h: 0, flexItem: {marginTop: 10, marginBottom: 15}, r: [100, 110, 100, 175], q: true},
                        {w: 100, h: 100, r: [200, 100, 100, 100]}
                    ]
                },
                {w: 150, h: 100, r: [400, 0, 150, 100]},
                {w: 300, h: 80, r: [10, 410, 300, 80], flexItem: {margin: 10}}
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('advanced', {
            r: [0, 0, 517, 605],
            flex: {paddingTop: 5, paddingLeft: 7},
            children: [
                {
                    flex: {padding: 100, alignItems: 'flex-end'}, r: [7, 5, 510, 600],
                    children: [
                        {
                            flex: {direction: 'column-reverse', paddingLeft: 50}, r: [100, 100, 170, 400], h: 400,
                            children: [
                                {w: 100, h: 100, r: [50, 300, 100, 100]},
                                {w: 100, h: 100, r: [60, 190, 100, 100], flexItem: {margin: 10}},
                                {w: 100, h: 100, r: [50, 0, 100, 180], flexItem: {grow: 1}}
                            ]
                        },
                        {
                            flex: {padding: 10}, r: [270, 260, 140, 240],
                            children: [
                                {w: 100, h: 200, r: [20, 20, 100, 200], flexItem: {margin: 10}}
                            ]
                        }
                    ]
                }
            ]
        });

    });
});