import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { TodoListElement } from './todo-list';
import './todo-list';

describe('TodoListElement', () => {
    let element: TodoListElement;

    beforeEach(async () => {
        element = document.createElement('miura-todo-list') as TodoListElement;
        document.body.appendChild(element);
        await waitForRender();
    });

    afterEach(() => {
        element.remove();
    });

    const waitForRender = async () => {
        await new Promise(resolve => setTimeout(resolve, 0));
    };

    it('initializes with empty todos', async () => {
        expect(element.todos).toEqual([]);
        expect(element.filter).toBe('all');
        expect(element.newTodoText).toBe('');
    });

    it('adds a new todo', async () => {
        // Set the value directly on the element
        element.newTodoText = 'Test todo';
        await waitForRender();

        // Trigger the form submit
        element.addTodo(new Event('submit'));
        await waitForRender();

        expect(element.todos).toHaveLength(1);
        expect(element.todos[0]).toMatchObject({
            text: 'Test todo',
            completed: false
        });
        expect(element.newTodoText).toBe('');
    });

    it('does not add empty todos', async () => {
        element.newTodoText = '';
        await waitForRender();

        element.addTodo(new Event('submit'));
        await waitForRender();

        expect(element.todos).toHaveLength(0);
    });

    it('toggles todo completion', async () => {
        // Add a todo first
        element.todos = [{ id: 1, text: 'Test todo', completed: false }];
        await waitForRender();

        element.toggleTodo(1);
        await waitForRender();

        expect(element.todos[0].completed).toBe(true);
    });

    it('deletes a todo', async () => {
        element.todos = [{ id: 1, text: 'Test todo', completed: false }];
        await waitForRender();

        element.deleteTodo(1);
        await waitForRender();

        expect(element.todos).toHaveLength(0);
    });

    it('filters todos correctly', async () => {
        element.todos = [
            { id: 1, text: 'Active todo', completed: false },
            { id: 2, text: 'Completed todo', completed: true }
        ];
        await waitForRender();

        // Test active filter
        element.updateFilter('active');
        await waitForRender();
        expect(element.filter).toBe('active');
        expect(element.filteredTodos.length).toBe(1);

        // Test completed filter
        element.updateFilter('completed');
        await waitForRender();
        expect(element.filter).toBe('completed');
        expect(element.filteredTodos.length).toBe(1);

        // Test all filter
        element.updateFilter('all');
        await waitForRender();
        expect(element.filter).toBe('all');
        expect(element.filteredTodos.length).toBe(2);
    });

    it('displays correct stats', async () => {
        element.todos = [
            { id: 1, text: 'Active todo', completed: false },
            { id: 2, text: 'Completed todo', completed: true }
        ];
        await waitForRender();

        const activeTodos = element.todos.filter(t => !t.completed).length;
        const completedTodos = element.todos.filter(t => t.completed).length;

        expect(activeTodos).toBe(1);
        expect(completedTodos).toBe(1);
    });
});
