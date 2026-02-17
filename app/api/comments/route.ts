import { NextResponse } from "next/server";
export async function GET() {
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return NextResponse.json([
        { id: 1, user: "Alice", text: "This site is amazing! <b>Love it!</b>" },
        { id: 2, user: "Bob", text: "Is this safe? <i>I hope so...</i>" },
    ]);
}
export async function POST(request: Request) {
    const body = await request.json();
    await new Promise((resolve) => setTimeout(resolve, 2000));
    return NextResponse.json({
        id: Date.now(),
        ...body,
    });
}
