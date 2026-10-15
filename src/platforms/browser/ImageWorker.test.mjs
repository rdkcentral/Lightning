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
import { describe, it, expect, vi } from 'vitest';
import ImageWorker from './ImageWorker.mjs';

describe('ImageWorker teardown', () => {
    it('cancels pending loads while alive', () => {
        const postMessage = vi.fn();
        const worker = Object.create(ImageWorker.prototype);
        Object.assign(worker, {
            _worker: { postMessage },
            _items: new Map([[1, {}]]),
        });
        worker.cancel({ id: 1 });
        expect(postMessage).toHaveBeenCalledWith({ type: 'cancel', id: 1 });
        expect(worker._items.has(1)).toBe(false);
    });

    it('tolerates cancellation after teardown', () => {
        const worker = Object.create(ImageWorker.prototype);
        Object.assign(worker, { _worker: undefined, _items: undefined });
        expect(() => worker.cancel({ id: 1 })).not.toThrow();
    });
});
