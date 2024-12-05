import {useEffect, useState} from 'react'
import {IObjectImage} from "../App.tsx";

const MODELS = [
    "/HairClip",
    "/HairClipV2",
    "/HairFast",
    "/OurModel",
    "/StableHair",
    "/StyleYourHair"
]
const REALIMAGES = "/RealImage"

const useImage = (fileName: string) => {
    const [name1, name2] = fileName.split("_")
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)
    const [image, setImage] = useState<IObjectImage | null>(null)

    useEffect(() => {
        const fetchImage = async () => {
            try {
                if (fileName === "") {
                    setImage(null)
                }
                const arrayRealImages = [REALIMAGES + "/" + name1 + ".png", REALIMAGES + "/" + name2 + ".png"]
                const arrayModels = MODELS.map(s => s + "/" + fileName + ".png")
                const response = arrayRealImages.concat(arrayModels)
                const objs = {
                    realImage1: response[0],
                    realImage2: response[1],
                    hairClip: response[2],
                    hairClipV2: response[3],
                    hairFast: response[4],
                    ourModel: response[5],
                    stableHair: response[6],
                    styleYourHair: response[7]
                }
                setImage(objs)
            } catch (err) {
                setError(err as never)
            } finally {
                setLoading(false)
            }
        }

        fetchImage()
    }, [fileName])

    return {
        loading,
        error,
        image,
    }
}

export default useImage