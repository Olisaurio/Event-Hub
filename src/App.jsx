
import { BrowserRouter, Routes, Route } from 'react-router-dom';
DoubleSliderForm
import EventHub from './assets/EventHub/EventHub';
import EventDetail from './assets/EventHub/EventDetail';

import "./App.css"
import CreateEvent from './components/CreateEvent ';
import DoubleSliderForm from './assets/DoubleSliderForm/DoubleSliderForm';



function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DoubleSliderForm />} />
        <Route path="/EventHub" element={<EventHub />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/create-event" element={<CreateEvent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
