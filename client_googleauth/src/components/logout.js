import {GoogleLogout} from 'react-google-login';

const client_id = "876703262-94tmihpdq6ope5b5vr4moj1dv8756rl8.apps.googleusercontent.com"

function Logout() {
    const onSuccess = (res) => {
        console.log("Logout Successful!");
    }
    return(
        <div id = "signOutButton">
            <GoogleLogout 
                clientId = {client_id}
                buttonText = {"Logout"}
                onLogoutSuccess={onSuccess}
            
            />

        </div>
    )
}

export default Logout;