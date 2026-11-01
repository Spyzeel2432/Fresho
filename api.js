// Tiny fetch wrapper. In AngularJS, replace with $http and an interceptor.
const API = '/api';
async function api(path, method = 'GET', body) {
  const token = localStorage.getItem('fresho_token');
  const res = await fetch(API + path, {
    method, headers: { 'Content-Type': 'application/json', ...(token && { Authorization: 'Bearer ' + token }) },
    body: body && JSON.stringify(body)
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || 'Something went wrong');
  return data;
}
// Example: const { token } = await api('/auth/login', 'POST', { email, password }); localStorage.setItem('fresho_token', token);
