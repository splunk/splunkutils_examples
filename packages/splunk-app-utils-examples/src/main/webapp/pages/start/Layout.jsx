import React, { useState } from 'react';
import { SplunkThemeProvider } from '@splunk/themes';
import Link from '@splunk/react-ui/Link';
import P from '@splunk/react-ui/Paragraph';
import Boolean from './Boolean';
import Button from '@splunk/react-ui/Button';
import Config from './Config';
import URL from './URL';
function Layout() {
    const [selectedComponent, setSelectedComponent] = useState(<></>);

    function handleDarkModeClick() {
        setDarkMode((event) => !event);
    }

    function switchHome(e) {
        e.preventDefault();
        setSelectedComponent(<h1>Home</h1>);
    }
    function switchBoolean(e) {
        e.preventDefault();
        setSelectedComponent(<Boolean />);
    }

    function switchConfig(e) {
        e.preventDefault();
        setSelectedComponent(<Config />);
    }
    function switchURL(e) {
        e.preventDefault();
        setSelectedComponent(<URL />);
    }
    return (
        <SplunkThemeProvider family="enterprise">
            <div className="navigation">
                <div style={{ textAlign: 'center', padding: '20px' }}>
                    <Link
                        className="nav-link"
                        onClick={(e) => switchHome(e)}
                        style={{ textAlign: 'center', padding: '20px' }}
                    >
                        Home
                    </Link>

                    <Link
                        className="nav-link"
                        onClick={(e) => switchBoolean(e)}
                        style={{ textAlign: 'center', padding: '20px' }}
                    >
                        Boolean
                    </Link>

                    <Link
                        className="nav-link"
                        onClick={(e) => switchConfig(e)}
                        style={{ textAlign: 'center', padding: '20px' }}
                    >
                        Config
                    </Link>
                    <Link
                        className="nav-link"
                        onClick={(e) => switchURL(e)}
                        style={{ textAlign: 'center', padding: '20px' }}
                    >
                        URL
                    </Link>
                    <Button
                        label="Splunk UI Docs"
                        to="https://splunkui.splunk.com"
                        target="_blank"
                    ></Button>
                </div>
                {selectedComponent}
            </div>
        </SplunkThemeProvider>
    );
}

export default Layout;
