document.addEventListener('DOMContentLoaded', () => {

  const inputValidators = [
    new InputValidator('#first-name', 
    [
      'patternMismatch',
      '* Only letters and word separators (spaces, hyphens and apostrophes)'
    ]),
    new InputValidator('#last-name', 
    [
      'patternMismatch',
      '* Only letters and word separators (spaces, hyphens and apostrophes)'
    ]),
    new InputValidator('#email', 
    [
      'patternMismatch',
      '* Not a valid email'
    ]),
    new InputValidator('#phone-number', 
    [
      'patternMismatch',
      '* Not a valid phone number'
    ]),
    new InputValidator('#password', 
    [
      'patternMismatch',
      '* At least numbers, uppercase and lowercase letters'
    ]),
    new InputValidator('#password-confirm')
  ];  
  
  inputValidators.forEach(validator => {
    validator.input.addEventListener('blur', event => {
      if (validator.input.checkValidity()) {
        validator.removeError();
      } else {
        validator.showError();
      }
    });
  });

  document.querySelector('form').addEventListener('submit', event => {
    inputValidators.forEach(validator => {
      if (!validator.input.checkValidity()) {
        validator.showError();
        event.preventDefault();
      }
    });
  });
});

function InputValidator(selector, ...customMessages) {
  this.input = document.querySelector(selector);
  this.errorDisplay = document.querySelector(`${selector} + .error`);

  this.errorMessages = new Map([
    ['valueMissing', '* Required field'],
    [
      'tooShort', 
      `* Must be between ${this.input.minLength} and ` + 
      `${this.input.maxLength} characters long`
    ],
    [
      'tooLong', 
      `* Must be between ${this.input.minLength} and ` + 
      `${this.input.maxLength} characters long`
    ],
    ['patternMismatch', '* Match the requested pattern']
  ]);

  customMessages.forEach(([type, message]) => {
    this.errorMessages.set(type, message);
  });

  this.showError = function() {
    const { validity } = this.input;

    for (const [type, message] of this.errorMessages) {
      if (validity[type]) {
        this.errorDisplay.textContent = message;
        this.input.classList.add('invalid');
        break;
      }
    } 
  }

  this.removeError = function() {
    this.errorDisplay.textContent = '';
    this.input.classList.remove('invalid');
  }
}