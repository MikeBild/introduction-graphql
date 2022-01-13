import aws from 'aws-sdk';

export async function list() {
  return [{ id: 1, content: 'ABC' }];
}

export async function byId(payload) {
  console.log(payload);
  return { id: 1, content: 'ABC' };
}
