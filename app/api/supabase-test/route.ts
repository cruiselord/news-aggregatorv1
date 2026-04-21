import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  const { data, error } = await supabase.storage.listBuckets();

  if (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Supabase connection failed",
        error: error.message,
      },
      { status: 500 }
    );
  }

  return NextResponse.json(
    {
      ok: true,
      message: "Supabase connection successful",
      buckets: data,
    },
    { status: 200 }
  );
}

