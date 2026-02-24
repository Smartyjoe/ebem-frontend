import { createBrowserRouter } from 'react-router';
import { Layout } from './components/Layout';
import Home from './pages/Home';
import Shop from './pages/Shop';
import About from './pages/About';
import Contact from './pages/Contact';
import Blog from './pages/Blog';
import NotFound from './pages/NotFound';

export const router = createBrowserRouter([
  {
    path: '/',
    Component: Layout,
    children: [
      { index: true, Component: Home },
      { path: 'shop', Component: Shop },
      { path: 'about', Component: About },
      { path: 'contact', Component: Contact },
      { path: 'blog', Component: Blog },
      { path: 'blog/:slug', Component: Blog },
      { path: '*', Component: NotFound },
    ],
  },
]);
