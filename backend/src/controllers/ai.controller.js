import gemini from "../lib/gemini.js";

export const chatWithAi = async (req,res) => {
    try {
        const { message } = req.body;
        if(!message) {
            return res.status(400).json({message: "Message is required"});
        }
        console.log(message);

        const result = await gemini.models.generateContent({
            model: "gemini-2.5-flash",
            contents: message
        })

        const reply = result?.candidates?.[0]?.content?.parts?.[0]?.text;
        return res.status(200).json({ reply });
    } catch (error) {
        console.error("Gemini Error:", error);
        if(error.status === 503) {
            return res.status(503).json({ message: "Gemini is busy. Try again in few seconds."})
        }
        console.error(error);
        return res.status(500).json({message:"Internal server Error"})
    }
}