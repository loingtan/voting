import { useEffect, useState } from "react";
import raw from "/question-order.txt";
import { useLocalStorage } from "./useLocalStorage";

function useReadFileFromPublic() {
    const [fileContent, setFileContent] = useLocalStorage("file-content", '');
    const [shuffledContent, setShuffledContent] = useState<string[]>([]);

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


            const selectedLines = lines.length > 30 ? getRandomLines(lines, 30) : lines;


            const shuffled = shuffleArray(selectedLines);
            setShuffledContent(shuffled);
            localStorage.setItem("isPageRefreshed", "true");
        } else if (fileContent) {
            const lines = fileContent.split(/\r?\n/);


            const selectedLines = lines.length > 30 ? getRandomLines(lines, 30) : lines;

            setShuffledContent(selectedLines);
        }

        return () => {
            localStorage.removeItem("isPageRefreshed");
        };
    }, [fileContent]);

    const shuffleArray = (array: string[]) => {
        return array.sort(() => Math.random() - 0.5);
    };

    const getRandomLines = (array: string[], n: number) => {
        const shuffled = shuffleArray([...array]);
        return shuffled.slice(0, n);
    };

    return shuffledContent;
}

export default useReadFileFromPublic;
