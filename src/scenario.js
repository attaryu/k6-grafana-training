import execution from 'k6/execution';
import { Counter } from 'k6/metrics';
import { uuidv4 } from 'https://jslib.k6.io/k6-utils/1.4.0/index.js';

import { createContact } from './helper/contact.js';
import { registerUser, loginUser } from './helper/user.js';

export const options = {
  thresholds: {
    registration_counter_success: ['count>190'],
    registration_counter_error: ['count<10'],
  },
  scenarios: {
    userRegistration: {
      exec: 'userRegistration',
      executor: 'shared-iterations',
      vus: 10,
      iterations: 200,
      maxDuration: '30s',
    },
    contactCreation: {
      exec: 'contactCreation',
      executor: 'constant-vus',
      vus: 10,
      duration: '10s',
    },
  },
};

const registrationSuccessCounter = new Counter('registration_counter_success');
const registrationErrorCounter = new Counter('registration_counter_error');

export function userRegistration() {
  const response = registerUser({
    username: `user-${uuidv4()}`,
    password: 'test',
    name: 'test',
  });

  if (response.status === 200) {
    registrationSuccessCounter.add(1);
  } else {
    registrationErrorCounter.add(1);
  }
}

export function contactCreation() {
  const number = execution.vu.idInInstance > 10
    ? execution.vu.idInInstance % 10
    : execution.vu.idInInstance;

  const loginBodyRequest = {
    username: `user-${number}`,
    password: 'test',
  }

  const loginResponse = loginUser(loginBodyRequest);
  const token = loginResponse.json().data.token;

  const contact = {
    first_name: 'first',
    last_name: 'last',
    email: 'email@gmail.com',
  };

  createContact(contact, token);
}
