
const functions = require("firebase-functions");
const axios = require("axios");
// const cors = require("cors") ({ origin: true }); // This allows all origins, or you can specify a list of allowed domains;
// const cors = require("cors")({ origin: "https://social-media-captions-443608.web.app" });
const cors = require("cors");

// CORS middleware: Allow all origins (or specify your front-end URL)
const corsOptions = { origin: true }; 
const corsHandler = cors(corsOptions);
// Firebase automatically handles authentication and tokens
const geminiApiKey = functions.config().gemini.api_key; // Using environment variable for secure API key

// Create a CORS handler
// const corsHandler = cors({ origin: true });  // Allow requests from any origin (you can restrict this to specific domains)

// Define the function to generate caption
// exports.generateCaption = functions.https.onCall(async (data) => {
//  const { content, tone, platform, captionLength } = data;

exports.generateCaptionai = functions.https.onRequest((req, res) => {
  // Run CORS middleware before handling the request
  corsHandler(req, res, async () => {
    if (req.method === "OPTIONS") {
      // Handle pre-flight request
      res.status(204).send("");
      return;
    }

    // Check if the method is POST (to generate the caption)
    if (req.method === "POST") {
      const { content, tone, platform, captionLength } = req.body;

  // Construct the Gemini prompt
  const prompt = `Create a ${tone} caption for ${content} suitable for ${platform}. Keep the caption under ${captionLength} characters.`;

  try {
    // Call Gemini API
    const response = await axios.post(
     // "https://gemini.googleapis.com/v1/text:generate", 
     //"https://us-central1-aiplatform.googleapis.com/v1/projects/social-media-captions-443608/locations/us-central1/models/publishers/google/models/gemini-pro-vision:predict",
     "https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=AIzaSyCodA02wD3MtRB_b0zBjrvhLrGtcF_RcJc",
      {
        model: "gemini-1.5-flash-latest", 
        prompt: prompt,
      },
      {
        headers: {
          Authorization: `Bearer ${geminiApiKey}`, // Use the Gemini API key securely stored
        },
      }
    );

    const generatedCaption = response.data.predictions[0].text;
    res.status(200).json({ caption: generatedCaption });  // Send back the generated caption

      } catch (error) {
        console.error("Error generating caption:", error.message);
        if (error.response) {
          console.error("Response error data:", error.response.data);
        }
        res.status(500).send("Error generating caption");
      }
    } else {
      res.status(405).send("Method Not Allowed");  // Only POST is allowed
    }
  });
});
