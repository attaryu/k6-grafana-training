import { check, fail } from 'k6';
import http from 'k6/http';

export const options = {
  // A number specifying the number of VUs to run concurrently.
  vus: 10,
  // A string specifying the total duration of the test run.
  duration: '10s',
};

export default function () {
  const uniqueId = new Date().getTime();
  const registerBodyRequest = {
    username: `user-${uniqueId}`,
    password: 'test',
    name: 'test',
  };

  const registerResponse = http.post('http://localhost:3000/api/users', JSON.stringify(registerBodyRequest), {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  });

  const checkRegister = check(registerResponse, {
    'register response status must 200': (res) => res.status === 200,
    'register response data must not null': (res) => res.json().data !== null,
  });

  if (!checkRegister) {
    fail(`Failed to register user ${registerResponse.status}`);
  }

  const loginBodyRequest = {
    username: `user-${uniqueId}`,
    password: 'test',
  }

  const loginResponse = http.post('http://localhost:3000/api/users/login', JSON.stringify(loginBodyRequest), {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  });

  const checkLogin = check(loginResponse, {
    'login response status must 200': (res) => res.status === 200,
    'login response token must exists': (res) => res.json().data.token !== null,
  });

  if (!checkLogin) {
    fail(`Failed to login user ${registerBodyRequest.username}`);
  }

  const loginBodyResponse = loginResponse.json();

  const currentResponse = http.get('http://localhost:3000/api/users/current', {
    headers: {
      'Authorization': loginBodyResponse.data.token,
    }
  });

  const checkCurrent = check(currentResponse, {
    'current response status must 200': (res) => res.status === 200,
    'current response data must not null': (res) => res.json().data !== null,
  });

  if (!checkCurrent) {
    fail(`Failed to get user ${registerBodyRequest.username}`);
  }

  const currentBodyResponse = currentResponse.json();

}
