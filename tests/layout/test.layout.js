import FlexHtmlTester from "./src/FlexHtmlTester.mjs";
import Utils from "../../src/tree/Utils.mjs";
import FlexContainer from "../../src/flex/FlexContainer.mjs";

const createMainSizeAspect = function(name = 'mainSize', select) {
    return FlexHtmlTester.createAspect(name, function(structure) {
        const getSize = (size) => {
            const cloned = Utils.getDeepClone(structure);
            const subject = select ? select(cloned) : cloned;
            if (subject.flex.direction.indexOf("row") === 0) {
                subject.w = size;
            } else {
                subject.h = size;
            }
            return cloned;
        };
        const tests = {
            "0": getSize(0),
            "50": getSize(50),
            "350": getSize(350),
            "1000": getSize(1000),
            "10000": getSize(10000)
        };

        if (structure.flex.wrap) {
            // HTML can't handle autosizing of the root while having wrap enabled, so we test it separately.
            delete tests["0"];
        }

        const horizontalLayout = ["row", "row-reverse"].indexOf(structure.flex.direction) !== -1;
        if (horizontalLayout) {
            // HTML can't autofit the main axis of a horizontal flexbox layout, so we test it separately.
            delete tests["0"];
        }

        return tests;
    }, select);
};

const mainSizeAspect = createMainSizeAspect();

const createCrossSizeAspect = function(name = 'crossSize', select) {
    return FlexHtmlTester.createAspect(name, function(structure) {
        const getSize = (size) => {
            const cloned = Utils.getDeepClone(structure);
            const subject = select ? select(cloned) : cloned;
            if (subject.flex.direction.indexOf("row") === 0) {
                subject.h = size;
            } else {
                subject.w = size;
            }
            return cloned;
        };
        const tests = {
            "0": getSize(0),
            "150": getSize(150),
            "1000": getSize(1000)
        };

        const verticalLayout = ["column", "column-reverse"].indexOf(structure.flex.direction) !== -1;
        if (verticalLayout) {
            // HTML can't autofit the cross axis a vertical flexbox layout, so we test it separately.
            delete tests["0"];
        }

        return tests;
    }, select);
};

const crossSizeAspect = createCrossSizeAspect();

const alignSelfAspect = FlexHtmlTester.createAspect('alignSelf', function(structure) {
    const tests = {};
    FlexContainer.ALIGN_ITEMS.forEach(option => {
        const result = Utils.getDeepClone(structure);
        if (option === "stretch") {
            // HTML does not allow stretch overriding when main axis set.
            // That's why we can only test it with 0 axes, and test non-0 axes seperately.
            result.children[6].flexItem = {alignSelf: option};
        } else {
            result.children[4].flexItem = {alignSelf: option};
        }
        tests[option] = result;
    });
    return tests;
});

const addSimpleStructureTests = (name, structure) => {
    describe('structure:' + name, () => {
        FlexHtmlTester.addMochaTestsFromAspects("wrap", structure, [
                FlexHtmlTester.createAspectFromFlexProperty('direction', ["row", "row-reverse", "column", "column-reverse"]),
                FlexHtmlTester.createAspectFromFlexProperty('wrap', [true, false]),
                mainSizeAspect,
                crossSizeAspect
            ], []
        );

        FlexHtmlTester.addMochaTestsFromAspects("justifyContent", structure, [
                FlexHtmlTester.createAspectFromFlexProperty('direction', ["row", "row-reverse", "column", "column-reverse"]),
                FlexHtmlTester.createAspectFromFlexProperty('wrap', [true, false]),
                FlexHtmlTester.createAspectFromFlexProperty('justifyContent', FlexContainer.JUSTIFY_CONTENT),
                mainSizeAspect
            ], []
        );

        FlexHtmlTester.addMochaTestsFromAspects("alignContent", structure, [
                FlexHtmlTester.createAspectFromFlexProperty('direction', ["row", "column"]),
                FlexHtmlTester.createAspectFromFlexProperty('wrap', [true, false]),
                FlexHtmlTester.createAspectFromFlexProperty('alignItems', ["flex-end", "stretch", "center"]),
                FlexHtmlTester.createAspectFromFlexProperty('alignContent', FlexContainer.ALIGN_CONTENT),
                mainSizeAspect,
                crossSizeAspect
            ], []
        );

        FlexHtmlTester.addMochaTestsFromAspects("alignSelf", structure, [
            FlexHtmlTester.createAspectFromFlexProperty('direction', ["row", "column"]),
            FlexHtmlTester.createAspectFromFlexProperty('wrap', [true, false]),
            FlexHtmlTester.createAspectFromFlexProperty('alignItems', FlexContainer.ALIGN_ITEMS),
            alignSelfAspect,
            mainSizeAspect,
            crossSizeAspect
        ]);

    });
};

describe('layout', () => {

    addSimpleStructureTests("html flexbox comparison (single level, excluding autosize)", {
        flex: {},
        w: 100, h: 100,
        children: [
            {w: 100, h: 100},
            {w: 200, h: 300},
            {w: 100, h: 100, flexItem: {grow: 1}},
            {w: 150, h: 150, flexItem: {grow: 2}},
            {w: 30, h: 200},
            {w: 70, h: 0},
            {w: 0, h: 0},
            {w: 200, h: 10, flexItem: {shrink: 3}},
            {w: 200, h: 100, flexItem: {shrink: 1}}
        ]
    });

});