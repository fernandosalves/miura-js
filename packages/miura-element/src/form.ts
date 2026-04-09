import type { TemplateResult } from '@miurajs/miura-render';

export type FormPath<T extends Record<string, any>> = Extract<keyof T, string> | `${Extract<keyof T, string>}.${string}`;
export type FormErrors<T extends Record<string, any>> = Partial<Record<FormPath<T> | string, string>>;
export type AsyncValidationMode = 'manual' | 'blur' | 'change';

export interface FormViewOptions<T extends Record<string, any>, R extends TemplateResult> {
    idle?: (values: Readonly<T>, form: Form<T>) => R;
    validating?: (values: Readonly<T>, form: Form<T>) => R;
    submitting?: (values: Readonly<T>, form: Form<T>) => R;
    success?: (result: unknown, values: Readonly<T>, form: Form<T>) => R;
    error?: (error: unknown, values: Readonly<T>, form: Form<T>) => R;
}

export interface FormField<T> {
    value: T;
    set: (value: T) => void;
    touch: () => void;
    isTouched: boolean;
    isDirty: boolean;
    showError: boolean;
    error?: string;
}

export interface FormOptions<T extends Record<string, any>> {
    validate?: (values: Readonly<T>) => FormErrors<T> | void;
    validateAsync?: (values: Readonly<T>) => Promise<FormErrors<T> | void>;
    validateAsyncOn?: AsyncValidationMode;
    validateAsyncDebounce?: number;
    touchOnChange?: boolean;
}

export interface Form<T extends Record<string, any>> {
    readonly values: Readonly<T>;
    readonly data: Readonly<T>;
    readonly initialValues: Readonly<T>;
    readonly errors: Readonly<FormErrors<T>>;
    readonly visibleErrors: Readonly<FormErrors<T>>;
    readonly dirty: boolean;
    readonly valid: boolean;
    readonly validating: boolean;
    readonly submitting: boolean;
    readonly submitError: unknown;
    readonly submitResult: unknown;
    readonly submitSucceeded: boolean;
    readonly touched: ReadonlySet<string>;
    field<K extends FormPath<T> | string>(name: K): FormField<any>;
    get<K extends FormPath<T> | string>(name: K): any;
    set<K extends FormPath<T> | string>(name: K, value: any): void;
    patch(values: Partial<T>): void;
    reset(values?: T): void;
    touch<K extends FormPath<T> | string>(name: K): void;
    touchAll(): void;
    isTouched<K extends FormPath<T> | string>(name: K): boolean;
    isDirty<K extends FormPath<T> | string>(name: K): boolean;
    shouldShowError<K extends FormPath<T> | string>(name: K): boolean;
    validate(): boolean;
    validateAsync(): Promise<boolean>;
    clearSubmitState(): void;
    setErrors(errors: FormErrors<T>, options?: { touch?: boolean }): void;
    clearErrors(options?: { touch?: boolean }): void;
    failSubmit(error: unknown, options?: { errors?: FormErrors<T>; touch?: boolean }): never;
    view<R extends TemplateResult>(options: FormViewOptions<T, R>): R | undefined;
    submit<R>(handler: (values: Readonly<T>, form: Form<T>) => Promise<R> | R): Promise<R>;
    handleSubmit<R>(handler: (values: Readonly<T>, form: Form<T>) => Promise<R> | R): (event?: Event) => Promise<R>;
}

function getPathValue(target: Record<string, any>, path: string): any {
    return path.split('.').reduce<any>((current, segment) => current?.[segment], target);
}

function setPathValue<T extends Record<string, any>>(target: T, path: string, value: any): T {
    const segments = path.split('.');
    const clone: Record<string, any> = Array.isArray(target) ? [...target] : { ...target };
    let cursor: Record<string, any> = clone;
    let sourceCursor: Record<string, any> | undefined = target;

    for (let index = 0; index < segments.length - 1; index++) {
        const segment = segments[index] as string;
        const sourceValue: any = sourceCursor?.[segment];
        const next = Array.isArray(sourceValue)
            ? [...sourceValue]
            : sourceValue && typeof sourceValue === 'object'
                ? { ...sourceValue }
                : {};
        cursor[segment] = next;
        cursor = next;
        sourceCursor = sourceValue;
    }

    cursor[segments[segments.length - 1]] = value;
    return clone as T;
}

function collectPaths(target: Record<string, any>, prefix = ''): string[] {
    const paths: string[] = [];
    for (const [key, value] of Object.entries(target)) {
        const path = prefix ? `${prefix}.${key}` : key;
        if (value && typeof value === 'object' && !Array.isArray(value)) {
            paths.push(...collectPaths(value as Record<string, any>, path));
            continue;
        }
        paths.push(path);
    }
    return paths;
}

class FormController<T extends Record<string, any>> implements Form<T> {
    private _values: T;
    private _initialValues: T;
    private _syncErrors: FormErrors<T> = {};
    private _asyncErrors: FormErrors<T> = {};
    private _touched = new Set<string>();
    private _validating = false;
    private _submitting = false;
    private _submitError: unknown = undefined;
    private _submitResult: unknown = undefined;
    private _submitGeneration = 0;
    private _validationGeneration = 0;
    private _validationTimeout: ReturnType<typeof setTimeout> | null = null;

    constructor(
        initialValues: T,
        private readonly onChange: () => void,
        private readonly options: FormOptions<T> = {}
    ) {
        this._values = { ...initialValues };
        this._initialValues = { ...initialValues };
        this.runValidation();
    }

    get values(): Readonly<T> {
        return this._values;
    }

    get data(): Readonly<T> {
        return this._values;
    }

    get initialValues(): Readonly<T> {
        return this._initialValues;
    }

    get errors(): Readonly<FormErrors<T>> {
        return { ...this._syncErrors, ...this._asyncErrors };
    }

    get visibleErrors(): Readonly<FormErrors<T>> {
        const visibleErrors: FormErrors<T> = {};
        const errors = this.errors;
        for (const key of Object.keys(errors)) {
            if (this.shouldShowError(key)) {
                (visibleErrors as Record<string, string>)[key] = errors[key] as string;
            }
        }
        return visibleErrors;
    }

    get dirty(): boolean {
        return collectPaths(this._values as Record<string, any>).some((path) => {
            return getPathValue(this._values, path) !== getPathValue(this._initialValues, path);
        });
    }

    get valid(): boolean {
        return Object.keys(this.errors).length === 0;
    }

    get validating(): boolean {
        return this._validating;
    }

    get submitting(): boolean {
        return this._submitting;
    }

    get submitError(): unknown {
        return this._submitError;
    }

    get submitResult(): unknown {
        return this._submitResult;
    }

    get submitSucceeded(): boolean {
        return this._submitError === undefined && this._submitResult !== undefined;
    }

    get touched(): ReadonlySet<string> {
        return this._touched;
    }

    field<K extends FormPath<T> | string>(name: K): FormField<any> {
        return {
            value: this.get(name),
            set: (value: any) => {
                this.set(name, value);
            },
            touch: () => {
                this.touch(name);
            },
            isTouched: this.isTouched(name),
            isDirty: this.isDirty(name),
            showError: this.shouldShowError(name),
            error: this.errors[String(name)]
        };
    }

    get<K extends FormPath<T> | string>(name: K): any {
        return getPathValue(this._values, String(name));
    }

    set<K extends FormPath<T> | string>(name: K, value: any): void {
        const path = String(name);
        const nextValues = setPathValue(this._values, path, value);
        this._values = nextValues;
        this._submitError = undefined;
        this._submitResult = undefined;

        if (this.options.touchOnChange !== false) {
            this._touched = new Set(this._touched).add(path);
        }

        this.invalidateAsyncValidation();
        this.runValidation();
        this.onChange();
    }

    patch(values: Partial<T>): void {
        this._values = { ...this._values, ...values };
        this._submitError = undefined;
        this._submitResult = undefined;

        if (this.options.touchOnChange !== false) {
            const touched = new Set(this._touched);
            for (const key of collectPaths(values as Record<string, any>)) {
                touched.add(key);
            }
            this._touched = touched;
        }

        this.invalidateAsyncValidation();
        this.runValidation();
        this.onChange();
    }

    reset(values?: T): void {
        const nextValues = values ? { ...values } : { ...this._initialValues };
        if (values) {
            this._initialValues = { ...values };
        }

        this._values = nextValues;
        this._syncErrors = {};
        this._asyncErrors = {};
        this._validating = false;
        this._submitError = undefined;
        this._submitResult = undefined;
        this._validationGeneration++;
        this.clearScheduledAsyncValidation();
        this._touched = new Set();
        this.runValidation();
        this.onChange();
    }

    touch<K extends FormPath<T> | string>(name: K): void {
        const path = String(name);
        if (this._touched.has(path)) {
            return;
        }

        this._touched = new Set(this._touched).add(path);
        if (this.options.validateAsyncOn === 'blur' && this.options.validateAsync) {
            void this.validateAsync();
        }
        this.onChange();
    }

    touchAll(): void {
        const nextTouched = new Set(this._touched);
        let changed = false;

        for (const key of collectPaths(this._values as Record<string, any>)) {
            if (!nextTouched.has(key)) {
                nextTouched.add(key);
                changed = true;
            }
        }

        if (!changed) {
            return;
        }

        this._touched = nextTouched;
        this.onChange();
    }

    isTouched<K extends FormPath<T> | string>(name: K): boolean {
        return this._touched.has(String(name));
    }

    isDirty<K extends FormPath<T> | string>(name: K): boolean {
        const path = String(name);
        return getPathValue(this._values, path) !== getPathValue(this._initialValues, path);
    }

    shouldShowError<K extends FormPath<T> | string>(name: K): boolean {
        const path = String(name);
        return this.isTouched(path) && this.errors[path] !== undefined;
    }

    validate(): boolean {
        this.runValidation();
        this.onChange();
        return this.valid;
    }

    async validateAsync(): Promise<boolean> {
        this.runValidation();

        if (!this.options.validateAsync) {
            this.onChange();
            return this.valid;
        }

        const generation = ++this._validationGeneration;
        const valuesSnapshot = { ...this._values };

        this._validating = true;
        this._asyncErrors = {};
        this.onChange();

        const nextErrors = await this.options.validateAsync(valuesSnapshot);

        if (generation !== this._validationGeneration) {
            return this.valid;
        }

        this._asyncErrors = Object.fromEntries(
            Object.entries(nextErrors ?? {}).filter(([, value]) => value !== undefined && value !== '')
        ) as FormErrors<T>;
        this._validating = false;
        this.onChange();
        return this.valid;
    }

    clearSubmitState(): void {
        this._submitError = undefined;
        this._submitResult = undefined;
        this.onChange();
    }

    setErrors(errors: FormErrors<T>, options: { touch?: boolean } = {}): void {
        this._syncErrors = Object.fromEntries(
            Object.entries(errors).filter(([, value]) => value !== undefined && value !== '')
        ) as FormErrors<T>;
        this._asyncErrors = {};

        if (options.touch) {
            const touched = new Set(this._touched);
            for (const key of Object.keys(this._syncErrors)) {
                touched.add(key);
            }
            this._touched = touched;
        }

        this.onChange();
    }

    clearErrors(options: { touch?: boolean } = {}): void {
        this._syncErrors = {};
        this._asyncErrors = {};

        if (options.touch === false) {
            this._touched = new Set();
        }

        this.onChange();
    }

    failSubmit(error: unknown, options: { errors?: FormErrors<T>; touch?: boolean } = {}): never {
        this._submitError = error;
        this._submitResult = undefined;

        if (options.errors) {
            this.setErrors(options.errors, { touch: options.touch });
        } else if (options.touch) {
            this.touchAll();
            this.onChange();
        } else {
            this.onChange();
        }

        throw error;
    }

    view<R extends TemplateResult>(options: FormViewOptions<T, R>): R | undefined {
        if (this._submitting) {
            return options.submitting?.(this._values, this);
        }

        if (this._validating) {
            return options.validating?.(this._values, this);
        }

        if (this._submitError !== undefined) {
            return options.error?.(this._submitError, this._values, this);
        }

        if (this._submitResult !== undefined) {
            return options.success?.(this._submitResult, this._values, this);
        }

        return options.idle?.(this._values, this);
    }

    async submit<R>(handler: (values: Readonly<T>, form: Form<T>) => Promise<R> | R): Promise<R> {
        const submitGeneration = ++this._submitGeneration;

        if (!this.validate()) {
            this.touchAll();
            throw new Error('Form validation failed');
        }

        if (!(await this.validateAsync())) {
            this.touchAll();
            throw new Error('Form validation failed');
        }

        this._submitting = true;
        this._submitError = undefined;
        this.onChange();

        try {
            const result = await handler(this._values, this);
            if (submitGeneration === this._submitGeneration) {
                this._submitResult = result;
                this._submitError = undefined;
            }
            return result;
        } catch (error) {
            if (submitGeneration === this._submitGeneration) {
                this._submitError = error;
                this._submitResult = undefined;
                this.onChange();
            }
            throw error;
        } finally {
            if (submitGeneration === this._submitGeneration) {
                this._submitting = false;
                this.onChange();
            }
        }
    }

    handleSubmit<R>(handler: (values: Readonly<T>, form: Form<T>) => Promise<R> | R): (event?: Event) => Promise<R> {
        return async (event?: Event) => {
            event?.preventDefault?.();
            return this.submit(handler);
        };
    }

    private runValidation(): void {
        const nextErrors = this.options.validate?.(this._values) ?? {};
        this._syncErrors = Object.fromEntries(
            Object.entries(nextErrors).filter(([, value]) => value !== undefined && value !== '')
        ) as FormErrors<T>;
    }

    private invalidateAsyncValidation(): void {
        this._validationGeneration++;
        this.clearScheduledAsyncValidation();
        this._asyncErrors = {};
        this._validating = false;
        if (this.options.validateAsyncOn === 'change' && this.options.validateAsync) {
            this.scheduleAsyncValidation();
        }
    }

    private scheduleAsyncValidation(): void {
        this.clearScheduledAsyncValidation();
        const debounceMs = this.options.validateAsyncDebounce ?? 150;
        this._validationTimeout = setTimeout(() => {
            this._validationTimeout = null;
            void this.validateAsync();
        }, debounceMs);
    }

    private clearScheduledAsyncValidation(): void {
        if (this._validationTimeout) {
            clearTimeout(this._validationTimeout);
            this._validationTimeout = null;
        }
    }
}

export function createForm<T extends Record<string, any>>(
    initialValues: T,
    onChange: () => void,
    options?: FormOptions<T>
): Form<T> {
    return new FormController(initialValues, onChange, options);
}
