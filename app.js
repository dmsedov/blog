import Express from 'express';
import bodyParser from 'body-parser';
import Router from 'named-routes';
import methodOverride from 'method-override';
import session from 'express-session';
import redis from 'connect-redis';
import cookieParser from 'cookie-parser';
import mysql from 'mysql';
import Post from './src/Post';
import NotFoundError from './src/NotFoundError';
import User from './src/entities/User';
import Guest from './src/entities/Guest';
import encrypt from './src/encrypt';

export default () => {
  const app = Express();
  const router = new Router();
  const pool = mysql.createPool({
    host: 'localhost',
    user: 'app',
    port: 3306,
    password: 'Tas2giq2',
    database: 'app',
  });
  const user = new User('admin', 'abrakadabra');
  const queryStr = 'CREATE TABLE IF NOT EXISTS users ' + '(id INT NOT NULL PRIMARY KEY AUTO_INCREMENT,' +
  ' nickname VARCHAR(20) UNIQUE, password CHAR(128))';
  pool.getConnection((err, connection) => {
    connection.query(queryStr, (err1) => {
      if (err1) throw err1;
      connection.query(`INSERT IGNORE INTO users (nickname, password) VALUES ('${user.nickname}', '${user.passwordDigest}')`, (err2) => {
        connection.release();
        if (err2) throw err2;
      });
    });
  });
  router.extendExpress(app);
  router.registerAppHelpers(app);
  app.set('view engine', 'pug');
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(methodOverride('_method'));
  const listOfPosts = [new Post('first title', 'content1'),
    new Post('second title', 'content2')];
  app.use(cookieParser());
  const RedisStore = redis(session);
  app.use(session({
    store: new RedisStore({
      host: '127.0.0.1',
      port: '6379',
      prefix: 'sess',
    }),
    secret: 'secret key',
    resave: false,
    saveUninitialized: false,
  }));

  app.use((req, res, next) => {
    if (req.session.nickname) {
      app.locals.currentUser = users.find(user => user.nickname === req.session.nickname);
    } else {
      app.locals.currentUser = new Guest();
    }
    next();
  });

  app.get('/', 'root', (req, res) => {
    res.render('index');
  });

  app.get('/posts', 'posts', (req, res) => {
    res.render('Posts/listOfPosts', { posts: listOfPosts });
  });

  app.get('/posts/new', 'posts.new', (req, res) => {
    res.render('Posts/new', { form: {} });
  });

  app.get('/posts/:id', 'posts.id', (req, res, next) => {
    const { id } = req.params;
    const reqPost = listOfPosts.find((post) => {
      if (post.id.toString() === id) {
        return true;
      }
      return false;
    });
    if (reqPost) {
      res.render('Posts/show', { reqPost });
    } else {
      next(new NotFoundError());
    }
  });

  app.post('/posts', 'posts', (req, res) => {
    const { title, body } = req.body;
    const error = {};
    if (!title) {
      error.title = 'it must be filled';
    }
    if (!body) {
      error.body = 'it must be filled';
    }
    if (Object.keys(error).length === 0) {
      const newPost = new Post(title, body);
      listOfPosts.push(newPost);
      res.redirect(`/posts/${newPost.id}/edit`);
      return;
    }
    res.status(422);
    res.render('Posts/new', { error });
  });

  app.get('/posts/:id/edit', 'posts.id.edit', (req, res) => {
    const { id } = req.params;
    const form = listOfPosts.find(post => post.id.toString() === id);
    res.render('Posts/edit', { form });
  });

  app.patch('/posts/:id', 'posts.id', (req, res) => {
    const { title, body } = req.body;
    const { id } = req.params;
    const error = {};
    if (!title) {
      error.title = 'it must be filled';
    }
    if (!body) {
      error.body = 'it must be filled';
    }
    if (Object.keys(error).length === 0) {
      const desiredPost = listOfPosts.find(post => post.id.toString() === id);
      desiredPost.title = title;
      desiredPost.body = body;
      res.redirect(`/posts/${desiredPost.id}/edit`);
      return;
    }
    res.status(422);
    res.render('Posts/new', { error });
  });

  app.delete('/posts/:id', 'posts.id', (req, res) => {
    const { id } = req.params;
    const index = listOfPosts.findIndex(post => post.id.toString() === id);
    listOfPosts.splice(index, 1);
    res.redirect('/posts');
  });

  app.get('/users/new', 'users.new', (req, res) => {
    res.render('forms/sign-in', { form: {} });
  });

  app.get('/session/new', 'session.new', (req, res) => {
    res.render('forms/sign-up', { form: {} });
  });

  app.post('/users', 'users', (req, res, next) => {
    const { nickname, password } = req.body;
    const error = {};
    if (!nickname) {
      error.nickname = 'must be filled';
    } else {
      pool.getConnection((err, connection) => {
        if (err) {
          return next(err);
        }
        connection.query(`SELECT * FROM users WHERE nickname='${nickname}'`, (err1, result) => {
          connection.release();
          if (err1) next(err1);
          console.log(result, 'result');
          if (sameUser) {
            error.message = `User with nickname "${sameUser.nickname}" already exists`;
          }
          if (!password) {
            error.password = 'must be filled';
          }
          if (Object.keys(error).length === 0) {
            const newUser = new User(nickname, password);
            req.session.nickname = nickname;
            connection.query(`INSERT INTO users VALUES (${newUser.nickname}, ${newUser.password})`, (err2) => {
              if (err2) next(err2);
            });
            res.redirect('/');
            return;
          }
          res.status(422);
          res.render('forms/sign-in', { error });
        });
      });
    }
      // const sameUser = users.find(user => user.nickname === nickname);
  });

  app.post('/session', 'session', (req, res) => {
    const { nickname, password } = req.body;
    const error = {};
    const authUser = users.find(user => user.nickname === nickname);
    if (authUser && authUser.passwordDigest === encrypt(password)) {
      req.session.nickname = nickname;
      res.redirect('/');
      return;
    }
    error.message = 'Invalid user nickname or password';
    res.status(422);
    res.render('forms/sign-up', { error });
  });

  app.delete('/session', 'session', (req, res) => {
    req.session.destroy();
    res.redirect('/');
  });

  app.use((req, res, next) => {
    next(new NotFoundError());
  });

  app.use((err, req, res, next) => {
    if (err.status === 404) {
      res.status(404);
      res.render('errorsPages/404');
    } else {
      res.status(500);
      res.render('errorsPages/500');
    }
  });

  return app;
};
