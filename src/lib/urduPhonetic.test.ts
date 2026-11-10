import test from 'node:test';
import assert from 'node:assert/strict';
import {
  translateKeyToUrdu,
  isUrduChar,
  getEnglishKeyForUrdu,
  URDU_PHONETIC_MAP,
} from './urduPhonetic.ts';

test('isUrduChar correctly identifies Urdu characters vs Latin characters', () => {
  assert.equal(isUrduChar('ا'), true);
  assert.equal(isUrduChar('ب'), true);
  assert.equal(isUrduChar('پ'), true);
  assert.equal(isUrduChar('a'), false);
  assert.equal(isUrduChar('Z'), false);
  assert.equal(isUrduChar(' '), false);
});

test('translateKeyToUrdu maps standard keyboard keys to Urdu phonetic letters', () => {
  assert.equal(translateKeyToUrdu('a'), 'ا');
  assert.equal(translateKeyToUrdu('b'), 'ب');
  assert.equal(translateKeyToUrdu('p'), 'پ');
  assert.equal(translateKeyToUrdu('t'), 'ت');
  assert.equal(translateKeyToUrdu('T'), 'ٹ');
  assert.equal(translateKeyToUrdu('s'), 'س');
  assert.equal(translateKeyToUrdu('S'), 'ص');
  assert.equal(translateKeyToUrdu('k'), 'ک');
  assert.equal(translateKeyToUrdu('?'), '؟');
  assert.equal(translateKeyToUrdu(','), '،');
  assert.equal(translateKeyToUrdu(' '), ' ');
});

test('translateKeyToUrdu preserves existing native Urdu keyboard inputs', () => {
  assert.equal(translateKeyToUrdu('ا'), 'ا');
  assert.equal(translateKeyToUrdu('م'), 'م');
  assert.equal(translateKeyToUrdu('د'), 'د');
});

test('getEnglishKeyForUrdu finds the English key shortcut for hints', () => {
  assert.equal(getEnglishKeyForUrdu('ا'), 'a');
  assert.equal(getEnglishKeyForUrdu('ب'), 'b');
  assert.equal(getEnglishKeyForUrdu('ٹ'), 'T');
  assert.equal(getEnglishKeyForUrdu(' '), 'Space');
});
