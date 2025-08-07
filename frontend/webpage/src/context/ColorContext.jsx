import { createContext, useContext, useState } from 'react';

// Create context
const ColorContext = createContext();

// Hook for easy access
export const useColor = () => useContext(ColorContext);

// Provider component
export const ColorProvider = ({ children }) => {
    const [scheme, setScheme] = useState('light'); // default is 'light'

    const toggleScheme = () => {
        setScheme(prev => (prev === 'light' ? 'dark' : 'light'));
    };

    return (
        <ColorContext.Provider value={{ scheme, toggleScheme }}>
            {children}
        </ColorContext.Provider>
    );
};
