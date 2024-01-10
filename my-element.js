import { LitElement, html, css } from 'lit';
import { v4 as uuidv4 } from 'uuid';

class RegistrationForm extends LitElement {
  static styles = css`
  /* Style for form container */
  .form-container {
    max-width: 400px;
    margin: 0 auto;
    padding: 20px;
    background-color: #f4f4f4;
    border-radius: 8px;
    box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  }

  /* Style for headings */
  h1 {
    text-align: center;
    color: #333;
  }

  /* Style for labels */
  label {
    display: block;
    margin-bottom: 5px;
    color: #333;
  }

  /* Style for inputs and selects */
  input[type='text'],
  input[type='email'],
  select {
    width: 100%;
    padding: 8px;
    margin-bottom: 15px;
    border-radius: 5px;
    border: 1px solid #ccc;
  }

  /* Style for the error message */
  .error {
    color: red;
    margin-bottom: 10px;
  }

  /* Style for the submit button */
  button[type='submit'] {
    width: 100%;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color: #007bff;
    color: #fff;
    cursor: pointer;
  }

  /* Style for the submit button on hover */
  button[type='submit']:hover {
    background-color: #0056b3;
  }

  /* Style for the cancel button */
  button[type='reset'] {
    width: 100%;
    padding: 10px;
    border: none;
    border-radius: 5px;
    background-color: #ccc;
    color: #333;
    cursor: pointer;
    / * margin-top: 10px; */
  }

  /* Style for the cancel button on hover */
  button[type='reset']:hover {
    background-color: #999;
  }

  /* Style for the buttons container */
  .button-container {
    display: flex;
    justify-content: space-between;
    margin-top: 15px;
  }

  /* Style for the buttons */
  button[type='submit'],
  button[type='reset'] {
    width: 48%; /* Adjust the width as needed */
  }
`;


  firstName = '';
  lastName = '';
  state = '';
  affiliation = '';
  email = '';
  states = ['NY', 'CA', 'FL']; // Replace with your state list
  affiliations = {
    'NY': ['L100', 'L102', 'L105'],
    'CA': ['C31', 'C1', 'C3'],
    'FL': ['R-Retiree 1', 'R-Retiree 2']
  }; // Replace with your affiliation list based on states
  emailError = '';

  async handleSubmit(e) {
    const validEmail = this.validateEmail(this.email);
    if (!validEmail) {
      this.emailError = 'Invalid email format';
    } else {
      if (e) {
        e.preventDefault(); // Prevent the default form submission behavior
        //document.getElementById('registerButton').disabled = true;
      }
      // Save data to Dynamo table
      this.saveData(e);

    }
  }

  resetForm() {
    const form = this.shadowRoot.querySelector('form');
    console.log("form", form);
    if (form) {
      form.reset();
      this.firstName = '';
      this.lastName = '';
      this.state = '';
      this.affiliation = '';
      this.email = '';
    }
  }

  validateEmail(email) {
    // Validate email using a simple regex for domain format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }

  saveData(e) {

    // Logic to save data to Dynamo DB
    // For demo purposes, display user selection on the console
    const registrationData = {
      id: uuidv4(),
      firstname: this.firstName,
      lastname: this.lastName,
      state: this.state,
      affiliation: this.affiliation,
      email: this.email,
      role: 'User',
      status: 'Pending'
    };
    console.log('User Selection:', registrationData);



    fetch('https://83k4jems55.execute-api.us-east-1.amazonaws.com/users', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(registrationData),
    })
      .then(async (response) => {
        console.log("response", response);
        if (response.ok) {
          //Show success message
          this.showSuccessMessage();
          this.resetForm();
          if (e) {
            // Remove preventDefault after successful registration
            e.preventDefault = null;
          }
          this.updateAffiliationOptions();
        } else {
          alert('Registration failed. Please try again later.');
        }
      })
      .catch((error) => {
        console.error('Error registering:', error);
        alert('There was an error during registration. Please try again later.');
      });
  }



  showSuccessMessage() {
    alert('Registration is succesfully.');
  }

  onStateChange(e) {
    this.state = e.target.value;
    this.affiliation = ''; // Reset affiliation on state change
    console.log(this.state);
    this.updateAffiliationOptions(); // Update affiliation options
  }

  onAffiliationChange(e) {
    this.affiliation = e.target.value;
    console.log(this.affiliation);
    this.updateAffiliationOptions(); // Update affiliation options
  }

  updateAffiliationOptions() {
    // Trigger a re-render to update the affiliation dropdown based on the selected state
    this.requestUpdate();
  }

  render() {
    return html`
      <div class="form-container">
      <h1>Registration Form</h1>
        <form @reset=${this.resetForm} @submit=${this.handleSubmit}>
          <label for="firstName">First Name:</label>
          <input
            id="firstName"
            type="text"
            .value=${this.firstName}
            @input=${(e) => {
        this.firstName = e.target.value;
      }}
            required
          />

          <label for="lastName">Last Name:</label>
          <input
            id="lastName"
            type="text"
            .value=${this.lastName}
            @input=${(e) => {
        this.lastName = e.target.value;
      }}
            required
          />

     
          <label for="state">State:</label>
          <select
            id="state"
            @change=${this.onStateChange}
            required
          >
            <option value="" selected disabled>Select State</option>
            ${this.states.map(
        (state) => html`<option value=${state}>${state}</option>`
      )}
          </select>

       

          <label for="affiliation">Affiliation:</label>
          <select
            id="affiliation" .disabled=${!this.state}
            @change=${this.onAffiliationChange}
            required
          >
            <option value="" selected disabled>Select Affiliation</option>
            ${this.state ? this.affiliations[this.state]?.map(
        (affiliation) => html`<option value=${affiliation}>${affiliation}</option>`
      ) : ''}
          </select>

       

          

          <label for="email">Email:</label>
          <input
            id="email"
            type="email"
            .value=${this.email}
            @input=${(e) => {
        this.email = e.target.value;
        this.emailError = ''; // Clear error when typing
      }}
            required
          />
          <div class="error">${this.emailError}</div>

          <!-- Buttons container -->
          <div class="button-container">
            <!-- Register button -->
            <button id="registerButton"  type="submit">Register</button>
      
            <!-- Cancel button -->
            <button type="reset">Cancel</button>
          </div>
        </form>
      </div>     
    `;
  }
}


customElements.define('registration-form', RegistrationForm);

