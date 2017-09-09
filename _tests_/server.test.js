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

  it('GET /posts/:id/edit', async () => {
    const app = server();
    const res1 = await request(app).post('/posts')
    .type('form').send({ title: 'title', body: 'body' });
    expect(res1.status).toBe(302);
    const res2 = await request(app).get(res1.headers.location);
    expect(res2.status).toBe(200);
  });

  it ('PATCH /posts/:id', async () => {
    const app = server();
    const res1 = await request(app).post('/posts')
    .type('form').send({ title: 'title', body: 'body' });
    const url = res1.headers.location.split('/').slice(0, -1).join('/');
    const res2 = await request(app).patch(url).type('form')
    .send({ title: 'newTitle', body: 'newBody' });
    expect(res2.status).toBe(302);
  });

  it('PATCH /posts/:id ("unprocessable entity" status 422)', async () => {
    const app = server();
    const res1 = await request(app).post('/posts')
    .type('form').send({ title: 'title', body: 'body' });
    const url = res1.headers.location.split('/').slice(0, -1).join('/');
    const res2 = await request(app).patch(url).type('form').send({ title: 'newTitle' });
    expect(res2.status).toBe(422);
  });

  it('DELETE /posts/:id', async () => {
    const app = server();
    const res1 = await request(app).post('/posts')
    .type('form').send({ title: 'title', body: 'body' });
    const url = res1.headers.location.split('/').slice(0, -1).join('/');
    const res2 = await request(app).delete(url);
    expect(res2.status).toBe(302);
  });
});
