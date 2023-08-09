import { GoogleLogin} from 'react-google-login';

const client_id = "876703262-94tmihpdq6ope5b5vr4moj1dv8756rl8.apps.googleusercontent.com";

function Login() {
    
    const onSuccess = (res) => {
        console.log("LOGIN SUCCESS! Current user: ", res.profileObj);
    }

    const onFailure = (res) => {
        console.log("LOGIN FAILED! res: ", res);
    }

    return(
        <div id = "signInButton">
            <GoogleLogin
            clientId = {client_id}
            button_Text = "Login"
            onSuccess = {onSuccess}
            onFailure = {onFailure}
            cookiePolicy={'single_host_origin'}
            isSignedIn = {true}
            />
        </div>
    )
}

export default Login;
