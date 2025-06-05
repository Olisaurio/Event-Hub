import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EventHub from './Pages-EventHub/EventHub';
import EventDetail from './Pages-EventHub/EventDetail';
import EventsListPage from './Pages-EventHub/EventsListPage';
import CreateEvent from './components/CreateEvent.jsx';
import DoubleSliderForm from './assets/DoubleSliderForm/DoubleSliderForm';
import Layout from './components/Layout.jsx';
import "./App.css";

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas fuera del layout (login/registro) */}
        <Route path="/" element={<DoubleSliderForm />} />

        {/* Rutas dentro del layout */}
        <Route element={<Layout />}>
          <Route path="/EventHub" element={<EventHub />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/events" element={<EventsListPage />} /> 
          <Route path="/create-event" element={<CreateEvent />} />
          {/* Nuevas rutas para las funcionalidades solicitadas */}
          <Route path="/my-events" element={<div>Mis eventos inscritos</div>} />
          <Route path="/invitations" element={<div>Eventos a los que me invitan</div>} />
          <Route path="/agenda" element={<div>Mi agenda</div>} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
