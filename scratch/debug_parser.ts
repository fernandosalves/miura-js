import { TemplateParser } from '../packages/miura-render/src/processor/parser';

const parser = new TemplateParser();
function html(strings: TemplateStringsArray, ...values: any[]) {
    return parser.parse(strings);
}

const v1 = 'v1';
const v2 = 'v2';
const result = html`<img src="${v1}" alt="${v2}">`;

console.log('HTML:', result.html);
console.log('Bindings:', result.bindings.length);
result.bindings.forEach((b, i) => {
    console.log(`  [${i}] index: ${b.index}, name: ${b.name}`);
});
