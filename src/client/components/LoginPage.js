import React from 'react';

import mainLogo from '../images/logo.png'
import '../../index.css';


const LoginPage = () => {
    
    const handleLoginSubmit = (event) => {
        event.preventDefault();  // Prevent default form submission behavior (page reload)
        
        const username = event.target.username.value;
        const password = event.target.password.value;

        // You can add your login logic here, such as making an API request
        console.log('Login attempt:', { username, password });
        fetch()
    };
    
    return (
        <div className="login-page">
            {/* Logo positioned above the form */}
            <img src={mainLogo} alt="Logo" className="logo" />
            <form className="login-form" onSubmit={handleLoginSubmit}>
                <div>
                    <label htmlFor="username">Username:</label>
                    <input type="text" id="username" name="username" required />
                </div>
                <div>
                    <label htmlFor="password">Password:</label>
                    <input type="password" id="password" name="password" required />
                </div>
                <div className="button-group">
                    {/* Use a normal anchor tag for navigation to /register */}
                    <a href="/register" className="button register-button">
                        Register
                    </a>
                    <input 
                        type="submit" 
                        value="Login" 
                        className="button login-button" 
                    />
                </div>
            </form>
        </div>
    );
    
    
    
};

export default LoginPage;