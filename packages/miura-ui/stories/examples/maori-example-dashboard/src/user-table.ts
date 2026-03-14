import { MiuraElement, html, css } from '@miura/miura-element';
import { component } from '@miura/miura-element';

interface User { name: string; email: string; }

@component({ tag: 'user-table' })
export class UserTable extends MiuraElement {
  users: User[] = [
    { name: 'Alice', email: 'alice@example.com' },
    { name: 'Bob', email: 'bob@example.com' }
  ];
  showDialog = false;
  newUser: User = { name: '', email: '' };

  static get styles() {
    return css`
      .actions { display: flex; gap: 0.5em; }
      .row { margin-bottom: 1em; }
      form { display: flex; flex-direction: column; gap: 0.5em; }
      input { padding: 0.5em; border-radius: 4px; border: 1px solid #ccc; }
    `;
  }

  private openDialog = () => { this.showDialog = true; this.requestUpdate(); };
  private closeDialog = () => { this.showDialog = false; this.newUser = { name: '', email: '' }; this.requestUpdate(); };
  private handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.newUser = { ...this.newUser, [target.name]: target.value };
    this.requestUpdate();
  };
  private addUser = (e: Event) => {
    e.preventDefault();
    if (!this.newUser.name || !this.newUser.email) return;
    this.users = [...this.users, { ...this.newUser }];
    this.closeDialog();
  };
  private removeUser = (index: number) => {
    this.users = this.users.filter((_, i) => i !== index);
    this.requestUpdate();
  };

  template() {
    return html`
      <section>
        <h2>📊 Table</h2>
        <div class="row actions">
          <mui-button @click=${this.openDialog}>Add User</mui-button>
        </div>
        <mui-table>
          <table>
            <thead><tr><th>Name</th><th>Email</th><th>Actions</th></tr></thead>
            <tbody>
              ${this.users.map((user, i) => html`
                <tr>
                  <td>${user.name}</td>
                  <td>${user.email}</td>
                  <td><mui-button @click=${() => this.removeUser(i)}>Remove</mui-button></td>
                </tr>
              `)}
            </tbody>
          </table>
        </mui-table>
        ${this.showDialog ? html`
          <mui-dialog open>
            <form @submit=${this.addUser}>
              <input name="name" placeholder="Name" .value=${this.newUser.name} @input=${this.handleInput} />
              <input name="email" placeholder="Email" .value=${this.newUser.email} @input=${this.handleInput} />
              <mui-button type="submit">Add</mui-button>
              <mui-button type="button" @click=${this.closeDialog}>Cancel</mui-button>
            </form>
          </mui-dialog>
        ` : ''}
      </section>
    `;
  }
} 