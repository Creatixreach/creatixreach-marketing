# ============================================================
#  add-contact-backup.ps1
#  Adds a database backup for contact-form leads on the PORTAL:
#    1) new ContactSubmission table in the schema
#    2) contact form now SAVES every submission to the DB, and emails
#       as a notification (a lead is captured even if email fails)
#    3) a new admin page to browse every lead
#  Then commits and pushes.
#
#  AFTER running this, you must also run two commands (see the message
#  in chat) to create the table in your database.
#
#  HOW TO RUN (in the portal folder):
#     powershell -ExecutionPolicy Bypass -File .\add-contact-backup.ps1
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
  $bkDir = Join-Path $repo "_backups"
  [System.IO.Directory]::CreateDirectory($bkDir) | Out-Null

  function Backup-File([string]$path, [string]$rel) {
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    Copy-Item -LiteralPath $path -Destination (Join-Path $bkDir (($rel -replace "[\\/]", "_") + "." + $stamp + ".bak")) -Force
  }

  function Do-Replace([string]$rel, [string]$marker, [string]$oldStr, [string]$newStr) {
    $path = Join-Path $repo $rel
    if (-not (Test-Path -LiteralPath $path)) { Write-Host ("SKIP (not found): " + $rel) -ForegroundColor Yellow; return }
    $text = [System.IO.File]::ReadAllText($path, $u8)
    if ($text.Contains($marker)) { Write-Host ("ALREADY DONE: " + $rel + "  (" + $marker + ")") -ForegroundColor Yellow; return }
    $eol = "`n"; if ($text.Contains("`r`n")) { $eol = "`r`n" }
    $o = ($oldStr -replace "`r`n", "`n") -replace "`n", $eol
    $n = ($newStr -replace "`r`n", "`n") -replace "`n", $eol
    if (-not $text.Contains($o)) { Write-Host ("PATTERN NOT FOUND in " + $rel + " -- send me this file.") -ForegroundColor Red; return }
    Backup-File $path $rel
    [System.IO.File]::WriteAllText($path, $text.Replace($o, $n), $u8)
    Write-Host ("Updated: " + $rel) -ForegroundColor Green
    $script:changed++
  }

  # ---------------- 1) schema.prisma: append the model ----------------
  $schemaRel  = "prisma\schema.prisma"
  $schemaPath = Join-Path $repo $schemaRel
  if (-not (Test-Path -LiteralPath $schemaPath)) {
    Write-Host "schema.prisma not found -- cannot continue." -ForegroundColor Red
    exit 1
  }
  $schema = [System.IO.File]::ReadAllText($schemaPath, $u8)
  if ($schema.Contains("model ContactSubmission")) {
    Write-Host "ALREADY DONE: prisma\schema.prisma (model exists)" -ForegroundColor Yellow
  } else {
    $seol = "`n"; if ($schema.Contains("`r`n")) { $seol = "`r`n" }
    $model = @'
model ContactSubmission {
  id        String   @id @default(cuid())
  name      String
  email     String
  company   String?
  seats     String?
  message   String
  emailSent Boolean  @default(false)
  createdAt DateTime @default(now())

  @@index([createdAt])
}
'@
    $model = ($model -replace "`r`n", "`n") -replace "`n", $seol
    $newSchema = $schema.TrimEnd("`r", "`n") + $seol + $seol + $model + $seol
    Backup-File $schemaPath $schemaRel
    [System.IO.File]::WriteAllText($schemaPath, $newSchema, $u8)
    Write-Host "Updated: prisma\schema.prisma (added ContactSubmission)" -ForegroundColor Green
    $script:changed++
  }

  # ---------------- 2) contact action edits ----------------
  $impOld = @'
import { renderBrandedEmail } from "@/lib/email-template";
import { sendBrandedEmail, FROM_SALES } from "@/lib/email-send";
'@
  $impNew = @'
import { renderBrandedEmail } from "@/lib/email-template";
import { sendBrandedEmail, FROM_SALES } from "@/lib/email-send";
import { prisma } from "@/lib/prisma";
'@

  $blkOld = @'
  const result = await sendBrandedEmail({
    from: FROM_SALES,
    to: recipients,
    replyTo: email,
    subject: `[Contact] ${name}${company ? ` from ${company}` : ""}`,
    html,
    context: "contact",
    bccAdmin: false, // Already multi-recipient
  });

  if (!result.ok) {
    return {
      ok: false,
      error:
        "Could not send right now. Please try again or email info@creatixreach.io directly.",
    };
  }
  return { ok: true };
}
'@
  $blkNew = @'
  let emailSent = false;
  try {
    const result = await sendBrandedEmail({
      from: FROM_SALES,
      to: recipients,
      replyTo: email,
      subject: `[Contact] ${name}${company ? ` from ${company}` : ""}`,
      html,
      context: "contact",
      bccAdmin: false, // Already multi-recipient
    });
    if (result.ok) {
      emailSent = true;
    } else {
      console.error("[contact] email send returned not-ok");
    }
  } catch (e) {
    console.error("[contact] email send threw", e);
  }

  // Durable backup: save every submission so a lead is never lost,
  // even if the notification email fails. This is the source of truth.
  let saved = false;
  try {
    await prisma.contactSubmission.create({
      data: {
        name,
        email,
        company: company || null,
        seats: seats || null,
        message,
        emailSent,
      },
    });
    saved = true;
  } catch (e) {
    console.error("[contact] db backup failed", e);
  }

  if (saved || emailSent) return { ok: true };
  return {
    ok: false,
    error:
      "Could not send right now. Please try again or email info@creatixreach.io directly.",
  };
}
'@

  Do-Replace "src\app\contact\actions.ts" "@/lib/prisma"      $impOld $impNew
  Do-Replace "src\app\contact\actions.ts" "contactSubmission" $blkOld $blkNew

  # ---------------- 3) admin viewer page ----------------
  $pageDir  = Join-Path $repo "src\app\dashboard\admin\contact-submissions"
  [System.IO.Directory]::CreateDirectory($pageDir) | Out-Null
  $pagePath = Join-Path $pageDir "page.tsx"
  if (Test-Path -LiteralPath $pagePath) {
    Write-Host "ALREADY EXISTS: src\app\dashboard\admin\contact-submissions\page.tsx" -ForegroundColor Yellow
  } else {
    $page = @'
import { redirect } from "next/navigation";
import { auth } from "@clerk/nextjs/server";
import { isAdminUser } from "@/lib/admin";
import { prisma } from "@/lib/prisma";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

export const dynamic = "force-dynamic";

const dateFmt = new Intl.DateTimeFormat("en-US", {
  dateStyle: "medium",
  timeStyle: "short",
});

export default async function AdminContactSubmissionsPage() {
  const { userId } = await auth();
  if (!isAdminUser(userId)) {
    redirect("/dashboard");
  }

  const rows = await prisma.contactSubmission
    .findMany({ orderBy: { createdAt: "desc" }, take: 200 })
    .catch((e) => {
      console.error("[admin/contact-submissions] query failed", e);
      return [] as Awaited<ReturnType<typeof prisma.contactSubmission.findMany>>;
    });

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight md:text-3xl">
          Contact submissions
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Every message sent through the contact form, saved here as a backup so
          a lead is never lost even if the notification email fails. Newest first.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent leads (last 200)</CardTitle>
          <CardDescription>
            The Email column shows whether the notification email went out. A red
            badge means it did not send, so follow up with that person from here.
          </CardDescription>
        </CardHeader>
        <CardContent className="px-0">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border/60 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="px-6 py-3 font-medium">Date</th>
                  <th className="px-6 py-3 font-medium">Name</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                  <th className="px-6 py-3 font-medium">Company</th>
                  <th className="px-6 py-3 font-medium">Message</th>
                  <th className="px-6 py-3 font-medium">Email</th>
                </tr>
              </thead>
              <tbody>
                {rows.length === 0 ? (
                  <tr>
                    <td
                      colSpan={6}
                      className="px-6 py-10 text-center text-sm text-muted-foreground"
                    >
                      No submissions yet.
                    </td>
                  </tr>
                ) : (
                  rows.map((r) => (
                    <tr
                      key={r.id}
                      className="border-b border-border/40 align-top"
                    >
                      <td className="whitespace-nowrap px-6 py-3 text-muted-foreground">
                        {dateFmt.format(r.createdAt)}
                      </td>
                      <td className="px-6 py-3 font-medium">{r.name}</td>
                      <td className="px-6 py-3">
                        <a
                          href={`mailto:${r.email}`}
                          className="text-indigo-600 hover:underline dark:text-indigo-400"
                        >
                          {r.email}
                        </a>
                      </td>
                      <td className="px-6 py-3 text-muted-foreground">
                        {r.company || "-"}
                      </td>
                      <td className="max-w-md px-6 py-3">
                        <span className="line-clamp-3 whitespace-pre-wrap text-muted-foreground">
                          {r.message}
                        </span>
                      </td>
                      <td className="px-6 py-3">
                        {r.emailSent ? (
                          <span className="inline-flex items-center rounded-full bg-emerald-500/10 px-2.5 py-0.5 text-xs font-medium text-emerald-700 dark:text-emerald-400">
                            Sent
                          </span>
                        ) : (
                          <span className="inline-flex items-center rounded-full bg-red-500/10 px-2.5 py-0.5 text-xs font-medium text-red-700 dark:text-red-400">
                            Not sent
                          </span>
                        )}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
'@
    $page = ($page -replace "`r`n", "`n")
    [System.IO.File]::WriteAllText($pagePath, $page, $u8)
    Write-Host "Created: src\app\dashboard\admin\contact-submissions\page.tsx" -ForegroundColor Green
    $script:changed++
  }
}
catch {
  Write-Host ("ERROR: " + $_.Exception.Message) -ForegroundColor Red
  Write-Host "Nothing was pushed. Copy this message to me and I will fix it."
  exit 1
}

# ---------------- commit + push ----------------
$ErrorActionPreference = "Continue"
Write-Host ""
if ($script:changed -eq 0) {
  Write-Host "No changes made (already applied)." -ForegroundColor Yellow
  exit 0
}

git add -- "prisma/schema.prisma" "src/app/contact/actions.ts" "src/app/dashboard/admin/contact-submissions/page.tsx"
if ($LASTEXITCODE -ne 0) { Write-Host "git add failed." -ForegroundColor Red; exit 1 }

git commit -m "feat(contact): save submissions to DB as backup + admin viewer"
if ($LASTEXITCODE -ne 0) { Write-Host "git commit failed." -ForegroundColor Red; exit 1 }

Write-Host "Pushing..." -ForegroundColor Cyan
git push
if ($LASTEXITCODE -ne 0) { Write-Host "git push failed. Run 'git push' yourself." -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "DONE (code pushed)." -ForegroundColor Green
Write-Host "NEXT: create the table in your database by running these two"
Write-Host "commands in this same folder (see chat for details):"
Write-Host "   npx prisma db push"
Write-Host "   npx prisma generate"
