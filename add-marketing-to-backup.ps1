# ============================================================
#  add-marketing-to-backup.ps1  (MARKETING SITE)
#  Makes the marketing contact form send each lead to the portal's
#  /api/leads endpoint, so it lands in the same admin list tagged
#  "Marketing site" -- even if the email fails. Then commits/pushes.
#
#  Requires the SAME LEADS_INGEST_SECRET env var in the MARKETING
#  Vercel project (see chat).
#
#  HOW TO RUN (from anywhere -- targets the marketing repo by path):
#     powershell -ExecutionPolicy Bypass -File "$HOME\Downloads\add-marketing-to-backup.ps1"
# ============================================================

$ErrorActionPreference = "Stop"

$repo = "C:\Users\CAVO TECH\Documents\creatixreach-marketing"
$script:changed = 0

try {
  if (-not (Test-Path -LiteralPath $repo)) {
    Write-Host "Could not find the marketing repo at: $repo" -ForegroundColor Red
    exit 1
  }
  Set-Location -LiteralPath $repo

  $u8 = New-Object System.Text.UTF8Encoding($false)
  $bkDir = Join-Path $repo "_backups"
  [System.IO.Directory]::CreateDirectory($bkDir) | Out-Null

  $rel = "src\app\contact\actions.ts"
  $path = Join-Path $repo $rel
  if (-not (Test-Path -LiteralPath $path)) {
    Write-Host ("Not found: " + $rel) -ForegroundColor Red
    exit 1
  }

  $text = [System.IO.File]::ReadAllText($path, $u8)
  if ($text.Contains("LEADS_INGEST_SECRET")) {
    Write-Host "ALREADY DONE: marketing contact action" -ForegroundColor Yellow
  } else {
    $eol = "`n"; if ($text.Contains("`r`n")) { $eol = "`r`n" }

    $old = @'
  const client = getResend();
  if (!client) {
    console.error("[marketing-contact] RESEND_API_KEY not configured");
    return {
      ok: false,
      error:
        "Couldn't send. Please WhatsApp us instead at +1 323 297 8843.",
    };
  }

  console.log(
    `[marketing-contact] sending to ${recipients.join(",")} subject="${subject}"`
  );

  try {
    const result = await client.emails.send({
      from: FROM_SALES,
      to: recipients,
      replyTo: data.email,
      subject,
      html,
    });

    // Resend can return 200 with an error object - check explicitly (portal gotcha #167)
    if (result.error) {
      console.error(
        "[marketing-contact] resend error",
        JSON.stringify(result.error)
      );
      return {
        ok: false,
        error: "Couldn't send. Please WhatsApp us instead.",
      };
    }

    console.log(`[marketing-contact] sent, id=${result.data?.id}`);
    return { ok: true };
  } catch (e) {
    const msg = e instanceof Error ? e.message : String(e);
    console.error("[marketing-contact] throw", msg);
    return {
      ok: false,
      error: "Couldn't send. Please WhatsApp us instead.",
    };
  }
}
'@

    $new = @'
  // Notification email (best-effort).
  let emailSent = false;
  const client = getResend();
  if (!client) {
    console.error("[marketing-contact] RESEND_API_KEY not configured");
  } else {
    try {
      const result = await client.emails.send({
        from: FROM_SALES,
        to: recipients,
        replyTo: data.email,
        subject,
        html,
      });
      if (result.error) {
        console.error(
          "[marketing-contact] resend error",
          JSON.stringify(result.error)
        );
      } else {
        emailSent = true;
        console.log(`[marketing-contact] sent, id=${result.data?.id}`);
      }
    } catch (e) {
      const msg = e instanceof Error ? e.message : String(e);
      console.error("[marketing-contact] throw", msg);
    }
  }

  // Durable backup: send the lead to the portal so it is saved in the
  // shared admin list, even if the notification email fails.
  let saved = false;
  const ingestSecret = process.env.LEADS_INGEST_SECRET;
  if (!ingestSecret) {
    console.error("[marketing-contact] LEADS_INGEST_SECRET not configured");
  } else {
    try {
      const res = await fetch("https://app.creatixreach.io/api/leads", {
        method: "POST",
        headers: {
          "content-type": "application/json",
          "x-leads-secret": ingestSecret,
        },
        body: JSON.stringify({
          source: "marketing",
          name: data.name,
          email: data.email,
          company: data.company || null,
          phone: data.phone || null,
          message:
            "Topic: " +
            topicLabel +
            (data.budget ? " | Budget: " + data.budget : "") +
            "\n\n" +
            data.message,
          emailSent,
        }),
      });
      saved = res.ok;
      if (!res.ok) {
        console.error("[marketing-contact] ingest failed", res.status);
      }
    } catch (e) {
      console.error("[marketing-contact] ingest threw", e);
    }
  }

  if (emailSent || saved) {
    return { ok: true };
  }
  return {
    ok: false,
    error: "Couldn't send. Please WhatsApp us instead.",
  };
}
'@

    $o = ($old -replace "`r`n", "`n") -replace "`n", $eol
    $n = ($new -replace "`r`n", "`n") -replace "`n", $eol
    if (-not $text.Contains($o)) {
      Write-Host "PATTERN NOT FOUND in marketing action -- send me the current file." -ForegroundColor Red
      exit 1
    }
    $stamp = Get-Date -Format "yyyyMMdd-HHmmss"
    Copy-Item -LiteralPath $path -Destination (Join-Path $bkDir (($rel -replace "[\\/]", "_") + "." + $stamp + ".bak")) -Force
    [System.IO.File]::WriteAllText($path, $text.Replace($o, $n), $u8)
    Write-Host ("Updated: " + $rel) -ForegroundColor Green
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

git add -- "src/app/contact/actions.ts"
if ($LASTEXITCODE -ne 0) { Write-Host "git add failed." -ForegroundColor Red; exit 1 }
git commit -m "feat(contact): also save leads to portal admin list"
if ($LASTEXITCODE -ne 0) { Write-Host "git commit failed." -ForegroundColor Red; exit 1 }
Write-Host "Pushing (marketing site rebuilds)..." -ForegroundColor Cyan
git push
if ($LASTEXITCODE -ne 0) { Write-Host "git push failed. Run 'git push' yourself." -ForegroundColor Red; exit 1 }

Write-Host ""
Write-Host "DONE." -ForegroundColor Green
Write-Host "Wait ~1-2 min, submit the marketing contact form, then check the"
Write-Host "portal admin 'Contact leads' page for a row tagged 'Marketing site'."
