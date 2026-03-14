import { MiuraElement, html, css } from '@miura/miura-element';
import { component } from '@miura/miura-element';

@component({ tag: 'form-demo' })
export class FormDemo extends MiuraElement {
  radioValue = 'a';
  checkboxValues = ['a'];
  rangeValue = 50;
  ratingValue = 3;
  files: File[] = [];

  static get styles() {
    return css`
      .row { display: flex; gap: 1em; margin-bottom: 1em; align-items: center; }
      .value { font-size: 0.95em; color: #888; }
    `;
  }

  private handleRadio = (e: any) => {
    this.radioValue = e.target.value;
    this.requestUpdate();
  };
  private handleCheckbox = (e: any) => {
    const value = e.target.value;
    if (e.target.checked) {
      this.checkboxValues = [...this.checkboxValues, value];
    } else {
      this.checkboxValues = this.checkboxValues.filter((v) => v !== value);
    }
    this.requestUpdate();
  };
  private handleRange = (e: any) => {
    this.rangeValue = Number(e.target.value);
    this.requestUpdate();
  };
  private handleRating = (e: any) => {
    this.ratingValue = Number(e.target.value);
    this.requestUpdate();
  };
  private handleFileDrop = (e: any) => {
    this.files = Array.from(e.target.files || []);
    this.requestUpdate();
  };

  template() {
    return html`
      <section>
        <h2>📝 Form Controls</h2>
        <div class="row">
          <mui-radio-group name="group" .value=${this.radioValue} @change=${this.handleRadio}>
            <mui-radio value="a">A</mui-radio>
            <mui-radio value="b">B</mui-radio>
          </mui-radio-group>
          <span class="value">Selected: ${this.radioValue}</span>
        </div>
        <div class="row">
          <mui-checkbox-group name="group">
            <mui-checkbox value="a" .checked=${this.checkboxValues.includes('a')} @change=${this.handleCheckbox}>A</mui-checkbox>
            <mui-checkbox value="b" .checked=${this.checkboxValues.includes('b')} @change=${this.handleCheckbox}>B</mui-checkbox>
          </mui-checkbox-group>
          <span class="value">Checked: ${this.checkboxValues.join(', ')}</span>
        </div>
        <div class="row">
          <mui-range min="0" max="100" step="1" .value=${this.rangeValue} @input=${this.handleRange}></mui-range>
          <span class="value">Value: ${this.rangeValue}</span>
        </div>
        <div class="row">
          <mui-rating max="5" .value=${this.ratingValue} @input=${this.handleRating}></mui-rating>
          <span class="value">Value: ${this.ratingValue}</span>
        </div>
        <div class="row">
          <mui-file-drop @change=${this.handleFileDrop}>Drop files here</mui-file-drop>
          <span class="value">Files: ${this.files.map(f => f.name).join(', ')}</span>
        </div>
      </section>
    `;
  }
} 