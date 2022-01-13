export async function list() {
  return [{ id: 1, content: 'ABC' }];
}

export async function byId(payload: any) {
  console.log(payload);
  return { id: 1, content: 'ABC' };
}
