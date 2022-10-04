import { expect, test } from '@jest/globals';
import { countEmptySpace, dateStringToDateUID, isDailyNote, nextNewLine } from '../utils';

test('empty space util', () => {
  expect(countEmptySpace('a   b c', 1)).toBe(3);
  expect(countEmptySpace('a   b c', 5)).toBe(1);
});

test('next newline util', () => {
  expect(nextNewLine('\nfoo bar foobar', 2)).toBe('\nfoo bar foobar'.length);
  expect(nextNewLine('foo \n\n bar', 2)).toBe(4);
});

test('date to UID date util', () => {
  expect(dateStringToDateUID('foobar', 'YYYY-MM-DD')).toBe('')
  expect(dateStringToDateUID('2022-10-04', 'YYYY-MM-DD')).toBe('10-04-2022')
});

test('is daily note test', () => {
  expect(isDailyNote('2022-10-04', 'YYYY-MM-DD')).toBe(true)
});