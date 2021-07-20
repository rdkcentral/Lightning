import FlexTestUtils from "./src/FlexTestUtils.mjs";
import FlexLayout from "../../src/flex/layout/FlexLayout.mjs";

const flexTestUtils = new FlexTestUtils();

describe('relative', function() {
    this.timeout(0);
    describe('absolute', () => {

        flexTestUtils.addMochaTestForAnnotatedStructure('func x, y, w, h', {
            flex: {},
            w: 200,
            h: 400,
            r: [0, 0, 200, 400],
            children: [
                {offsetX: (w=>0.1*w), offsetY: (h=>0.15*h), w: (w=>0.3*w), h: (h=>0.2*h+5), r: [20, 60, 60, 85]},
                {w: (w=>0.2*w), h: (h=>0.1*h), r: [60, 0, 40, 40]},
                {flexItem: false, offsetX: (w=>0.2*w), offsetY: (h=>0.2*h), w: (w=>0.2*w), h: (h=>0.2*h+5), r: [40, 80, 40, 85]},
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('flex relative to absolute parent', {
            w: 600, h: 800,
            r: [0, 0, 600, 800],
            children: [
                {
                    flex: {},
                    w: w=>w/3,
                    h: h=>h/2,
                    r: [0, 0, 200, 400],
                    children: [
                        {offsetX: (w=>0.1*w), offsetY: (h=>0.15*h), w: (w=>0.3*w), h: (h=>0.2*h+5), r: [20, 60, 60, 85]},
                        {w: (w=>0.2*w), h: (h=>0.1*h), r: [60, 0, 40, 40]},
                        {flexItem: false, offsetX: (w=>0.2*w), offsetY: (h=>0.2*h), w: (w=>0.2*w), h: (h=>0.2*h+5), r: [40, 80, 40, 85]},
                    ]
                }
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('fit-to-contents containing funcW, funcH (expect 0)', {
            w: 100,
            h: 100,
            flex: {},
            r: [0, 0, 100, 100],
            children: [
                {
                    flex: {}, flexItem: {grow: 1},
                    r: [0, 0, 100, 100],
                    children: [
                        {w: (w=>0.3*w), h: (h=>0.2*h), r: [0, 0, 0, 0]},
                        {w: (w=>0.2*w), h: (h=>0.1*h), r: [0, 0, 0, 0]}
                    ]
                }
            ]
        });

        /*
        Relative size problems:
        - when we use a relative function for one flex item on the cross axis
        - and then have our container 'grow' in the cross axis direction
        - we must not include the flex item's dynamic size in the cross axis layout calcs
        - we must update the flex item's axis size based on the new cross axis size
         */
        flexTestUtils.addMochaTestForAnnotatedStructure('dynamic main axis situation', {
            w: 100,
            h: 300,
            flex: {direction: 'column'},
            r: [0, 0, 100, 300],
            children: [
                {
                    flex: {}, w: 100, h: 200, flexItem: {grow: 1},
                    r: [0, 0, 100, 300],
                    children: [
                        {w: 50, h: 100, r: [0, 0, 50, 300], flexItem: {alignSelf: 'stretch'}},
                        {w: 50, h: (h => h * 2), r: [50, 0, 50, 600]}
                    ]
                }
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('dynamic main axis situation', {
            w: 100,
            h: 300,
            flex: {direction: 'column'},
            r: [0, 0, 100, 300],
            children: [
                {
                    flex: {direction: 'column'}, w: 100, h: 200, flexItem: {grow: 1},
                    r: [0, 0, 100, 300],
                    children: [
                        {w: 100, h: 100, r: [0, 0, 100, 100]},
                        {w: 100, h: (h => h * 1.5), r: [0, 100, 100, 450]}
                    ]
                }
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('dynamic main axis situation - with grow', {
            w: 100,
            h: 300,
            flex: {direction: 'column'},
            r: [0, 0, 100, 300],
            children: [
                {
                    flex: {direction: 'column'}, w: 100, h: 200, flexItem: {grow: 1},
                    r: [0, 0, 100, 300],
                    children: [
                        {w: 100, h: 100, r: [0, 0, 100, 100]},
                        {w: 100, h: (h => h * 0.1), r: [0, 100, 100, 200], flexItem: {grow: 1}}
                    ]
                }
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('dynamic main axis situation - with ignored grow', {
            w: 100,
            h: 300,
            flex: {direction: 'column'},
            r: [0, 0, 100, 300],
            children: [
                {
                    flex: {direction: 'column'}, w: 100, h: 200, flexItem: {grow: 1},
                    r: [0, 0, 100, 300],
                    children: [
                        {w: 100, h: 100, r: [0, 0, 100, 100]},
                        {w: 100, h: (h => h * 1.5), r: [0, 100, 100, 450], flexItem: {grow: 1}}
                    ]
                }
            ]
        });

        describe('recursive', () => {
            let root, level1, level2, leaf, abs, sibling, siblingSub, siblingLeaf, siblingAbs;
            before(() => {
                const structure = {
                    flex: {},
                    r: [0, 0, 800, 200],
                    w: 800,
                    h: 200,
                    children: [
                        {w: (w=>w*0.50), h: (h=>h*0.20), flex: {}, r: [0, 0, 400, 40],
                            children: [
                                {w: (w=>w*0.40), h: (h=>h*0.20), flex: {}, r: [0, 0, 160, 8],
                                    children: [
                                        {w: (w=>w*0.50), h: (h=>h*0.50), flex: {}, r: [0, 0, 80, 4]},
                                        {flexItem: false, w: (w=>w*0.50), h: (h=>h*0.50), x: 0, y: 0, r: [0, 0, 80, 4]}
                                    ]
                                }
                            ]
                        },
                        {w: (w=>w*0.20), h: (h=>h*0.20), flex: {padding: 10}, r: [400, 0, 180, 60],
                            children: [
                                {flex: {}, r: [10, 10, 10, 40],
                                    children: [
                                        {w: 10, h: 10, r: [0, 0, 10, 10]},
                                        {flexItem: false, w: (w=>w*0.50), h: (h=>h*0.50), x: 0, y: 0, r: [0, 0, 5, 20]}
                                    ]
                                }
                            ]
                        }
                    ]
                };
                root = flexTestUtils.buildFlexFromStructure(structure);

                level1 = root.children[0];
                level2 = level1.children[0];
                leaf = level2.children[0];
                abs = level2.children[1];
                sibling = root.children[1];
                siblingSub = sibling.children[0];
                siblingSub.siblingSub = true;
                siblingLeaf = siblingSub.children[0];
                siblingAbs = siblingSub.children[1];

                root.update();
            });

            const getRoot = () => root;
            const addUpdateTest = (name, setup, show = false) => {
                flexTestUtils.addAnnotatedUpdateTest(getRoot, name, setup, show);
            };


            describe('initial', () => {
                it ('layouts', () => {
                    return flexTestUtils.validateAnnotatedFlex(root);
                });
            });

            addUpdateTest('update leaf', () => {
                leaf.w = (w=>w*0.20);
                leaf.h = (h=>h*1);
                leaf.r = [0, 0, 32, 8];
                return {layouts: [leaf, level2]};
            });

            addUpdateTest('update level2', () => {
                level2.w = (w=>w*0.80);
                level2.h = (h=>h*0.40);
                level2.r = [0, 0, 320, 16];
                leaf.r = [0, 0, 64, 16];
                abs.r = [0, 0, 160, 8];
                return {layouts: [leaf, level2, level1]};
            });

            addUpdateTest('update level1', () => {
                level1.w = (w=>w*0.25);
                level1.h = (h=>h*0.10);
                level1.r = [0, 0, 200, 20];
                level2.r = [0, 0, 160, 8];
                leaf.r = [0, 0, 32, 8];
                abs.r = [0, 0, 80, 4];
                sibling.r[0] = 200;
                return {layouts: [leaf, sibling, level2, level1, root]};
            });

            addUpdateTest('update root w,h', () => {
                root.w = 1200;
                root.h = 400;
                root.r = [0, 0, 1200, 400];
                level1.r = [0, 0, 300, 40];
                level2.r = [0, 0, 240, 16];
                leaf.r = [0, 0, 48, 16];
                abs.r = [0, 0, 120, 8];
                sibling.r = [300, 0, 260, 100];
                siblingSub.r = [10, 10, 10, 80];
                siblingAbs.r = [0, 0, 5, 40];
                return {layouts: [leaf, level2, level1, root, sibling, siblingSub]};
            });

            addUpdateTest('convert siblingSub to funcW,funcH', () => {
                siblingSub.offsetX = (w=>w*0.1);
                siblingSub.offsetY = (h=>h*0.1);
                siblingSub.w = (w=>w*0.25);
                siblingSub.h = (h=>h*0.25);
                siblingSub.r = [36, 20, 65, 25];
                siblingAbs.r = [0, 0, 32.5, 12.5];
                return {layouts: [sibling, siblingSub]};
            });

            addUpdateTest('convert siblingSub to fixed w,h', () => {
                siblingSub.offsetX = 1;
                siblingSub.offsetY = 1;
                siblingSub.w = 500;
                siblingSub.h = 500;
                siblingSub.flexItem.shrink = 0;
                siblingSub.r = [11, 11, 500, 500];
                siblingAbs.r = [0, 0, 250, 250];
                return {layouts: [sibling, siblingSub]};
            });

            addUpdateTest('convert leaf to funcW', () => {
                siblingLeaf.w = (w=>w*0.10);
                siblingLeaf.h = (h=>h*0.20);
                siblingLeaf.r = [0, 0, 50, 100];
                return {layouts: [siblingSub]};
            });
        })

    });

});
