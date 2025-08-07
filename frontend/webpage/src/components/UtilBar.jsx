import { useState } from 'react';
import ProjectExplorer from './ProjectExplorer';
import GithubPanel from './GithubPanel';
import { Button } from 'react-bootstrap';
import { useColor } from '../context/ColorContext';
import GitHubPanel from "./GithubPanel"; // adjust path if needed

function UtilBar({ onSelectItem }) {
    const [showExplorer, setShowExplorer] = useState(false);
    const [showGitHub, setShowGitHub] = useState(false);
    const { scheme } = useColor();
    const isDark = scheme === 'dark';

    const toggleExplorer = () => {
        setShowExplorer(prev => !prev);
        setShowGitHub(false);
    };

    const toggleGitHub = () => {
        setShowGitHub(prev => !prev);
        setShowExplorer(false);
    };

    return (
        <div className="d-flex">
            {/* Vertical Sidebar */}
            <div
                className={`d-flex flex-column align-items-center 
          ${isDark ? 'bg-secondary bg-opacity-75' : 'bg-light'} 
          p-2 h-100`}
                style={{ width: '60px', boxShadow: isDark ? '2px 0 8px rgba(0,0,0,0.6)' : '2px 0 8px rgba(0,0,0,0.1)' }}
            >
                <Button
                    variant={isDark ? 'outline-light' : 'outline-primary'}
                    size="sm"
                    onClick={toggleExplorer}
                    title="Toggle Project Explorer"
                    className="mb-2"
                    style={{ width: '40px', height: '40px', padding: 0, fontSize: '1.25rem', lineHeight: 1 }}
                >
                    📁
                </Button>

                <Button
                    variant={isDark ? 'outline-light' : 'outline-primary'}
                    size="sm"
                    onClick={toggleGitHub}
                    title="Toggle GitHub Panel"
                    className="mb-2"
                    style={{ width: '40px', height: '40px', padding: 0, fontSize: '1.25rem', lineHeight: 1 }}
                >
                    G
                </Button>
            </div>

            {/* Explorer Drawer */}
            {showExplorer && (
                <div
                    className={`border-start ${isDark ? 'bg-dark text-light' : 'bg-white text-dark'}`}
                    style={{ minWidth: '300px', maxWidth: '400px', height: '100vh', overflowY: 'auto' }}
                >
                    <ProjectExplorer onSelectItem={onSelectItem} />
                </div>
            )}

            {/* GitHub Drawer */}
            {showGitHub && (
                <div
                    className={`border-start ${isDark ? 'bg-dark text-light' : 'bg-white text-dark'}`}
                    style={{ minWidth: '300px', maxWidth: '400px', height: '100vh', overflowY: 'auto' }}
                >
                    <GitHubPanel />
                </div>
            )}
        </div>
    );
}

export default UtilBar;
