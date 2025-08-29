
import { GoogleGenAI, Type } from "@google/genai";
import { type DonationDetails } from '../types';

if (!process.env.API_KEY) {
  // In a real app, you'd want to handle this more gracefully.
  // For this context, we'll alert the developer in the console.
  console.error("API_KEY environment variable not set. Gemini API calls will fail.");
}

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY! });

export const generateThankYouContent = async (
  details: DonationDetails
): Promise<{ email: string; impact: string }> => {
  const { name, amount, causeTitle } = details;

  const prompt = `
    Generate a JSON object for a donation receipt.
    - Donor Name: ${name}
    - Donation Amount: $${amount}
    - Cause: "${causeTitle}"

    The JSON object must contain two string fields: "email" and "impact".

    - "email": A warm, heartfelt, and personalized thank-you email body (plain text) addressed to ${name}. It must acknowledge the specific donation amount and the cause. The tone should be inspiring, grateful, and professional.
    - "impact": A short, vivid paragraph describing the tangible impact this $${amount} donation will have on the "${causeTitle}" project. Use specific, inspiring, and slightly emotional language to connect the donor to the outcome. For example, instead of "buys supplies", say "provides a child with a backpack full of books and dreams".
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            email: {
              type: Type.STRING,
              description: "A warm, heartfelt, and personalized thank-you email to the donor. Address them by name. Mention the specific cause they donated to and the amount. Keep it concise, around 3-4 paragraphs.",
            },
            impact: {
              type: Type.STRING,
              description: `A short, optimistic paragraph summarizing the tangible impact a donation of $${amount} can make for the "${causeTitle}" cause. Use specific, inspiring examples.`,
            },
          },
          required: ["email", "impact"],
        },
      },
    });

    const jsonText = response.text.trim();
    const generatedContent = JSON.parse(jsonText);
    
    return {
      email: generatedContent.email || "Thank you for your generous donation!",
      impact: generatedContent.impact || "Your contribution will make a real difference.",
    };

  } catch (error) {
    console.error("Error generating thank you content:", error);
    // Return a fallback message in case of an API error
    return {
      email: `Dear ${name},\n\nThank you so much for your generous donation of $${amount} to our "${causeTitle}" cause. Your support is incredibly valuable to us and the communities we serve.\n\nWe are truly grateful for your commitment to making a positive change in the world.\n\nSincerely,\nThe Team`,
      impact: `Your donation of $${amount} will directly contribute to the success of the "${causeTitle}" project, helping us move closer to our goal. Every dollar makes a significant difference, and your support is instrumental in our work.`,
    };
  }
};