import request from 'supertest';
import server from '../index';

describe('request', () => {
  it('GET /', async () => {
    const res = await request(server()).get('/');
    expect(res.status).toBe(200);
  });

  it('GET /posts', async () => {
    const res = await request(server()).get('/posts');
    expect(res.status).toBe(200);
  });

  it('GET /posts/new', async () => {
    const res = await request(server()).get('/posts/new');
    expect(res.status).toBe(200);
  });

  it('POST /posts', async () => {
    const res = await request(server()).post('/posts')
    .type('form').send({ title: 'title', body: 'body' });
    expect(res.status).toBe(302);
  });

  it('POST /posts without query string', async () => {
    const res = await request(server()).post('/posts');
    expect(res.status).toBe(422);
  });

  it('GET /posts/:id', async () => {
    const query = request(server());
    const res1 = await query.post('/posts')
    .type('form').send({ title: 'title', body: 'body' });
    expect(res1.status).toBe(302);
    const res2 = await query.get(res1.headers.location);
    expect(res2.status).toBe(200);
  });
});
