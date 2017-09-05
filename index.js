import Express from 'express';
import bodyParser from 'body-parser';
import Post from './src/Post';

export default () => {
  const app = new Express();
  app.set('view engine', 'pug');
  app.use(bodyParser.urlencoded({ extended: false }));
  let ListOfPosts = [new Post('first title', 'content1'),
    new Post('second title', 'content2')];
  app.get('/', (req, res) => {
    res.render('index');
  });

  // app.get('/posts', (req, res) => {
  //   res.render()
  // });
  //
  // app.get('/posts/:id', (req, res) => {
  //   res.render('Posts/')
  // });
  return app;
};
