import { useEffect, useState } from "react";
import raw from "/question-order.txt";
import useSessionStorage from "./useSession.ts";


function useReadFileFromPublic() {
    const [fileContent, setFileContent] = useState('');
    const [shuffledContent, setShuffledContent] = useSessionStorage<string[]>("shuffled-content", ['']);

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
        if (shuffledContent[0] === '' && fileContent) {
            const lines = fileContent.split(/\r?\n/);
            const selectedLines = lines.length > 30 ? getRandomLines(lines, 30) : lines;
            const shuffled = shuffleArray(selectedLines);
            setShuffledContent(shuffled);
        }
    }, [fileContent, shuffledContent, setShuffledContent]);
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
