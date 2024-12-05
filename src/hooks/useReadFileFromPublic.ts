import {useEffect, useState} from 'react';
import raw from "/question-order.txt"

function useReadFileFromPublic() {
    const [fileContent, setFileContent] = useState('');
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

    return fileContent.split(/\r?\n/);

}

export default useReadFileFromPublic;
