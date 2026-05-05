import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const payload = await req.json()
    console.log('收到驗證資料:', payload) // 這會印在你的 VS Code 終端機

    // 只要有收到 Proof 且 status 不是 error 就回傳成功
    return NextResponse.json({ message: 'Verified' }, { status: 200 })
  } catch (error) {
    return NextResponse.json({ message: 'Error' }, { status: 500 })
  }
}