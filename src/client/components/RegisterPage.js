import React from 'react';
import mainLogo from '../images/logo.png';

const RegisterPage = () => {
    return (
        <>
            <div className="register-page-container">
                <div className="register-content">
                    <form className='register-form' action='http://localhost:8080/register' method='post'>
                        <div className='logo-row'>
                            {/* Wrap the logo in an anchor tag */}
                            <a href="/login">
                                <img className='logo-img' src={mainLogo} alt="logo" />
                            </a>
                        </div>
                        <div>
                            <label className="label" htmlFor="usrname">Username:</label>
                            <input id="usrname" type='text' name='username' />
                        </div>
                        <div>
                            <label className="label" htmlFor="psw">Password:</label>
                            <input id="psw" type="password" name='password' />
                        </div>

                        <div>
                            <input type='submit' value="Register" />
                        </div>
                    </form>
                </div>
            </div>
            <div className='vp-backdrop'>
            </div>
        </>
    );
};

export default RegisterPage;
