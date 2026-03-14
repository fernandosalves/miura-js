import { MiuraElement } from '../miura-element';
import { html } from '../../template/html';

interface Todo {
    id: number;
    text: string;
    completed: boolean;
}

export class TodoListElement extends MiuraElement {
    static properties = {
        todos: { type: Array, default: [] as Todo[] },
        filter: { type: String, default: 'all' },
        newTodoText: { type: String, default: '' }
    };

    private nextId = 1;

    addTodo(e: Event) {
        e?.preventDefault();
        if (!this.newTodoText?.trim()) return;

        this.todos = [
            ...this.todos,
            {
                id: this.nextId++,
                text: this.newTodoText,
                completed: false
            }
        ];
        this.newTodoText = '';
    }

    toggleTodo(id: number) {
        if (!id) return;
        this.todos = this.todos.map(todo =>
            todo.id === id ? { ...todo, completed: !todo.completed } : todo
        );
    }

    deleteTodo(id: number) {
        if (!id) return;
        this.todos = this.todos.filter(todo => todo.id !== id);
    }

    updateFilter(filter: string) {
        if (!filter || !['all', 'active', 'completed'].includes(filter)) return;
        this.filter = filter;
    }

    get filteredTodos() {
        switch (this.filter) {
            case 'active':
                return this.todos.filter(todo => !todo.completed);
            case 'completed':
                return this.todos.filter(todo => todo.completed);
            default:
                return this.todos;
        }
    }

    private renderTodoItem(todo: Todo) {
        return html`
            <li class="todo-item ${todo.completed ? 'completed' : ''}">
                <input
                    type="checkbox"
                    .checked=${todo.completed}
                    @change=${() => this.toggleTodo(todo.id)}
                />
                <span>${todo.text}</span>
                <button @click=${() => this.deleteTodo(todo.id)}>Delete</button>
            </li>
        `;
    }

    template() {
        const template = html`
            <div class="todo-app">
                <form @submit=${this.addTodo}>
                    <input
                        type="text"
                        .value=${this.newTodoText}
                        @input=${(e: Event) => this.newTodoText = (e.target as HTMLInputElement).value}
                        placeholder="What needs to be done?"
                    />
                    <button type="submit">Add</button>
                </form>

                <div class="filters">
                    <button
                        class=${this.filter === 'all' ? 'active' : ''}
                        @click=${() => this.updateFilter('all')}
                    >All</button>
                    <button
                        class=${this.filter === 'active' ? 'active' : ''}
                        @click=${() => this.updateFilter('active')}
                    >Active</button>
                    <button
                        class=${this.filter === 'completed' ? 'active' : ''}
                        @click=${() => this.updateFilter('completed')}
                    >Completed</button>
                </div>

                <ul class="todo-list">
                    ${this.filteredTodos.map(todo => this.renderTodoItem(todo))}
                </ul>

                <div class="todo-stats">
                    <span>${this.todos.filter(t => !t.completed).length} items left</span>
                    <span>${this.todos.filter(t => t.completed).length} completed</span>
                </div>
            </div>
        `;

        return template;
    }
}

customElements.define('miura-todo-list', TodoListElement);
