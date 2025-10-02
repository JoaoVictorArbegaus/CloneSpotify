import { Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import Footer from './components/Footer';

export default function App() {
  return (
    <div className="app-bg">
      <Navbar />
      <main className="app-main">
        <div className="page d-flex justify-content-center align-items-center">
          <Outlet />
        </div>
      </main>
      <Footer />
    </div>
  );
}