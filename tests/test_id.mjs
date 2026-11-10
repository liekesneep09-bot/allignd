import test from 'node:test';
import assert from 'node:assert/strict';

import { createId } from '../src/utils/id.js';

test('createId works when crypto.randomUUID is unavailable', () => {
    const original = Object.getOwnPropertyDescriptor(globalThis.crypto, 'randomUUID');
    Object.defineProperty(globalThis.crypto, 'randomUUID', { value: undefined, configurable: true });

    try {
        const id = createId();
        assert.match(id, /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/);
        assert.notEqual(id, createId());
    } finally {
        if (original) Object.defineProperty(globalThis.crypto, 'randomUUID', original);
    }
});
