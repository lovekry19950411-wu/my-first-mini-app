import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { query } from "@/lib/db";

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { platform, contentType, topic } = await req.json();

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "GEMINI_API_KEY not configured" }, { status: 500 });
  }

  const { GoogleGenerativeAI } = await import("@google/generative-ai");
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  const prompt = `你是一位頂級社群媒體文案專家。
請為以下需求生成一篇高品質的${contentType}：

平台：${platform}
主題：${topic}
類型：${contentType}

要求：
- 符合${platform}平台風格
- 加入適當的 emoji
- 結尾加上3-5個相關 hashtag
- 內容要有吸引力、容易讓人分享
- 繁體中文撰寫

直接輸出文案內容，不需要任何說明。`;

  try {
    const result = await model.generateContent(prompt);
    const content = result.response.text();

    await query(
      `INSERT INTO content_library (user_id, platform, content_type, topic, content)
       VALUES ($1, $2, $3, $4, $5)`,
      [session.user.id, platform, contentType, topic, content]
    ).catch(() => {});

    await query(
      `INSERT INTO user_points (user_id, points, action) VALUES ($1, 10, 'generate')
       ON CONFLICT (user_id) DO UPDATE SET points = user_points.points + 10`,
      [session.user.id]
    ).catch(() => {});

    return NextResponse.json({ content });
  } catch (e: any) {
    return NextResponse.json({ error: e.message }, { status: 500 });
  }
}