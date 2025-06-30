import { check } from 'k6';
import http from 'k6/http';

export function registerUser(body) {
  const registerResponse = http.post('http://localhost:3000/api/users', JSON.stringify(body), {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  });

  check(registerResponse, {
    'register response status must 200': (res) => res.status === 200,
    'register response data must not null': (res) => res.json().data !== null,
  });

  return registerResponse;
}

export function loginUser(body) {
  const loginResponse = http.post('http://localhost:3000/api/users/login', JSON.stringify(body), {
    headers: {
      'Accept': 'application/json',
      'Content-Type': 'application/json',
    }
  });

  check(loginResponse, {
    'login response status must 200': (res) => res.status === 200,
    'login response token must exists': (res) => res.json().data.token !== null,
  });

  return loginResponse;
}

export function getUser(token) {
  const currentResponse = http.get('http://localhost:3000/api/users/current', {
    headers: {
      'Authorization': token,
    }
  });

  check(currentResponse, {
    'current response status must 200': (res) => res.status === 200,
    'current response data must not null': (res) => res.json().data !== null,
  });

  return currentResponse;
}
