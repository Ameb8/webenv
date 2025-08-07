import { useState, useRef, useEffect } from 'react';
import { Navbar, Container, Nav, Image } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import Profile from './Profile';
import User from './User';
import userIcon from '../assets/user.png';
import { useColor } from '../context/ColorContext.jsx';
import ProjectFolderSelector from './ProjectFolderSelector';  // Import it

function AppNavbar() {
    const { user } = useAuth();
    const [showUserDropdown, setShowUserDropdown] = useState(false);
    const [showProjectDropdown, setShowProjectDropdown] = useState(false);

    const userToggleRef = useRef(null);
    const projectToggleRef = useRef(null);
    const projectDropdownRef = useRef(null);
    const userDropdownRef = useRef(null);

    const { scheme } = useColor();
    const isDark = scheme === 'dark';

    // Close dropdowns when clicking outside
    useEffect(() => {
        const handleClickOutside = (e) => {
            if (
                userDropdownRef.current &&
                !userDropdownRef.current.contains(e.target) &&
                userToggleRef.current &&
                !userToggleRef.current.contains(e.target)
            ) {
                setShowUserDropdown(false);
            }

            if (
                projectDropdownRef.current &&
                !projectDropdownRef.current.contains(e.target) &&
                projectToggleRef.current &&
                !projectToggleRef.current.contains(e.target)
            ) {
                setShowProjectDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    // Toggle handlers
    const toggleUserDropdown = () => setShowUserDropdown(prev => !prev);
    const toggleProjectDropdown = () => setShowProjectDropdown(prev => !prev);

    // Calculate project dropdown position dynamically
    const [projectDropdownStyle, setProjectDropdownStyle] = useState({});

    useEffect(() => {
        if (showProjectDropdown && projectToggleRef.current) {
            const rect = projectToggleRef.current.getBoundingClientRect();
            setProjectDropdownStyle({
                position: 'absolute',
                top: rect.bottom + window.scrollY + 4, // slightly below button
                left: rect.left + window.scrollX,
                zIndex: 1050,
                minWidth: '280px',
                maxHeight: '400px',
                overflowY: 'auto',
                boxShadow: isDark
                    ? '0 0 10px rgba(255,255,255,0.15)'
                    : '0 4px 8px rgba(0,0,0,0.1)',
                borderRadius: '0.375rem',
                backgroundColor: isDark ? '#343a40' : 'white',
                padding: '1rem',
                animation: 'fadeInDrop 0.25s ease forwards',
            });
        }
    }, [showProjectDropdown, isDark]);

    return (
        <>
            <Navbar
                bg={isDark ? 'dark' : 'light'}
                variant={isDark ? 'dark' : 'light'}
                expand="lg"
                className={`border-bottom px-4 py-1 ${isDark ? 'shadow' : 'shadow-sm'}`}
            >
                <Container fluid className="d-flex justify-content-between align-items-center">
                    <Navbar.Brand
                        className={`fw-bold fs-3 ${isDark ? 'text-light' : 'text-primary'}`}
                        style={{ letterSpacing: '0.05em' }}
                    >
                        CFLOW
                    </Navbar.Brand>

                    <Nav className="d-flex align-items-center">
                        <div
                            ref={projectToggleRef}
                            role="button"
                            onClick={toggleProjectDropdown}
                            className={`d-flex align-items-center px-3 py-2 rounded-pill me-3 ${
                                isDark ? 'bg-secondary bg-opacity-25' : 'bg-light'
                            }`}
                            style={{
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease',
                                userSelect: 'none',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = isDark ? '#5a5a5a' : '#e9ecef';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = isDark ? 'rgba(108,117,125,0.25)' : 'white';
                            }}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') toggleProjectDropdown();
                            }}
                        >
                            <span
                                className={`fw-semibold me-2 ${isDark ? 'text-light' : 'text-dark'}`}
                                style={{ fontSize: '1rem' }}
                            >
                                Select Project
                            </span>
                            <span
                                className={`ms-1 ${isDark ? 'text-light' : 'text-muted'}`}
                                style={{ fontSize: '0.8rem', userSelect: 'none' }}
                            >
                                ▼
                            </span>
                        </div>

                        <div
                            ref={userToggleRef}
                            role="button"
                            onClick={toggleUserDropdown}
                            className={`d-flex align-items-center px-3 py-2 rounded-pill ${
                                isDark ? 'bg-secondary bg-opacity-25' : 'bg-light'
                            }`}
                            style={{
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease',
                                userSelect: 'none',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = isDark ? '#5a5a5a' : '#e9ecef';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = isDark ? 'rgba(108,117,125,0.25)' : 'white';
                            }}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') toggleUserDropdown();
                            }}
                        >
                            {user ? (
                                <span
                                    className={`fw-semibold me-3 ${isDark ? 'text-light' : 'text-dark'}`}
                                    style={{ fontSize: '1.1rem' }}
                                >
                                    {user.username}
                                </span>
                            ) : (
                                <Image
                                    src={userIcon}
                                    alt="User Icon"
                                    width={30}
                                    height={30}
                                    roundedCircle
                                    className="me-2 border border-secondary-subtle"
                                    style={{ transition: 'transform 0.2s ease' }}
                                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                                />
                            )}
                            <span
                                className={`ms-1 ${isDark ? 'text-light' : 'text-muted'}`}
                                style={{ fontSize: '0.8rem', userSelect: 'none' }}
                            >
                                ▼
                            </span>
                        </div>
                    </Nav>
                </Container>
            </Navbar>

            {showProjectDropdown && (
                <div ref={projectDropdownRef} style={projectDropdownStyle}>
                    <ProjectFolderSelector />
                </div>
            )}

            {showUserDropdown && (
                <div
                    ref={userDropdownRef}
                    className={`position-absolute end-0 mt-2 me-4 p-3 border rounded-3 shadow-lg ${
                        isDark ? 'bg-dark text-light' : 'bg-white'
                    }`}
                    style={{
                        top: '65px',
                        zIndex: 1050,
                        minWidth: '220px',
                        animation: 'fadeInDrop 0.25s ease forwards',
                        boxShadow: isDark
                            ? '0 0 10px rgba(255,255,255,0.15)'
                            : '0 4px 8px rgba(0,0,0,0.1)',
                    }}
                >
                    {user ? <Profile /> : <User />}
                </div>
            )}

            <style>{`
                @keyframes fadeInDrop {
                    0% {opacity: 0; transform: translateY(-10px);}
                    100% {opacity: 1; transform: translateY(0);}
                }
            `}</style>
        </>
    );
}

export default AppNavbar;




/*
import { useState, useRef, useEffect } from 'react';
import { Navbar, Container, Nav, Image } from 'react-bootstrap';
import { useAuth } from '../context/AuthContext';
import Profile from './Profile';
import User from './User';
import userIcon from '../assets/user.png';
import { useColor } from '../context/ColorContext.jsx';

function AppNavbar() {
    const { user } = useAuth();
    const [showDropdown, setShowDropdown] = useState(false);
    const dropdownRef = useRef(null);
    const toggleRef = useRef(null);
    const { scheme } = useColor();

    const toggleDropdown = () => setShowDropdown(prev => !prev);

    useEffect(() => { // Close dropdown when clicking outside
        const handleClickOutside = (e) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(e.target) &&
                !toggleRef.current.contains(e.target)
            ) {
                setShowDropdown(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const isDark = scheme === 'dark'; // Follow color scheme

    return (
        <>
            <Navbar
                bg={isDark ? 'dark' : 'light'}
                variant={isDark ? 'dark' : 'light'}
                expand="lg"
                className={`border-bottom px-4 py-1 ${isDark ? 'shadow' : 'shadow-sm'}`}
            >
                <Container fluid className="d-flex justify-content-between align-items-center">
                    <Navbar.Brand
                        className={`fw-bold fs-3 ${isDark ? 'text-light' : 'text-primary'}`}
                        style={{ letterSpacing: '0.05em' }}
                    >
                        CFLOW
                    </Navbar.Brand>

                    <Nav className="d-flex align-items-center">
                        <div
                            ref={toggleRef}
                            role="button"
                            onClick={toggleDropdown}
                            className={`d-flex align-items-center px-3 py-2 rounded-pill ${
                                isDark ? 'bg-secondary bg-opacity-25' : 'bg-light'
                            }`}
                            style={{
                                cursor: 'pointer',
                                transition: 'background-color 0.3s ease',
                                userSelect: 'none',
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.backgroundColor = isDark ? '#5a5a5a' : '#e9ecef';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.backgroundColor = isDark ? 'rgba(108,117,125,0.25)' : 'white';
                            }}
                            tabIndex={0}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter' || e.key === ' ') toggleDropdown();
                            }}
                        >
                            {user ? (
                                <span
                                    className={`fw-semibold me-3 ${isDark ? 'text-light' : 'text-dark'}`}
                                    style={{ fontSize: '1.1rem' }}
                                >
                                    {user.username}
                                </span>
                            ) : (
                                <Image
                                    src={userIcon}
                                    alt="User Icon"
                                    width={30}
                                    height={30}
                                    roundedCircle
                                    className="me-2 border border-secondary-subtle"
                                    style={{ transition: 'transform 0.2s ease' }}
                                    onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.1)')}
                                    onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                                />
                            )}
                            <span
                                className={`ms-1 ${isDark ? 'text-light' : 'text-muted'}`}
                                style={{ fontSize: '0.8rem', userSelect: 'none' }}
                            >
                                ▼
                            </span>
                        </div>
                    </Nav>
                </Container>
            </Navbar>

            {showDropdown && (
                <div
                    ref={dropdownRef}
                    className={`position-absolute end-0 mt-2 me-4 p-3 border rounded-3 shadow-lg ${
                        isDark ? 'bg-dark text-light' : 'bg-white'
                    }`}
                    style={{
                        top: '65px',
                        zIndex: 1050,
                        minWidth: '220px',
                        animation: 'fadeInDrop 0.25s ease forwards',
                        boxShadow: isDark
                            ? '0 0 10px rgba(255,255,255,0.15)'
                            : '0 4px 8px rgba(0,0,0,0.1)',
                    }}
                >
                    {user ? <Profile /> : <User />}
                </div>
            )}

            <style>{`
                @keyframes fadeInDrop {
                    0% {opacity: 0; transform: translateY(-10px);}
                    100% {opacity: 1; transform: translateY(0);}
                }
            `}</style>
        </>
    );
}

export default AppNavbar;

*/