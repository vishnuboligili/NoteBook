export default async function textSummarizer(noteContent){

    try {
        console.log("Text:", noteContent);
    
        // Define a structured prompt
        const prompt = `
        Analyze the following note content and provide structured insights:
        - Summarize the key points from the notes.
        - Identify any action items or tasks mentioned.
        - Extract important keywords and themes from the content.
        - Detect and report any grammar or clarity issues briefly.
        - Suggest improvements or clarifications to make the content more understandable.
        - Do **not** include any explanations or tables—return **only** valid string.
      
        Return the String only containing the summarized content for the following notes content:
        ${noteContent}
      `;
      
    
        // Dynamically import Google Generative AI
        const { GoogleGenerativeAI } = await import("@google/generative-ai");
        const genAI = new GoogleGenerativeAI("AIzaSyB6JsM0yk6ebN1PnXbyaPQWLrA5pScf6Bk");
        const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash-lite" });
     
        const result = await model.generateContent([prompt]);
        const analysis = result.response.text();
    
        return {
            analysis
        };
      } catch (error) {
        console.error("Error summarizing the text:", error);
        throw error;
      }

}