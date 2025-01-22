import { generateResult } from "../services/ai.service.js";

export const getResult = async (req, res) => {
    try {
        const { prompt } = req.query;
        const result = await generateResult(prompt);
        res.status(200).send(result)
    } catch (error) {
        console.log("Error: ", error.message);
        res.send({ message: error.message });
    }
}