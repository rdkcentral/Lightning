export default class App extends lng.Component {

    static g(c) {
        return c.seekAncestorByType(this);
    }

    /**
     * Returns all fonts to be preloaded before entering this app.
     * @returns {{family: string, url: string, descriptors: {}}[]}
     */
    static getFonts() {
        return [];
    }

}