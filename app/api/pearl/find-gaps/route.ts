export async function POST() {
  return Response.json({ error: 'Bad Request' }, { status: 400 });
}