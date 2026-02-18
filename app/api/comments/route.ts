import { NextResponse } from "next/server";

// ─────────────────────────────────────────────
// BUG FIX 1 — XSS Sanitization Helper
// Original code had raw HTML like <b>Love it!</b>
// inside user text — this is a Cross Site Scripting
// (XSS) vulnerability. Any HTML tags in user input
// must be escaped before storing or returning.
// ─────────────────────────────────────────────
function sanitizeText(text: string): string {
    return text
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#x27;");
}

// ─────────────────────────────────────────────
// BUG FIX 2 — Input Validation Helper
// Original code had no check on what fields
// are required in the POST body
// ─────────────────────────────────────────────
function validateBody(body: any): { valid: boolean; message: string } {
    if (!body) {
        return { valid: false, message: "Request body is empty" };
    }
    if (!body.user || typeof body.user !== "string" || body.user.trim() === "") {
        return { valid: false, message: "Field 'user' is required and must be a non-empty string" };
    }
    if (!body.text || typeof body.text !== "string" || body.text.trim() === "") {
        return { valid: false, message: "Field 'text' is required and must be a non-empty string" };
    }
    if (body.user.length > 50) {
        return { valid: false, message: "Field 'user' must be under 50 characters" };
    }
    if (body.text.length > 500) {
        return { valid: false, message: "Field 'text' must be under 500 characters" };
    }
    return { valid: true, message: "OK" };
}

// ─────────────────────────────────────────────
// GET — Return list of comments
// BUG FIXED: HTML in text fields is now sanitized
// ─────────────────────────────────────────────
export async function GET() {
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // BUG FIX 1 APPLIED: sanitizeText() called on all text fields
    // Original buggy data had raw HTML tags like <b> and <i>
    // which could execute malicious scripts in the browser
    return NextResponse.json([
        { id: 1, user: sanitizeText("Alice"), text: sanitizeText("This site is amazing! <b>Love it!</b>") },
        { id: 2, user: sanitizeText("Bob"),   text: sanitizeText("Is this safe? <i>I hope so...</i>") },
    ]);
}

// ─────────────────────────────────────────────
// POST — Create a new comment
// BUG FIXED: Added input validation + error handling
// + sanitization of user input
// ─────────────────────────────────────────────
export async function POST(request: Request) {

    // BUG FIX 3 — Wrapped in try/catch
    // Original code had NO error handling — if the request
    // body was malformed JSON, the whole server would crash
    let body;
    try {
        body = await request.json();
    } catch (error) {
        // BUG: Original code would throw unhandled error here
        return NextResponse.json(
            { error: "Invalid JSON in request body" },
            { status: 400 }
        );
    }

    // BUG FIX 2 APPLIED: Validate the body before using it
    // Original code used ...body directly with zero checks
    const validation = validateBody(body);
    if (!validation.valid) {
        return NextResponse.json(
            { error: validation.message },
            { status: 400 }
        );
    }

    await new Promise((resolve) => setTimeout(resolve, 2000));

    // BUG FIX 1 APPLIED: Sanitize user input before returning
    // Original code returned raw user input which is dangerous
    return NextResponse.json({
        id:   Date.now(),
        user: sanitizeText(body.user),
        text: sanitizeText(body.text),
    });
}
