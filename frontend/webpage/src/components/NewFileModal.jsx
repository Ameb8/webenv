import { useEffect, useRef, useState } from 'react';
import { Modal, Button, Form, Tabs, Tab } from 'react-bootstrap';
import csrfAxios from '../util/csrfAxios';
import RepoImport from './RepoImport.jsx'

const extensions = ['c', 'h'];

export default function NewFileModal({ show, onHide, folderId, onFileCreated }) {
    const [fileName, setFileName] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const [activeTab, setActiveTab] = useState('newFile');
    const inputRef = useRef(null);

    useEffect(() => {
        if (show && activeTab === 'newFile' && inputRef.current) {
            inputRef.current.focus();
        }
    }, [show, activeTab]);

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % extensions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + extensions.length) % extensions.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        const payload = {
            file_name: fileName.trim(),
            folder: folderId,
            extension: extensions[selectedIndex],
            file_content: '',
        };

        try {
            const response = await csrfAxios.post('/file-sys/files/', payload);
            if (onFileCreated) onFileCreated(response.data);
            onHide();
            setFileName('');
            setSelectedIndex(0);
        } catch (err) {
            console.error('Failed to create file:', err);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>File Options</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Tabs
                    activeKey={activeTab}
                    onSelect={(k) => setActiveTab(k)}
                    className="mb-3"
                >
                    <Tab eventKey="newFile" title="New File">
                        <Form.Control
                            ref={inputRef}
                            type="text"
                            placeholder="Enter file name"
                            value={fileName}
                            onChange={(e) => setFileName(e.target.value)}
                            onKeyDown={handleKeyDown}
                            autoFocus
                            className="mb-3"
                        />
                        <div className="d-flex flex-column gap-1">
                            {extensions.map((ext, i) => (
                                <Button
                                    key={ext}
                                    variant={i === selectedIndex ? 'primary' : 'outline-secondary'}
                                    onClick={() => setSelectedIndex(i)}
                                    className="text-start"
                                >
                                    .{ext}
                                </Button>
                            ))}
                        </div>
                    </Tab>

                    <Tab eventKey="repository" title="Repository">
                        <div>
                            <RepoImport folderId={folderId} />
                        </div>
                    </Tab>
                </Tabs>
            </Modal.Body>
        </Modal>
    );
}






/*
import { useEffect, useRef, useState } from 'react';
import { Modal, Button, Form } from 'react-bootstrap';
import csrfAxios from '../util/csrfAxios';

const extensions = ['c', 'h'];

export default function NewFileModal({ show, onHide, folderId, onFileCreated }) {
    const [fileName, setFileName] = useState('');
    const [selectedIndex, setSelectedIndex] = useState(0);
    const inputRef = useRef(null);

    useEffect(() => {
        if (show && inputRef.current) {
            inputRef.current.focus();
        }
    }, [show]);

    const handleKeyDown = (e) => {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev + 1) % extensions.length);
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            setSelectedIndex((prev) => (prev - 1 + extensions.length) % extensions.length);
        } else if (e.key === 'Enter') {
            e.preventDefault();
            handleSubmit();
        }
    };

    const handleSubmit = async () => {
        const payload = {
            file_name: fileName.trim(),
            folder: folderId,
            extension: extensions[selectedIndex],
            file_content: '',
        };

        try {
            const response = await csrfAxios.post('/file-sys/files/', payload);
            if (onFileCreated) onFileCreated(response.data);
            onHide();
            setFileName('');
            setSelectedIndex(0);
        } catch (err) {
            console.error('Failed to create file:', err);
        }
    };

    return (
        <Modal show={show} onHide={onHide} centered>
            <Modal.Header closeButton>
                <Modal.Title>Create New File</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                <Form.Control
                    ref={inputRef}
                    type="text"
                    placeholder="Enter file name"
                    value={fileName}
                    onChange={(e) => setFileName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    autoFocus
                    className="mb-3"
                />
                <div className="d-flex flex-column gap-1">
                    {extensions.map((ext, i) => (
                        <Button
                            key={ext}
                            variant={i === selectedIndex ? 'primary' : 'outline-secondary'}
                            onClick={() => setSelectedIndex(i)}
                            className="text-start"
                        >
                            .{ext}
                        </Button>
                    ))}
                </div>
            </Modal.Body>
        </Modal>
    );
}
*/


