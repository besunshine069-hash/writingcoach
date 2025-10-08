export default async function handler(request, response) {
    if (request.method !== 'POST') {
        return response.status(405).json({ message: 'Method Not Allowed' });
    }

    try {
        const { prompt, useSystemPrompt } = request.body;
        
        const apiKey = process.env.API_KEY;

        if (!apiKey) {
            return response.status(500).json({ error: { message: 'API key is not configured on the server.' } });
        }
        
        const model = "gemini-2.5-flash-preview-05-20";
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-preview-05-20:generateContent?key=${apiKey}`;

        const systemPromptText = `You are an expert AI English Writing Coach. Your goal is to provide comprehensive, constructive feedback to help learners improve their English writing skills. When a user submits a paragraph, you MUST provide the following in your feedback, using markdown for clear structure:
        1. ### Overall Feedback: Start with a brief, encouraging summary of the user's paragraph.
        2. ### Grammar & Clarity: Point out specific areas for improvement in grammar, punctuation, and sentence structure.
        3. ### Suggestions for Improvement: Offer concrete suggestions on how to make the paragraph stronger or more descriptive.
        4. ### Related Vocabulary: Suggest 3-4 relevant vocabulary words with brief definitions that could enhance the paragraph's topic.
        5. ### Estimated IELTS Band: Provide an estimated IELTS writing band score for the paragraph (e.g., 5.5-6.0). Add a clear disclaimer that this is an approximation for practice purposes only.
        6. ### Keep it up! End with a short, positive, and encouraging remark.
        Your tone should always be friendly, supportive, and motivational.`;

        const payload = {
            contents: [{ parts: [{ text: prompt }] }],
        };

        if (useSystemPrompt) {
            payload.systemInstruction = {
                parts: [{ text: systemPromptText }]
            };
        }

        const geminiResponse = await fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(payload),
        });

        const data = await geminiResponse.json();
        
        if (!geminiResponse.ok) {
            console.error('Gemini API Error:', data);
            return response.status(geminiResponse.status).json(data);
        }

        return response.status(200).json(data);

    } catch (error) {
        console.error('Internal Server Error:', error);
        return response.status(500).json({ error: { message: 'An internal server error occurred.' } });
    }

}

