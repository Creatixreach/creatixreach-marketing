# ============================================================
#  add-leads-endpoint.ps1  (PORTAL)
#  Creates a secure /api/leads endpoint on the portal that accepts
#  leads from your other sites (protected by the shared secret) and
#  saves them into the same admin list. Then commits and pushes.
#
#  Requires the LEADS_INGEST_SECRET env var in the portal Vercel
#  project (see chat).
#
#  HOW TO RUN (in the portal folder):
#     powershell -ExecutionPolicy Bypass -File .\add-leads-endpoint.ps1
# ============================================================

$ErrorActionPreference = "Stop"

$repo = "C:\Users\CAVO TECH\Documents\creatixreach-portal"
$script:changed = 0

try {
  if (-not (Test-Path -LiteralPath $repo)) {
    Write-Host "Could not find the portal repo at: $repo" -ForegroundColor Red
    exit 1
  }
  Set-Location -LiteralPath $repo

  $u8 = New-Object System.Text.UTF8Encoding($false)
  $dir = Join-Path $repo "src\app\api\leads"
  [System.IO.Directory]::CreateDirectory($dir) | Out-Null
  $routePath = Join-Path $dir "route.ts"

  if (Test-Path -LiteralPath $routePath) {
    Write-Host "ALREADY EXISTS: src\app\api\leads\route.ts" -ForegroundColor Yellow
  } else {
    $route = @'
import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

type LeadBody = {
  source?: string;
  name?: string;
  email?: string;
  company?: string | null;
  phone?: string | null;
  seats?: string | null;
  message?: string;
  emailSent?: boolean;
};

export async function POST(req: Request) {
  const secret = process.env.LEADS_INGEST_SECRET;
  if (!secret) {
    console.error("[api/leads] LEADS_INGEST_SECRET not configured");
    return NextResponse.json(
      { ok: false, error: "not configured" },
      { status: 500 }
    );
  }

  const provided = req.headers.get("x-leads-secret");
  if (!provided || provided !== secret) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 }
    );
  }

  let body: LeadBody;
  try {
    body = (await req.json()) as LeadBody;
  } catch {
    return NextResponse.json(
      { ok: false, error: "invalid json" },
      { status: 400 }
    );
  }

  const name = (body.name ?? "").trim();
  const email = (body.email ?? "").trim();
  const message = (body.message ?? "").trim();
  if (name.length < 1 || !email.includes("@") || message.length < 1) {
    return NextResponse.json(
      { ok: false, error: "missing fields" },
      { status: 400 }
    );
  }

  const source = (body.source ?? "external").trim() || "external";
  const company = body.company ? String(body.company).trim() : null;
  const phone = body.phone ? String(body.phone).trim() : null;
  const seats = body.seats ? String(body.seats).trim() : null;
  const emailSent = body.emailSent === true;

  try {
    await prisma.contactSubmission.create({
      data: { source, name, email, company, phone, seats, message, emailSent },
    });
  } catch (e) {
    console.error("[api/leads] db insert failed", e);
    return NextResponse.json({ ok: false, error: "db error" }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
'@
    $route = ($route -replace "`r`n", "`n")
    [System.IO.File]::WriteAllText($routePath, $route, $u8)
    Write-Host "Created: src\app\api\leads\route.ts" -ForegroundColor Green
    $script:changed++
  }
}
catch {
  Write-Host ("ERROR: " + $_.Exception.Message) -ForegroundColor Red
  exit 1
}

$ErrorActionPreference = "Continue"
Write-Host ""
if ($script:changed -eq 0) { Write-Host "No changes made (already applied)." -ForegroundColor Yellow; exit 0 }

git add -- "src/app/api/leads/route.ts"
if ($LASTEXITCODE -ne 0) { Write-Host "git add failed." -ForegroundColor Red; exit 1 }
git commit -m "feat(api): secure /api/leads endpoint for external lead capture"
if ($LASTEXITCODE -ne 0) { Write-Host "git commit failed." -ForegroundColor Red; exit 1 }
Write-Host "Pushing..." -ForegroundColor Cyan
git push
if ($LASTEXITCODE -ne 0) { Write-Host "git push failed. Run 'git push' yourself." -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "DONE (portal endpoint live after ~1-2 min)." -ForegroundColor Green
