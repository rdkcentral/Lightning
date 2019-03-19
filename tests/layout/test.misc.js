import FlexTestUtils from "./src/FlexTestUtils.mjs";
import lng from "../../src/lightning.mjs";

const flexTestUtils = new FlexTestUtils();

// These tests must be performed separately from HTML because we want it to behave differently (more consistently) than HTML.
describe('layout', () => {
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

    flexTestUtils.addMochaTestForAnnotatedStructure('simple shrink', {
        r: [0, 0, 310, 110],
        w: 300, flex: {padding: 5},
        children: [
            {flexItem: {shrink: 1, minWidth: 50}, w: 100, h: 100, r: [5, 5, 50, 100]},
            {w: 100, h: 100, r: [55, 5, 100, 100]},
            {w: 100, h: 100, r: [155, 5, 100, 100]},
            {w: 100, h: 100, r: [255, 5, 100, 100]}
        ]
    });

    describe('get layout', () => {
        let app, stage;
        before(() => {
            class TestApplication extends lng.Application {}
            app = new TestApplication({stage: {w: 500, h: 500, clearColor: 0xFFFF0000, autostart: false}});
            stage = app.stage;
            document.body.appendChild(stage.getCanvas());
        });

        describe('getting final coords', () => {
            before(() => {
                const element = app.stage.createElement({
                    Item: {
                        w: 300, flex: {padding: 5},
                        children: [
                            {flexItem: {shrink: 1, minWidth: 50}, w: 100, h: 100},
                            {w: 100, h: 100},
                            {w: 100, h: 100},
                            {w: 100, h: 100}
                        ]
                    }
                });
                app.children = [element];
            });

            it('should not update coords yet', () => {
                const child = app.tag("Item").children[3];
                chai.assert(child.finalX === 0, "final X not updated until update");
            });

            it('should update after update', () => {
                stage.update();
                const child = app.tag("Item").children[3];
                chai.assert(child.finalX === 255, "final X updated");
                chai.assert(child.finalY === 5, "final Y updated");
                chai.assert(child.finalW === 100, "final W updated");
                chai.assert(child.finalH === 100, "final H updated");

                const item = app.tag("Item");
                chai.assert(item.finalH === 110, "final H updated");
            });
        });
    });

});

