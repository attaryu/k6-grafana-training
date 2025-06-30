import { check } from 'k6';
import http from 'k6/http';

export function createContact(body, token) {
  const response = http.post('http://localhost:3000/api/contacts', JSON.stringify(body), {
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'Authorization': token,
    },
  });

  check(response, {
    'create contact status is 200': (res) => res.status === 200,
  });

  return response;
}