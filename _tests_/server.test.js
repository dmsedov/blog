import request from 'supertest';
import server from '../app';

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

  const htmlRes = '<!DOCTYPE html><html><head><title>Blog</title></head><body><h3>Page not found</h3></body></html>';

  it('GET /unexisting-route', async () => {
    const app = server();
    const res = await request(app).get('/unexisting-route');
    expect(res.status).toBe(404);
    expect(res.text).toBe(htmlRes);
  });

  it('GET /posts/:id with id = 5', async () => {
    const app = server();
    const res = await request(app).get('/posts/5');
    expect(res.status).toBe(404);
    expect(res.text).toBe(htmlRes);
  });

  it('GET /users/new', async () => {
    const app = server();
    const res =  await request(app).get('/users/new');
    expect(res.status).toBe(200);
  });

  it('POST /users with SUCCESS', async () => {
    const app = server();
    const res1 =  await request(app).post('/users').type('form')
    .send({ nickname: 'User', password: 'password' });
    expect(res1.status).toBe(302);
    const res2 = await request(app).get(res1.headers.location);
    expect(res2.status).toBe(200);
  });

  it('POST /users "nickname must be uniq"', async () => {
    const app = server();
    const res1 =  await request(app).post('/users').type('form')
    .send({ nickname: 'User', password: 'password1' });
    expect(res1.status).toBe(302);
    const res2 = await request(app).post('/users').type('form')
    .send({ nickname: 'User', password: 'password2' });
    expect(res2.status).toBe(422);
  });

  it('POST /users "Nickame and password must be blanked"', async () => {
    const app = server();
    const res1 =  await request(app).post('/users').type('form')
    .send({ nickname: 'User' });
    expect(res2.status).toBe(422);
  });

  it('GET /session/new', async () => {
    const app = server();
    const res = await request(app).get('/session/new');
    expect(res.status).toBe(200);
  });

  it('POST /session', async () => {
    const app = server();
    const res1 = await request(app).post('/users').type('form')
    .send({ nickname: 'User', password: 'password' });
    expect(res1.status).toBe(302);
    const res2 = await request(app).post('/session').type('form')
    .send({ nickname: 'User', password: 'password' });
    expect(res2.status).toBe(302);
    const res3 = await request(app).get(res2.headers.location);
    expect(res3.status).toBe(200);
  });

  it('POST /session with Error', async () => {
    const app = server();
    const res1 = await request(app).post('/users').type('form')
    .send({ nickname: 'User', password: 'password' });
    expect(res1.status).toBe(302);
    const res2 = await request(app).post('/session').type('form')
    .send({ nickname: 'User' });
    expect(res2.status).toBe(422);

  it('DELETE /session', async () => {
    const app = server();
    const res1 = await request(app).post('/users').type('form')
    .send({ nickname: 'User', password: 'password' });
    expect(res1.status).toBe(302);

    const res2 = await request(app).post('/session').type('form')
    .send({ nickname: 'User', password: 'password' });
    const cookie = res2.header['Set-Cookie'];
    const res3 = await request(app).post('/session').set('Cookie', cookie);
    expect(res3.status).toBe(302);
  });
});
