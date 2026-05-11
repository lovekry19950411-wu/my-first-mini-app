import { NextRequest, NextResponse } from "next/server";

export async function POST(req: NextRequest) {
  const { platform, contentType, topic, walletAddress } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return NextResponse.json({ error: "GEMINI_API_KEY not set" }, { status: 500 });

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `你是頂級社群媒體文案專家。
請為以下需求生成一篇高品質的${contentType}：
平台：${platform}
主題：${topic}
要求：符合${platform}風格、加入 emoji、結尾加 3-5 個 hashtag、有吸引力、繁體中文。
直接輸出文案，不需說明。`;

  try {
    const result = await model.generateContent(prompt);
    const content = result.response.text();

    // 存 DB（失敗不影響主功能）
    if (walletAddress && walletAddress !== "anonymous") {
      const { query } = await import("@/lib/db");
      await query(
        "INSERT INTO content_library (user_id, platform, content_type, topic, content) VALUES ($1,$2,$3,$4,$5)",
        [walletAddress, platform, contentType, topic, content]
      ).catch(() => {});
      await query(
        "INSERT INTO user_points (user_id, points) VALUES ($1,10) ON CONFLICT (user_id) DO UPDATE SET points = user_points.points + 10",
        [walletAddress]
      ).catch(() => {});
    }

    return NextResponse.json({ content });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}
