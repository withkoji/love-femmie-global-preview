import { useEffect } from 'react';
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Toaster } from '@project/components/ui/sonner';
import { DataProvider } from './lib/data';
import Layout from './components/Layout';
import Home from './pages/Home';
import Academy from './pages/Academy';
import CoursePage from './pages/CoursePage';
import Recipes from './pages/Recipes';
import TV from './pages/TV';
import Membership from './pages/Membership';
import Account from './pages/Account';
import Topic from './pages/Topic';
import Kids from './pages/Kids';
import Blog, { BlogPost } from './pages/Blog';
import Community from './pages/Community';
import ResearchNetwork from './pages/ResearchNetwork';

function ScrollTop() {
  const { pathname } = useLocation();
  useEffect(() => window.scrollTo(0, 0), [pathname]);
  return null;
}

export default function App() {
  return (
    <DataProvider>
      <BrowserRouter>
        <ScrollTop />
        <Routes>
          <Route element={<Layout />}>
            <Route path="/" element={<Home />} />
            <Route path="/academy" element={<Academy />} />
            <Route path="/academy/:id" element={<CoursePage />} />
            <Route path="/recipes" element={<Recipes />} />
            <Route path="/tv" element={<TV />} />
            <Route path="/membership" element={<Membership />} />
            <Route path="/account" element={<Account />} />
            <Route path="/explore/:slug" element={<Topic />} />
            <Route path="/kids" element={<Kids />} />
            <Route path="/blog" element={<Blog />} />
            <Route path="/blog/:id" element={<BlogPost />} />
            <Route path="/community" element={<Community />} />
            <Route path="/research" element={<ResearchNetwork />} />
          </Route>
        </Routes>
        <Toaster />
      </BrowserRouter>
    </DataProvider>
  );
}
