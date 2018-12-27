import FlexTestUtils from "./src/FlexTestUtils.mjs";
import FlexLayout from "../../src/flex/layout/FlexLayout.mjs";

const flexTestUtils = new FlexTestUtils();

describe('relative', function() {
    this.timeout(0);
    describe('absolute', () => {

        flexTestUtils.addMochaTestForAnnotatedStructure('simple relW, relH', {
            flex: {},
            w: 200,
            h: 400,
            r: [0, 0, 200, 400],
            children: [
                {w: (w=>0.3*w), h: (h=>0.2*h+5), r: [0, 0, 60, 85]},
                {w: (w=>0.2*w), h: (h=>0.1*h), r: [60, 0, 40, 40]}
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('fit-to-contents containing relW, relH (expect 0)', {
            flex: {},
            r: [0, 0, 0, 0],
            children: [
                {w: (w=>0.3*w), h: (h=>0.2*h), r: [0, 0, 0, 0]},
                {w: (w=>0.2*w), h: (h=>0.1*h), r: [0, 0, 0, 0]}
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
                        {w: (w=>w*0.20), h: (h=>h*0.20), flex: {}, r: [400, 0, 160, 40],
                            children: [
                                {flex: {}, r: [0, 0, 10, 40],
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

            const addUpdateTest = (name, setup, show = false) => {
                describe(name, () => {
                    it('layouts', () => {
                        const tests = setup(root);

                        const layoutSpy = sinon.spy(FlexLayout.prototype, '_layoutAxes');

                        root.update();
                        return flexTestUtils.validateAnnotatedFlex(root, {resultVisible: show}).then(() => {
                            if (tests && tests.layouts) {
                                const updatedTargets = layoutSpy.thisValues.map(flexLayout => flexLayout.item);
                                const expectedTargets = tests.layouts.map(target => target._layout);
                                chai.expect(updatedTargets).to.have.same.members(expectedTargets);
                            }
                        }).finally(() => {
                            FlexLayout.prototype._layoutAxes.restore();
                        });
                    });
                });
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
                return {layouts: [leaf, level2, level1, root]};
            });

            addUpdateTest('update root w,h', () => {
                root.w = 1200;
                root.h = 400;
                root.r = [0, 0, 1200, 400];
                level1.r = [0, 0, 300, 40];
                level2.r = [0, 0, 240, 16];
                leaf.r = [0, 0, 48, 16];
                abs.r = [0, 0, 120, 8];
                sibling.r = [300, 0, 240, 80];
                siblingSub.r = [0, 0, 10, 80];
                siblingAbs.r = [0, 0, 5, 40];
                return {layouts: [leaf, level2, level1, root, sibling, siblingSub]};
            });

            addUpdateTest('convert siblingSub to relW,relH', () => {
                siblingSub.w = (w=>w*0.25);
                siblingSub.h = (h=>h*0.25);
                siblingSub.r = [0, 0, 60, 20];
                siblingAbs.r = [0, 0, 30, 10];
                return {layouts: [sibling, siblingSub]};
            });

            addUpdateTest('convert siblingSub to fixed w,h', () => {
                siblingSub.w = 500;
                siblingSub.h = 500;
                siblingSub.flexItem.shrink = 0;
                siblingSub.r = [0, 0, 500, 500];
                siblingAbs.r = [0, 0, 250, 250];
                return {layouts: [sibling, siblingSub]};
            });

            addUpdateTest('convert leaf to relW', () => {
                siblingLeaf.w = (w=>w*0.10);
                siblingLeaf.h = (h=>h*0.20);
                siblingLeaf.r = [0, 0, 50, 100];
                return {layouts: [siblingSub]};
            });
        })

    });

});
