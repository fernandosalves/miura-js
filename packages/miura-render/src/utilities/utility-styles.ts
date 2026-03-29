const SPACE_SCALE: Record<number, string> = {
    0: '0',
    1: '0.25rem',
    2: '0.5rem',
    3: '0.75rem',
    4: '1rem',
    5: '1.25rem',
    6: '1.5rem',
    7: '1.75rem',
    8: '2rem',
};

const spacingClasses = Object.entries(SPACE_SCALE).flatMap(([key, fallback]) => ([
    `.miura-u-gap-${key}{gap:var(--miura-space-${key},${fallback});}`,
    `.miura-u-p-${key}{padding:var(--miura-space-${key},${fallback});}`,
    `.miura-u-px-${key}{padding-inline:var(--miura-space-${key},${fallback});}`,
    `.miura-u-py-${key}{padding-block:var(--miura-space-${key},${fallback});}`,
    `.miura-u-pt-${key}{padding-top:var(--miura-space-${key},${fallback});}`,
    `.miura-u-pr-${key}{padding-right:var(--miura-space-${key},${fallback});}`,
    `.miura-u-pb-${key}{padding-bottom:var(--miura-space-${key},${fallback});}`,
    `.miura-u-pl-${key}{padding-left:var(--miura-space-${key},${fallback});}`,
    `.miura-u-m-${key}{margin:var(--miura-space-${key},${fallback});}`,
    `.miura-u-mx-${key}{margin-inline:var(--miura-space-${key},${fallback});}`,
    `.miura-u-my-${key}{margin-block:var(--miura-space-${key},${fallback});}`,
    `.miura-u-mt-${key}{margin-top:var(--miura-space-${key},${fallback});}`,
    `.miura-u-mr-${key}{margin-right:var(--miura-space-${key},${fallback});}`,
    `.miura-u-mb-${key}{margin-bottom:var(--miura-space-${key},${fallback});}`,
    `.miura-u-ml-${key}{margin-left:var(--miura-space-${key},${fallback});}`,
]));

const gridClasses = Array.from({ length: 12 }, (_, index) => {
    const value = index + 1;
    return [
        `.miura-u-cols-${value}{grid-template-columns:repeat(${value},minmax(0,1fr));}`,
        `.miura-u-rows-${value}{grid-template-rows:repeat(${value},minmax(0,1fr));}`,
    ];
}).flat();

export const UTILITY_STYLE_ELEMENT_ID = 'miura-render-utility-styles';

export const UTILITY_STYLE_TEXT = `
:root{
    --miura-space-0:0;
    --miura-space-1:${SPACE_SCALE[1]};
    --miura-space-2:${SPACE_SCALE[2]};
    --miura-space-3:${SPACE_SCALE[3]};
    --miura-space-4:${SPACE_SCALE[4]};
    --miura-space-5:${SPACE_SCALE[5]};
    --miura-space-6:${SPACE_SCALE[6]};
    --miura-space-7:${SPACE_SCALE[7]};
    --miura-space-8:${SPACE_SCALE[8]};
}
.miura-u-flex{display:flex;}
.miura-u-inline-flex{display:inline-flex;}
.miura-u-grid{display:grid;}
.miura-u-inline-grid{display:inline-grid;}
.miura-u-block{display:block;}
.miura-u-inline-block{display:inline-block;}
.miura-u-hidden{display:none;}
.miura-u-flex-1{flex:1 1 0%;}
.miura-u-grow{flex-grow:1;}
.miura-u-grow-0{flex-grow:0;}
.miura-u-shrink{flex-shrink:1;}
.miura-u-shrink-0{flex-shrink:0;}
.miura-u-wrap{flex-wrap:wrap;}
.miura-u-nowrap{flex-wrap:nowrap;}
.miura-u-row{flex-direction:row;}
.miura-u-col{flex-direction:column;}
.miura-u-items-start{align-items:flex-start;}
.miura-u-items-center{align-items:center;}
.miura-u-items-end{align-items:flex-end;}
.miura-u-justify-start{justify-content:flex-start;}
.miura-u-justify-center{justify-content:center;}
.miura-u-justify-between{justify-content:space-between;}
.miura-u-justify-end{justify-content:flex-end;}
.miura-u-place-center{place-items:center;}
.miura-u-w-full{width:100%;}
.miura-u-h-full{height:100%;}
.miura-u-w-screen{width:100vw;}
.miura-u-h-screen{height:100vh;}
${spacingClasses.join('\n')}
${gridClasses.join('\n')}
`.trim();
