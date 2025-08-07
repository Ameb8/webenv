import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useColor } from '../context/ColorContext';
import { Button, Stack, Modal, Form, Alert } from 'react-bootstrap';

function User() {
    const { handleGitHubLogin, login } = useAuth();
    const { scheme, toggleScheme } = useColor();
    const isDark = scheme === 'dark';

    // States for Create Account modal
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [createUsername, setCreateUsername] = useState('');
    const [createPassword, setCreatePassword] = useState('');
    const [createConfirmPassword, setCreateConfirmPassword] = useState('');
    const [createError, setCreateError] = useState('');

    // States for Login modal
    const [showLoginModal, setShowLoginModal] = useState(false);
    const [loginUsername, setLoginUsername] = useState('');
    const [loginPassword, setLoginPassword] = useState('');
    const [loginError, setLoginError] = useState('');

    // Handlers for Create Account modal
    const handleCreateClose = () => {
        setShowCreateModal(false);
        setCreateUsername('');
        setCreatePassword('');
        setCreateConfirmPassword('');
        setCreateError('');
    };
    const handleCreateShow = () => setShowCreateModal(true);

    // Handlers for Login modal
    const handleLoginClose = () => {
        setShowLoginModal(false);
        setLoginUsername('');
        setLoginPassword('');
        setLoginError('');
    };
    const handleLoginShow = () => setShowLoginModal(true);

    // Submit for Create Account
    const handleCreateSubmit = async (e) => {
        e.preventDefault();
        if (!createUsername || !createPassword || !createConfirmPassword) {
            setCreateError('Please fill out all fields.');
            return;
        }
        if (createPassword !== createConfirmPassword) {
            setCreateError('Passwords do not match.');
            return;
        }
        setCreateError('');
        try {
            // Replace with your actual create account call if you have one
            await login(createUsername, createPassword); // For demo, just logging in after create
            handleCreateClose();
        } catch (err) {
            setCreateError('Failed to create account.');
            console.error(err);
        }
    };

    // Submit for Login
    const handleLoginSubmit = async (e) => {
        e.preventDefault();
        if (!loginUsername || !loginPassword) {
            setLoginError('Please enter username and password.');
            return;
        }
        setLoginError('');
        try {
            await login(loginUsername, loginPassword);
            handleLoginClose();
        } catch (err) {
            setLoginError('Login failed. Please try again.');
            console.error(err);
        }
    };

    return (
        <div className={`p-3 rounded-3 ${isDark ? 'bg-dark text-light' : 'bg-light text-dark'}`}>
            <Stack gap={2}>
                <Button
                    variant={isDark ? 'primary' : 'dark'}
                    size="sm"
                    onClick={handleLoginShow}  // Show login modal here
                >
                    Login
                </Button>

                <Button
                    variant="outline-primary"
                    size="sm"
                    onClick={handleGitHubLogin}
                >
                    Login with GitHub
                </Button>

                <Button
                    variant={isDark ? 'success' : 'outline-success'}
                    size="sm"
                    onClick={handleCreateShow}
                >
                    Create Account
                </Button>

                <hr className={`my-2 ${isDark ? 'border-light' : 'border-dark'}`} />

                <Button
                    variant={isDark ? 'outline-light' : 'outline-dark'}
                    size="sm"
                    onClick={toggleScheme}
                >
                    {isDark ? 'Light Mode' : 'Dark Mode'}
                </Button>
            </Stack>

            {/* Modal for Create Account */}
            <Modal show={showCreateModal} onHide={handleCreateClose} centered>
                <Modal.Header closeButton className={isDark ? 'bg-dark text-light' : ''}>
                    <Modal.Title>Create Account</Modal.Title>
                </Modal.Header>
                <Modal.Body className={isDark ? 'bg-dark text-light' : ''}>
                    {createError && <Alert variant="danger">{createError}</Alert>}

                    <Form onSubmit={handleCreateSubmit}>
                        <Form.Group className="mb-3" controlId="formCreateUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter username"
                                value={createUsername}
                                onChange={(e) => setCreateUsername(e.target.value)}
                                autoFocus
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formCreatePassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={createPassword}
                                onChange={(e) => setCreatePassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formCreateConfirmPassword">
                            <Form.Label>Confirm Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Confirm Password"
                                value={createConfirmPassword}
                                onChange={(e) => setCreateConfirmPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button
                            variant={isDark ? 'success' : 'outline-success'}
                            type="submit"
                            className="w-100"
                        >
                            Create Account
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>

            {/* Modal for Login */}
            <Modal show={showLoginModal} onHide={handleLoginClose} centered>
                <Modal.Header closeButton className={isDark ? 'bg-dark text-light' : ''}>
                    <Modal.Title>Login</Modal.Title>
                </Modal.Header>
                <Modal.Body className={isDark ? 'bg-dark text-light' : ''}>
                    {loginError && <Alert variant="danger">{loginError}</Alert>}

                    <Form onSubmit={handleLoginSubmit}>
                        <Form.Group className="mb-3" controlId="formLoginUsername">
                            <Form.Label>Username</Form.Label>
                            <Form.Control
                                type="text"
                                placeholder="Enter username"
                                value={loginUsername}
                                onChange={(e) => setLoginUsername(e.target.value)}
                                autoFocus
                                required
                            />
                        </Form.Group>

                        <Form.Group className="mb-3" controlId="formLoginPassword">
                            <Form.Label>Password</Form.Label>
                            <Form.Control
                                type="password"
                                placeholder="Password"
                                value={loginPassword}
                                onChange={(e) => setLoginPassword(e.target.value)}
                                required
                            />
                        </Form.Group>

                        <Button
                            variant={isDark ? 'primary' : 'dark'}
                            type="submit"
                            className="w-100"
                        >
                            Login
                        </Button>
                    </Form>
                </Modal.Body>
            </Modal>
        </div>
    );
}

export default User;
