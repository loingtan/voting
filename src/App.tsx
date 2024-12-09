import React, {useCallback, useEffect, useState} from "react";
import "./App.css";
import useReadFileFromPublic from "./hooks/useReadFileFromPublic.ts";
import useImage from "./hooks/useImage.ts";
import useSessionStorage from "./hooks/useSession.ts";

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
    const [currentSlide, setCurrentSlide] = useSessionStorage("currentSlide", 0);
    const [votes, setVotes] = useSessionStorage<IUser>("votes", {});
    const [isLoading, setIsLoading] = useState(false);
    const [userType, setUserType] = useSessionStorage<"Novice" | "Expert" | null>("user-type", null);
    const [pageBegin, setPageBegin] = useSessionStorage("page-begin",false);
    const content = useReadFileFromPublic();
    const problemName = content[currentSlide]

    const objImage = useImage(problemName);
    const totalSlides = Math.ceil(content.length);
    const [shuffledImages, setShuffledImages] = useState<IProperty[]>([]);
    const getQuestionTitles = () => {
        return questionNumberTitles;
    }

    const shuffleArray = useCallback(<T, >(array: T[]): T[] => {
        const shuffled = [...array];
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
        window.scrollTo({top: 0, behavior: "auto"});
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
    const handleSelection = (type: "Novice" | "Expert") => {
        setUserType(type);
        setPageBegin(true)
        console.log(`User selected: ${type}`);
    };
    const handleVote = (problem_name: string, title: string, model: string) => {
        setVotes((prevVotes: IUser) => {
            const currentProblemVotes = prevVotes[problem_name] || {};
            const currentValue = currentProblemVotes[title];

            const updatedProblemVotes = {
                ...currentProblemVotes,
                [title]: currentValue === model ? undefined : model,
            };
            console.log(updatedProblemVotes)
            const cleanedProblemVotes = Object.fromEntries(
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
        if (currentSlide === 0) {
            setPageBegin(false);
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
            mode: "no-cors",
            headers: {
                "Content-Type": "application/json",
                "Accept": "application/vnd.pageclip.v1+json",
            },
            body: JSON.stringify({
                ...votes,
                user_level: userType,
                version: "v1"
            }),
        })
            .then(() => {
                alert("Form submitted successfully!");
                setIsLoading(false);
                setVotes({})
                sessionStorage.removeItem("currentSlide");
                sessionStorage.removeItem("votes");
                sessionStorage.removeItem("shuffled-content");
                setCurrentSlide(0);
                window.scrollTo(0, 0);
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
    if (!pageBegin) {
        return (
            <div className="selection-container">
                <h1 className="title">Select Your Experience Level</h1>
                <div className="button-container">
                    <button
                        className={`selection-button ${userType === "Novice" ? "active" : ""}`}

                        onClick={() => handleSelection("Novice")}
                    >
                        Novice
                    </button>
                    <button
                        className={`selection-button ${userType === "Expert" ? "active" : ""}`}
                        onClick={() => handleSelection("Expert")}
                    >
                        Expert
                    </button>
                </div>
            </div>)
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
                                    <img src={obj.img} alt="Voted option" key={index} />
                                            <figcaption>{obj.name}</figcaption>
                                        </figure>

                                    ))}

                                </div>

                                <div className="problem-images">
                                    {shuffledImages.map((obj, index) => (
                                        <figure className="image-container " key={index}>

                                            <img src={obj.img} alt={`Option ${index + 1}`} />
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
                    <button onClick={prevSlide} type={"button"}>
                        Previous
                    </button>
                    <button type={"submit"} onClick={(e) => {
                        const userConfirmed = window.confirm("Are you sure you want to submit?");
                        if (!userConfirmed) {
                            e.preventDefault();
                        }
                    }}>
                        {"Submit"}
                    </button>
                    <button
                        type={"button"}
                        disabled={currentSlide === totalSlides - 1}
                        onClick={nextSlide}
                    >
                        {"Next"}
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
