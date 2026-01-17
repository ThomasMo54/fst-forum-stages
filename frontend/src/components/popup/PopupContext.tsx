import React from 'react';

export interface PopupOpt { time?: number; children: React.ReactNode };
export const PopupContext = React.createContext<{ id: number, opt: PopupOpt }[]>([]);
