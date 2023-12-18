/*
 * If not stated otherwise in this file or this component's LICENSE file the
 * following copyright and licenses apply:
 *
 * Copyright 2020 Metrological
 *
 * Licensed under the Apache License, Version 2.0 (the License);
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Utils from "../tree/Utils.mjs";

export default class ObjMerger {

    static isMf(f) {
        return Utils.isFunction(f) && f.__mf;
    }

    static mf(f) {
        // Set as merge function.
        f.__mf = true;
        return f;
    }

    static merge(a, b) {
        const aks = Object.keys(a);
        const bks = Object.keys(b);

        if (!bks.length) {
            return a;
        }

        // Create index array for all elements.
        const ai = {};
        const bi = {};
        for (let i = 0, n = bks.length; i < n; i++) {
            const key = bks[i];
            ai[key] = -1;
            bi[key] = i;
        }
        for (let i = 0, n = aks.length; i < n; i++) {
            const key = aks[i];
            ai[key] = i;
            if (bi[key] === undefined) {
                bi[key] = -1;
            }
        }

        const aksl = aks.length;

        const result = {};
        for (let i = 0, n = bks.length; i < n; i++) {
            const key = bks[i];

            // Prepend all items in a that are not in b - before the now added b attribute.
            const aIndex = ai[key];
            let curIndex = aIndex;
            while(--curIndex >= 0) {
                const akey = aks[curIndex];
                if (bi[akey] !== -1) {
                    // Already found? Stop processing.
                    // Not yet found but exists in b? Also stop processing: wait until we find it in b.
                    break;
                }
            }
            while(++curIndex < aIndex) {
                const akey = aks[curIndex];
                result[akey] = a[akey];
            }

            const bv = b[key];
            const av = a[key];
            let r;
            if (this.isMf(bv)) {
                r = bv(av);
            } else {
                if (!Utils.isObjectLiteral(av) || !Utils.isObjectLiteral(bv)) {
                    r = bv;
                } else {
                    r = ObjMerger.merge(av, bv);
                }
            }

            // When marked as undefined, property is deleted.
            if (r !== undefined) {
                result[key] = r;
            }
        }

        // Append remaining final items in a.
        let curIndex = aksl;
        while(--curIndex >= 0) {
            const akey = aks[curIndex];
            if (bi[akey] !== -1) {
                break;
            }
        }
        while(++curIndex < aksl) {
            const akey = aks[curIndex];
            result[akey] = a[akey];
        }

        return result;
    }

}
