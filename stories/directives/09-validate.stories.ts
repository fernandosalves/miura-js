import { MiuraElement, html, css } from '@miura/miura-element';
import type { Meta, StoryObj } from '@storybook/web-components';

class ValidateDirectiveDemo extends MiuraElement {
    declare formData: {
        email: string;
        password: string;
        age: string;
        website: string;
        phone: string;
    };
    declare validationErrors: Record<string, string[]>;
    declare isValid: boolean;
    declare isSubmitting: boolean;

    static properties = {
        formData: { type: Object, default: () => ({
            email: '',
            password: '',
            age: '',
            website: '',
            phone: ''
        }), state: true },
        validationErrors: { type: Object, default: () => ({}), state: true },
        isValid: { type: Boolean, default: false, state: true },
        isSubmitting: { type: Boolean, default: false, state: true }
    };

    static get styles() {
        return css`
            :host {
                display: block;
                font-family: 'Helvetica Neue', Arial, sans-serif;
                max-width: 800px;
                margin: 0 auto;
                padding: 20px;
            }

            .validate-demo {
                background: white;
                border-radius: 8px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                padding: 20px;
            }

            .demo-section {
                margin-bottom: 30px;
                padding: 20px;
                border: 1px solid #eee;
                border-radius: 8px;
                background: #fafafa;
            }

            h3 {
                color: #E91E63;
                margin-top: 0;
                display: flex;
                align-items: center;
                gap: 10px;
            }

            .form-group {
                margin-bottom: 20px;
            }

            label {
                display: block;
                margin-bottom: 8px;
                font-weight: 600;
                color: #333;
            }

            input, textarea {
                width: 100%;
                padding: 12px;
                border: 2px solid #ddd;
                border-radius: 6px;
                font-size: 16px;
                transition: border-color 0.3s ease;
                box-sizing: border-box;
            }

            input:focus, textarea:focus {
                outline: none;
                border-color: #E91E63;
                box-shadow: 0 0 0 3px rgba(233, 30, 99, 0.1);
            }

            input.valid {
                border-color: #4CAF50;
                background-color: #f8fff8;
            }

            input.invalid {
                border-color: #f44336;
                background-color: #fff8f8;
            }

            .error-message {
                color: #f44336;
                font-size: 14px;
                margin-top: 5px;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .success-message {
                color: #4CAF50;
                font-size: 14px;
                margin-top: 5px;
                display: flex;
                align-items: center;
                gap: 5px;
            }

            .validation-status {
                background: #f5f5f5;
                padding: 15px;
                border-radius: 8px;
                margin: 15px 0;
                font-family: monospace;
            }

            .status-row {
                display: flex;
                justify-content: space-between;
                margin: 8px 0;
                padding: 4px 0;
                border-bottom: 1px solid #ddd;
            }

            .status-row:last-child {
                border-bottom: none;
            }

            .controls {
                display: flex;
                gap: 10px;
                margin: 20px 0;
                flex-wrap: wrap;
            }

            button {
                background: #E91E63;
                color: white;
                border: none;
                padding: 12px 24px;
                border-radius: 6px;
                cursor: pointer;
                font-size: 16px;
                transition: background-color 0.2s;
            }

            button:hover {
                background: #c2185b;
            }

            button:disabled {
                background: #ccc;
                cursor: not-allowed;
            }

            button.secondary {
                background: #9c27b0;
            }

            button.secondary:hover {
                background: #7b1fa2;
            }

            .validation-examples {
                display: grid;
                grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
                gap: 20px;
                margin: 20px 0;
            }

            .example-card {
                background: white;
                border-radius: 8px;
                padding: 20px;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
                border: 1px solid #eee;
            }

            .example-title {
                font-weight: bold;
                margin-bottom: 10px;
                color: #333;
            }

            .example-description {
                color: #666;
                font-size: 14px;
                margin-bottom: 15px;
            }

            .code-example {
                background: #f8f9fa;
                border: 1px solid #e9ecef;
                border-radius: 4px;
                padding: 15px;
                font-family: 'Courier New', monospace;
                font-size: 12px;
                overflow-x: auto;
                margin: 10px 0;
            }

            .error-summary {
                background: #ffebee;
                border: 1px solid #ffcdd2;
                border-radius: 6px;
                padding: 15px;
                margin: 15px 0;
            }

            .error-summary h4 {
                color: #c62828;
                margin-top: 0;
                margin-bottom: 10px;
            }

            .error-list {
                list-style: none;
                padding: 0;
                margin: 0;
            }

            .error-list li {
                color: #d32f2f;
                margin: 5px 0;
                padding: 5px 0;
                border-bottom: 1px solid #ffcdd2;
            }

            .error-list li:last-child {
                border-bottom: none;
            }

            .icon {
                font-size: 16px;
            }

            .field-status {
                display: flex;
                align-items: center;
                gap: 8px;
                margin-top: 5px;
                font-size: 12px;
            }

            .status-indicator {
                width: 8px;
                height: 8px;
                border-radius: 50%;
                display: inline-block;
            }

            .status-indicator.valid {
                background: #4CAF50;
            }

            .status-indicator.invalid {
                background: #f44336;
            }

            .status-indicator.pending {
                background: #ff9800;
            }
        `;
    }

    handleInputChange = (field: string) => (event: Event) => {
        const target = event.target as HTMLInputElement;
        this.formData = { ...this.formData, [field]: target.value };
    };

    validateForm = () => {
        this.isSubmitting = true;
        
        // Simulate validation delay
        setTimeout(() => {
            const errors: Record<string, string[]> = {};
            
            // Email validation
            if (!this.formData.email) {
                errors.email = ['Email is required'];
            } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.formData.email)) {
                errors.email = ['Please enter a valid email address'];
            }
            
            // Password validation
            if (!this.formData.password) {
                errors.password = ['Password is required'];
            } else if (this.formData.password.length < 8) {
                errors.password = ['Password must be at least 8 characters long'];
            } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(this.formData.password)) {
                errors.password = ['Password must contain uppercase, lowercase, and number'];
            }
            
            // Age validation
            if (this.formData.age) {
                const age = parseInt(this.formData.age);
                if (isNaN(age) || age < 13 || age > 120) {
                    errors.age = ['Age must be between 13 and 120'];
                }
            }
            
            // Website validation
            if (this.formData.website && !/^https?:\/\/.+/.test(this.formData.website)) {
                errors.website = ['Please enter a valid URL starting with http:// or https://'];
            }
            
            // Phone validation
            if (this.formData.phone && !/^[\+]?[1-9][\d]{0,15}$/.test(this.formData.phone.replace(/\s/g, ''))) {
                errors.phone = ['Please enter a valid phone number'];
            }
            
            this.validationErrors = errors;
            this.isValid = Object.keys(errors).length === 0;
            this.isSubmitting = false;
            
            if (this.isValid) {
                console.log('Form is valid!', this.formData);
            }
        }, 1000);
    };

    resetForm = () => {
        this.formData = {
            email: '',
            password: '',
            age: '',
            website: '',
            phone: ''
        };
        this.validationErrors = {};
        this.isValid = false;
        this.isSubmitting = false;
    };

    getFieldStatus = (field: string) => {
        if (this.validationErrors[field]) return 'invalid';
        if (this.formData[field]) return 'valid';
        return 'pending';
    };

    protected override template() {
        return html`
            <div class="validate-demo">
                <h2>✅ Validation Directive Demo</h2>
                <p>Real-time form validation with custom rules and error handling.</p>

                <!-- Validation Status -->
                <div class="validation-status">
                    <div class="status-row">
                        <span>Form Valid:</span>
                        <span>${this.isValid ? '✅ Yes' : '❌ No'}</span>
                    </div>
                    <div class="status-row">
                        <span>Fields with Errors:</span>
                        <span>${Object.keys(this.validationErrors).length}</span>
                    </div>
                    <div class="status-row">
                        <span>Submission Status:</span>
                        <span>${this.isSubmitting ? '🔄 Validating...' : '⏸️ Ready'}</span>
                    </div>
                </div>

                <!-- Error Summary -->
                ${Object.keys(this.validationErrors).length > 0 ? html`
                    <div class="error-summary">
                        <h4>❌ Validation Errors</h4>
                        <ul class="error-list">
                            ${Object.entries(this.validationErrors).map(([field, errors]) => 
                                errors.map(error => html`
                                    <li>• ${field.charAt(0).toUpperCase() + field.slice(1)}: ${error}</li>
                                `)
                            )}
                        </ul>
                    </div>
                ` : ''}

                <!-- Validation Form -->
                <div class="demo-section">
                    <h3>📝 Validation Form</h3>
                    <p>Fill out the form below to see real-time validation in action.</p>
                    
                    <form @submit="${(e: Event) => { e.preventDefault(); this.validateForm(); }}">
                        <div class="form-group">
                            <label for="email">Email Address *</label>
                            <input 
                                id="email"
                                type="email" 
                                placeholder="Enter your email"
                                .value="${this.formData.email}"
                                @input="${this.handleInputChange('email')}"
                                #validate=${{
                                    rules: [
                                        { required: true, message: 'Email is required' },
                                        { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Please enter a valid email address' }
                                    ],
                                    validateOn: 'blur',
                                    onValidation: (errors: string[]) => {
                                        if (errors.length > 0) {
                                            this.validationErrors = { ...this.validationErrors, email: errors };
                                        } else {
                                            const { email, ...rest } = this.validationErrors;
                                            this.validationErrors = rest;
                                        }
                                    }
                                }}
                                class="${this.getFieldStatus('email')}"
                            />
                            <div class="field-status">
                                <span class="status-indicator ${this.getFieldStatus('email')}"></span>
                                ${this.validationErrors.email ? 
                                    html`<span class="error-message">❌ ${this.validationErrors.email[0]}</span>` :
                                    this.formData.email ? 
                                        html`<span class="success-message">✅ Email is valid</span>` :
                                        html`<span>⏳ Enter your email</span>`
                                }
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="password">Password *</label>
                            <input 
                                id="password"
                                type="password" 
                                placeholder="Enter your password"
                                .value="${this.formData.password}"
                                @input="${this.handleInputChange('password')}"
                                #validate=${{
                                    rules: [
                                        { required: true, message: 'Password is required' },
                                        { minLength: 8, message: 'Password must be at least 8 characters long' },
                                        { pattern: /(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, message: 'Password must contain uppercase, lowercase, and number' }
                                    ],
                                    validateOn: 'blur',
                                    onValidation: (errors: string[]) => {
                                        if (errors.length > 0) {
                                            this.validationErrors = { ...this.validationErrors, password: errors };
                                        } else {
                                            const { password, ...rest } = this.validationErrors;
                                            this.validationErrors = rest;
                                        }
                                    }
                                }}
                                class="${this.getFieldStatus('password')}"
                            />
                            <div class="field-status">
                                <span class="status-indicator ${this.getFieldStatus('password')}"></span>
                                ${this.validationErrors.password ? 
                                    html`<span class="error-message">❌ ${this.validationErrors.password[0]}</span>` :
                                    this.formData.password ? 
                                        html`<span class="success-message">✅ Password meets requirements</span>` :
                                        html`<span>⏳ Enter your password</span>`
                                }
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="age">Age</label>
                            <input 
                                id="age"
                                type="number" 
                                placeholder="Enter your age"
                                .value="${this.formData.age}"
                                @input="${this.handleInputChange('age')}"
                                #validate=${{
                                    rules: [
                                        { range: [13, 120], message: 'Age must be between 13 and 120' }
                                    ],
                                    validateOn: 'blur',
                                    onValidation: (errors: string[]) => {
                                        if (errors.length > 0) {
                                            this.validationErrors = { ...this.validationErrors, age: errors };
                                        } else {
                                            const { age, ...rest } = this.validationErrors;
                                            this.validationErrors = rest;
                                        }
                                    }
                                }}
                                class="${this.getFieldStatus('age')}"
                            />
                            <div class="field-status">
                                <span class="status-indicator ${this.getFieldStatus('age')}"></span>
                                ${this.validationErrors.age ? 
                                    html`<span class="error-message">❌ ${this.validationErrors.age[0]}</span>` :
                                    this.formData.age ? 
                                        html`<span class="success-message">✅ Age is valid</span>` :
                                        html`<span>⏳ Optional field</span>`
                                }
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="website">Website</label>
                            <input 
                                id="website"
                                type="url" 
                                placeholder="https://example.com"
                                .value="${this.formData.website}"
                                @input="${this.handleInputChange('website')}"
                                #validate=${{
                                    rules: [
                                        { pattern: /^https?:\/\/.+/, message: 'Please enter a valid URL starting with http:// or https://' }
                                    ],
                                    validateOn: 'blur',
                                    onValidation: (errors: string[]) => {
                                        if (errors.length > 0) {
                                            this.validationErrors = { ...this.validationErrors, website: errors };
                                        } else {
                                            const { website, ...rest } = this.validationErrors;
                                            this.validationErrors = rest;
                                        }
                                    }
                                }}
                                class="${this.getFieldStatus('website')}"
                            />
                            <div class="field-status">
                                <span class="status-indicator ${this.getFieldStatus('website')}"></span>
                                ${this.validationErrors.website ? 
                                    html`<span class="error-message">❌ ${this.validationErrors.website[0]}</span>` :
                                    this.formData.website ? 
                                        html`<span class="success-message">✅ URL is valid</span>` :
                                        html`<span>⏳ Optional field</span>`
                                }
                            </div>
                        </div>

                        <div class="form-group">
                            <label for="phone">Phone Number</label>
                            <input 
                                id="phone"
                                type="tel" 
                                placeholder="+1 234 567 8900"
                                .value="${this.formData.phone}"
                                @input="${this.handleInputChange('phone')}"
                                #validate=${{
                                    rules: [
                                        { pattern: /^[\+]?[1-9][\d]{0,15}$/, message: 'Please enter a valid phone number' }
                                    ],
                                    validateOn: 'blur',
                                    onValidation: (errors: string[]) => {
                                        if (errors.length > 0) {
                                            this.validationErrors = { ...this.validationErrors, phone: errors };
                                        } else {
                                            const { phone, ...rest } = this.validationErrors;
                                            this.validationErrors = rest;
                                        }
                                    }
                                }}
                                class="${this.getFieldStatus('phone')}"
                            />
                            <div class="field-status">
                                <span class="status-indicator ${this.getFieldStatus('phone')}"></span>
                                ${this.validationErrors.phone ? 
                                    html`<span class="error-message">❌ ${this.validationErrors.phone[0]}</span>` :
                                    this.formData.phone ? 
                                        html`<span class="success-message">✅ Phone number is valid</span>` :
                                        html`<span>⏳ Optional field</span>`
                                }
                            </div>
                        </div>

                        <div class="controls">
                            <button type="submit" ?disabled="${this.isSubmitting}">
                                ${this.isSubmitting ? '🔄 Validating...' : '✅ Submit Form'}
                            </button>
                            <button type="button" class="secondary" @click="${this.resetForm}">
                                🔄 Reset Form
                            </button>
                        </div>
                    </form>
                </div>

                <!-- Code Examples -->
                <div class="demo-section">
                    <h3>💻 Code Examples</h3>
                    
                    <div class="code-example">
// Basic validation
&lt;input #validate=\${{
  rules: [
    { required: true, message: 'This field is required' },
    { minLength: 3, message: 'Minimum 3 characters' }
  ],
  validateOn: 'blur',
  onValidation: (errors) => console.log('Validation errors:', errors)
}} /&gt;

// Pattern validation
&lt;input #validate=\${{
  rules: [
    { pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: 'Invalid email format' }
  ]
}} /&gt;

// Custom validation function
&lt;input #validate=\${{
  rules: [
    { 
      validator: (value) => value.length > 0 && value.length <= 10,
      message: 'Length must be between 1 and 10 characters'
    }
  ]
}} /&gt;
                    </div>
                </div>
            </div>
        `;
    }
}

customElements.define('validate-directive-demo', ValidateDirectiveDemo);

const meta: Meta<ValidateDirectiveDemo> = {
    title: 'Miura/Directives/Utility/10. Validation',
    component: 'validate-directive-demo',
    tags: ['autodocs'],
    parameters: {
        docs: {
            description: {
                component: `
# Validation Directive (#validate)

The validation directive provides comprehensive form validation with real-time feedback, custom rules, and error handling.

## Features

- **Real-time Validation**: Validate on input, blur, or submit
- **Custom Rules**: Required, pattern, length, range, and custom validators
- **Error Handling**: Detailed error messages and visual feedback
- **Multiple Validation Modes**: Immediate, on blur, or on submit
- **Accessibility**: Screen reader friendly error messages

## Basic Usage

\`\`\`typescript
<input #validate=\${{
  rules: [
    { required: true, message: 'This field is required' },
    { minLength: 3, message: 'Minimum 3 characters' }
  ],
  validateOn: 'blur',
  onValidation: (errors) => console.log('Validation errors:', errors)
}} />
\`\`\`

## Validation Rules

- **required**: Field must have a value
- **pattern**: Regex pattern validation
- **minLength/maxLength**: String length validation
- **min/max**: Number range validation
- **range**: Array with min and max values
- **validator**: Custom validation function

## Validation Triggers

- **input**: Validate on every input change
- **blur**: Validate when field loses focus
- **submit**: Validate only on form submission
- **custom**: Custom trigger function

## Options

- \`rules\`: Array - Array of validation rules
- \`validateOn\`: String - When to trigger validation
- \`onValidation\`: Function - Called with validation results
- \`onValid\`: Function - Called when field becomes valid
- \`onInvalid\`: Function - Called when field becomes invalid

## Built-in Validators

- **Email**: Email format validation
- **URL**: URL format validation
- **Phone**: Phone number validation
- **Password**: Password strength validation
- **Number**: Numeric value validation

## Use Cases

- **Form Validation**: Real-time form field validation
- **User Input**: Input sanitization and validation
- **Data Entry**: Ensuring data quality and format
- **API Integration**: Pre-validate data before submission
- **User Experience**: Immediate feedback for better UX

## Best Practices

1. Provide clear, actionable error messages
2. Use appropriate validation triggers for your use case
3. Consider accessibility with screen reader support
4. Validate on both client and server side
5. Use visual indicators for validation status
                `
            }
        }
    }
};

export default meta;
type Story = StoryObj<ValidateDirectiveDemo>;

export const Default: Story = {
    args: {}
}; 