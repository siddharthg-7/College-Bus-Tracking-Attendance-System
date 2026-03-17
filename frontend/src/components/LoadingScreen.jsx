/**
 * Loading Screen Component
 * Displays while app is initializing
 */

import { FaBus } from 'react-icons/fa';
import './LoadingScreen.css';

function LoadingScreen() {
    return (
        <div className="loading-screen">
            <div className="loading-content">
                <div className="loading-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-icon"><FaBus /></div>
                </div>
                <h2 className="loading-title">College Bus Tracker</h2>
                <p className="loading-text">Loading your dashboard...</p>
            </div>
        </div>
    );
}

export default LoadingScreen;
