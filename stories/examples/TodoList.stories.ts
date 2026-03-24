import { MiuraElement, html, css, repeat } from "@miurajs/miura-element";
import type { Meta, StoryObj } from "@storybook/web-components";
import { component } from "@miurajs/miura-element";

let nextId = 1;

interface Todo {
  id: number;
  text: string;
  completed: boolean;
}

@component({
  tag: "miura-todo-list",
})
class TodoListElement extends MiuraElement {
  // --- Properties (public, reflected if needed) ---
  declare todos: Todo[];
  declare filter: string;
  declare isReadOnly: boolean;

  // --- State (internal, non-reflected) ---
  declare newTodoText: string;
  declare isLoading: boolean;

  static properties = {
    todos: { type: Array, default: [] as Todo[] },
    filter: { type: String, default: "all" },
    isReadOnly: { type: Boolean, default: false },
  };

  static state() {
    return {
      newTodoText: { type: String, default: "" },
      isLoading: { type: Boolean, default: false },
    };
  }

  static styles = css`
    :host {
      display: block;
      font-family: "Helvetica Neue", Arial, sans-serif;
      max-width: 600px;
      margin: 0 auto;
      padding: 20px;
    }

    .todo-app {
      background: white;
      border-radius: 8px;
      box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
      padding: 20px;
    }

    form {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
    }

    input {
      flex: 1;
      padding: 8px 12px;
      border: 1px solid #ddd;
      border-radius: 4px;
      font-size: 16px;
    }

    button {
      background: #4caf50;
      color: white;
      border: none;
      padding: 8px 16px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
      transition: background-color 0.2s;
    }

    button:hover {
      background: #45a049;
    }

    .filters {
      display: flex;
      gap: 8px;
      margin-bottom: 20px;
    }

    .filters button {
      background: #f5f5f5;
      color: #666;
    }

    .filters button:hover {
      background: #e0e0e0;
    }

    .filters button.active {
      background: #2196f3;
      color: white;
    }

    .filters button.active:hover {
      background: #1976d2;
    }

    .todo-list {
      list-style: none;
      padding: 0;
      margin: 0;
    }

    .todo-list li {
      display: flex;
      align-items: center;
      padding: 12px;
      border-bottom: 1px solid #eee;
      gap: 12px;
    }

    .todo-list li:last-child {
      border-bottom: none;
    }

    .todo-list input[type="checkbox"] {
      width: 20px;
      height: 20px;
      margin: 0;
    }

    .todo-list span {
      flex: 1;
      font-size: 16px;
    }

    .todo-list li.completed span {
      text-decoration: line-through;
      color: #888;
    }

    .todo-list button {
      background: #ff5252;
      padding: 6px 12px;
      font-size: 12px;
    }

    .todo-list button:hover {
      background: #ff1744;
    }

    button:disabled,
    input:disabled {
      opacity: 0.5;
      cursor: not-allowed;
      background: #cccccc;
    }

    input:read-only {
      background: #f5f5f5;
      border-color: #ddd;
    }
  `;

  addTodo = (e: Event) => {
    e?.preventDefault();
    if (!this.newTodoText?.trim()) {
      return;
    }

    const newTodo: Todo = {
      id: nextId++,
      text: this.newTodoText.trim(),
      completed: false,
    };

    this.isLoading = true;
    this.todos = [...this.todos, newTodo];
    this.newTodoText = "";
    this.isLoading = false;
  };

  toggleTodo = (index: number) => {
    this.todos = this.todos.map((todo: Todo, i: number) =>
      i === index ? { ...todo, completed: !todo.completed } : todo
    );
  };

  deleteTodo = (index: number) => {
    this.isLoading = true;
    this.todos = this.todos.filter((_: Todo, i: number) => i !== index);
    this.isLoading = false;
  };

  updateFilter = (filter: string) => {
    if (!filter || !["all", "active", "completed"].includes(filter)) return;
    this.filter = filter;
  };

  get filteredTodos() {
    const filtered = this.todos.filter((todo: Todo) => {
      switch (this.filter) {
        case "active":
          return !todo.completed;
        case "completed":
          return todo.completed;
        default:
          return true;
      }
    });
    return filtered;
  }

  todoTemplate(todo: Todo, index: number) {
    return html`
      <li class="${{
        'todo-list-item': true,
        'completed': todo.completed
      }}">
        <input
          type="checkbox"
          .checked="${todo.completed}"
          @change="${() => this.toggleTodo(index)}"    
        />
        <span>${todo.text}</span>
        <button
          @click="${() => this.deleteTodo(index)}"
          ?disabled="${this.isLoading}"
        >
          Delete
        </button>
      </li>
    `;
  }

  private handleInput = (e: Event) => {
    const target = e.target as HTMLInputElement;
    this.newTodoText = target.value;
  };

  template(): ReturnType<typeof html> {
    return html`
      <div class="todo-app">
        <form @submit="${this.addTodo}">
          <input
            type="text"
            .value="${this.newTodoText}"
            ?disabled="${this.isLoading}"
            ?readonly="${this.isReadOnly}"
            placeholder="What needs to be done?"
            @input="${this.handleInput}"
          />
          <button
            type="submit"
            ?disabled="${!this.newTodoText || this.isLoading}"
          >
            ${this.isLoading ? "Adding..." : "Add"}
          </button>
        </form>

        <div class="filters">
          <button
            ?disabled="${this.isLoading}"
            class="${this.filter === "all" ? "active" : ""}"
            @click="${() => this.updateFilter("all")}"
          >
            All
          </button>
          <button
            ?disabled="${this.isLoading}"
            class="${this.filter === "active" ? "active" : ""}"
            @click="${() => this.updateFilter("active")}"
          >
            Active
          </button>
          <button
            ?disabled="${this.isLoading}"
            class="${this.filter === "completed" ? "active" : ""}"
            @click="${() => this.updateFilter("completed")}"
          >
            Completed
          </button>
        </div>

        <ul class="todo-list">
          ${repeat(
            this.filteredTodos,
            (todo: Todo) => todo.id,
            (todo: Todo, index: number) => this.todoTemplate(todo, index)
          )}
        </ul>
      </div>
    `;
  }
}

// customElements.define('miura-todo-list', TodoListElement);

const meta: Meta<TodoListElement> = {
  title: "Miura/Demos/Todo List",
  component: "miura-todo-list",
  tags: ["autodocs"],
};

export default meta;

interface TodoListArgs {
  todos?: Todo[];
  filter?: string;
  newTodoText?: string;
  isLoading?: boolean;
  isReadOnly?: boolean;
}

type Story = StoryObj<TodoListElement & TodoListArgs>;

export const Default: Story = {
  args: {
    todos: [
      { id: nextId++, text: "Learn Miura Framework", completed: true },
      { id: nextId++, text: "Build an app", completed: false },
      { id: nextId++, text: "Write documentation", completed: false },
    ],
  },
};
