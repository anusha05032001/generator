const functions = require("firebase-functions");
const axios = require("axios");

// Firebase automatically handles authentication and tokens
const geminiApiKey = functions.config().gemini.api_key; // Using environment variable for secure API key

exports.generateCaption = functions.https.onCall(async (data, context) => {
  const { content, tone, platform, captionLength } = data;

  // Construct the Gemini prompt
  const prompt = `Create a ${tone} caption for ${content} suitable for ${platform}. Keep the caption under ${captionLength} characters.`;

  try {
    // Call Gemini API
    const response = await axios.post(
      "https://gemini.googleapis.com/v1/text:generate", // Actual endpoint
      {
        model: "gemini-v1", 
        prompt: prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${geminiApiKey}`, // Use the Gemini API key securely stored
        },
      }
    );

    const generatedCaption = response.data.text;
    return { caption: generatedCaption };
  } catch (error) {
    console.error("Error generating caption:", error.message);
    if (error.response) {
      console.error("Response error data:", error.response.data);
    }
    throw new functions.https.HttpsError("internal", "Error generating caption");
  }
});
