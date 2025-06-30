import { check, fail } from 'k6';
import execution from 'k6/execution';
import http from 'k6/http';

export const options = {
  // A number specifying the number of VUs to run concurrently.
  vus: 10,
  // A string specifying the total duration of the test run.
  duration: '10s',
};

export default function () {
  const loginBodyRequest = {
    username: `user-${execution.vu.idInInstance}`,
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
    fail(`Failed to login user ${loginBodyRequest.username}`);
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
    fail(`Failed to get user ${loginBodyRequest.username}`);
  }

  const currentBodyResponse = currentResponse.json();

}
