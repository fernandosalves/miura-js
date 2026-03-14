import { TemplateParser } from './parser';
import { BindingType } from './template-result';
import { describe, beforeEach, expect } from 'vitest';

// Helper function to create a TemplateStringsArray-like object
function createTemplateStrings(strings: string[]): TemplateStringsArray {
  const result = strings as unknown as TemplateStringsArray;
  result.raw = strings;
  return result;
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
      expect(result.bindings[0]).toEqual({
        type: BindingType.Event,
        name: '@click',
        index: 0,
        modifiers: undefined
      });
      
      expect(result.html).toBe('<button @click="binding:0">Click</button>');
    });

    it('should parse quoted event bindings', () => {
      const result = parser.parse(createTemplateStrings(['<button @click="', '">Click</button>']));
      
      expect(result.bindings).toHaveLength(1);
      expect(result.bindings[0]).toEqual({
        type: BindingType.Event,
        name: '@click',
        index: 0,
        modifiers: undefined
      });
      
      expect(result.html).toBe('<button @click="binding:0">Click</button>');
    });

    it('should parse unquoted property bindings', () => {
      const result = parser.parse(createTemplateStrings(['<input .value=', '>']));
      
      expect(result.bindings).toHaveLength(1);
      expect(result.bindings[0]).toEqual({
        type: BindingType.Property,
        name: '.value',
        index: 0,
        modifiers: undefined
      });
      
      expect(result.html).toBe('<input .value="binding:0">');
    });

    it('should parse quoted property bindings', () => {
      const result = parser.parse(createTemplateStrings(['<input .value="', '">']));
      
      expect(result.bindings).toHaveLength(1);
      expect(result.bindings[0]).toEqual({
        type: BindingType.Property,
        name: '.value',
        index: 0,
        modifiers: undefined
      });
      
      expect(result.html).toBe('<input .value="binding:0">');
    });

    it('should parse unquoted boolean bindings', () => {
      const result = parser.parse(createTemplateStrings(['<button ?disabled=', '>Submit</button>']));
      
      expect(result.bindings).toHaveLength(1);
      expect(result.bindings[0]).toEqual({
        type: BindingType.Boolean,
        name: '?disabled',
        index: 0,
        modifiers: undefined
      });
      
      expect(result.html).toBe('<button ?disabled="binding:0">Submit</button>');
    });

    it('should parse quoted boolean bindings', () => {
      const result = parser.parse(createTemplateStrings(['<button ?disabled="', '">Submit</button>']));
      
      expect(result.bindings).toHaveLength(1);
      expect(result.bindings[0]).toEqual({
        type: BindingType.Boolean,
        name: '?disabled',
        index: 0,
        modifiers: undefined
      });
      
      expect(result.html).toBe('<button ?disabled="binding:0">Submit</button>');
    });

    it('should parse event bindings with modifiers (unquoted)', () => {
      const result = parser.parse(createTemplateStrings(['<button @click|prevent=', '>Submit</button>']));
      
      expect(result.bindings).toHaveLength(1);
      expect(result.bindings[0]).toEqual({
        type: BindingType.Event,
        name: '@click',
        index: 0,
        modifiers: ['prevent']
      });
      
      expect(result.html).toBe('<button @click|prevent="binding:0">Submit</button>');
    });

    it('should parse event bindings with modifiers (quoted)', () => {
      const result = parser.parse(createTemplateStrings(['<button @click|prevent="', '">Submit</button>']));
      
      expect(result.bindings).toHaveLength(1);
      expect(result.bindings[0]).toEqual({
        type: BindingType.Event,
        name: '@click',
        index: 0,
        modifiers: ['prevent']
      });
      
      expect(result.html).toBe('<button @click|prevent="binding:0">Submit</button>');
    });

    it('should parse class bindings (unquoted)', () => {
      const result = parser.parse(createTemplateStrings(['<div class=', '>Content</div>']));
      
      expect(result.bindings).toHaveLength(1);
      expect(result.bindings[0]).toEqual({
        type: BindingType.Class,
        name: 'class',
        index: 0,
        modifiers: undefined
      });
      
      expect(result.html).toBe('<div class="binding:0">Content</div>');
    });

    it('should parse class bindings (quoted)', () => {
      const result = parser.parse(createTemplateStrings(['<div class="', '">Content</div>']));
      
      expect(result.bindings).toHaveLength(1);
      expect(result.bindings[0]).toEqual({
        type: BindingType.Class,
        name: 'class',
        index: 0,
        modifiers: undefined
      });
      
      expect(result.html).toBe('<div class="binding:0">Content</div>');
    });
  });

  describe('Node Bindings', () => {
    it('should parse text node bindings', () => {
      const result = parser.parse(createTemplateStrings(['<div>Hello ', '</div>']));
      
      expect(result.bindings).toHaveLength(1);
      expect(result.bindings[0]).toEqual({
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
      
      expect(result.bindings).toHaveLength(4);
      expect(result.bindings[0]).toEqual({ type: BindingType.Node, index: 0 });
      expect(result.bindings[1]).toEqual({ type: BindingType.Node, index: 1 });
      expect(result.bindings[2]).toEqual({ 
        type: BindingType.Event, 
        name: '@click', 
        index: 2,
        modifiers: undefined
      });
      expect(result.bindings[3]).toEqual({ type: BindingType.Node, index: 3 });
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
      
      expect(result.bindings).toHaveLength(6);
      expect(result.bindings[1]).toEqual({ 
        type: BindingType.Event, 
        name: '@click', 
        index: 1,
        modifiers: undefined
      });
      expect(result.bindings[3]).toEqual({ 
        type: BindingType.Property, 
        name: '.value', 
        index: 3,
        modifiers: undefined
      });
      expect(result.bindings[5]).toEqual({ 
        type: BindingType.Boolean, 
        name: '?hidden', 
        index: 5,
        modifiers: undefined
      });
    });
  });
}); 