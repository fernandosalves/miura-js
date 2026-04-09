import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { MiuraElement, html, type Form } from '../index.js';

const waitForMicrotask = async () => {
    await new Promise((resolve) => setTimeout(resolve, 0));
};

const waitFor = async (check: () => boolean, timeoutMs = 150) => {
    const started = Date.now();
    while (Date.now() - started < timeoutMs) {
        if (check()) return;
        await waitForMicrotask();
    }
    throw new Error('Timed out waiting for condition');
};

describe('MiuraElement $form', () => {
    beforeEach(() => {
        document.body.innerHTML = '';
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    it('binds fields through &value and &checked', async () => {
        const tagName = 'miura-form-bindings';

        class FormBindingsElement extends MiuraElement {
            form: Form<{ name: string; published: boolean }>;

            constructor() {
                super();
                this.form = this.$form({ name: 'Draft', published: false });
            }

            protected override template() {
                return html`
                    <input class="name" &value=${this.form.field('name')}>
                    <input class="published" type="checkbox" &checked=${this.form.field('published')}>
                    <p class="summary">${this.form.values.name}:${String(this.form.values.published)}</p>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, FormBindingsElement);
        }

        const element = document.createElement(tagName) as FormBindingsElement;
        document.body.appendChild(element);
        await element.updateComplete;

        const nameInput = element.shadowRoot?.querySelector('.name') as HTMLInputElement;
        const publishedInput = element.shadowRoot?.querySelector('.published') as HTMLInputElement;

        expect(nameInput.value).toBe('Draft');
        expect(publishedInput.checked).toBe(false);

        nameInput.value = 'Published Post';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));

        publishedInput.checked = true;
        publishedInput.dispatchEvent(new Event('change', { bubbles: true }));

        await waitFor(() => element.shadowRoot?.querySelector('.summary')?.textContent === 'Published Post:true');

        expect(element.form.values.name).toBe('Published Post');
        expect(element.form.values.published).toBe(true);
        expect(element.form.dirty).toBe(true);
        expect(element.form.isTouched('name')).toBe(true);
        expect(element.form.isTouched('published')).toBe(true);
    });

    it('tracks validation errors and submit state', async () => {
        const tagName = 'miura-form-validation';
        let releaseSubmit!: () => void;

        class FormValidationElement extends MiuraElement {
            form: Form<{ title: string }>;
            savedValue = '';

            constructor() {
                super();
                this.form = this.$form(
                    { title: '' },
                    {
                        validate: (values) => ({
                            title: values.title.trim() ? undefined : 'Title is required',
                        }),
                    }
                );
            }

            async save() {
                await this.form.submit(async (values) => {
                    await new Promise<void>((resolve) => {
                        releaseSubmit = resolve;
                    });
                    this.savedValue = values.title;
                    this.requestUpdate();
                });
            }

            protected override template() {
                return html`
                    <input class="title" &value=${this.form.field('title')}>
                    <p class="error">${this.form.errors.title ?? ''}</p>
                    <p class="submitting">${String(this.form.submitting)}</p>
                    <p class="saved">${this.savedValue}</p>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, FormValidationElement);
        }

        const element = document.createElement(tagName) as FormValidationElement;
        document.body.appendChild(element);
        await element.updateComplete;

        expect(element.form.valid).toBe(false);
        expect(element.shadowRoot?.querySelector('.error')?.textContent).toBe('Title is required');
        await expect(element.form.submit(async () => undefined)).rejects.toThrow('Form validation failed');
        expect(element.form.isTouched('title')).toBe(true);
        expect(element.form.shouldShowError('title')).toBe(true);
        expect(element.form.visibleErrors.title).toBe('Title is required');

        element.form.set('title', 'Hello Miura');
        await element.updateComplete;

        expect(element.form.valid).toBe(true);
        expect(element.shadowRoot?.querySelector('.error')?.textContent).toBe('');

        const savePromise = element.save();
        await waitFor(() => element.shadowRoot?.querySelector('.submitting')?.textContent === 'true');

        expect(element.form.submitting).toBe(true);

        releaseSubmit();
        await savePromise;
        await waitFor(() => element.shadowRoot?.querySelector('.saved')?.textContent === 'Hello Miura');

        expect(element.form.submitting).toBe(false);
        expect(element.savedValue).toBe('Hello Miura');
    });

    it('supports patch and reset while preserving a clean baseline', async () => {
        const tagName = 'miura-form-reset';

        class FormResetElement extends MiuraElement {
            form: Form<{ title: string; published: boolean }>;

            constructor() {
                super();
                this.form = this.$form({ title: 'Draft', published: false });
            }

            protected override template() {
                return html`
                    <p class="title">${this.form.values.title}</p>
                    <p class="published">${String(this.form.values.published)}</p>
                    <p class="dirty">${String(this.form.dirty)}</p>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, FormResetElement);
        }

        const element = document.createElement(tagName) as FormResetElement;
        document.body.appendChild(element);
        await element.updateComplete;

        element.form.patch({ title: 'Updated', published: true });
        await waitFor(() => element.shadowRoot?.querySelector('.dirty')?.textContent === 'true');

        expect(element.form.isDirty('title')).toBe(true);
        expect(element.form.isDirty('published')).toBe(true);

        element.form.reset();
        await waitFor(() => element.shadowRoot?.querySelector('.title')?.textContent === 'Draft');

        expect(element.form.dirty).toBe(false);
        expect(element.form.values.title).toBe('Draft');
        expect(element.form.values.published).toBe(false);

        element.form.reset({ title: 'Fresh', published: true });
        await waitFor(() => element.shadowRoot?.querySelector('.title')?.textContent === 'Fresh');

        expect(element.form.initialValues.title).toBe('Fresh');
        expect(element.form.initialValues.published).toBe(true);
        expect(element.form.dirty).toBe(false);
    });

    it('exposes field touch and metadata for template-level ergonomics', async () => {
        const tagName = 'miura-form-field-meta';

        class FormFieldMetaElement extends MiuraElement {
            form: Form<{ email: string }>;

            constructor() {
                super();
                this.form = this.$form(
                    { email: '' },
                    {
                        touchOnChange: false,
                        validate: (values) => ({
                            email: values.email.includes('@') ? undefined : 'Invalid email',
                        }),
                    }
                );
            }

            protected override template() {
                const email = this.form.field('email');
                return html`
                    <input
                        class="email"
                        &value=${email}
                        @blur=${() => email.touch()}
                    >
                    <p class="touched">${String(email.isTouched)}</p>
                    <p class="dirty">${String(email.isDirty)}</p>
                    <p class="show-error">${String(email.showError)}</p>
                    <p class="error">${this.form.visibleErrors.email ?? ''}</p>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, FormFieldMetaElement);
        }

        const element = document.createElement(tagName) as FormFieldMetaElement;
        document.body.appendChild(element);
        await element.updateComplete;

        const input = element.shadowRoot?.querySelector('.email') as HTMLInputElement;

        expect(element.shadowRoot?.querySelector('.touched')?.textContent).toBe('false');
        expect(element.shadowRoot?.querySelector('.dirty')?.textContent).toBe('false');
        expect(element.shadowRoot?.querySelector('.show-error')?.textContent).toBe('false');
        expect(element.shadowRoot?.querySelector('.error')?.textContent).toBe('');

        input.dispatchEvent(new Event('blur', { bubbles: true }));
        await waitFor(() => element.shadowRoot?.querySelector('.touched')?.textContent === 'true');
        expect(element.shadowRoot?.querySelector('.show-error')?.textContent).toBe('true');
        expect(element.shadowRoot?.querySelector('.error')?.textContent).toBe('Invalid email');

        input.value = 'team@miura.dev';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        await waitFor(() => element.shadowRoot?.querySelector('.dirty')?.textContent === 'true');

        expect(element.form.isTouched('email')).toBe(true);
        expect(element.form.isDirty('email')).toBe(true);
        expect(element.form.shouldShowError('email')).toBe(false);
        expect(element.shadowRoot?.querySelector('.error')?.textContent).toBe('');
    });

    it('supports nested form paths for get, set, touch, and binding', async () => {
        const tagName = 'miura-form-nested-paths';

        class NestedPathFormElement extends MiuraElement {
            form: Form<{ profile: { name: string; meta: { featured: boolean } } }>;

            constructor() {
                super();
                this.form = this.$form({
                    profile: {
                        name: 'Draft',
                        meta: { featured: false },
                    },
                });
            }

            protected override template() {
                return html`
                    <input class="name" &value=${this.form.field('profile.name')}>
                    <input class="featured" type="checkbox" &checked=${this.form.field('profile.meta.featured')}>
                    <p class="summary">
                        ${this.form.get('profile.name')}:${String(this.form.get('profile.meta.featured'))}
                    </p>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, NestedPathFormElement);
        }

        const element = document.createElement(tagName) as NestedPathFormElement;
        document.body.appendChild(element);
        await element.updateComplete;

        const nameInput = element.shadowRoot?.querySelector('.name') as HTMLInputElement;
        const featuredInput = element.shadowRoot?.querySelector('.featured') as HTMLInputElement;

        expect(nameInput.value).toBe('Draft');
        expect(featuredInput.checked).toBe(false);

        nameInput.value = 'Published';
        nameInput.dispatchEvent(new Event('input', { bubbles: true }));
        featuredInput.checked = true;
        featuredInput.dispatchEvent(new Event('change', { bubbles: true }));

        expect(element.form.get('profile.name')).toBe('Published');
        expect(element.form.get('profile.meta.featured')).toBe(true);
        await waitFor(() => element.form.get('profile.name') === 'Published' && element.form.get('profile.meta.featured') === true);
        await waitFor(() => (element.shadowRoot?.querySelector('.summary')?.textContent ?? '').includes('Published:true'));
        expect(element.form.isTouched('profile.name')).toBe(true);
        expect(element.form.isDirty('profile.meta.featured')).toBe(true);
    });

    it('supports native form submission through handleSubmit', async () => {
        const tagName = 'miura-form-submit-handler';

        class FormSubmitElement extends MiuraElement {
            form: Form<{ title: string }>;
            savedValue = '';
            save!: (event?: Event) => Promise<void>;

            constructor() {
                super();
                this.form = this.$form({
                    title: 'Draft',
                });
                this.save = this.form.handleSubmit(async (values) => {
                    this.savedValue = values.title;
                    this.requestUpdate();
                });
            }

            protected override template() {
                return html`
                    <form class="editor" @submit=${this.save}>
                        <input class="title" &value=${this.form.field('title')}>
                        <button type="submit">Save</button>
                    </form>
                    <p class="saved">${this.savedValue}</p>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, FormSubmitElement);
        }

        const element = document.createElement(tagName) as FormSubmitElement;
        document.body.appendChild(element);
        await element.updateComplete;

        const input = element.shadowRoot?.querySelector('.title') as HTMLInputElement;
        const form = element.shadowRoot?.querySelector('.editor') as HTMLFormElement;

        input.value = 'Published';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        const submitEvent = new Event('submit', { bubbles: true, cancelable: true });
        form.dispatchEvent(submitEvent);
        await waitFor(() => element.shadowRoot?.querySelector('.saved')?.textContent === 'Published');

        expect(submitEvent.defaultPrevented).toBe(true);
        expect(element.savedValue).toBe('Published');
    });

    it('tracks submit results and clears them after edits', async () => {
        const tagName = 'miura-form-submit-result';

        class SubmitResultElement extends MiuraElement {
            form: Form<{ title: string }>;

            constructor() {
                super();
                this.form = this.$form({ title: 'Draft' });
            }

            protected override template() {
                return html`
                    <p class="result">${String(this.form.submitResult ?? '')}</p>
                    <p class="succeeded">${String(this.form.submitSucceeded)}</p>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, SubmitResultElement);
        }

        const element = document.createElement(tagName) as SubmitResultElement;
        document.body.appendChild(element);
        await element.updateComplete;

        const result = await element.form.submit(async (values) => `${values.title}:saved`);
        expect(result).toBe('Draft:saved');
        await waitFor(() => element.shadowRoot?.querySelector('.result')?.textContent === 'Draft:saved');

        expect(element.form.submitResult).toBe('Draft:saved');
        expect(element.form.submitSucceeded).toBe(true);

        element.form.set('title', 'Updated');
        await element.updateComplete;

        expect(element.form.submitResult).toBeUndefined();
        expect(element.form.submitSucceeded).toBe(false);
    });

    it('tracks submit errors and allows clearing submit state', async () => {
        const tagName = 'miura-form-submit-error';

        class SubmitErrorElement extends MiuraElement {
            form: Form<{ title: string }>;

            constructor() {
                super();
                this.form = this.$form({ title: 'Draft' });
            }

            protected override template() {
                const message = this.form.submitError instanceof Error
                    ? this.form.submitError.message
                    : String(this.form.submitError ?? '');

                return html`
                    <p class="error">${message}</p>
                    <p class="succeeded">${String(this.form.submitSucceeded)}</p>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, SubmitErrorElement);
        }

        const element = document.createElement(tagName) as SubmitErrorElement;
        document.body.appendChild(element);
        await element.updateComplete;

        await expect(element.form.submit(async () => {
            throw new Error('Save failed');
        })).rejects.toThrow('Save failed');

        await waitFor(() => element.shadowRoot?.querySelector('.error')?.textContent === 'Save failed');

        expect((element.form.submitError as Error).message).toBe('Save failed');
        expect(element.form.submitSucceeded).toBe(false);

        element.form.clearSubmitState();
        await waitFor(() => element.shadowRoot?.querySelector('.error')?.textContent === '');

        expect(element.form.submitError).toBeUndefined();
        expect(element.form.submitResult).toBeUndefined();
    });

    it('can map server field errors onto the form', async () => {
        const tagName = 'miura-form-server-errors';

        class ServerErrorsElement extends MiuraElement {
            form: Form<{ email: string; password: string }>;

            constructor() {
                super();
                this.form = this.$form({ email: '', password: '' });
            }

            protected override template() {
                return html`
                    <p class="email-error">${this.form.visibleErrors.email ?? ''}</p>
                    <p class="password-error">${this.form.visibleErrors.password ?? ''}</p>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, ServerErrorsElement);
        }

        const element = document.createElement(tagName) as ServerErrorsElement;
        document.body.appendChild(element);
        await element.updateComplete;

        element.form.setErrors(
            {
                email: 'Email already in use',
                password: 'Password is too weak',
            },
            { touch: true }
        );

        await waitFor(() => element.shadowRoot?.querySelector('.email-error')?.textContent === 'Email already in use');

        expect(element.form.errors.email).toBe('Email already in use');
        expect(element.form.errors.password).toBe('Password is too weak');
        expect(element.form.isTouched('email')).toBe(true);
        expect(element.form.isTouched('password')).toBe(true);
        expect(element.form.visibleErrors.password).toBe('Password is too weak');

        element.form.clearErrors();
        await waitFor(() => element.shadowRoot?.querySelector('.email-error')?.textContent === '');

        expect(element.form.errors.email).toBeUndefined();
        expect(element.form.errors.password).toBeUndefined();
    });

    it('can fail a submit with top-level and field errors together', async () => {
        const tagName = 'miura-form-fail-submit';

        class FailSubmitElement extends MiuraElement {
            form: Form<{ email: string }>;

            constructor() {
                super();
                this.form = this.$form({ email: 'a@b.com' });
            }

            protected override template() {
                const submitMessage = this.form.submitError instanceof Error
                    ? this.form.submitError.message
                    : String(this.form.submitError ?? '');

                return html`
                    <p class="submit-error">${submitMessage}</p>
                    <p class="field-error">${this.form.visibleErrors.email ?? ''}</p>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, FailSubmitElement);
        }

        const element = document.createElement(tagName) as FailSubmitElement;
        document.body.appendChild(element);
        await element.updateComplete;

        await expect(
            element.form.submit(async (_values, form) => {
                try {
                    throw new Error('Request failed');
                } catch (error) {
                    form.failSubmit(error, {
                        errors: {
                            email: 'Email already registered',
                        },
                        touch: true,
                    });
                }
            })
        ).rejects.toThrow('Request failed');

        await waitFor(() => element.shadowRoot?.querySelector('.submit-error')?.textContent === 'Request failed');

        expect(element.form.submitError).toBeInstanceOf(Error);
        expect((element.form.submitError as Error).message).toBe('Request failed');
        expect(element.form.visibleErrors.email).toBe('Email already registered');
    });

    it('can render submit state declaratively with view()', async () => {
        const tagName = 'miura-form-view';
        let releaseValidation!: (value: { title?: string }) => void;

        class FormViewElement extends MiuraElement {
            form: Form<{ title: string }>;

            constructor() {
                super();
                this.form = this.$form(
                    { title: 'Draft' },
                    {
                        validateAsync: () =>
                            new Promise((resolve) => {
                                releaseValidation = resolve;
                            }),
                    }
                );
            }

            protected override template() {
                return html`
                    ${this.form.view({
                        idle: () => html`<p class="state">idle</p>`,
                        validating: () => html`<p class="state">validating</p>`,
                        submitting: () => html`<p class="state">submitting</p>`,
                        success: (result) => html`<p class="state">success:${String(result)}</p>`,
                        error: (error) => html`<p class="state">error:${(error as Error).message}</p>`,
                    })}
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, FormViewElement);
        }

        const element = document.createElement(tagName) as FormViewElement;
        document.body.appendChild(element);
        await element.updateComplete;

        expect(element.shadowRoot?.querySelector('.state')?.textContent).toBe('idle');

        const successPromise = element.form.submit(async (values) => `saved:${values.title}`);
        await waitFor(() => element.shadowRoot?.querySelector('.state')?.textContent === 'validating');
        releaseValidation({});
        await successPromise;
        await waitFor(() => element.shadowRoot?.querySelector('.state')?.textContent === 'success:saved:Draft');

        element.form.set('title', 'Changed');
        await waitFor(() => element.shadowRoot?.querySelector('.state')?.textContent === 'idle');

        const failurePromise = element.form.submit(async (_values, form) => {
            try {
                throw new Error('Boom');
            } catch (error) {
                form.failSubmit(error);
            }
        });

        await waitFor(() => element.shadowRoot?.querySelector('.state')?.textContent === 'validating');
        releaseValidation({});
        await expect(failurePromise).rejects.toThrow('Boom');
        await waitFor(() => element.shadowRoot?.querySelector('.state')?.textContent === 'error:Boom');
    });

    it('blocks submit on async validation errors and exposes validating state', async () => {
        const tagName = 'miura-form-async-validation';
        let resolveValidation!: (value: { title?: string }) => void;

        class AsyncValidationElement extends MiuraElement {
            form: Form<{ title: string }>;
            savedValue = '';

            constructor() {
                super();
                this.form = this.$form(
                    { title: 'Draft' },
                    {
                        validateAsync: () =>
                            new Promise((resolve) => {
                                resolveValidation = resolve;
                            }),
                    }
                );
            }

            protected override template() {
                return html`
                    <p class="validating">${String(this.form.validating)}</p>
                    <p class="error">${this.form.visibleErrors.title ?? ''}</p>
                    <p class="saved">${this.savedValue}</p>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, AsyncValidationElement);
        }

        const element = document.createElement(tagName) as AsyncValidationElement;
        document.body.appendChild(element);
        await element.updateComplete;

        const submitPromise = element.form.submit(async (values) => {
            element.savedValue = values.title;
            element.requestUpdate();
        });

        await waitFor(() => element.shadowRoot?.querySelector('.validating')?.textContent === 'true');
        expect(element.form.validating).toBe(true);

        resolveValidation({ title: 'Title already exists' });
        await expect(submitPromise).rejects.toThrow('Form validation failed');
        await waitFor(() => element.shadowRoot?.querySelector('.error')?.textContent === 'Title already exists');

        expect(element.form.validating).toBe(false);
        expect(element.form.shouldShowError('title')).toBe(true);
        expect(element.savedValue).toBe('');
    });

    it('ignores stale async validation results after the form changes', async () => {
        const tagName = 'miura-form-async-stale';
        const releases: Array<(value: { username?: string }) => void> = [];

        class AsyncStaleElement extends MiuraElement {
            form: Form<{ username: string }>;

            constructor() {
                super();
                this.form = this.$form(
                    { username: '' },
                    {
                        validateAsync: (values) =>
                            new Promise((resolve) => {
                                releases.push((result) => resolve(result.username === undefined ? {} : result));
                            }),
                    }
                );
            }

            protected override template() {
                return html`
                    <p class="error">${this.form.errors.username ?? ''}</p>
                    <p class="validating">${String(this.form.validating)}</p>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, AsyncStaleElement);
        }

        const element = document.createElement(tagName) as AsyncStaleElement;
        document.body.appendChild(element);
        await element.updateComplete;

        const firstValidation = element.form.validateAsync();
        await waitFor(() => element.shadowRoot?.querySelector('.validating')?.textContent === 'true');

        element.form.set('username', 'fresh');
        const secondValidation = element.form.validateAsync();

        releases.shift()?.({ username: 'Taken' });
        await firstValidation;
        await waitForMicrotask();
        expect(element.form.errors.username).toBeUndefined();

        releases.shift()?.({});
        await secondValidation;
        await waitFor(() => element.shadowRoot?.querySelector('.validating')?.textContent === 'false');

        expect(element.form.errors.username).toBeUndefined();
        expect(element.form.validating).toBe(false);
    });

    it('can run async validation automatically on blur', async () => {
        const tagName = 'miura-form-async-blur';
        let calls = 0;

        class AsyncBlurElement extends MiuraElement {
            form: Form<{ email: string }>;

            constructor() {
                super();
                this.form = this.$form(
                    { email: '' },
                    {
                        validateAsyncOn: 'blur',
                        validateAsync: async (values) => {
                            calls++;
                            return {
                                email: values.email.includes('@') ? undefined : 'Invalid email',
                            };
                        },
                    }
                );
            }

            protected override template() {
                const email = this.form.field('email');
                return html`
                    <input class="email" &value=${email} @blur=${email.touch}>
                    <p class="error">${this.form.visibleErrors.email ?? ''}</p>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, AsyncBlurElement);
        }

        const element = document.createElement(tagName) as AsyncBlurElement;
        document.body.appendChild(element);
        await element.updateComplete;

        const input = element.shadowRoot?.querySelector('.email') as HTMLInputElement;
        input.dispatchEvent(new Event('blur', { bubbles: true }));

        await waitFor(() => element.shadowRoot?.querySelector('.error')?.textContent === 'Invalid email');
        expect(calls).toBe(1);
    });

    it('can debounce async validation on change', async () => {
        const tagName = 'miura-form-async-change';
        let calls = 0;

        class AsyncChangeElement extends MiuraElement {
            form: Form<{ username: string }>;

            constructor() {
                super();
                this.form = this.$form(
                    { username: '' },
                    {
                        validateAsyncOn: 'change',
                        validateAsyncDebounce: 20,
                        validateAsync: async (values) => {
                            calls++;
                            return {
                                username: values.username.length >= 3 ? undefined : 'Too short',
                            };
                        },
                    }
                );
            }

            protected override template() {
                return html`
                    <input class="username" &value=${this.form.field('username')}>
                    <p class="error">${this.form.errors.username ?? ''}</p>
                `;
            }
        }

        if (!customElements.get(tagName)) {
            customElements.define(tagName, AsyncChangeElement);
        }

        const element = document.createElement(tagName) as AsyncChangeElement;
        document.body.appendChild(element);
        await element.updateComplete;

        const input = element.shadowRoot?.querySelector('.username') as HTMLInputElement;

        input.value = 'a';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.value = 'ab';
        input.dispatchEvent(new Event('input', { bubbles: true }));
        input.value = 'abc';
        input.dispatchEvent(new Event('input', { bubbles: true }));

        await waitFor(() => calls === 1, 250);
        await waitFor(() => element.form.validating === false, 250);

        expect(element.form.errors.username).toBeUndefined();
        expect(calls).toBe(1);
    });
});
