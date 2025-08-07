import React, { useState } from 'react';
import UtilBar from './components/UtilBar';
import AppNavbar from "./components/AppNavbar.jsx";
import CodeEditor from "./components/CodeEditor.jsx";

function App() {
    const [selectedItem, setSelectedItem] = useState(null);

    return (
        <div className="vh-100 d-flex flex-column">
            <AppNavbar />

            <div className="d-flex flex-grow-1" style={{ minHeight: 0 }}>
                <UtilBar onSelectItem={setSelectedItem} />

                <div className="flex-grow-1 d-flex" style={{ minHeight: 0 }}>
                    <CodeEditor />
                </div>
            </div>
        </div>
    );
}

export default App;


