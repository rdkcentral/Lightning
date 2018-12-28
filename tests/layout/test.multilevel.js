import FlexTestUtils from "./src/FlexTestUtils.mjs";

const flexTestUtils = new FlexTestUtils();

describe('layout', () => {
    describe('multilevel', () => {
        flexTestUtils.addMochaTestForAnnotatedStructure('row,row, nowrap', {
            flex: {},
            r: [0, 0, 1550, 300],
            children: [
                {w: 100, h: 100, r: [0, 0, 100, 100]},
                {
                    flex: {}, r: [100, 0, 500, 300],
                    children: [
                        {w: 200, h: 123, r: [0, 0, 200, 123]},
                        {w: 100, h: 0, flexItem: {grow: 1}, r: [200, 0, 100, 300]},
                        {w: 200, h: 100, flexItem: {shrink: 1}, r: [300, 0, 200, 100]}
                    ]
                },
                {w: 200, h: 300, r: [600, 0, 200, 300]},
                {w: 100, h: 100, flexItem: {grow: 1}, r: [800, 0, 100, 100]},
                {w: 150, h: 150, flexItem: {grow: 2}, r: [900, 0, 150, 150]},
                {w: 30, h: 200, r: [1050, 0, 30, 200]},
                {w: 70, h: 0, r: [1080, 0, 70, 300]},
                {w: 200, h: 10, flexItem: {shrink: 3}, r: [1150, 0, 200, 10]},
                {w: 200, h: 100, flexItem: {shrink: 1}, r: [1350, 0, 200, 100]}
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('row,row, wrap', {
            flex: {},
            w: 0,
            r: [0, 0, 1350, 300],
            children: [
                {w: 100, h: 100, r: [0, 0, 100, 100]},
                {
                    flex: {wrap: true}, r: [100, 0, 300, 300], w: 300,
                    children: [
                        {w: 200, h: 123, r: [0, 0, 200, 123]},
                        {w: 100, h: 0, flexItem: {grow: 1}, r: [200, 0, 100, 123]},
                        {w: 200, h: 100, flexItem: {shrink: 1}, r: [0, 123, 200, 100]}
                    ]
                },
                {w: 200, h: 300, r: [400, 0, 200, 300]},
                {w: 100, h: 100, flexItem: {grow: 1}, r: [600, 0, 100, 100]},
                {w: 150, h: 150, flexItem: {grow: 2}, r: [700, 0, 150, 150]},
                {w: 30, h: 200, r: [850, 0, 30, 200]},
                {w: 70, h: 0, r: [880, 0, 70, 300]},
                {w: 200, h: 10, flexItem: {shrink: 3}, r: [950, 0, 200, 10]},
                {w: 200, h: 100, flexItem: {shrink: 1}, r: [1150, 0, 200, 100]}
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('row,column, nowrap', {
            flex: {},
            w: 0,
            r: [0, 0, 1250, 423],
            children: [
                {w: 100, h: 100, r: [0, 0, 100, 100]},
                {
                    flex: {wrap: false, direction: "column"}, r: [100, 0, 200, 423],
                    children: [
                        {w: 200, h: 123, r: [0, 0, 200, 123]},
                        {w: 100, h: 0, flexItem: {grow: 1}, r: [0, 123, 100, 0]},
                        {w: 200, h: 300, flexItem: {shrink: 1}, r: [0, 123, 200, 300]}
                    ]
                },
                {w: 200, h: 300, r: [300, 0, 200, 300]},
                {w: 100, h: 100, flexItem: {grow: 1}, r: [500, 0, 100, 100]},
                {w: 150, h: 150, flexItem: {grow: 2}, r: [600, 0, 150, 150]},
                {w: 30, h: 200, r: [750, 0, 30, 200]},
                {w: 70, h: 0, r: [780, 0, 70, 423]},
                {w: 200, h: 10, flexItem: {shrink: 3}, r: [850, 0, 200, 10]},
                {w: 200, h: 100, flexItem: {shrink: 1}, r: [1050, 0, 200, 100]}
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('row,column, wrap', {
            flex: {},
            w: 0,
            r: [0, 0, 1450, 300],
            children: [
                {w: 100, h: 100, r: [0, 0, 100, 100]},
                {
                    flex: {wrap: true, direction: "column"}, r: [100, 0, 400, 250], h: 250,
                    children: [
                        {w: 200, h: 123, r: [0, 0, 200, 123]},
                        {w: 100, h: 0, flexItem: {grow: 1}, r: [0, 123, 100, 127]},
                        {w: 200, h: 300, flexItem: {shrink: 1}, r: [200, 0, 200, 250]}
                    ]
                },
                {w: 200, h: 300, r: [500, 0, 200, 300]},
                {w: 100, h: 100, flexItem: {grow: 1}, r: [700, 0, 100, 100]},
                {w: 150, h: 150, flexItem: {grow: 2}, r: [800, 0, 150, 150]},
                {w: 30, h: 200, r: [950, 0, 30, 200]},
                {w: 70, h: 0, r: [980, 0, 70, 300]},
                {w: 200, h: 10, flexItem: {shrink: 3}, r: [1050, 0, 200, 10]},
                {w: 200, h: 100, flexItem: {shrink: 1}, r: [1250, 0, 200, 100]}
            ]
        });


        flexTestUtils.addMochaTestForAnnotatedStructure('column,column, nowrap', {
            flex: {direction: "column"},
            r: [0, 0, 200, 1660],
            children: [
                {w: 100, h: 100, r: [0, 0, 100, 100]},
                {
                    flex: {wrap: false, direction: "column"}, r: [0, 100, 200, 400],
                    children: [
                        {w: 200, h: 100, r: [0, 0, 200, 100]},
                        {w: 100, h: 0, flexItem: {grow: 1}, r: [0, 100, 100, 0]},
                        {w: 200, h: 300, flexItem: {shrink: 1}, r: [0, 100, 200, 300]}
                    ]
                },
                {w: 200, h: 300, r: [0, 500, 200, 300]},
                {w: 100, h: 100, flexItem: {grow: 1}, r: [0, 800, 100, 100]},
                {w: 150, h: 150, flexItem: {grow: 2}, r: [0, 900, 150, 150]},
                {w: 30, h: 200, r: [0, 1050, 30, 200]},
                {w: 0, h: 300, r: [0, 1250, 200, 300]},
                {w: 200, h: 10, flexItem: {shrink: 3}, r: [0, 1550, 200, 10]},
                {w: 200, h: 100, flexItem: {shrink: 1}, r: [0, 1560, 200, 100]}
            ]
        });


        flexTestUtils.addMochaTestForAnnotatedStructure('column,column, wrap', {
            flex: {direction: "column"},
            r: [0, 0, 600, 1460],
            children: [
                {w: 100, h: 100, r: [0, 0, 100, 100]},
                {
                    flex: {wrap: true, direction: "column"}, r: [0, 100, 600, 200], h: 200,
                    children: [
                        {w: 200, h: 100, r: [0, 0, 200, 100]},
                        {w: 100, h: 0, flexItem: {grow: 1}, r: [0, 100, 100, 100]},
                        {w: 200, h: 300, flexItem: {shrink: 0}, r: [200, 0, 200, 300]},
                        {w: 200, h: 300, flexItem: {shrink: 1}, r: [400, 0, 200, 200]}
                    ]
                },
                {w: 200, h: 300, r: [0, 300, 200, 300]},
                {w: 100, h: 100, flexItem: {grow: 1}, r: [0, 600, 100, 100]},
                {w: 150, h: 150, flexItem: {grow: 2}, r: [0, 700, 150, 150]},
                {w: 30, h: 200, r: [0, 850, 30, 200]},
                {w: 0, h: 300, r: [0, 1050, 600, 300]},
                {w: 200, h: 10, flexItem: {shrink: 3}, r: [0, 1350, 200, 10]},
                {w: 200, h: 100, flexItem: {shrink: 1}, r: [0, 1360, 200, 100]}
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('column,row, nowrap', {
            flex: {direction: "column"},
            r: [0, 0, 500, 1560],
            children: [
                {w: 100, h: 100, r: [0, 0, 100, 100]},
                {
                    flex: {wrap: false, direction: "row"}, r: [0, 100, 500, 300],
                    children: [
                        {w: 200, h: 100, r: [0, 0, 200, 100]},
                        {w: 100, h: 0, flexItem: {grow: 1}, r: [200, 0, 100, 300]},
                        {w: 200, h: 300, flexItem: {shrink: 1}, r: [300, 0, 200, 300]}
                    ]
                },
                {w: 200, h: 300, r: [0, 400, 200, 300]},
                {w: 100, h: 100, flexItem: {grow: 1}, r: [0, 700, 100, 100]},
                {w: 150, h: 150, flexItem: {grow: 2}, r: [0, 800, 150, 150]},
                {w: 30, h: 200, r: [0, 950, 30, 200]},
                {w: 0, h: 300, r: [0, 1150, 500, 300]},
                {w: 200, h: 10, flexItem: {shrink: 3}, r: [0, 1450, 200, 10]},
                {w: 200, h: 100, flexItem: {shrink: 1}, r: [0, 1460, 200, 100]}
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('column,row, wrap', {
            flex: {direction: "column"},
            r: [0, 0, 350, 1660],
            children: [
                {w: 100, h: 100, r: [0, 0, 100, 100]},
                {
                    flex: {wrap: true, direction: "row"}, r: [0, 100, 350, 400], w: 350,
                    children: [
                        {w: 200, h: 100, r: [0, 0, 200, 100]},
                        {w: 100, h: 0, flexItem: {grow: 1}, r: [200, 0, 150, 100]},
                        {w: 200, h: 300, flexItem: {shrink: 1}, r: [0, 100, 200, 300]}
                    ]
                },
                {w: 200, h: 300, r: [0, 500, 200, 300]},
                {w: 100, h: 100, flexItem: {grow: 1}, r: [0, 800, 100, 100]},
                {w: 150, h: 150, flexItem: {grow: 2}, r: [0, 900, 150, 150]},
                {w: 30, h: 200, r: [0, 1050, 30, 200]},
                {w: 0, h: 300, r: [0, 1250, 350, 300]},
                {w: 200, h: 10, flexItem: {shrink: 3}, r: [0, 1550, 200, 10]},
                {w: 200, h: 100, flexItem: {shrink: 1}, r: [0, 1560, 200, 100]}
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('grow from grandparent', {
            flex: {},
            w: 2000,
            r: [0, 0, 2000, 300],
            children: [
                {
                    flex: {}, flexItem: {grow: 1}, r: [0, 0, 2000, 300],
                    children: [
                        {
                            flex: {wrap: true}, flexItem: {grow: 1}, w: 200, r: [0, 0, 1900, 300],
                            children: [
                                {w: 100, h: 100, r: [0, 0, 100, 100]},
                                {w: 100, h: 100, r: [100, 0, 100, 100]},
                                {w: 100, h: 100, r: [200, 0, 100, 100]},
                                {w: 100, h: 100, r: [300, 0, 100, 100]},
                                {w: 100, h: 100, r: [400, 0, 100, 100]},
                                {w: 100, h: 100, r: [500, 0, 100, 100]},
                                {w: 100, h: 100, r: [600, 0, 100, 100]},
                                {w: 100, h: 100, r: [700, 0, 100, 100]},
                                {w: 100, h: 100, r: [800, 0, 100, 100]},
                                {w: 100, h: 100, r: [900, 0, 100, 100]}
                            ]
                        },
                        {
                            flex: {}, r: [1900, 0, 100, 300],
                            children: [
                                {w: 100, h: 300, r: [0, 0, 100, 300]}
                            ]
                        }
                    ]
                }
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('shrink from grandparent, not possible', {
            flex: {},
            w: 200,
            r: [0, 0, 200, 300],
            children: [
                {
                    flex: {}, r: [0, 0, 750, 300],
                    children: [
                        {
                            flex: {wrap: true}, w: 650, r: [0, 0, 650, 300],
                            children: [
                                {w: 100, h: 100, r: [0, 0, 100, 100]},
                                {w: 100, h: 100, r: [100, 0, 100, 100]},
                                {w: 100, h: 100, r: [200, 0, 100, 100]},
                                {w: 100, h: 100, r: [300, 0, 100, 100]},
                                {w: 100, h: 100, r: [400, 0, 100, 100]},
                                {w: 100, h: 100, r: [500, 0, 100, 100]},
                                {w: 100, h: 100, r: [0, 100, 100, 100]},
                                {w: 100, h: 100, r: [100, 100, 100, 100]},
                                {w: 100, h: 100, r: [200, 100, 100, 100]},
                                {w: 100, h: 100, r: [300, 100, 100, 100]}
                            ]
                        },
                        {
                            flex: {}, r: [650, 0, 100, 300],
                            children: [
                                {w: 100, h: 300, r: [0, 0, 100, 300]}
                            ]
                        }
                    ]
                }
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('shrink from grandparent, possible', {
            flex: {},
            w: 200,
            r: [0, 0, 200, 300],
            children: [
                {
                    flex: {}, r: [0, 0, 400, 300],
                    children: [
                        {
                            flex: {wrap: false}, w: 650, r: [0, 0, 300, 300],
                            children: [
                                {w: 100, h: 100, r: [0, 0, 100, 100]},
                                {w: 100, h: 100, r: [100, 0, 100, 100]},
                                {w: 100, h: 100, r: [200, 0, 100, 100]}
                            ]
                        },
                        {
                            flex: {}, r: [300, 0, 100, 300],
                            children: [
                                {w: 100, h: 300, r: [0, 0, 100, 300]}
                            ]
                        }
                    ]
                }
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('row,row,column', {
            flex: {},
            r: [0, 0, 200, 400],
            children: [
                {
                    flex: {}, r: [0, 0, 200, 400],
                    children: [
                        {
                            flex: {direction: 'column'}, r: [0, 0, 100, 400], h: 400,
                            children: [
                                {w: 100, h: 100, r: [0, 0, 100, 100]},
                                {w: 100, h: 100, r: [0, 100, 100, 100]},
                                {w: 100, h: 100, r: [0, 200, 100, 200], flexItem: {grow: 1}}
                            ]
                        },
                        {
                            flex: {}, r: [100, 0, 100, 400],
                            children: [
                                {w: 100, h: 200, r: [0, 0, 100, 200]}
                            ]
                        }
                    ]
                }
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('row,column,row', {
            flex: {},
            r: [0, 0, 300, 450],
            children: [
                {
                    flex: {direction: 'column', alignItems: "flex-end"}, r: [0, 0, 300, 450],
                    children: [
                        {
                            flex: {}, r: [0, 0, 300, 250], h: 250,
                            children: [
                                {w: 100, h: 100, r: [0, 0, 100, 100]},
                                {w: 100, h: 100, r: [100, 0, 100, 100]},
                                {w: 100, h: 100, r: [200, 0, 100, 100]}
                            ]
                        },
                        {
                            flex: {}, r: [200, 250, 100, 200],
                            children: [
                                {w: 100, h: 200, r: [0, 0, 100, 200]}
                            ]
                        }
                    ]
                }
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('row,column,row, flex item disabled.', {
            flex: {padding: 10},
            w: 500,
            h: 400,
            r: [0, 0, 520, 420],
            children: [
                {w: 200, h: 200, r: [10, 10, 200, 200]},
                {
                    flex: {direction: 'column'}, flexItem: false, w:(w=>w*0.5), h:(h=>h*0.5), r: [0, 0, 260, 210],
                    children: [
                        {w: 100, h: 100, r: [0, 0, 100, 100]},
                        {w: 100, h: 100, flexItem: {grow: 1}, r: [0, 100, 100, 110]}
                    ]
                }
            ]
        });

        flexTestUtils.addMochaTestForAnnotatedStructure('multi-level shrink', {
            w: 300,
            flex: {padding: 10},
            r: [0, 0, 320, 150],
            children: [
                {
                    r: [10, 10, 300, 130],
                    w: 400, flex: {padding: 10},
                    children: [
                        {
                            r: [10, 10, 280, 110],
                            w: 500, flex: {padding: 5, justifyContent: 'center'},
                            children: [
                                {w: 100, h: 100, r: [40, 5, 100, 100]},
                                {w: 100, h: 100, r: [140, 5, 100, 100]}
                            ]
                        }
                    ]
                }
            ]
        });
    });
});
