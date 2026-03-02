// frontend/src/components/AnnouncementPopup.js
import React, { useState, useEffect } from 'react';
import { useSettings } from '../context/SettingsContext';

function AnnouncementPopup() {
    const { settings } = useSettings();
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        // Check if announcement is enabled and has text
        if (settings.announcement_enabled && settings.announcement_text) {
            // Check if user has already seen this announcement
            const lastAnnouncement = localStorage.getItem('last_announcement_seen');
            const currentAnnouncement = settings.announcement_text;
            
            // Show popup if announcement text has changed or never seen
            if (lastAnnouncement !== currentAnnouncement) {
                // Delay showing popup by 1 second for better UX
                const timer = setTimeout(() => {
                    setIsVisible(true);
                }, 1000);
                
                return () => clearTimeout(timer);
            }
        }
    }, [settings.announcement_enabled, settings.announcement_text]);

    const handleClose = () => {
        setIsVisible(false);
        // Save announcement as seen
        localStorage.setItem('last_announcement_seen', settings.announcement_text);
    };

    if (!isVisible || !settings.announcement_enabled || !settings.announcement_text) {
        return null;
    }

    return (
        <>
            <div className="announcement-overlay" onClick={handleClose}></div>
            <div className="announcement-popup animate-slide-in">
                <div className="announcement-header">
                    <div className="announcement-icon">
                        <i className="fas fa-bullhorn"></i>
                    </div>
                    <h3>Pengumuman Penting</h3>
                    <button className="close-btn" onClick={handleClose} aria-label="Close">
                        <i className="fas fa-times"></i>
                    </button>
                </div>
                <div className="announcement-body">
                    <p>{settings.announcement_text}</p>
                </div>
                <div className="announcement-footer">
                    <button className="btn-understood" onClick={handleClose}>
                        <i className="fas fa-check"></i> Mengerti
                    </button>
                </div>
            </div>

            <style jsx>{`
                .announcement-overlay {
                    position: fixed;
                    top: 0;
                    left: 0;
                    right: 0;
                    bottom: 0;
                    background: rgba(0, 0, 0, 0.5);
                    backdrop-filter: blur(4px);
                    z-index: 9998;
                    animation: fadeIn 0.3s ease-out;
                }

                .announcement-popup {
                    position: fixed;
                    top: 50%;
                    left: 50%;
                    transform: translate(-50%, -50%);
                    background: white;
                    border-radius: 12px;
                    box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
                    z-index: 9999;
                    width: 90%;
                    max-width: 500px;
                    max-height: 80vh;
                    overflow: hidden;
                    display: flex;
                    flex-direction: column;
                }

                .animate-slide-in {
                    animation: slideIn 0.4s cubic-bezier(0.16, 1, 0.3, 1);
                }

                @keyframes fadeIn {
                    from {
                        opacity: 0;
                    }
                    to {
                        opacity: 1;
                    }
                }

                @keyframes slideIn {
                    from {
                        transform: translate(-50%, -60%);
                        opacity: 0;
                    }
                    to {
                        transform: translate(-50%, -50%);
                        opacity: 1;
                    }
                }

                .announcement-header {
                    display: flex;
                    align-items: center;
                    gap: 12px;
                    padding: 20px;
                    background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
                    color: white;
                    position: relative;
                }

                .announcement-icon {
                    font-size: 24px;
                    animation: pulse 2s infinite;
                }

                @keyframes pulse {
                    0%, 100% {
                        opacity: 1;
                    }
                    50% {
                        opacity: 0.7;
                    }
                }

                .announcement-header h3 {
                    flex: 1;
                    margin: 0;
                    font-size: 18px;
                    font-weight: 600;
                }

                .close-btn {
                    background: rgba(255, 255, 255, 0.2);
                    border: none;
                    width: 32px;
                    height: 32px;
                    border-radius: 50%;
                    color: white;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: background 0.2s;
                }

                .close-btn:hover {
                    background: rgba(255, 255, 255, 0.3);
                }

                .announcement-body {
                    padding: 24px;
                    overflow-y: auto;
                    flex: 1;
                }

                .announcement-body p {
                    margin: 0;
                    line-height: 1.6;
                    color: #374151;
                    font-size: 15px;
                    white-space: pre-wrap;
                    word-break: break-word;
                }

                .announcement-footer {
                    padding: 16px 20px;
                    border-top: 1px solid #e5e7eb;
                    display: flex;
                    justify-content: flex-end;
                }

                .btn-understood {
                    background: #4f46e5;
                    color: white;
                    border: none;
                    padding: 10px 24px;
                    border-radius: 8px;
                    font-size: 14px;
                    font-weight: 500;
                    cursor: pointer;
                    display: flex;
                    align-items: center;
                    gap: 8px;
                    transition: background 0.2s;
                }

                .btn-understood:hover {
                    background: #4338ca;
                }

                @media (max-width: 640px) {
                    .announcement-popup {
                        width: 95%;
                        max-height: 85vh;
                    }

                    .announcement-header {
                        padding: 16px;
                    }

                    .announcement-header h3 {
                        font-size: 16px;
                    }

                    .announcement-body {
                        padding: 20px;
                    }

                    .announcement-body p {
                        font-size: 14px;
                    }
                }
            `}</style>
        </>
    );
}

export default AnnouncementPopup;
