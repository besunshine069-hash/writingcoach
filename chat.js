// This file is intended to be run on a server environment (like Node.js),
// not in the browser. For example, as a Vercel Serverless Function.

// Import the Google Generative AI SDK - a more robust way to interact with the API on a server.
const { GoogleGenerativeAI } = require('@google/generative-ai');

// --- THIS IS THE SECURE WAY TO HANDLE THE API KEY ---
// The API key is retrieved from the server's environment variables.
// It is never exposed to the client-side/browser.
const apiKey = process.env.API_KEY; 
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash-preview-05-20" });

// This is the main function that handles incoming requests from the frontend.
// The name 'handler' is common for serverless functions.
export default async function handler(req, res) {
    // Check if the request method is POST. We only want to handle POST requests.
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        // Get the 'prompt' and 'action' from the request body sent by the frontend.
        const { prompt, action } = req.body;
        
        let finalPrompt;
        let generationConfig = {};
        
        // The same system prompt from the frontend.
        const systemPrompt = `You are an expert AI English Writing Coach. Your goal is to provide comprehensive, constructive feedback to help learners improve their English writing skills. When a user submits a paragraph, you MUST provide the following in your feedback, using markdown for clear structure:

1.  **### Overall Feedback:** Start with a brief, encouraging summary of the user's paragraph.
2.  **### Grammar & Clarity:** Point out specific areas for improvement in grammar, punctuation, and sentence structure.
3.  **### Suggestions for Improvement:** Offer concrete suggestions on how to make the paragraph stronger or more descriptive.
4.  **### Related Vocabulary:** Suggest 3-4 relevant vocabulary words with brief definitions that could enhance the paragraph's topic.
5.  **### Estimated IELTS Band:** Provide an estimated IELTS writing band score for the paragraph (e.g., 5.5-6.0). Add a clear disclaimer that this is an approximation for practice purposes only.
6.  **### Keep it up!** End with a short, positive, and encouraging remark.

Your tone should always be friendly, supportive, and motivational.`;

        // Determine the correct prompt to send to the Gemini API based on the action.
        switch(action) {
            case 'feedback':
                finalPrompt = prompt;
                // For 'feedback', we attach the system prompt to guide the AI's response.
                generationConfig.systemInstruction = { parts: [{ text: systemPrompt }] };
                break;
            case 'continue':
                finalPrompt = `Continue writing this paragraph in a similar tone and style:\n\n"${prompt}"`;
                break;
            case 'rephrase':
                finalPrompt = `Rephrase the following paragraph in two different ways, maintaining the original meaning. Label them "Option 1" and "Option 2":\n\n"${prompt}"`;
                break;
            default:
                // If the action is unknown, return an error.
                return res.status(400).json({ error: 'Invalid action type.' });
        }

        // Generate content using the Gemini model.
        const result = await model.generateContent({
            contents: [{ role: "user", parts: [{ text: finalPrompt }] }],
            ...generationConfig
        });

        const response = await result.response;
        const text = response.text();

        // Send the generated text back to the frontend in a JSON object.
        res.status(200).json({ text: text });

    } catch (error) {
        // If anything goes wrong, log the error on the server and send a generic error message.
        console.error("Error calling Gemini API:", error);
        res.status(500).json({ error: 'Failed to get response from AI.' });
    }
}
