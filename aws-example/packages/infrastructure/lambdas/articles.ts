export async function list(payload: any) {
  console.log(payload);
  return [{ id: 1, body: 'ABC' }];
}

export async function byId(payload: any) {
  console.log(payload);
  return { id: 1, body: 'ABC' };
}
