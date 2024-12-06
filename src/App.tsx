import React, {useCallback, useEffect, useState} from "react";
import "./App.css";
import useReadFileFromPublic from "./hooks/useReadFileFromPublic.ts";
import useImage from "./hooks/useImage.ts";

const questionNumberTitles = [
    "Which photo looks the most natural?",
    "Which photo best resembles the desired hairstyle?",
    "Which photo stands out the most?"
]

enum IMAGES {
    realImage1 = "realImage1",
    realImage2 = "realImage2",
    hairClip = "hairClip",
    hairClipV2 = "hairClipV2",
    hairFast = "hairFast",
    ourModel = "ourModel",
    stableHair = "stableHair",
    styleYourHair = "styleYourHair",
}

export interface IObjectImage {
    realImage1: string;
    realImage2: string;
    hairClip: string;
    hairClipV2: string;
    hairFast: string;
    ourModel: string;
    stableHair: string;
    styleYourHair: string;
}

interface ProblemTitle {
    [key: string]: string;
}

interface IUser {
    [key: string]: ProblemTitle;
}

interface IProperty {
    name: IMAGES;
    img: string;
}

const App = () => {
    const [currentSlide, setCurrentSlide] = useState(0);
    const [votes, setVotes] = useState<IUser>({});
    const [isLoading, setIsLoading] = useState(false); //
    const content = useReadFileFromPublic();
    const problemName = content[currentSlide]
    const objImage = useImage(problemName);
    const totalSlides = Math.ceil(content.length);
    const [shuffledImages, setShuffledImages] = useState<IProperty[]>([]);
    const getQuestionTitles = () => {
        return questionNumberTitles;
    }

    const shuffleArray = useCallback(<T, >(array: T[]): T[] => {
        const shuffled = [...array]; // Create a copy to avoid mutating the original array
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }, []);
    const getCurrentImages = useCallback(() => {
        if (!objImage.image) {
            return [];
        }
        const returnPropertyAndImg = (name: IMAGES) => {
            if (!objImage.image) return {}
            return {
                name,
                img: objImage.image[name]
            }
        }

        return [
            returnPropertyAndImg(IMAGES.ourModel),
            returnPropertyAndImg(IMAGES.stableHair),
            returnPropertyAndImg(IMAGES.hairClip),
            returnPropertyAndImg(IMAGES.hairClipV2),
            returnPropertyAndImg(IMAGES.hairFast),
            returnPropertyAndImg(IMAGES.styleYourHair),
        ];

    }, [objImage])
    useEffect(() => {
        setShuffledImages(shuffleArray(getCurrentImages()) as IProperty[]);
        window.scrollTo({top: 0, behavior: "smooth"});
    }, [currentSlide, objImage.image]);


    const getRealImages = useCallback(() => {
        if (!objImage.image) {
            return [];
        }
        const returnPropertyAndImg = (name: IMAGES) => {
            if (!objImage.image) return {}
            return {
                name: name === IMAGES.realImage1 ? "Face" : "Hair",
                img: objImage.image[name]
            }
        }
        return [returnPropertyAndImg(IMAGES.realImage1), returnPropertyAndImg(IMAGES.realImage2)]
    }, [
        objImage
    ])
    const handleVote = (problem_name: string, title: string, model: string) => {
        setVotes((prevVotes) => {
            const currentProblemVotes = prevVotes[problem_name] || {};
            const currentValue = currentProblemVotes[title];

            const updatedProblemVotes = {
                ...currentProblemVotes,
                [title]: currentValue === model ? undefined : model,
            };
            console.log(updatedProblemVotes)
            const cleanedProblemVotes = Object.fromEntries(
                // eslint-disable-next-line @typescript-eslint/no-unused-vars
                Object.entries(updatedProblemVotes).filter(([_, value]) => value !== undefined)
            );

            return {
                ...prevVotes,
                ...(Object.keys(cleanedProblemVotes).length >= 0
                    ? {[problem_name]: cleanedProblemVotes}
                    : {}),
            } as IUser;
        });
    };


    const nextSlide = () => {
        if (currentSlide < totalSlides - 1) {
            setCurrentSlide(currentSlide + 1);
        }
    };

    const prevSlide = () => {
        if (currentSlide > 0) {
            setCurrentSlide(currentSlide - 1);
        }
    };
    const validate = () => {
        const voteProblems = Object.keys(votes);
        if (!voteProblems.length || voteProblems.length === 0 || voteProblems.length !== content.length) {

            return false;
        }
        Object.entries(voteProblems).forEach(([, value]) => {
            if (!value || value.length === 0 || value.length !== 3) {
                return false;
            }
        })
        return true;

    }
    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();

        setIsLoading(true);
        if (!validate()) {
            alert("Please fill in all votes.");
            setIsLoading(false);
            return;
        }
        fetch("https://send.pageclip.co/0hZmsxu9symwGpEjCkpy6kKAjINn5Yr4", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                ...votes,
                version: "v1"
            }),
        })
            .then((response) => {
                if (response.ok) {
                    alert("Form submitted successfully!");
                    setIsLoading(false);
                    setVotes({})
                    setCurrentSlide(0);
                    window.scrollTo(0, 0);
                } else {
                    alert("Error submitting form.");
                }
            })
            .catch((error) => {
                setIsLoading(false);
                console.error("Submission error:", error);
                alert("Failed to submit form.");
            });
    };


    const handleDisableButton = (problemName: string, title: string, model: string) => {
        if (!(problemName in votes)) {
            return false;
        }
        if (!(title in votes[problemName])) {
            return false;
        }
        return votes[problemName][title] !== model;
    }
    if (isLoading) {
        return (

            <div className="loading-overlay">
                <div className="spinner"></div>
                <p>Submitting your form, please wait...</p>
            </div>

        )
    }
    return (
        <div className="App">
            <form onSubmit={handleSubmit} className="pageclip-form">
                <header>
                    <h1>Survey for best hairstyle model</h1>
                </header>
                <div className="slides">
                    {getQuestionTitles().map((title, index1) => (
                            <div key={index1}>
                                <div className="title-problem">
                                    {title}
                                </div>
                                <div className="real-images">

                                    {getRealImages().map((obj, index) => (

                                        <figure className="image-container big-image" key={index}>
                                            <img src={obj.img} alt="Voted option"/>
                                            <figcaption>{obj.name}</figcaption>
                                        </figure>

                                    ))}

                                </div>

                                <div className="problem-images">
                                    {shuffledImages.map((obj, index) => (
                                        <figure className="image-container " key={index}>

                                            <img src={obj.img} alt={`Option ${index + 1}`}/>
                                            <figcaption>{obj.name}</figcaption>

                                            <button
                                                className="options"
                                                type={"button"}
                                                disabled={handleDisableButton(problemName, title, obj.name ?? "")}
                                                onClick={() => handleVote(problemName, title, obj.name ?? "")}>Vote
                                            </button>

                                        </figure>
                                    ))}
                                </div>
                            </div>

                        )
                    )}

                </div>
                <div className="navigation">
                    <button onClick={prevSlide} disabled={currentSlide === 0} type={"button"}>
                        Previous
                    </button>
                    <button
                        type={currentSlide < totalSlides - 1 ? "button" : "submit"}
                        onClick={(e) => {
                            if (currentSlide < totalSlides - 1) {
                                e.preventDefault();
                                nextSlide()

                            } else {
                                const userConfirmed = window.confirm("Are you sure you want to submit?");
                                if (!userConfirmed) {
                                    e.preventDefault();
                                }
                            }
                        }}
                    >
                        {currentSlide < totalSlides - 1 ? "Next" : "Submit"}
                    </button>
                </div>
                <div className="progress-indicator">
                    Page {currentSlide + 1} of {totalSlides}
                </div>
            </form>

        </div>
    )
        ;
};

export default App;
