import { useEffect, useState } from "react";
import raw from "/question-order.txt";

function useReadFileFromPublic() {
    const [fileContent, setFileContent] = useState('');
    const [shuffledContent, setShuffledContent] = useState<string[]>(['']);

    useEffect(() => {
        fetch(raw)
            .then((response) => {
                if (!response.ok) {
                    throw new Error('Failed to fetch file');
                }
                return response.text();
            })
            .then((text) => {
                setFileContent(text);
            })
            .catch((error) => {
                console.error('Error reading file:', error);
            });
    }, []);

    useEffect(() => {
        // Check if page has been refreshed using localStorage
        const isPageRefreshed = localStorage.getItem("isPageRefreshed");

        if (!isPageRefreshed && fileContent) {
            const lines = fileContent.split(/\r?\n/);
            // Shuffle the array if the page is refreshed
            const shuffled = shuffleArray(lines);
            setShuffledContent(shuffled);

            // Set a flag in localStorage to prevent shuffling on state change
            localStorage.setItem("isPageRefreshed", "true");
        } else if (fileContent) {
            setShuffledContent(fileContent.split(/\r?\n/)); // Keep original content if not a fresh page load
        }

        // Optionally, remove the "isPageRefreshed" flag if you want reshuffling on future refreshes
        return () => {
            localStorage.removeItem("isPageRefreshed");
        };
    }, [fileContent]);

    // Helper function to shuffle the array
    const shuffleArray = (array: string[]) => {
        return array.sort(() => Math.random() - 0.5);
    };

    return shuffledContent;
}

export default useReadFileFromPublic;
