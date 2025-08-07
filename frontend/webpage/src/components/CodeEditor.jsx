import { useState, useEffect } from 'react';
import Editor from '@monaco-editor/react';
import { useColor } from '../context/ColorContext';
import { useFileContext } from '../context/FileContext';
import OpenFilesBar from './OpenFilesBar.jsx';
import { diffChars } from 'diff';

const CodeEditor = () => {
    const { scheme } = useColor();
    const [code, setCode] = useState('');
    const { showFile, updateFileContent, addPendingChanges } = useFileContext();

    /*
    useEffect(() => { // Update editor content when showFile changes
        if (showFile?.file_content !== undefined) {
            setCode(showFile.file_content);
        }
    }, [showFile]);


    // Update editor text and file content
    const handleEditorChange = (value) => {
        setCode(value);
        if (showFile?.id) {
            updateFileContent(showFile.id, value);
        }
    };
    */

    const [prevCode, setPrevCode] = useState('');
    const [pendingChanges, setPendingChanges] = useState([]);

    useEffect(() => {
        if (showFile?.file_content !== undefined) {
            setCode(showFile.file_content);
            setPrevCode(showFile.file_content);
            setPendingChanges([]); // reset changes on file load
        }
    }, [showFile]);

    const handleEditorChange = (value) => {
        // Calculate diff between prevCode and new value
        const diffs = diffChars(prevCode, value);
        let cursorPos = 0; // tracks offset in old string
        const changes = [];

        diffs.forEach(part => {
            if (part.added) {
                // Insert at current cursor position
                changes.push({
                    change_type: 'insert',
                    position: cursorPos,
                    text: part.value
                });
            } else if (part.removed) {
                // Delete at current cursor position
                changes.push({
                    change_type: 'delete',
                    position: cursorPos,
                    length: part.value.length
                });
                cursorPos += part.value.length;
            } else {
                // unchanged chunk, advance cursor
                cursorPos += part.value.length;
            }
        });

        if (showFile?.id && changes.length > 0) {
            addPendingChanges(showFile.id, changes);
        }

        setPendingChanges(prev => [...prev, ...changes]);
        setCode(value);
        setPrevCode(value);

        if (showFile?.id) {
            updateFileContent(showFile.id, value);
        }
    };

    return (
        <div className="flex-grow-1 d-flex flex-column" style={{ minHeight: 0 }}>
            <OpenFilesBar />
            <Editor
                height="100%"
                width="100%"
                language={showFile?.extension || 'plaintext'} // ✅ match file type
                value={code}
                theme={scheme === 'dark' ? 'vs-dark' : 'vs'}
                onChange={handleEditorChange}
                options={{
                    fontSize: 14,
                    minimap: { enabled: false },
                    tabSize: 4,
                    automaticLayout: true,
                }}
                className="flex-grow-1"
            />
        </div>
    );
};

export default CodeEditor;
