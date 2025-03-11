
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Login } from './assets/Login/Login';
import { Register } from './assets/Register/Register';
import EventHub from './assets/EventHub/EventHub';


function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route path="/Register" element={<Register />} />
        <Route path="/EventHub" element={<EventHub />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
