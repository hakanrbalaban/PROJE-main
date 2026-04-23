import { createContext, useState,useContext } from "react";
export const DataContext = createContext();

const DataProvider = ({ children }) => {
    const [notes, setNotes] = useState([]);
    const [archiveNotes, setArchiveNotes] = useState([]);
    const [deletedNotes, setDeletedNotes] = useState([]); //deletednotes
    return (
        <DataContext.Provider value={{
            notes,
            setNotes,
            archiveNotes,
            setArchiveNotes,
            deletedNotes,
            setDeletedNotes
        }}>{children}</DataContext.Provider>
    )
};

export default DataProvider;
