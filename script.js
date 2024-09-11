document.addEventListener('DOMContentLoaded', () => {

  const inputValidators = {
    firstName: new InputValidator('#first-name', 
    {
      'patternMismatch': 
      '* Only letters and word separators (spaces, hyphens and apostrophes)'
    }),
    lastName: new InputValidator('#last-name', 
    {
      'patternMismatch':
      '* Only letters and word separators (spaces, hyphens and apostrophes)'
    }),
    email: new InputValidator('#email', 
    {
      'patternMismatch': '* Not a valid email'
    }),
    phoneNumber: new InputValidator('#phone-number', 
    {
      'patternMismatch': '* Not a valid phone number'
    }),
    password: new InputValidator('#password', 
    {
      'patternMismatch': '* At least numbers, uppercase and lowercase letters'
    }),
    passwordConfirm: new InputValidator('#password-confirm', 
    {
      'valueMissing': '* Confirm your password',
      'passwordMismatch': '* Passwords do not match'
    })
  };  

  const passwordValidator = new PasswordConfirmValidator(
    inputValidators.password,
    inputValidators.passwordConfirm
  );
  
  // Filter the fields that follow standard validation (InputValidator)

  Object.entries(inputValidators)
    .filter(([name, _]) => !/password/.test(name))
    .forEach(([_, validator]) => {
      validator.input.addEventListener('blur', event => {

        if (!validator.input.checkValidity()) {
          validator.showError();
        } else {
          validator.removeError();
        }
      });
    });

    /*
      Filter the fields that follow custom validation (only passwords, in this
      case), managed by PasswordConfirmValidator, that has a very specific
      error handling flow
    */

    Object.entries(inputValidators)
      .filter(([name, _]) => /password/.test(name))
      .forEach(([_, validator]) => {

        validator.input.addEventListener('blur', event => {
          passwordValidator.checkValidity();
        });
      });

  /* 
    Filter now just the password InputValidator, cause in this case i actually
    want passwordConfirm to perform default validation (if not, submitting a 
    correct form with an empty confirm password, wouldn't show any error, due to
    how PasswordConfirmValidator.checkValidity() performs validation)
  */

  document.querySelector('form').addEventListener('submit', event => {
    Object.entries(inputValidators)
      .filter(([name, _]) => name !== 'password')
      .forEach(([_, validator]) => {

        if (!validator.input.checkValidity()) {
          validator.showError();
          event.preventDefault();
        }
      });

    if(!passwordValidator.checkValidity()) {
      event.preventDefault();
    }
  });
});

function InputValidator(selector, customMessages = {}) {
  this.input = document.querySelector(selector);
  this.errorDisplay = document.querySelector(`${selector} + .error`);

  // Use a Map so the showError function show them in the desired order

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

  Object.entries(customMessages).forEach(([type, message]) => {
    this.errorMessages.set(type, message);
  });

  // Accepts optional parameter to make custom errors displayable

  this.showError = function(errorType) {
    const { validity } = this.input;

    for (const [type, message] of this.errorMessages) {
      if (errorType === type || validity[type]) {
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

function PasswordConfirmValidator(passwordValidator, confirmValidator) {
  this.passwordValidator = passwordValidator;
  this.confirmValidator = confirmValidator;
  this.confirmValidator.userHasInteracted = false;

  this.confirmValidator.input.addEventListener('focus', () => {
    this.confirmValidator.userHasInteracted = true;
  });

  this.isPasswordMatching = function() {
    const passwordValue = this.passwordValidator.input.value;
    const confirmValue = this.confirmValidator.input.value;
    return passwordValue === confirmValue;
  }

  /*
    Performs validation-displaying errors logic:
    
    1. Checks password input validity first (we dont want to show confirm
    password errors if there is a password field error, to guide the user)

    2. If user has interacted and password field is fine, checks confirm 
    password, shows default validation errors in case

    3. If confirm password has no default validation errors, checks if the 
    passwords are matching

    Remember this is done after completing password and confirm-password (and,
    ofc on submit), ensuring consistency
  */

  this.checkValidity = function() {
    if (!this.passwordValidator.input.checkValidity()) {
      this.confirmValidator.removeError();
      this.passwordValidator.showError();
      return false;
    } 

    this.passwordValidator.removeError();

    if (this.confirmValidator.userHasInteracted) {  
      if (!this.passwordValidator.input.checkValidity()) {

        this.confirmValidator.showError();
        return false;
      } 

      if (!this.isPasswordMatching()) {
        this.confirmValidator.showError('passwordMismatch');
        return false;
      }

      this.confirmValidator.removeError();
      return true;
    }
    
  }
}

