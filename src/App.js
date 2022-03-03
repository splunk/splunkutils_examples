import './App.css';
import { useState, useEffect, useCallback } from 'react';
import { presets, formInputTypes } from './constants';

//@splunk/visualizations imports
//These are visualizations we are using for this demo
import SingleValue from '@splunk/visualizations/SingleValue';
import Column from '@splunk/visualizations/Column';

//@splunk/react-ui imports.
//These are what give us components that look and feel like Splunk.
import Link from '@splunk/react-ui/Link';
import List from '@splunk/react-ui/List';
import P from '@splunk/react-ui/Paragraph';
import Button from '@splunk/react-ui/Button';
import WaitSpinner from '@splunk/react-ui/WaitSpinner';
import Heading from '@splunk/react-ui/Heading';
import Switch from '@splunk/react-ui/Switch';

//@splunk/react-search imports.
//These are what give us a search bar and time picker
import SearchBar from '@splunk/react-search/components/Bar';
import Input from '@splunk/react-search/components/Input';

//@splunk/splunk-utils imports.
//This is what is used to create search jobs
import { createSearchJob, getData } from '@splunk/splunk-utils/search';

//Custom Components
import LoginComponent from './components/LoginComponent';

function App() {
    //State variables for communication with Splunkd
    const [sessionKey, setSessionKey] = useState('<Token>');
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [serverURL, setServerURL] = useState('https://localhost:8089');

    const headers = {
        headers: {
            Authorization: `Splunk ${sessionKey}`,
        },
    };

    /* Second Visualization Variables */
    //Sid for Column Chart
    const [columnSid, setColumnSid] = useState();
    //Search for Column Chart
    const [splunkSearchColumn, setSplunkSearchColumn] = useState(
        'search index=_* | stats count by sourcetype | eval count=random()%200 | fields sourcetype count'
    );
    const [splunkSearchColumnEarliest, setSplunkSearchColumnEarliest] = useState('-24h');
    const [splunkSearchColumnLatest, setSplunkSearchColumnLatest] = useState('now');

    const [columnSearching, setColumnSearching] = useState(false);

    //Fields for Column Chart
    const [columnSearchResultsFields, setColumnSearchResultsFields] = useState();
    //Columns for Column Chart
    const [columnSearchResultsColumns, setColumnSearchResultsColumns] = useState();
    //Seconds to Complete for Column Chart
    const [columnSecondsToComplete, setColumnSecondsToComplete] = useState();
    const [columnSearchOptions, setColumnSearchOptions] = useState({
        earliest: splunkSearchColumnEarliest,
        latest: splunkSearchColumnLatest,
        search: splunkSearchColumn,
        timePickerPresets: presets,
        timePickerFormInputTypes: formInputTypes,
        timePickerAdvancedInputTypes: [],
    });
    const [columnSearchObj, setColumnSearchObj] = useState({
        search: '',
        earliest: '',
        latest: '',
    });
    const [columnAppendPostProcess, setColumnAppendPostProcess] = useState(false);

    /* Second Visualization Post Process Variables */
    const [splunkSearchColumnPostProcess, setSplunkSearchColumnPostProcess] = useState(
        '| search sourcetype="splunk*" OR sourcetype="*scheduler*" | sort 0 - count'
    );

    const handleColumnAppendPostProcessClick = useCallback(() => {
        setColumnAppendPostProcess((current) => !current);
    }, []);

    const columnPostProcessBar = (
        <>
            <div>
                <div style={{ float: 'left' }}>
                    <Switch
                        value={false}
                        onClick={handleColumnAppendPostProcessClick}
                        selected={columnAppendPostProcess}
                        appearance="toggle"
                        error={!columnAppendPostProcess}
                    ></Switch>
                </div>
                <div>
                    <Heading level={4} style={{ paddingLeft: '40px', paddingTop: '10px' }}>
                        {columnAppendPostProcess
                            ? '     Append Visualization'
                            : '     Update Existing'}
                    </Heading>
                </div>
            </div>
            <Input
                value={splunkSearchColumnPostProcess}
                onChange={(e, value) =>
                    handlePostProcessChange(e, value, setSplunkSearchColumnPostProcess)
                }
                onEnter={() =>
                    handleEventTrigger(
                        columnSid,
                        splunkSearchColumnPostProcess,
                        setColumnSearchResultsFields,
                        setColumnSearchResultsColumns
                    )
                }
            />
        </>
    );

    //Sid for Single Value
    const [singleValueSid, setSingleValueSid] = useState();
    //Search for Single Value
    const [splunkSearchSingleValue, setSplunkSearchSingleValue] = useState(
        'search index=_internal | stats count by sourcetype'
    );
    const [splunkSearchSingleValueEarliest, setSplunkSearchSingleValueEarliest] = useState('-24h');
    const [splunkSearchSingleValueLatest, setSplunkSearchSingleValueLatest] = useState('now');

    const [singleValueSearching, setSingleValueSearching] = useState(false);

    //Fields for Single Value
    const [singleValueSearchResultsFields, setSingleValueSearchResultsFields] = useState();
    //Columns for Single Value
    const [singleValueSearchResultsColumns, setSingleValueSearchResultsColumns] = useState();
    //Seconds to Complete for Single Value
    const [singleValueSeondsToComplete, setSingleValueSecondsToComplete] = useState();

    const [singleValueSearchOptions, setSingleValueSearchOptions] = useState({
        earliest: splunkSearchSingleValueEarliest,
        latest: splunkSearchSingleValueLatest,
        search: splunkSearchSingleValue,
        timePickerPresets: presets,
        timePickerFormInputTypes: formInputTypes,
        timePickerAdvancedInputTypes: [],
    });
    const [singleValueSearchObj, setSingleValueSearchObj] = useState({
        search: '',
        earliest: '',
        latest: '',
    });
    const [singleValueAppendPostProcess, setSingleValueAppendPostProcess] = useState(false);

    const [splunkSearchSingleValuePostProcess, setSplunkSearchSingleValuePostProcess] = useState(
        '| search sourcetype="splunkd"'
    );

    const handleSingleValueAppendPostProcessClick = () => {
        console.log(!singleValueAppendPostProcess);
        setSingleValueAppendPostProcess(!singleValueAppendPostProcess);
    };

    const singleValuePostProcessBar = (
        <>
            <div>
                <div style={{ float: 'left' }}>
                    <Switch
                        onClick={handleSingleValueAppendPostProcessClick}
                        selected={singleValueAppendPostProcess}
                        appearance="toggle"
                        error={!singleValueAppendPostProcess}
                        selectedLabel="Append Visualization"
                        unselectedLabel="Update Existing Visualization"
                    ></Switch>
                </div>

                <div>
                    <Heading level={4} style={{ paddingLeft: '40px', paddingTop: '10px' }}>
                        {singleValueAppendPostProcess
                            ? '     Append Visualization'
                            : '     Update Existing'}
                    </Heading>
                </div>
            </div>

            <Input
                value={splunkSearchSingleValuePostProcess}
                onChange={(e, value) =>
                    handlePostProcessChange(e, value, setSplunkSearchSingleValuePostProcess)
                }
                onEnter={() =>
                    handleEventTrigger(
                        singleValueSid,
                        splunkSearchSingleValuePostProcess,
                        setSingleValueSearchResultsFields,
                        setSingleValueSearchResultsColumns
                    )
                }
            />
        </>
    );

    //Timer for Search length
    const timer = (ms) => new Promise((res) => setTimeout(res, ms));
    async function load(sidJob, completeFunc, fieldsFunc, columnsFunc, setSearchingBool) {
        var completeSeconds = 0;
        for (var i = 0; i < 30; i++) {
            fetchData(sidJob, fieldsFunc, columnsFunc)
                .then((data) => data)
                .then((sidJob) => {
                    if (sidJob) {
                        completeSeconds = completeSeconds + 1;
                        setSearchingBool(false);
                        completeFunc(completeSeconds);
                    }
                });
            if (!completeSeconds) {
                await timer(1000);
            } else {
                break;
            }
        }
    }

    //Function for Clicking the Post Process Search Button
    function handlePostProcessClick(locaPostProcessSid, postProcessSearch, setFields, setColumns) {
        postProcess(locaPostProcessSid, postProcessSearch, setFields, setColumns);
    }

    //Function for Updating the Post Process Search
    function handlePostProcessChange(e, value, setPostProcess) {
        setPostProcess(value.value);
    }

    const createJob = async (search, earliest, latest) => {
        console.log(sessionKey);
        const n = createSearchJob(
            {
                search: search,
                earliest_time: earliest,
                latest_time: latest,
            },
            {},
            { splunkdPath: serverURL, app: 'search', owner: username },
            headers
        )
            .then((response) => response)
            .then((data) => data.sid);
        return n;
    };

    const fetchData = async (sidJob, fieldsFunc, columnsFunc) => {
        const n = await getData(
            sidJob,
            'results',
            { output_mode: 'json_cols' },
            { splunkdPath: serverURL, app: 'search', owner: username },
            headers
        )
            .then((response) => response)
            .then((data) => {
                if (data) {
                    fieldsFunc(data.fields);
                    columnsFunc(data.columns);
                    return data;
                }
            });
        return n;
    };

    const postProcess = async (sidJob, postProcess, fieldsFunc, columnsFunc) => {
        const n = await getData(
            sidJob,
            'results',
            { output_mode: 'json_cols', search: postProcess },
            { splunkdPath: serverURL, app: 'search', owner: username },
            headers
        )
            .then((response) => response)
            .then((data) => {
                if (data) {
                    fieldsFunc(data.fields);
                    columnsFunc(data.columns);
                    return data;
                }
            });
        return n;
    };

    const handleOptionsChange = async (option, setSearchOptions, searchOptions) => {
        setSearchOptions({
            ...searchOptions,
            ...option,
        });
    };

    /**
     * Invoked when the user hits enter or click on the search button
     */
    const handleEventTrigger = async (
        eventType,
        Sid,
        setSidFunc,
        setSearchObjFunction,
        searchObj,
        setSecondsToComplete,
        setSearchResultsFields,
        setSearchResultsColumns,
        setSearchingBool,
        setOptionsFunc,
        searchOptions
    ) => {
        setSearchObjFunction({
            search: searchOptions.search,
            earliest: searchOptions.earliest,
            latest: searchOptions.latest,
        });
        switch (eventType) {
            case 'submit':
                setSearchingBool(true);
                createJob(searchOptions.search, searchOptions.earliest, searchOptions.latest)
                    .then((data) => data)
                    .then((sidJob) => {
                        setSidFunc(sidJob);
                        load(
                            sidJob,
                            setSecondsToComplete,
                            setSearchResultsFields,
                            setSearchResultsColumns,
                            setSearchingBool
                        );
                    });

                break;
            case 'escape':
                this.handleOptionsChange({ search: '' }, setOptionsFunc, searchOptions);
                break;
            default:
                break;
        }
    };

    const wordBreakStyle = { overflowWrap: 'break-word', margin: '10px' };
    return (
        <div className="App">
            <header className="App-header">
                <Heading level={1}>@splunk/splunk-utils Example app</Heading>
                <P>
                    This app will show you how to query Splunk from a remote webapp using our Splunk
                    UI Toolkit in React. It uses a couple of packages listed below:{' '}
                </P>
                <List>
                    <List.Item>
                        <Link to="https://www.npmjs.com/package/@splunk/splunk-utils">
                            @splunk/splunk-utils
                        </Link>
                    </List.Item>
                    <ul>
                        <li>
                            <Link to="https://splunkui.splunkeng.com/Packages/splunk-utils">
                                Documentation
                            </Link>
                        </li>
                    </ul>
                    <List.Item>
                        <Link to="https://www.npmjs.com/package/@splunk/visualizations">
                            @splunk/visualizations
                        </Link>
                    </List.Item>
                    <ul>
                        <li>
                            <Link to="https://splunkui.splunkeng.com/Packages/visualizations">
                                Documentation
                            </Link>
                        </li>
                    </ul>
                    <List.Item>
                        <Link to="https://www.npmjs.com/package/@splunk/react-ui">
                            @splunk/react-ui
                        </Link>
                    </List.Item>
                    <ul>
                        <li>
                            <Link to="https://splunkui.splunkeng.com/Packages/react-ui">
                                Documentation
                            </Link>
                        </li>
                    </ul>
                </List>
                {sessionKey == '<Token>' ? (
                    <>
                        <Heading level={2}>Setup Instructions</Heading>
                        <P>
                            Note: You may need to complete a step for this app to work with your
                            Splunk Environment. Details below:
                        </P>
                        <List>
                            <List.Item>
                                You'll need to configure CORS on your Splunk Environment.
                                Instructions can be found{' '}
                                <Link to="https://dev.splunk.com/enterprise/docs/developapps/visualizedata/usesplunkjsstack/communicatesplunkserver/">
                                    here
                                </Link>
                            </List.Item>
                            <List.Item>
                                You'll need to have a trusted certificate for the Splunk management
                                port. If you don't have a valid certificate, you can always visit
                                the URL for the management port of your Splunk environment, and
                                trust the certificate manually with your browser.
                            </List.Item>
                        </List>
                    </>
                ) : (
                    <></>
                )}

                {sessionKey == '<Token>' ? (
                    <>
                        <LoginComponent
                            username={username}
                            setUsername={setUsername}
                            password={password}
                            setPassword={setPassword}
                            serverURL={serverURL}
                            setServerURL={setServerURL}
                            sessionKey={sessionKey}
                            setSessionKey={setSessionKey}
                        ></LoginComponent>
                    </>
                ) : (
                    <div style={{ width: '100%' }}>
                        <div style={{ float: 'left', width: '47%', padding: '10px' }}>
                            <Heading style={wordBreakStyle} level={3}>
                                This is a Single Value that is populated by the following search:{' '}
                            </Heading>
                            <div style={{ padding: '10px' }}>
                                <SearchBar
                                    options={singleValueSearchOptions}
                                    onOptionsChange={(options) =>
                                        handleOptionsChange(
                                            options,
                                            setSingleValueSearchOptions,
                                            singleValueSearchOptions
                                        )
                                    }
                                    onEventTrigger={(eventType) =>
                                        handleEventTrigger(
                                            eventType,
                                            singleValueSid,
                                            setSingleValueSid,
                                            setSingleValueSearchObj,
                                            singleValueSearchObj,
                                            setSingleValueSecondsToComplete,
                                            setSingleValueSearchResultsFields,
                                            setSingleValueSearchResultsColumns,
                                            setSingleValueSearching,
                                            setSingleValueSearchOptions,
                                            singleValueSearchOptions
                                        )
                                    }
                                />
                            </div>
                            {singleValueSearching ? <WaitSpinner size="medium" /> : <></>}

                            {singleValueSeondsToComplete ? (
                                <>
                                    <SingleValue
                                        options={{
                                            majorColor: '#008000',
                                            sparklineDisplay: 'off',
                                            trendDisplay: 'off',
                                        }}
                                        dataSources={{
                                            primary: {
                                                data: {
                                                    columns: singleValueSearchResultsColumns,
                                                    fields: singleValueSearchResultsFields,
                                                },
                                                meta: {},
                                            },
                                        }}
                                    />

                                    <Heading style={wordBreakStyle} level={3}>
                                        Clicking this button will execute the following post-process
                                        search:{' '}
                                    </Heading>

                                    {singleValuePostProcessBar}

                                    <Button
                                        label="Execute Post-process"
                                        appearance="primary"
                                        onClick={() =>
                                            handlePostProcessClick(
                                                singleValueSid,
                                                splunkSearchSingleValuePostProcess,
                                                setSingleValueSearchResultsFields,
                                                setSingleValueSearchResultsColumns
                                            )
                                        }
                                    />
                                    <P style={wordBreakStyle}>
                                        Search: {singleValueSearchOptions.search}
                                    </P>
                                    <P style={wordBreakStyle}>{'Splunk SID: ' + singleValueSid}</P>
                                    <P style={wordBreakStyle}>
                                        {'Seconds to Complete: ' +
                                            JSON.stringify(singleValueSeondsToComplete)}
                                    </P>
                                    <P style={wordBreakStyle}>
                                        {'Splunk Results - Fields: ' +
                                            JSON.stringify(singleValueSearchResultsFields)}
                                    </P>
                                    <P style={wordBreakStyle}>
                                        {'Splunk Results - Columns: ' +
                                            JSON.stringify(singleValueSearchResultsColumns)}
                                    </P>
                                </>
                            ) : (
                                <></>
                            )}
                        </div>

                        <div style={{ float: 'right', width: '47%', padding: '10px' }}>
                            <Heading style={wordBreakStyle} level={3}>
                                This is a Column Chart that is populated by the following search:{' '}
                            </Heading>
                            <div style={{ padding: '10px' }}>
                                <SearchBar
                                    options={columnSearchOptions}
                                    onOptionsChange={(options) =>
                                        handleOptionsChange(
                                            options,
                                            setColumnSearchOptions,
                                            columnSearchOptions
                                        )
                                    }
                                    onEventTrigger={(eventType) =>
                                        handleEventTrigger(
                                            eventType,
                                            columnSid,
                                            setColumnSid,
                                            setColumnSearchObj,
                                            columnSearchObj,
                                            setColumnSecondsToComplete,
                                            setColumnSearchResultsFields,
                                            setColumnSearchResultsColumns,
                                            setColumnSearching,
                                            setColumnSearchOptions,
                                            columnSearchOptions
                                        )
                                    }
                                />
                            </div>
                            {columnSearching ? <WaitSpinner size="medium" /> : <></>}

                            {columnSecondsToComplete ? (
                                <>
                                    <Column
                                        options={{}}
                                        dataSources={{
                                            primary: {
                                                data: {
                                                    fields: columnSearchResultsFields,
                                                    columns: columnSearchResultsColumns,
                                                },
                                                meta: {},
                                            },
                                        }}
                                    />

                                    <Heading style={wordBreakStyle} level={3}>
                                        Clicking this button will execute the following post-process
                                        search:{' '}
                                    </Heading>

                                    {columnPostProcessBar}

                                    <Button
                                        label="Execute Post-process"
                                        appearance="primary"
                                        onClick={() =>
                                            handlePostProcessClick(
                                                columnSid,
                                                splunkSearchColumnPostProcess,
                                                setColumnSearchResultsFields,
                                                setColumnSearchResultsColumns
                                            )
                                        }
                                    />

                                    <P style={wordBreakStyle}>
                                        Search: {columnSearchOptions.search}
                                    </P>
                                    <P>{'Splunk SID: ' + columnSid}</P>
                                    <P style={wordBreakStyle}>
                                        {'Seconds to Complete: ' +
                                            JSON.stringify(columnSecondsToComplete)}
                                    </P>
                                    <P style={wordBreakStyle}>
                                        {'Splunk Results - Fields: ' +
                                            JSON.stringify(columnSearchResultsFields)}
                                    </P>
                                    <P style={wordBreakStyle}>
                                        {'Splunk Results - Columns: ' +
                                            JSON.stringify(columnSearchResultsColumns)}
                                    </P>
                                </>
                            ) : (
                                <></>
                            )}
                        </div>
                    </div>
                )}
            </header>
        </div>
    );
}

export default App;
