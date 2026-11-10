import test from 'node:test';
import assert from 'node:assert/strict';

import { normalizeMealCategory } from '../src/utils/mealCategory.js';

test('meal categories normalize Dutch and English values to one view category', () => {
    assert.equal(normalizeMealCategory('ontbijt'), 'breakfast');
    assert.equal(normalizeMealCategory('breakfast'), 'breakfast');
    assert.equal(normalizeMealCategory('diner'), 'dinner');
    assert.equal(normalizeMealCategory('dinner'), 'dinner');
    assert.equal(normalizeMealCategory('lunch'), 'lunch');
    assert.equal(normalizeMealCategory('snack'), 'snack');
    assert.equal(normalizeMealCategory(' Lunch '), 'lunch');
});

test('missing or unknown categories map to the safe Other bucket', () => {
    assert.equal(normalizeMealCategory(null), null);
    assert.equal(normalizeMealCategory(undefined), null);
    assert.equal(normalizeMealCategory(''), null);
    assert.equal(normalizeMealCategory('unknown'), null);
});
