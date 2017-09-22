import Express from 'express';
import bodyParser from 'body-parser';
import Router from 'named-routes';
import methodOverride from 'method-override';
import session from 'express-session';
import redis from 'connect-redis';
import cookieParser from 'cookie-parser';
import models from './models/index';
import Post from './src/Post';
import NotFoundError from './src/NotFoundError';
import User from './src/entities/User';
import Guest from './src/entities/Guest';
import encrypt from './src/encrypt';
import data from './dataDb/genData';


export default () => {
  const app = Express();
  const router = new Router();
  const Users = models.users;
  const Posts = models.posts;
  const { usersData, postsData } = data();
  models.sequelize.sync().then(() => {
    console.log('Connection has been established successfully.');
    Users.findAll().then((users) => {
      if (users.length === 0) {
        Users.bulkCreate(usersData);
      }
    });
    Posts.findAll().then((posts) => {
      if (posts.length === 0) {
        Posts.bulkCreate(postsData);
      }
    });
  })
  .catch((err) => {
    console.error('Unable to connect to the database:', err);
  });
  router.extendExpress(app);
  router.registerAppHelpers(app);
  app.set('view engine', 'pug');
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(methodOverride('_method'));
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
    if (req.session && req.session.nickname) {
      Users.findOne({
        where: { nickname: req.session.nickname },
      }).then((result) => {
        const { nickname, password } = result.get({ plain: true });
        const authUser = new User(nickname, password);
        app.locals.currentUser = authUser;
      }).catch(err => next(err));
    } else {
      app.locals.currentUser = new Guest();
    }
    next();
  });

  app.get('/', 'root', (req, res) => {
    const report = 'You must log in before you\'ll write posts!';
    const message = req.session.nickname ? null : report;
    res.render('index', { message });
  });

  app.get('/posts', 'posts', (req, res) => {
    Posts.findAll().then((posts) => {
      res.render('Posts/listOfPosts', { posts });
    });
  });

  app.get('/posts/new', 'posts.new', (req, res) => {
    res.render('Posts/new', { form: {} });
  });

  app.get('/posts/:id', 'posts.id', (req, res, next) => {
    const { id } = req.params;
    Posts.findOne({ where: { post_id: id } }).then((result) => {
      if (!result) {
        next(new NotFoundError());
      }
      res.render('Posts/show', { post: result.get({ plain: true }) });
    });
  });

  app.post('/posts', 'posts', (req, res, next) => {
    const { title, body } = req.body;
    const error = {};
    if (!title) {
      error.title = 'it must be filled';
    }
    if (!body) {
      error.body = 'it must be filled';
    }
    if (title && body && !req.session.nickname) {
      res.redirect('/');
      return;
    }
    if (Object.keys(error).length === 0) {
      const newPost = new Post(title, body);
      Posts.create({ post_id: newPost.id,
        title: newPost.title,
        body: newPost.body,
        user: req.session.nickname })
      .then(() => {
        res.redirect(`/posts/${newPost.id}/edit`);
      }).catch(err => next(err));
      return;
    }
    res.status(422);
    res.render('Posts/new', { error });
  });

  app.get('/posts/:id/edit', 'posts.id.edit', (req, res, next) => {
    const { id } = req.params;
    Posts.findOne({ where: { post_id: id } }).then((post) => {
      const form = post.get({ plain: true });
      res.render('Posts/edit', { form });
    }).catch(err => next(err));
  });

  app.get('/myposts', 'my-posts', (req, res, next) => {
    Posts.findAll({ where: {
      user: req.session.nickname,
    } }).then((posts) => {
      res.render('Posts/myposts', { posts });
    }).catch(err => next(err));
  });

  app.patch('/posts/:id', 'posts.id', (req, res, next) => {
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
      Posts.findOne({ where: { post_id: id } }).then((post) => {
        const dataOfPost = post.get({ plain: true });
        dataOfPost.title = title;
        dataOfPost.body = body;
        return dataOfPost;
      }).then(newData => Posts.update({
        title: newData.title,
        body: newData.body,
      }, { where: { post_id: newData.post_id } })).catch(err => next(err));
      return;
    }
    res.status(422);
    res.render('Posts/new', { error });
  });

  app.delete('/posts/:id', 'posts.id', (req, res, next) => {
    const { id } = req.params;
    Posts.destroy({ where: {
      post_id: id,
    } }).then(() => res.redirect('/myposts')).catch(err => next(err));
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
    if (!password || !nickname) {
      error.message = 'fields "Nickname" and "Password" must be filled';
      res.status(422);
      res.render('forms/sign-in', { error });
    } else {
      Users.findOne({ where: { nickname } }).then((result) => {
        if (result) {
          error.message = `User "${nickname}" already exists`;
        }
        if (Object.keys(error).length === 0) {
          const newUser = new User(nickname, encrypt(password));
          req.session.nickname = nickname;
          Users.create({ nickname: newUser.nickname, password: newUser.passwordDigest })
          .then(() => res.redirect('/')).catch(err => next(err));
          return;
        }
        res.status(422);
        res.render('forms/sign-in', { error });
      });
    }
  });

  app.post('/session', 'session', (req, res) => {
    const { nickname, password } = req.body;
    const error = {};
    if (nickname && password) {
      Users.findAll({ where: { nickname } }).then((result) => {
        if (result.length !== 0 && result[0].get({ plain: true }).password === encrypt(password)) {
          req.session.nickname = nickname;
          res.redirect('/');
          return;
        }
        error.message = 'Invalid user nickname or password';
        res.status(422);
        res.render('forms/sign-up', { error });
      });
    } else {
      if (!nickname) {
        error.nickname = 'must be filled';
      }
      if (!password) {
        error.password = 'must be filled';
      }
      res.status(422);
      res.render('forms/sign-up', { error });
    }
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
