import { createClient } from "@/utils/supabase/client";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const supabase = createClient();
  const { email } = await request.json();

  if (!email || !email.includes("@")) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Insert into Supabase
  const { error } = await supabase
    .from("subscribers")
    .insert({ email });

  if (error) {
    if (error.code === "23505") { // Unique violation code
       return NextResponse.json({ error: "You are already subscribed!" }, { status: 400 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ message: "Success!" });
}