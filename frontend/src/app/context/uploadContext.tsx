'use client'
import { createContext, useState, useContext } from 'react';

interface UploadProviderProps {
    children: React.ReactNode;
}


const UploadContext = createContext<{
    isUploading: boolean;
    setIsUploading: (v: boolean) => void;
}>({ isUploading: false, setIsUploading: () => {} });

export const UploadProvider = ({children}: UploadProviderProps) => {
    const [isUploading, setIsUploading] = useState(false);
    return (
        <UploadContext.Provider value={{ isUploading, setIsUploading }}>
            {children}
        </UploadContext.Provider>
    );
};

export const useUpload = () => useContext(UploadContext);
