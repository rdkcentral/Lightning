import FlexTestUtils from "./src/FlexTestUtils.mjs";
import Target from "./src/Target.mjs";
import FlexLayout from "../../src/flex/layout/FlexLayout.mjs";

const flexTestUtils = new FlexTestUtils();

describe('layout', () => {
    describe('update', function() {
        this.timeout(0);

        let root;

        const getRoot = () => root;
        const addUpdateTest = (name, setup, show = false) => {
            flexTestUtils.addUpdateTest(getRoot, name, setup, show);
        };

        describe('deferred/smart updates', () => {
            let subject, sibling;
            before(() => {
                const structure = {
                    w: 500, h: 500, flex: {direction: 'column', padding:5},
                    children: [
                        {
                            w: 0, h: 50, flex: {}, flexItem: {grow: 1}, sibling: true
                        },
                        {
                            w: 100, h: 100, flex: {direction: 'column'}, subject: true, flexItem: {grow: 2},
                            children: [
                                {w: 90, h: 100, flexItem: {grow: 1}, sub: true}
                            ]
                        }
                    ]
                };
                root = flexTestUtils.buildFlexFromStructure(structure);
                root.update();

                sibling = root.children[0];
                subject = root.children[1];
            });

            describe('initial', () => {
                it ('layouts', () => {
                    return flexTestUtils.validateLayout(root);
                });
            });

            addUpdateTest('no changes', () => {
                return {layouts: []}
            });

            addUpdateTest('update from within fixed-size container', () => {
                subject.children[0].w = 100;
                return {layouts: [subject]}
            });

            addUpdateTest('change dims of fixed-size container', () => {
                subject.h = 130;
                return {layouts: [root, sibling, sibling, subject]}
            });

            addUpdateTest('change from root', () => {
                root.w = 600;
                return {layouts: [root, sibling]}
            });

            addUpdateTest('change to dynamic width', () => {
                subject.w = 0;
                return {layouts: [root, subject, subject]}
            });

            addUpdateTest('change from root', () => {
                root.w = 700;
                return {layouts: [root, sibling, subject]}
            });

            addUpdateTest('change offset of root', () => {
                root.offsetX = 200;
                return {layouts: []}
            });

            addUpdateTest('change offset of subject', () => {
                subject.offsetX = 2;
                subject.offsetY = 2;
                return {layouts: []}
            });
        });

        describe('mutations', () => {
            before(() => {
                const structure = {
                    children: [
                        {
                            w: 550, h: 500, flex: {paddingTop: 5, paddingLeft: 7}, children: [
                                {
                                    flex: {padding: 100, alignItems: 'flex-start'}, w: 500, children: [
                                        {
                                            flex: {direction: 'column-reverse', paddingLeft: 50}, h: 400, w: 200, children: [
                                                {w: 100, h: 100},
                                                {w: 100, h: 100, flexItem: {}},
                                                {w: 100, h: 100, flexItem: {grow: 1}}
                                            ]
                                        },
                                        {
                                            flex: {padding: 10}, children: [
                                                {w: 100, h: 200, flexItem: {}}
                                            ]
                                        },
                                        {
                                            w: 300, h: 300, children: [
                                                {
                                                    flex: {padding: 10}, w: 100, children: [
                                                        {w: 100, h: 100}
                                                    ]
                                                }
                                            ]
                                        }
                                    ],
                                },
                                {
                                    w: 0, h: 400, flex: {},
                                    children: [
                                        {}
                                    ]
                                }
                            ]
                        }
                    ]
                };
                root = flexTestUtils.buildFlexFromStructure(structure);
                root.update();
            });

            describe('initial', () => {
                it ('layouts', () => {
                    return flexTestUtils.validateLayout(root);
                });
            });

            addUpdateTest('update tree root dimensions', () => {
                root.children[0].w = 1800;
            });

            addUpdateTest('disable shrinking', () => {
                root.children[0].children[0].children[0].flexItem.shrink = 0;
            });

            addUpdateTest('update sub grow', () => {
                root.children[0].children[0].flexItem.grow = 2;
            });

            addUpdateTest('update main width (shrink)', () => {
                root.children[0].w = 300;
            });

            addUpdateTest('update main y offset (1)', () => {
                root.children[0].offsetY = 50;
            });

            addUpdateTest('update main y offset (2)', () => {
                root.children[0].offsetY = 0;
            });

            addUpdateTest('update sub y offset (1)', () => {
                root.children[0].children[0].offsetY = 50;
            });

            addUpdateTest('update sub y offset (2)', () => {
                root.children[0].children[0].offsetY = 0;
            });

            addUpdateTest('update padding', () => {
                root.children[0].children[0].flex.padding = 10;
            });

            addUpdateTest('align items', () => {
                root.children[0].children[0].flex.alignItems = 'stretch';
            });

            addUpdateTest('align self', () => {
                root.children[0].children[0].children[1].flexItem.alignSelf = 'flex-start';
            });

            addUpdateTest('update deep tree', () => {
                root.children[0].children[0].children[2].children[0].w = 200;
            });

            addUpdateTest('disable flex item', () => {
                root.children[0].children[0].children[0].children[1].flexItem = false;
            });

            addUpdateTest('re-enable flex item', () => {
                root.children[0].children[0].children[0].children[1].flexItem = {};
            });

            addUpdateTest('disable flex container', () => {
                root.children[0].children[0].children[0].flex = false;
            });

            addUpdateTest('enable flex container', () => {
                root.children[0].children[0].children[0].flex = {};
            });

            addUpdateTest('add subtree', () => {
                const structure = {
                    flex: {}, w: 800, flexItem: {},
                    children: [
                        {w: 200, h: 300},
                        {w: 100, h: 100},
                        {w: 150, h: 150}
                    ]
                };

                const newSubtree = new Target();
                newSubtree.patch(structure);

                const target = root.children[0].children[0];
                target.addChildAt(target.children.length,newSubtree);
            });

            addUpdateTest('remove subtree', () => {
                const target = root.children[0].children[0];
                target.removeChildAt(target.children.length - 1);
            });

            addUpdateTest('visibility off', () => {
                const target = root.children[0].children[0].children[0];
                target.visible = false;
            });

            addUpdateTest('visibility on', () => {
                const target = root.children[0].children[0].children[0];
                target.visible = true;
            });
        });

    });
});
