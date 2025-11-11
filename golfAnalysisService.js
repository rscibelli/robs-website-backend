import { callGeminiWithGarminTool } from "./geminiService.js";

async function getGolfData() {
    const prompt = `get my latest golf activity, get as much golf specific data as you can.`;
    const response = await callGeminiWithGarminTool(prompt);

    console.log("Golf Data: ", response);

    return response;
}

export { getGolfData };