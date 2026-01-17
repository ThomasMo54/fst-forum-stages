import React from 'react';
import "./Popup.css";

interface PopupProps {
    children: React.ReactNode;
    popupId: number;
    time?: number;
    onClose: (id: number) => void
};

const Popup: React.FC<PopupProps> = ({ children, popupId, time = 5, onClose, ...rest }) => {
    const closeThis = () => {
        clearTimeout(timeOutId);
        onClose(popupId);
    };

    const timeOutId = setTimeout(closeThis, time * 1000);

    return (
        <div
            className="popup"
            {...rest}
        >
            {children}
            <button onClick={closeThis}>x</button>
        </div>
    )
}

export default Popup;
