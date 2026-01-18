import React from 'react';

export interface PopupOpt { time?: number; children: React.ReactNode };
export const PopupContext = React.createContext<{ id: number, opt: PopupOpt }[]>([
    { id: 0, opt: { children: (<p>Lorem</p>), time: 1000 } },
    { id: 1, opt: { children: (<p>Ipsum</p>), time: 1000 } },
]);
