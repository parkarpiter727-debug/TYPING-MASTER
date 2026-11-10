import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateWPM, calculateAccuracy, getStarRating, formatTime, getInitials } from './typingUtils.ts';

test('calculateWPM computes words per minute based on 5 chars per word', () => {
  // 50 chars in 60s = 10 words / 1 min = 10 WPM
  assert.equal(calculateWPM(50, 60), 10);
  // 250 chars in 60s = 50 WPM
  assert.equal(calculateWPM(250, 60), 50);
  // 100 chars in 30s = 20 words in 0.5 min = 40 WPM
  assert.equal(calculateWPM(100, 30), 40);
  // 0 seconds elapsed or 0 chars returns 0
  assert.equal(calculateWPM(0, 60), 0);
  assert.equal(calculateWPM(50, 0), 0);
});

test('calculateAccuracy computes percentage correctly', () => {
  // 90 correct out of 100 typed = 90%
  assert.equal(calculateAccuracy(90, 100), 90);
  // 0 typed returns 100%
  assert.equal(calculateAccuracy(0, 0), 100);
  // 45 correct out of 50 = 90%
  assert.equal(calculateAccuracy(45, 50), 90);
});

test('getStarRating assigns stars based on wpm and accuracy', () => {
  assert.equal(getStarRating(30, 96, 25), 3);
  assert.equal(getStarRating(20, 90, 25), 2);
  assert.equal(getStarRating(10, 80, 25), 1);
});

test('formatTime formats seconds to mm:ss', () => {
  assert.equal(formatTime(0), '0:00');
  assert.equal(formatTime(9), '0:09');
  assert.equal(formatTime(65), '1:05');
  assert.equal(formatTime(300), '5:00');
});

test('getInitials extracts two capital letters', () => {
  assert.equal(getInitials('John Doe'), 'JD');
  assert.equal(getInitials('Alice'), 'AL');
  assert.equal(getInitials('Muhammad Hamza Ali'), 'MA');
});
