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

        const isPageRefreshed = localStorage.getItem("isPageRefreshed");

        if (!isPageRefreshed && fileContent) {
            const lines = fileContent.split(/\r?\n/);
            const shuffled = shuffleArray(lines).slice(0, 30);
            setShuffledContent(shuffled);
            localStorage.setItem("isPageRefreshed", "true");
        } else if (fileContent) {
            setShuffledContent(fileContent.split(/\r?\n/).slice(0, 30));
        }


        return () => {
            localStorage.removeItem("isPageRefreshed");
        };
    }, [fileContent]);

    const shuffleArray = (array: string[]) => {
        return array.sort(() => Math.random() - 0.5);
    };

    return shuffledContent;
}

export default useReadFileFromPublic;
