import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MiuraElement, html, repeat } from '../index.js';

const readProjectedText = (card: MiuraElement) => {
  const titleSlot = card.shadowRoot?.querySelector('slot[name="title"]') as HTMLSlotElement | null;
  const bodySlot = card.shadowRoot?.querySelector('section slot') as HTMLSlotElement | null;
  const title = titleSlot?.assignedElements({ flatten: true })[0]?.textContent?.trim();
  const body = bodySlot?.assignedElements({ flatten: true })[0]?.textContent?.trim();
  return [title, body].filter(Boolean).join(' ');
};

describe('MiuraElement slot + repeat regressions', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
  });

  afterEach(() => {
    document.body.innerHTML = '';
  });

  it('keeps projected slot content aligned with keyed repeated child elements during reorder and shrink', async () => {
    const cardTag = 'miura-slot-card-regression';
    const boardTag = 'miura-slot-board-regression';

    class SlotCardElement extends MiuraElement {
      protected override template() {
        return html`
          <article class="card-shell">
            <header><slot name="title"></slot></header>
            <section><slot></slot></section>
          </article>
        `;
      }
    }

    class SlotBoardElement extends MiuraElement {
      static override properties = {
        items: { type: Array, default: [] }
      };

      declare items: Array<{ id: string; title: string; body: string }>;

      protected override template() {
        return html`
          <section class="board">
            ${repeat(
              this.items,
              (item) => item.id,
              (item) => html`
                <miura-slot-card-regression class="card" data-id=${item.id}>
                  <span slot="title">${item.title}</span>
                  <p>${item.body}</p>
                </miura-slot-card-regression>
              `
            )}
          </section>
        `;
      }
    }

    if (!customElements.get(cardTag)) {
      customElements.define(cardTag, SlotCardElement);
    }
    if (!customElements.get(boardTag)) {
      customElements.define(boardTag, SlotBoardElement);
    }

    const element = document.createElement(boardTag) as SlotBoardElement;
    element.items = [
      { id: '1', title: 'First', body: 'Body A' },
      { id: '2', title: 'Second', body: 'Body B' },
      { id: '3', title: 'Third', body: 'Body C' },
    ];
    document.body.appendChild(element);

    await element.updateComplete;

    const initialCards = Array.from(element.shadowRoot?.querySelectorAll(`.${'card'}`) || []) as MiuraElement[];
    await Promise.all(initialCards.map((card) => card.updateComplete));

    expect(initialCards.map((card) => card.getAttribute('data-id'))).toEqual(['1', '2', '3']);
    expect(initialCards.map((card) => readProjectedText(card))).toEqual([
      'First Body A',
      'Second Body B',
      'Third Body C',
    ]);

    element.items = [
      { id: '3', title: 'Third', body: 'Body C updated' },
      { id: '1', title: 'First', body: 'Body A' },
    ];
    await element.updateComplete;

    const reorderedCards = Array.from(element.shadowRoot?.querySelectorAll(`.${'card'}`) || []) as MiuraElement[];
    await Promise.all(reorderedCards.map((card) => card.updateComplete));

    expect(reorderedCards.map((card) => card.getAttribute('data-id'))).toEqual(['3', '1']);
    expect(reorderedCards.map((card) => readProjectedText(card))).toEqual([
      'Third Body C updated',
      'First Body A',
    ]);
  });
});
