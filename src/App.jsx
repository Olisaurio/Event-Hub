import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EventHub from './Pages-EventHub/EventHub';
import EventDetail from './Pages-EventHub/EventDetail';
import EventsListPage from './Pages-EventHub/EventsListPage';
import CreateEvent from './components/CreateEvent.jsx';
import DoubleSliderForm from './assets/DoubleSliderForm/DoubleSliderForm';
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DoubleSliderForm />} />
        <Route path="/EventHub" element={<EventHub />} />
        <Route path="/event/:id" element={<EventDetail />} />
        <Route path="/events" element={<EventsListPage />} /> 
        <Route path="/create-event" element={<CreateEvent />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;

