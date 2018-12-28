import FlexTestUtils from "./src/FlexTestUtils.mjs";

const flexTestUtils = new FlexTestUtils();

describe('layout', () => {

    describe('absolute', () => {

        // flexItem: false should cause the item to be ignored.
        flexTestUtils.addMochaTestForAnnotatedStructure('simple', {
            flex: {}, r: [0, 0, 770, 315], flexItem: {},
            children: [
                {w: 200, h: 300, flexItem: {marginLeft: 100, marginRight: 70, marginTop: 5, marginBottom: 10}, r: [100, 5, 200, 300]},
                {w: 100, h: 100, flexItem: {margin: 50}, r: [420, 50, 100, 100]},
                {w: 150, h: 150, flexItem: {marginRight: 50}, r: [570, 0, 150, 150]},
            ]
        });

    });

});
