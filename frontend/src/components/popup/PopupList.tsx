import React, { useState } from 'react';
import { PopupContext } from "./PopupContext";
import Popup from "./Popup";
import "./PopupList.css";

const PopupList: React.FC = () => {
    const popupsContext = React.useContext(PopupContext);

    const [popups, setPopups] = useState(popupsContext);

    const deleteThis = (id: number) => {
        setPopups(prevPopups =>
            prevPopups.filter(popup => popup.id != id)
        );
    }

    return (
        <PopupContext value={popups}>
            <div className="popup-list">
                {
                    popups.map(({ id, opt }) => (
                        <Popup key={id} onClose={deleteThis} popupId={id} time={opt.time ?? 5}>
                            {opt.children}
                        </Popup>
                    ))
                }
            </div>
        </PopupContext >
    )
}

export default PopupList
