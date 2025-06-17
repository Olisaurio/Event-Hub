
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import EventHub from './Pages-EventHub/EventHub';
import EventDetail from './Pages-EventHub/EventDetail';
import EventsListPage from './Pages-EventHub/EventsListPage';
import CreateEvent from './components/CreateEvent.jsx';
import DoubleSliderForm from './assets/DoubleSliderForm/DoubleSliderForm';
import Layout from './components/Layout.jsx';
import "./App.css";
import RecoveryPassword from './assets/recoveryPassword/recoveryPassword.jsx';
import NewPassword from './assets/recoveryPassword/newPassword.jsx';
import MyEvents from './Pages-EventHub/myEvents.jsx';
import Participate from './Pages-EventHub/participate.jsx';
import LandingPage from './assets/landingPage/landingPage.jsx';
<<<<<<< HEAD
import MyAgenda from './Pages-EventHub/MyAgenda.jsx';
=======
<<<<<<< HEAD
import UserProfile from './components/UserProfile.jsx';
=======
import MyInvitations from './components/MyInvitations.jsx';

>>>>>>> 358d6a54c0cf7bd1e75e3562a0107d479a58e493
>>>>>>> 2cf88d97880f4a7370898c70144b4ac17158eda4

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rutas fuera del layout (login/registro/recovery-password/new-password) */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/loginAndRegister" element={<DoubleSliderForm />} />
        <Route path="/recovery-password" element={<RecoveryPassword />} />
        <Route path="/new-password" element={<NewPassword />} />

        {/* Rutas dentro del layout */}
        <Route element={<Layout />}>
          <Route path="/EventHub" element={<EventHub />} />
          <Route path="/event/:id" element={<EventDetail />} />
          <Route path="/events" element={<EventsListPage />} /> 
          <Route path="/create-event" element={<CreateEvent />} />
          {/* Nuevas rutas para las funcionalidades solicitadas */}
          <Route path="/my-events" element={<MyEvents/>} />
<<<<<<< HEAD
          <Route path="/invitations" element={<div>Eventos a los que me invitan</div>} />
          <Route path="/agenda" element={<MyAgenda/>} />
=======
          <Route path="/invitations" element={<MyInvitations />} />
          <Route path="/agenda" element={<div>Mi agenda</div>} />
>>>>>>> 2cf88d97880f4a7370898c70144b4ac17158eda4
          <Route path="/assistance" element={<Participate />} />
          <Route path="/sub-creator" element={<div>SubCreador</div>} />
          {/* NUEVA RUTA AGREGADA: Perfil de usuario */}
          <Route path="/profile" element={<UserProfile />} />
        </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;