import Express from 'express';
import bodyParser from 'body-parser';
import Router from 'named-routes';
import Post from './src/Post';

export default () => {
  const app = Express();
  const router = new Router();
  router.extendExpress(app);
  router.registerAppHelpers(app);
  app.set('view engine', 'pug');
  app.use(bodyParser.urlencoded({ extended: false }));
  const listOfPosts = [new Post('first title', 'content1'),
    new Post('second title', 'content2')];
  app.get('/', 'root', (req, res) => {
    res.render('index');
  });

  app.get('/posts', 'posts', (req, res) => {
    res.render('Posts/listOfPosts', { posts: listOfPosts });
  });

  app.get('/posts/new', 'new', (req, res) => {
    res.render('Posts/new');
  });
  //
  // app.get('/posts/:id', (req, res) => {
  //   res.render('Posts/')
  // });
  return app;
};
