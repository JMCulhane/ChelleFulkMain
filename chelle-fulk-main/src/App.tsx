import './App.scss';
import Navbar from './components/Navbar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import { AdminAuthProvider } from './context/AdminAuthContext';
import ContactForm from './components/pages/ContactForm';
import AdminPage from './components/pages/AdminPage';
import KnotBackground from './components/styling/KnotBackground';
import Recordings from './components/pages/Recordings';
import HomePage from './components/home/HomePage';
import Videos from './components/pages/Videos';

function App() {

  const [trigger, setTrigger] = useState(false);

  const handleClick = () => {
    setTrigger(true);
    setTimeout(() => setTrigger(false), 3000); // effect lasts 3s
  };
  
  return (
    <AdminAuthProvider>
      <Router>
        <div className="App relative">
          <KnotBackground />
          <header className="App-header">
            <div className="fixed top-0 left-0 w-full z-50">
              <Navbar />
            </div>
            <Routes>
              <Route
                path="/"
                element={
                  <HomePage />
                }
              />
              <Route path="/contact" element={<ContactForm />} />
              <Route path="/videos" element={<Videos />} />
              <Route path="/recordings" element={<Recordings />} />
              
                <Route path="/admin" element={<AdminPage />} />
             
            </Routes>
            <>
        <div>
      </div>
      </>
          </header>
        </div>
      </Router>
    </AdminAuthProvider>
  );
}

export default App;
