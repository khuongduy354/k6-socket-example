import http from "k6/http";

export function makeConnection(domain) {
  let res;

  // Establishing a `polling` transport and getting the `sid`.
  res = http.get(
    `http://${domain}/socket.io/?EIO=4&transport=polling&t=${hashDate()}`
  );

  const sid = getSid(res.body);

  const data = `40`;
  const headers = { "Content-type": "text/plain;charset=UTF-8" };

  // `message connect` event
  res = http.post(
    `http://${domain}/socket.io/?EIO=4&transport=polling&t=${hashDate()}&sid=${sid}`,
    data,
    { headers: headers }
  );
  // also seems to be needed...
  res = http.get(
    `http://${domain}/socket.io/?EIO=4&transport=polling&t=${hashDate()}&sid=${sid}`
  );

  return sid;
}

function hashDate() {
  return (+new Date()).toString(36);
}

function getSid(parserEncoding) {
  const match = /{.+?}/;
  const response = parserEncoding.match(match);
  return response ? JSON.parse(response[0]).sid : "No Response";
}
