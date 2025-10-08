export async function callGeminiAPI(prompt, useSystemPrompt = false) {
    const proxyUrl = '/api/gemini';

    const response = await fetch(proxyUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({ prompt, useSystemPrompt })
    });

    if (!response.ok) {
        const errorBody = await response.text();
        throw new Error(`API request via proxy failed: ${errorBody}`);
    }

    const result = await response.json();

    if (result.candidates && result.candidates[0] && result.candidates[0].content && result.candidates[0].content.parts[0]) {
        return result.candidates[0].content.parts[0].text;
    } else {
        console.warn("Unexpected API response structure from proxy:", result);
        if (result.error) {
            return `Error from API: ${result.error.message}`;
        }
        return "I received a response, but couldn't understand it.";
    }
}
