// The one place text from outside reaches the player: a shared workbench link, and the code it hands to a site.
import { describe, expect, it } from 'vitest';

import { cssString } from '@/css-string';
import { codeSnippet, embedSnippet, readParams } from '@preview/shell/params';

describe('workbench links', () => {
  it('keeps only https media links', () => {
    expect(readParams('source=custom&src=https://example.com/v.mp4').customSrc).toBe('https://example.com/v.mp4');
    expect(readParams('source=custom&src=javascript:alert(1)').customSrc).toBe('');
    expect(readParams('source=custom&src=http://example.com/v.mp4').customSrc).toBe('');
    expect(readParams('chapters=data:text/vtt,x').customChapters).toBe('');
  });

  it('never lets a word or number close the script it is written into', () => {
    const params = readParams('w-playing=</script>&w-paused=<script>x&number=</sc');
    for (const code of [embedSnippet(params), codeSnippet(params)]) {
      expect(code.match(/<\/?script/gi) ?? []).toEqual(code.startsWith('<div') ? ['<script', '</script'] : []);
      expect(code).toContain('\\u003c/script>');
    }
  });
});

describe('cssString', () => {
  it('escapes quotes, backslashes and line breaks, and drops control characters', () => {
    expect(cssString('On "air"\\\nnow\u0007')).toBe('"On \\"air\\"\\\\\\a now"');
  });
});
