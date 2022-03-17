import React from 'react';
import Heading from '@splunk/react-ui/Heading';
import Text from '@splunk/react-ui/Text';
import Button from '@splunk/react-ui/Button';
import { useState, useEffect } from 'react';

function Login(props) {
    //Headers for Authorization
    const headers = {
        headers: {
            Authorization: `Splunk ${props.sessionKey}`,
        },
    };

    const handleServerChange = (e, { value }) => {
        //setServerURL(value);
        props.setServerURL(value);
    };

    const handleUsernameChange = (e, { value }) => {
        //setUsername(value);
        props.setUsername(value);
    };

    const handlePasswordChange = (e, { value }) => {
        //setPassword(value);
        props.setPassword(value);
    };

    function handleLoginButton() {
        GetSessionKey(props.username, props.password, props.serverURL)
            .then((response) => response)
            .then((data) => {
                props.setSessionKey(data['sessionKey']);
            });
    }

    async function GetSessionKey(username, password, server) {
        var key = await fetch(server + '/services/auth/login', {
            method: 'POST',
            body: new URLSearchParams({
                username: username,
                password: password,
                output_mode: 'json',
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        })
            .then((response) => response.json())
            .then((data) => {
                return data['sessionKey'];
            });

        return { sessionKey: key };
    }

    return (
        <>
            <Heading level={1}>Please login to Splunk</Heading>

            <form>
                <Heading level={2}>Splunk Server:</Heading>

                <Text
                    style={{ width: '200px' }}
                    type="server"
                    value={props.serverURL}
                    onChange={handleServerChange}
                />
                <Heading level={2}>Username:</Heading>

                <Text
                    style={{ width: '200px' }}
                    type="username"
                    value={props.username}
                    onChange={handleUsernameChange}
                />
                <Heading level={2}>Password:</Heading>

                <Text
                    style={{ width: '200px' }}
                    type="password"
                    value={props.password}
                    onChange={handlePasswordChange}
                />
                <br />
                <Button label="Login" appearance="primary" onClick={() => handleLoginButton()} />
            </form>
        </>
    );
}

export default Login;
