import { GoogleGenerativeAI, SchemaType } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI('AIzaSyDuPDSAa0FRaVgf6ZIkL0IrHNMGszV3Ml8');
const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

export async function generateCategoryAndTags(title: string, description: string) {
  const prompt = `
      You are an AI designed to categorize and tag content based on its title and description.
  
      Given a page's title and description, return the following structured result in JSON format:
      - "category": A single category name that best describes the content. You can only choose from the following categories:
        - Web Development
        - General Programming
        - Web Design
        - Science & Technology  
        - Personal Development
        - Health & Fitness
        - AI &Machine Learning
        - Music & Audio
        - News & Geopolitics
        - Other
      - "tags": A list of 1-5 related keywords or phrases that further describe the content. Tags must not contain any spaces, use abbrevations when applicable
         and try not to be too specific.
  
      Example:
  
      Input:
      Title: "Master CSS Overflow/Text Wrapping Like A Senior Developer"
      Description: "We all pretty much know how the overflow property in CSS works, but there is so much more to overflow than just the overflow property."
  
      Output:
      {
        "category": "Web Design",
        "tags": ["CSS"]
      }
  
      Input:
      Title: "Mastering React.js: A Comprehensive Guide"
      Description: "A step-by-step tutorial to learning React.js, including hooks, state management, and best practices for building web apps."
  
      Output:
      {
        "category": "Web Development",
        "tags": ["React", "JavaScript", "tutorial", "frontend"]
      }
  
      Now, analyze the following content and provide a similar structured result.

      Title: "${title}"
      Description: "${description}"
    `;

  try {
    const result = await model.generateContent([prompt]);

    if (result.response && result.response.text()) {
      let text = result.response.text().trim();
      // remove "```json" and "```" from the beginning and end of the text
      text = text.replace(/^```json\s*/, '').replace(/\s*```$/, '');
      // parse the JSON text
      console.log(text);
      return JSON.parse(text) as { category: string; tags: string[] };
    } else {
      throw new Error('No result from the AI model');
    }
  } catch (error) {
    console.error('Error generating category and tags:', error);
    return { category: '', tags: [] };
  }
}
