import Target from "./Target.mjs";
import FlexHtmlComparer from "./flexToHtml/Comparer.mjs";
import FlexLayout from "../../../src/flex/layout/FlexLayout.mjs";

export default class FlexTestUtils {

    constructor() {
        this.flexHtmlComparer = new FlexHtmlComparer();

        this._createVisibleTestResultsContainer();
    }

    _createVisibleTestResultsContainer() {
        this._visibleTestResultsContainer = document.createElement('div');
        this._visibleTestResultsContainer.style.display = 'block';
        this._visibleTestResultsContainer.style.position = 'relative';
        document.body.appendChild(this._visibleTestResultsContainer);
    }

    layoutFlexAndValidate(structure, options = {}) {
        const root = this._convertToFlex(structure);
        return this.validateLayout(root, options);
    };

    validateLayout(item, options = {}) {
        return this.getLayoutMismatchesBetweenItemAndHtml(item).then(mismatches => {
            if (mismatches.length) {
                // Make failed test info available.
                return this._addVisibleTestResult(item).then(() => {
                    throw new Error("Layout mismatches at items:\n" + mismatches.join("\n"));
                });
            } else if (options.resultVisible) {
                return this._addVisibleTestResult(item);
            }
        });
    };

    _convertToFlex(structure) {
        const root = this.buildFlexFromStructure(structure);
        root.update();
        return root;
    }

    buildFlexFromStructure(structure) {
        const root = new Target();
        root.patch(structure);
        return root;
    }

    _addVisibleTestResult(item) {
        return this._getFlexTestInfoHtml(item).then(div => {
            this._visibleTestResultsContainer.appendChild(div);
        })
    }

    _getFlexTestInfoHtml(item) {
        const container = document.createElement('div');
        container.style.display = 'block';
        return this.flexHtmlComparer.transformItemToHtmlWithMismatchInfo(item).then(div => {
            container.appendChild(div);
            const structure = document.createElement('pre');
            structure.innerText = item.toString();
            container.appendChild(structure);
            return container;
        });
    }

    getLayoutMismatchesBetweenItemAndHtml(item) {
        return this.flexHtmlComparer.getLayoutMismatchesBetweenItemAndHtml(item);
    }


    addMochaTestForAnnotatedStructure(name, structure, showHtml) {
        describe(name, () => {
            it('layouts', done => {
                const root = this._convertToFlex(structure);
                const collector = new AnnotatedStructureMismatchCollector(root);
                const mismatches = collector.getMismatches();
                if (showHtml) {
                    this._addVisibleTestResult(root);
                }
                if (!mismatches.length) {
                    done();
                } else {
                    done(new Error("Mismatches:\n" + mismatches.join("\n") + "\n\n" + root.toString()))
                }
            });
        })
    }

    validateAnnotatedFlex(root, options) {
        return new Promise((resolve, reject) => {
            const collector = new AnnotatedStructureMismatchCollector(root);
            const mismatches = collector.getMismatches();
            if (options && options.showHtml) {
                this._addVisibleTestResult(root);
            }
            if (mismatches.length) {
                reject(new Error("Mismatches:\n" + mismatches.join("\n") + "\n\n" + root.toString()));
            } else {
                resolve();
            }
        })
    }

    checkUpdatedTargets(updatedTargets, expectedTargets) {
        const updatedSet = new Set(updatedTargets);
        const expectedSet = new Set(expectedTargets);
        const missing = [...expectedSet].filter(x => !updatedSet.has(x));
        chai.assert(!missing.length, "has missing updated targets: " + missing.map(target => target._target.getLocationString()));
        const unexpected = [...updatedSet].filter(x => !expectedSet.has(x));
        chai.assert(!unexpected.length, "has unexpected updated targets: " + unexpected.map(target => target._target.getLocationString()));

        const sameLength = expectedTargets.length === updatedTargets.length;
        chai.assert(sameLength, "the number of target updates mismatches: " + updatedTargets.length + " while we expected " + expectedTargets.length);
    }

    addUpdateTest(getRoot, name, setup, show = false) {
        describe(name, () => {
            it('layouts', () => {
                const root = getRoot();
                const tests = setup(root);

                let layoutSpy;
                if (tests && tests.layouts) {
                    layoutSpy = sinon.spy(FlexLayout.prototype, '_layoutMainAxis');
                }

                root.update();
                return this.validateLayout(root, {resultVisible: show}).then(() => {
                    if (tests && tests.layouts) {
                        const updatedTargets = layoutSpy.thisValues.map(flexLayout => flexLayout.item);
                        const expectedTargets = tests.layouts.map(target => target._layout);
                        this.checkUpdatedTargets(updatedTargets, expectedTargets);
                    }
                }).finally(() => {
                    if (tests && tests.layouts) {
                        FlexLayout.prototype._layoutMainAxis.restore();
                    }
                });
            });
        });
    }

    addAnnotatedUpdateTest(getRoot, name, setup, show = false) {
        describe(name, () => {
            it('layouts', () => {
                const root = getRoot();
                const tests = setup(root);

                let layoutSpy;
                if (tests && tests.layouts) {
                    layoutSpy = sinon.spy(FlexLayout.prototype, '_layoutMainAxis');
                }

                root.update();
                return this.validateAnnotatedFlex(root, {resultVisible: show}).then(() => {
                    if (tests && tests.layouts) {
                       const updatedTargets = layoutSpy.thisValues.map(flexLayout => flexLayout.item);
                       const expectedTargets = tests.layouts.map(target => target._layout);
                       this.checkUpdatedTargets(updatedTargets, expectedTargets);
                    }
                }).finally(() => {
                    if (tests && tests.layouts) {
                        FlexLayout.prototype._layoutMainAxis.restore();
                    }
                });
            });
        });
    }
}

class AnnotatedStructureMismatchCollector {

    constructor(item) {
        this._item = item;
        this._results = null;
    }

    getMismatches() {
        return this._collectMismatches();
    }

    _checkLayoutsEqual(layout, otherLayout) {
        const equal = this._compareFloats(layout.x, otherLayout.x) &&
            this._compareFloats(layout.y, otherLayout.y) &&
            this._compareFloats(layout.w, otherLayout.w) &&
            this._compareFloats(layout.h, otherLayout.h);
        return equal;
    }

    _compareFloats(f1, f2) {
        // Account for rounding errors.
        const delta = Math.abs(f1 - f2);
        return (delta < 0.1);
    }

    _collectMismatches() {
        this._results = [];
        this._collectRecursive(this._item, []);
        const results = this._results;
        this._results = null;
        return results.map(path => `[${path}]`);
    }

    _collectRecursive(item, location) {
        if (!this._checkLayoutsEqual(
            {x: item.x, y: item.y, w: item.w, h: item.h},
            item.r ? {x: item.r[0], y: item.r[1], w: item.r[2], h: item.r[3]} : {x: 0, y: 0, w: 0, h: 0})
        ) {
            this._results.push(location.join("."));
        }
        item.children.forEach((subItem, index) => {
            const subLocation = location.concat([index]);
            this._collectRecursive(subItem, subLocation);
        });
    }

}
