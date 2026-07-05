import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

/**
 * Diagnostic endpoint: reports whether the deployment can reach its database
 * and whether the schema exists, without leaking any secret values. Safe to
 * open in a browser to debug a fresh deployment.
 */
export async function GET() {
  const databaseUrlSet = Boolean(process.env.DATABASE_URL);

  if (!databaseUrlSet) {
    return NextResponse.json({
      ok: false,
      databaseUrlSet: false,
      cause: "DATABASE_URL is not configured for this deployment.",
      fix: "In this Vercel project: Storage -> Connect your database, then redeploy.",
    });
  }

  try {
    // If the tables exist this succeeds; if we connected but the schema is
    // missing, this throws a P2021 / 42P01 (undefined table).
    const planCount = await prisma.mealPlan.count();
    return NextResponse.json({
      ok: true,
      databaseUrlSet: true,
      canConnect: true,
      tablesExist: true,
      planCount,
    });
  } catch (err) {
    const code =
      (err as { code?: string })?.code ??
      (err as { name?: string })?.name ??
      "unknown";
    const message = err instanceof Error ? err.message.split("\n")[0] : String(err);

    let cause = "Could not query the database.";
    let fix = "Check the DATABASE_URL value and that the tables were created.";

    if (code === "P2021" || code === "42P01" || /does not exist|no such table/i.test(message)) {
      cause = "Connected to the database, but the tables don't exist yet.";
      fix = "Run the setup SQL in your database's SQL editor to create the tables.";
    } else if (code === "28P01" || /password authentication/i.test(message)) {
      cause = "The database rejected the credentials in DATABASE_URL.";
      fix = "Re-copy the connection string; the username/password may be wrong.";
    } else if (code === "3D000") {
      cause = "The database named in DATABASE_URL does not exist.";
      fix = "Point DATABASE_URL at the correct database name.";
    } else if (/ECONNREFUSED|ENOTFOUND|ETIMEDOUT|getaddrinfo/i.test(message)) {
      cause = "Could not reach the database host from this deployment.";
      fix = "Check the host in DATABASE_URL; use the pooled connection string.";
    } else if (/SSL|self-signed|certificate/i.test(message)) {
      cause = "The database requires SSL and the connection was rejected.";
      fix = "Ensure the connection string includes ?sslmode=require.";
    }

    return NextResponse.json({
      ok: false,
      databaseUrlSet: true,
      canConnect: false,
      code,
      cause,
      fix,
      detail: message,
    });
  }
}
