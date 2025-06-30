import execution from 'k6/execution';

import { loginUser } from './helper/user.js';
import { createContact } from './helper/contact.js';

export const options = {
  // A number specifying the number of VUs to run concurrently.
  vus: 10,
  // A string specifying the total duration of the test run.
  duration: '10s',
};

export function setup() {
  const totalContact = parseInt(__ENV.TOTAL_CONTACT) || 10;
  const data = [];

  for (let i = 0; i < totalContact; i++) {
    data.push({
      first_name: `first-${i}`,
      last_name: `last-${i}`,
      email: `email${i}@gmail.com`,
    });
  }

  return data;
}

export function getToken() {
  const loginBodyRequest = {
    username: `user-${execution.vu.idInInstance}`,
    password: 'test',
  }

  const loginResponse = loginUser(loginBodyRequest);

  return loginResponse.json().data.token;
}

export default function (data) {
  const token = getToken();

  for (const contact of data) {
    createContact(contact, token);
  }
}

export function teardown(data) {
  console.info(`Finish create ${data.length} contacts`);
}
