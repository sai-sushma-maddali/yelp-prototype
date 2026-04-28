import '@testing-library/jest-dom';
import { TextDecoder, TextEncoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

if (typeof Element !== 'undefined') {
  Element.prototype.scrollIntoView = jest.fn();
}
