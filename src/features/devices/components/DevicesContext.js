import React, { createContext, useContext, useState } from 'react';

const DevicesContext = createContext();

export const DevicesProvider = ({ children }) => {
    const [isFetching, setIsFetching] = useState(false);
    const [valueLoad, setValueLoad] = useState(0);

    return (
        <DevicesContext.Provider value={{ isFetching, setIsFetching, valueLoad, setValueLoad }}>
            {children}
        </DevicesContext.Provider>
    );
};

export const useDevices = () => useContext(DevicesContext);