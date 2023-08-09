import logo from './logo.svg';
import './App.css';
import LoginButton from "./components/login";
import LogoutButton from "./components/logout";
import { useEffect } from 'react';
import { gapi } from 'gapi-script';
import Login from './components/login';

const client_id = "876703262-94tmihpdq6ope5b5vr4moj1dv8756rl8.apps.googleusercontent.com"

function App() {
  useEffect(() => {
  function start() {
    gapi.client.init({
      clientId: client_id,
      scope: ""
    })
  };
  gapi.load('client:auth2', start);
});

  return (
    <div className="App">
      <LoginButton />
      <LogoutButton />
      
    </div>
  );
}

export default App;
