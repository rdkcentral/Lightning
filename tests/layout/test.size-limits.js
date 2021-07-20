import FlexTestUtils from "./src/FlexTestUtils.mjs";

const flexTestUtils = new FlexTestUtils();

// These tests must be performed separately from HTML because we want it to behave differently (more consistently) than HTML.
describe('layout', () => {
    describe('sizing', () => {
        flexTestUtils.addMochaTestForAnnotatedStructure('overrule dimensions', {
            flex: {},
            r: [0, 0, 670, 300],
            children: [
                {w: 200, h: 300, flexItem: {minWidth: 300}, r: [0, 0, 300, 300]},
                {w: 300, h: 300, flexItem: {maxWidth: 170}, r: [300, 0, 170, 300]},
                {w: 100, h: 100, flexItem: {minHeight: 120}, r: [470, 0, 100, 120]},
                {w: 100, h: 300, flexItem: {maxHeight: 200}, r: [570, 0, 100, 200]},
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('shrink minWidth', {
            flex: {},
            r: [0, 0, 200, 300],
            w: 200,
            children: [
                {
                    flex: {}, w: 2000, r: [0, 0, 520, 300], flexItem: {minWidth: 520},
                    children: [
                        {w: 200, h: 300, r: [0, 0, 200, 300]},
                        {w: 100, h: 100, r: [200, 0, 100, 100]},
                        {w: 150, h: 150, r: [300, 0, 150, 150]}
                    ]
                }
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('shrink minHeight', {
            flex: {direction: 'column'},
            r: [0, 0, 200, 200],
            h: 200,
            children: [
                {w: 200, h: 300, r: [0, 0, 200, 300]},
                {w: 100, h: 100, r: [0, 300, 100, 70], flexItem: {shrink: 1, minHeight: 70}},
                {w: 150, h: 150, r: [0, 370, 150, 150]}
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('stretch maxHeight', {
            flex: {},
            r: [0, 0, 450, 300],
            children: [
                {w: 200, h: 300, r: [0, 0, 200, 300]},
                {w: 100, h: 100, r: [200, 0, 100, 200], flexItem: {alignSelf: 'stretch', maxHeight: 200}},
                {w: 150, h: 150, r: [300, 0, 150, 150]}
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('stretch maxWidth', {
            flex: {direction: 'column'},
            r: [0, 0, 200, 550],
            children: [
                {w: 200, h: 300, r: [0, 0, 200, 300]},
                {w: 100, h: 100, r: [0, 300, 120, 100], flexItem: {alignSelf: 'stretch', maxWidth: 120}},
                {w: 150, h: 150, r: [0, 400, 150, 150]}
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('grow maxWidth', {
            flex: {},
            r: [0, 0, 600, 300],
            w: 600,
            children: [
                {w: 200, h: 300, r: [0, 0, 200, 300]},
                {w: 100, h: 100, r: [200, 0, 160, 100], flexItem: {grow: 1, maxWidth: 160}},
                {w: 150, h: 150, r: [360, 0, 240, 150], flexItem: {grow: 1}}
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('grow maxHeight', {
            flex: {direction: 'column'},
            r: [0, 0, 200, 700],
            h: 700,
            children: [
                {w: 200, h: 300, r: [0, 0, 200, 300]},
                {w: 100, h: 100, r: [0, 300, 100, 150], flexItem: {grow: 1, maxHeight: 150}},
                {w: 150, h: 150, r: [0, 450, 150, 250], flexItem: {grow: 1}}
            ]
        });

        describe('updates', function() {
            this.timeout(0);

            let root;

            const getRoot = () => root;
            const addUpdateTest = (name, setup, show = false) => {
                flexTestUtils.addAnnotatedUpdateTest(getRoot, name, setup, show);
            };

            describe('changing minWidth in shrink situation', () => {
                before(() => {
                    const structure = {
                        r: [0, 0, 200, 200], flex: {}, w: 200, h: 200, children: [
                            {
                                r: [0, 0, 400, 200], w: 600, h: 200, flex: {}, children: [
                                    {
                                        r: [0, 0, 400, 200], flex: {}, w: 500, h: 200, children: [
                                            {
                                                r: [0, 0, 400, 200], flex: {}, w: 500, h: 200, children: [
                                                    {
                                                        r: [0, 0, 400, 200], flex: {}, w: 100, flexItem: {minWidth: 400}
                                                    }
                                                ]
                                            }
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
                        return flexTestUtils.validateAnnotatedFlex(root);
                    });
                });

                addUpdateTest('change minSize', () => {
                    root.children[0].children[0].children[0].children[0].flexItem.minWidth = 300;
                    root.children[0].children[0].children[0].children[0].r = [0, 0, 300, 200];
                    root.children[0].children[0].children[0].r = [0, 0, 300, 200];
                    root.children[0].children[0].r = [0, 0, 300, 200];
                    root.children[0].r = [0, 0, 300, 200];
                },true);

            });
        });

    });

});
