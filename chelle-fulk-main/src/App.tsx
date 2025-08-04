import './App.scss';
import Navbar from './components/Navbar';
import Schedule from './components/home/Schedule';
import Foreword from './components/home/Foreword';
import PhotoReel from './components/home/PhotoReel';
import MonthlyCalendar from './components/pages/Calendar';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import { useState } from 'react';
import ContactForm from './components/pages/ContactForm';
import UnfurlingTest from './implementationTesting/UnfurlingTest';
import KnotBackground from './components/styling/KnotBackground';
import LeftHuggingContainer from './components/styling/LeftHuggingContainer';
import Recordings from './components/pages/Recordings';

function App() {

  const [trigger, setTrigger] = useState(false);

  const handleClick = () => {
    setTrigger(true);
    setTimeout(() => setTrigger(false), 3000); // effect lasts 3s
  };
  
  return (
    <Router>
      <div className="App relative">
        <KnotBackground />
        <header className="App-header">
          <div className="fixed top-0 left-0 w-full z-50">
            <Navbar />
          </div>
          {/* <UnfurlingTest /> */}
          <Routes>
            <Route
              path="/"
              element={
                <>
                  <PhotoReel />
                  <Foreword />
                  <Schedule />
                </>
              }
            />
            <Route path="/contact" element={<ContactForm />} />
            <Route path="/calendar" element={<MonthlyCalendar />} />
            <Route path="/recordings" element={<Recordings />} />
          </Routes>
          <>
      {/* <button
        onClick={() => setTrigger(true)}
        style={{ position: "fixed", top: 20, left: 20, zIndex: 10000 }}
      >
        Trigger Leaf Effect
      </button> */}

      {/* <LeafTransition
        trigger={trigger}
        onComplete={() => setTrigger(false)}
      /> */}
      <div>
        {/* <ScaleOnScroll>
          <img
            src="https://images.unsplash.com/photo-1506744038136-46273834b3fb?auto=format&fit=crop&w=1920&q=80"
            alt="Sample"
            className="w-full h-full object-cover"
          />
        </ScaleOnScroll> */}
      {/* You can add more components or content below */}
    </div>
    </>
                
          {/* <KnotFrame /> */}
        </header>
      </div>
    </Router>
  );
}

export default App;
