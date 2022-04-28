/*
 * @Author: mereith
 * @Date: 2022-04-28 11:16:14
 * @LastEditTime: 2022-04-28 11:16:14
 * @LastEditors: mereith
 * @Description: nice
 * @FilePath: \van-nav-chrome\utils\index.js
 */
// Example POST method implementation:
async function postData(url = '', data = {}) {
  // Default options are marked with *
  const response = await fetch(url, {
    method: 'POST', // *GET, POST, PUT, DELETE, etc.
    mode: 'cors', // no-cors, *cors, same-origin
    cache: 'no-cache', // *default, no-cache, reload, force-cache, only-if-cached
    // credentials: 'same-origin', // include, *same-origin, omit
    headers: {
      'Content-Type': 'application/json',
      "authorization": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJleHAiOjQ4MDMyODg3ODUsImlkIjoxNjQ5Njg4Nzg1LCJuYW1lIjoiZGVmYXVsdCJ9.dXSIJBQ7R3eCVh5WkyG9Yn83i09NSlG6EKuZufbhUJE",
      // 'Content-Type': 'application/x-www-form-urlencoded',
    },
    redirect: 'follow', // manual, *follow, error
    referrerPolicy: 'no-referrer', // no-referrer, *no-referrer-when-downgrade, origin, origin-when-cross-origin, same-origin, strict-origin, strict-origin-when-cross-origin, unsafe-url
    body: JSON.stringify(data) // body data type must match "Content-Type" header
  });
  return response.json(); // parses JSON response into native JavaScript objects
}