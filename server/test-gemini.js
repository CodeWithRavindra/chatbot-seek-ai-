import { GoogleGenerativeAI } from '@google/generative-ai';
import dotenv from 'dotenv';
dotenv.config();

const apiKey = process.env.AI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function testModel(modelName) {
  try {
    const model = genAI.getGenerativeModel({ model: modelName });
    const result = await model.generateContent('Hi');
    console.log(`✅ ${modelName} works! Response: ${result.response.text()}`);
    return true;
  } catch (error) {
    console.log(`❌ ${modelName} failed: ${error.message}`);
    return false;
  }
}

async function main() {
  const modelsToTest = [
    'antigravity-preview-05-2026',
    'deep-research-max-preview-04-2026',
    'gemini-2.5-flash-native-audio-latest'
  ];
  
  for (const model of modelsToTest) {
    const works = await testModel(model);
    if (works) break;
  }
}
main();
