import Express from 'express';
import bodyParser from 'body-parser';
import Router from 'named-routes';
import methodOverride from 'method-override';
import Post from './src/Post';

export default () => {
  const app = Express();
  const router = new Router();
  router.extendExpress(app);
  router.registerAppHelpers(app);
  app.set('view engine', 'pug');
  app.use(bodyParser.urlencoded({ extended: false }));
  app.use(methodOverride('_method'));
  const listOfPosts = [new Post('first title', 'content1'),
    new Post('second title', 'content2')];
  app.get('/', 'root', (req, res) => {
    res.render('index');
  });

  app.get('/posts', 'posts', (req, res) => {
    res.render('Posts/listOfPosts', { posts: listOfPosts });
  });

  app.get('/posts/new', 'new', (req, res) => {
    res.render('Posts/new', { form: {} });
  });

  app.get('/posts/:id', (req, res) => {
    const { id } = req.params;
    const reqPost = listOfPosts.find((post) => {
      if (post.id.toString() === id) {
        return true;
      }
      return false;
    });
    res.render('Posts/show', { reqPost });
  });

  app.post('/posts', 'posts', (req, res) => {
    const { title, body } = req.body;
    const error = {};
    if (!title) {
      error.title = 'it must be filled';
    } else if (!body) {
      error.body = 'it must be filled';
    } else {
      const newPost = new Post(title, body);
      listOfPosts.push(newPost);
      res.redirect(`/posts/${newPost.id}/edit`);
      return;
    }
    res.status(422);
    res.render('Posts/new', { error });
  });

  // app.

  return app;
};
