import { TemplateParser } from './parser';
import { BindingType } from './template-result';
import { describe, beforeEach, expect } from 'vitest';
import '../directives/lazy-setup';

// Helper function to create a TemplateStringsArray-like object
function createTemplateStrings(strings: string[]): TemplateStringsArray {
  const result = strings as unknown as TemplateStringsArray;
  result.raw = strings;
  return result;
}

function expectBinding(
  actual: Record<string, unknown>,
  expected: Record<string, unknown>,
) {
  expect(actual).toMatchObject(expected);
  if ('debugLabel' in actual && actual.debugLabel !== undefined) {
    expect(actual.debugLabel).toEqual(expect.any(String));
  }
}

describe('TemplateParser', () => {
  let parser: TemplateParser;

  beforeEach(() => {
    parser = new TemplateParser();
  });

  describe('Attribute Bindings', () => {
    it('should parse unquoted event bindings', () => {
      const result = parser.parse(createTemplateStrings(['<button @click=', '>Click</button>']));
      
      expect(result.bindings).toHaveLength(1);
      expectBinding(result.bindings[0], {
        type: BindingType.Event,
        name: 'click',
        index: 0,
        modifiers: undefined
      });
      
      expect(result.html).toBe('<button @click="binding:0">Click</button>');
    });

    it('should parse quoted event bindings', () => {
      const result = parser.parse(createTemplateStrings(['<button @click="', '">Click</button>']));
      
      expect(result.bindings).toHaveLength(1);
      expectBinding(result.bindings[0], {
        type: BindingType.Event,
        name: 'click',
        index: 0,
        modifiers: undefined
      });
      
      expect(result.html).toBe('<button @click="binding:0">Click</button>');
    });

    it('should parse unquoted property bindings', () => {
      const result = parser.parse(createTemplateStrings(['<input .value=', '>']));
      
      expect(result.bindings).toHaveLength(1);
      expectBinding(result.bindings[0], {
        type: BindingType.Property,
        name: '.value',
        index: 0,
        modifiers: undefined,
        strings: ['', ''],
        partIndex: 0,
        groupStart: 0,
      });
      
      expect(result.html).toBe('<input .value="binding:0">');
    });

    it('should parse quoted property bindings', () => {
      const result = parser.parse(createTemplateStrings(['<input .value="', '">']));
      
      expect(result.bindings).toHaveLength(1);
      expectBinding(result.bindings[0], {
        type: BindingType.Property,
        name: '.value',
        index: 0,
        modifiers: undefined,
        strings: ['', ''],
        partIndex: 0,
        groupStart: 0,
      });
      
      expect(result.html).toBe('<input .value="binding:0">');
    });

    it('should parse unquoted boolean bindings', () => {
      const result = parser.parse(createTemplateStrings(['<button ?disabled=', '>Submit</button>']));
      
      expect(result.bindings).toHaveLength(1);
      expectBinding(result.bindings[0], {
        type: BindingType.Boolean,
        name: '?disabled',
        index: 0,
        modifiers: undefined,
        strings: ['', ''],
        partIndex: 0,
        groupStart: 0,
      });
      
      expect(result.html).toBe('<button ?disabled="binding:0">Submit</button>');
    });

    it('should parse quoted boolean bindings', () => {
      const result = parser.parse(createTemplateStrings(['<button ?disabled="', '">Submit</button>']));
      
      expect(result.bindings).toHaveLength(1);
      expectBinding(result.bindings[0], {
        type: BindingType.Boolean,
        name: '?disabled',
        index: 0,
        modifiers: undefined,
        strings: ['', ''],
        partIndex: 0,
        groupStart: 0,
      });
      
      expect(result.html).toBe('<button ?disabled="binding:0">Submit</button>');
    });

    it('should parse event bindings with modifiers (unquoted)', () => {
      const result = parser.parse(createTemplateStrings(['<button @click|prevent=', '>Submit</button>']));
      
      expect(result.bindings).toHaveLength(1);
      expectBinding(result.bindings[0], {
        type: BindingType.Event,
        name: 'click',
        index: 0,
        modifiers: ['prevent']
      });
      
      expect(result.html).toBe('<button @click|prevent="binding:0">Submit</button>');
    });

    it('should parse event bindings with modifiers (quoted)', () => {
      const result = parser.parse(createTemplateStrings(['<button @click|prevent="', '">Submit</button>']));
      
      expect(result.bindings).toHaveLength(1);
      expectBinding(result.bindings[0], {
        type: BindingType.Event,
        name: 'click',
        index: 0,
        modifiers: ['prevent']
      });
      
      expect(result.html).toBe('<button @click|prevent="binding:0">Submit</button>');
    });

    it('should parse class bindings (unquoted)', () => {
      const result = parser.parse(createTemplateStrings(['<div class=', '>Content</div>']));
      
      expect(result.bindings).toHaveLength(1);
      expectBinding(result.bindings[0], {
        type: BindingType.Class,
        name: 'class',
        index: 0,
        modifiers: undefined,
        strings: ['', ''],
        partIndex: 0,
        groupStart: 0,
      });
      
      expect(result.html).toBe('<div class="binding:0">Content</div>');
    });

    it('should parse class bindings (quoted)', () => {
      const result = parser.parse(createTemplateStrings(['<div class="', '">Content</div>']));
      
      expect(result.bindings).toHaveLength(1);
      expectBinding(result.bindings[0], {
        type: BindingType.Class,
        name: 'class',
        index: 0,
        modifiers: undefined,
        strings: ['', ''],
        partIndex: 0,
        groupStart: 0,
      });
      
      expect(result.html).toBe('<div class="binding:0">Content</div>');
    });

    it('should parse unquoted utility bindings', () => {
      const result = parser.parse(createTemplateStrings(['<div %=', '></div>']));

      expectBinding(result.bindings[0], {
        type: BindingType.Utility,
        name: '%',
        index: 0,
        modifiers: undefined,
        strings: ['', ''],
        partIndex: 0,
        groupStart: 0,
      });

      expect(result.html).toBe('<div %="binding:0"></div>');
    });

    it('should parse named utility bindings', () => {
      const result = parser.parse(createTemplateStrings(['<div %grow="', '"></div>']));

      expectBinding(result.bindings[0], {
        type: BindingType.Utility,
        name: '%grow',
        index: 0,
        partIndex: 0,
        groupStart: 0,
        strings: ['', ''],
      });

      expect(result.html).toBe('<div %grow="binding:0"></div>');
    });
  });

  describe('Node Bindings', () => {
    it('should parse text node bindings', () => {
      const result = parser.parse(createTemplateStrings(['<div>Hello ', '</div>']));
      
      expect(result.bindings).toHaveLength(1);
      expectBinding(result.bindings[0], {
        type: BindingType.Node,
        index: 0
      });
      
      expect(result.html).toBe('<div>Hello <!--binding:0--><!--/binding:0--></div>');
    });

    it('should parse multiple bindings', () => {
      const result = parser.parse(createTemplateStrings([
        '<div>Hello ', 
        '! Count: ', 
        ' <button @click=', 
        '>Click</button></div>'
      ]));
      
      expect(result.bindings).toHaveLength(3);
      expectBinding(result.bindings[0], { type: BindingType.Node, index: 0 });
      expectBinding(result.bindings[1], { type: BindingType.Node, index: 1 });
      expectBinding(result.bindings[2], { 
        type: BindingType.Event, 
        name: 'click', 
        index: 2,
        modifiers: undefined
      });
    });

    it('ignores expressions inside html comments', () => {
      const result = parser.parse(createTemplateStrings([
        '<div><!-- <button @click=',
        '>Click</button> --></div>'
      ]));

      expect(result.bindings).toHaveLength(0);
      expect(result.html).toBe('<div><!-- <button @click=>Click</button> --></div>');
    });

    it('ignores quoted attribute expressions inside html comments', () => {
      const result = parser.parse(createTemplateStrings([
        '<!--\n  <mui-icon-button\n    label="',
        '"\n    ?disabled=',
        '\n  ></mui-icon-button>\n-->'
      ]));

      expect(result.bindings).toHaveLength(0);
      expect(result.html).toContain('<mui-icon-button');
      expect(result.html).toContain('label=""');
      expect(result.html).toContain('?disabled=');
      expect(result.html.trim().endsWith('-->')).toBe(true);
    });
  });

  describe('Mixed Syntax Support', () => {
    it('should handle mixed quoted and unquoted bindings in the same template', () => {
      const result = parser.parse(createTemplateStrings([
        '<div>',
        ' <button @click=', 
        '>Click</button>',
        ' <input .value="', 
        '">',
        ' <span ?hidden=', 
        '>Hidden</span>',
        '</div>'
      ]));
      
      expect(result.bindings).toHaveLength(7);
      expectBinding(result.bindings[0], {
        type: BindingType.Node,
        index: 0,
      });
      expectBinding(result.bindings[1], { 
        type: BindingType.Event, 
        name: 'click', 
        index: 1,
        modifiers: undefined
      });
      expectBinding(result.bindings[2], {
        type: BindingType.Node,
        index: 2,
      });
      expectBinding(result.bindings[3], { 
        type: BindingType.Property, 
        name: '.value', 
        index: 3,
        modifiers: undefined,
        strings: ['', ''],
        partIndex: 0,
        groupStart: 3,
      });
      expectBinding(result.bindings[4], {
        type: BindingType.Node,
        index: 4,
      });
      expectBinding(result.bindings[5], { 
        type: BindingType.Boolean, 
        name: '?hidden', 
        index: 5,
        modifiers: undefined,
        strings: ['', ''],
        partIndex: 0,
        groupStart: 5,
      });
      expectBinding(result.bindings[6], {
        type: BindingType.Node,
        index: 6,
      });
    });
  });

  describe('Event Modifier Parsing', () => {
    it('should parse repeated pipe modifiers', () => {
      const result = parser.parse(createTemplateStrings(['<button @mousedown|prevent|stop=', '>Drag</button>']));

      expectBinding(result.bindings[0], {
        type: BindingType.Event,
        name: 'mousedown',
        index: 0,
        modifiers: ['prevent', 'stop']
      });
    });

    it('should parse comma and pipe modifiers together', () => {
      const result = parser.parse(createTemplateStrings(['<input @keydown|key:Enter,prevent|stop=', '>']));

      expectBinding(result.bindings[0], {
        type: BindingType.Event,
        name: 'keydown',
        index: 0,
        modifiers: ['key:Enter', 'prevent', 'stop']
      });
    });
  });

  describe('Multipart Attributes', () => {
    it('captures strings metadata for multi-expression quoted attributes', () => {
      const result = parser.parse(createTemplateStrings([
        '<div class="btn ',
        ' size-',
        '"></div>',
      ]));

      expect(result.bindings).toHaveLength(2);
      expectBinding(result.bindings[0], {
        type: BindingType.Attribute,
        name: 'class',
        index: 0,
        groupStart: 0,
        partIndex: 0,
        strings: ['btn ', ' size-', ''],
      });
      expectBinding(result.bindings[1], {
        type: BindingType.Attribute,
        name: 'class',
        index: 1,
        groupStart: 0,
        partIndex: 1,
      });
      expect(result.html).toBe('<div class="binding:0"></div>');
    });
  });

  describe('Directive Parsing', () => {
    it('recognizes registered structural directives as directive bindings', () => {
      const result = parser.parse(createTemplateStrings(['<div #if=', '>Shown</div>']));

      expect(result.bindings).toHaveLength(1);
      expectBinding(result.bindings[0], {
        type: BindingType.Directive,
        name: '#if',
        index: 0,
        strings: ['', ''],
        partIndex: 0,
        groupStart: 0,
      });
      expect(result.html).toBe('<div #if="binding:0">Shown</div>');
    });
  });

  describe('Class And Style Unification', () => {
    it('treats :class as a normal class binding', () => {
      const result = parser.parse(createTemplateStrings(['<div :class=', '></div>']));

      expect(result.bindings).toHaveLength(1);
      expectBinding(result.bindings[0], {
        type: BindingType.Class,
        name: ':class',
        index: 0,
        strings: ['', ''],
        partIndex: 0,
        groupStart: 0,
      });
    });

    it('treats :style as a normal style binding', () => {
      const result = parser.parse(createTemplateStrings(['<div :style=', '></div>']));

      expect(result.bindings).toHaveLength(1);
      expectBinding(result.bindings[0], {
        type: BindingType.Style,
        name: ':style',
        index: 0,
        strings: ['', ''],
        partIndex: 0,
        groupStart: 0,
      });
    });
  });
});
