import React, { useState } from 'react';
import { PopupContext } from "./PopupContext";
import Popup from "./Popup";

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
            <div>
                <ul>
                    {
                        popups.map(({ id, opt }) => (
                            <li key={id} style={{ top: id + "em" }} >
                                <Popup onClose={deleteThis} popupId={id} time={opt.time ?? 5}>
                                    {opt.children}
                                </Popup>
                            </li>
                        ))
                    }
                </ul>
            </div>
        </PopupContext >
    )
}

export default PopupList
