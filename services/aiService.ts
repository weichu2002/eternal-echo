// Interface for the Alibaba Cloud Bailian (DeepSeek) API
const API_KEY = "sk-26d09fa903034902928ae380a56ecfd3";
const API_URL = "https://dashscope.aliyuncs.com/compatible-mode/v1/chat/completions";

export const generateBio = async (context: string): Promise<string> => {
  // WARNING: In a production environment, this key should be stored in an ESA Edge Function
  // and accessed via a proxy endpoint to prevent exposing it to the client.
  // We are calling it directly here for the purpose of the "Product Demo" as requested.

  if (!context) return "请提供一些关于您生活的背景信息。";

  try {
    const response = await fetch(API_URL, {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "deepseek-v3", // Assuming 'deepseek-v3' is the valid model alias on Bailian, otherwise 'qwen-plus' is common fallback
        messages: [
          {
            role: "system",
            content: "你是'Eternal Echo'（永恒回声）系统的共情数字传记作家。你的工作是将用户提供的关于生活的原始笔记，转化为感人、反思且略带哲学意味的回忆录章节。请务必使用中文撰写。字数控制在200字以内。语调：空灵、深意、温暖。"
          },
          {
            role: "user",
            content: context
          }
        ]
      })
    });

    const data = await response.json();
    
    if (data.choices && data.choices.length > 0) {
      return data.choices[0].message.content;
    } else {
      console.error("AI API Error:", data);
      throw new Error("Failed to generate content");
    }
  } catch (error) {
    console.error("AI Service Error:", error);
    // Fallback for demo if API fails (e.g., CORS or quota)
    return "数字之风沉寂了... (API连接失败。请确保CORS允许或使用后端代理)。";
  }
};