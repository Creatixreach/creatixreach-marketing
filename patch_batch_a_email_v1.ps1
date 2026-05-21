# =====================================================================
# Batch A - Email patches (Session 17)
# Adds noReplyFooter to shared template, turns it on for all customer-
# direction emails, rewrites welcome "reply to email" to "open a ticket".
#
# Touches: src/lib/email-template.ts
#          src/lib/email-welcome.ts
#          src/lib/email-tickets.ts
#          src/lib/email.ts
#
# Backups: each file gets a .bak.<timestamp> sibling. Rollback at bottom.
# =====================================================================

& {
    $repo = "C:\Users\CAVO TECH\Documents\creatixreach-portal"
    if (-not (Test-Path -LiteralPath $repo)) {
        Write-Host "REPO NOT FOUND at $repo. Edit `$repo at top of script." -ForegroundColor Red
        return
    }
    $stamp = Get-Date -Format 'yyyyMMdd_HHmmss'
    Write-Host ""
    Write-Host "=== BATCH A: Email patches ===" -ForegroundColor Cyan
    Write-Host "Repo:   $repo" -ForegroundColor Gray
    Write-Host "Backup: .bak.$stamp" -ForegroundColor Gray
    Write-Host ""

    function Process-File {
        param([string]$RelPath, [hashtable[]]$Pairs)
        $path = Join-Path $repo $RelPath
        if (-not (Test-Path -LiteralPath $path)) {
            Write-Host "  MISSING: $RelPath" -ForegroundColor Red
            return $false
        }
        Copy-Item -LiteralPath $path -Destination "$path.bak.$stamp" -Force
        $content = [System.IO.File]::ReadAllText($path) -replace "`r`n", "`n"
        $i = 0
        foreach ($p in $Pairs) {
            $i++
            $o = $p.Old -replace "`r`n", "`n"
            $n = $p.New -replace "`r`n", "`n"
            if (-not $content.Contains($o)) {
                Write-Host "  ANCHOR $i NOT FOUND in $RelPath" -ForegroundColor Red
                $head = $o.Substring(0, [Math]::Min(140, $o.Length))
                Write-Host "  Looked for: $head" -ForegroundColor Yellow
                return $false
            }
            $content = $content.Replace($o, $n)
        }
        [System.IO.File]::WriteAllText($path, $content, [System.Text.UTF8Encoding]::new($false))
        Write-Host "  OK: $RelPath ($($Pairs.Count) anchor(s))" -ForegroundColor Green
        return $true
    }

    # ---------------------------------------------------------------
    # File 1: email-template.ts  (add noReplyFooter param + conditional footer)
    # ---------------------------------------------------------------
    Write-Host "Patching src\lib\email-template.ts ..." -ForegroundColor Cyan
    $ok = Process-File "src\lib\email-template.ts" @(
        @{
            Old = @'
  /** Department signing off in footer */
  department: Department;
}
'@
            New = @'
  /** Department signing off in footer */
  department: Department;
  /** When true, footer says "no-reply, use support portal" instead of "reply to this email" */
  noReplyFooter?: boolean;
}
'@
        },
        @{
            Old = @'
              <div style="margin-bottom: 6px;">
                Questions? Reply to this email and a team member will help.
              </div>
'@
            New = @'
              <div style="margin-bottom: 6px;">
                ${t.noReplyFooter
                  ? `This is a no-reply address. For any questions, please open or update a support ticket at <a href="${APP_URL}/dashboard/support" style="color: #4f46e5; text-decoration: underline;">app.creatixreach.io/dashboard/support</a>.`
                  : `Questions? Reply to this email and a team member will help.`}
              </div>
'@
        }
    )
    if (-not $ok) { Write-Host "STOPPED" -ForegroundColor Red; return }

    # ---------------------------------------------------------------
    # File 2: email-welcome.ts  (rewrite intro + add noReplyFooter)
    # ---------------------------------------------------------------
    Write-Host "Patching src\lib\email-welcome.ts ..." -ForegroundColor Cyan
    $ok = Process-File "src\lib\email-welcome.ts" @(
        @{
            Old = @'
If you have any questions along the way, just reply to this email \u2014 we read every message.`;
'@
            New = @'
If you have any questions or run into any issues, please open a support ticket from your dashboard \u2014 we will get back to you as quickly as possible.`;
'@
        },
        @{
            Old = @'
    department: "CreatixReach team",
  });
'@
            New = @'
    department: "CreatixReach team",
    noReplyFooter: true,
  });
'@
        }
    )
    if (-not $ok) { Write-Host "STOPPED" -ForegroundColor Red; return }

    # ---------------------------------------------------------------
    # File 3: email-tickets.ts  (noReplyFooter on 3 customer-direction templates)
    # ---------------------------------------------------------------
    Write-Host "Patching src\lib\email-tickets.ts ..." -ForegroundColor Cyan
    $ok = Process-File "src\lib\email-tickets.ts" @(
        @{
            Old = @'
    ctaLabel: "View conversation",
    ctaUrl: url,
    department: "Support team",
  });
'@
            New = @'
    ctaLabel: "View conversation",
    ctaUrl: url,
    department: "Support team",
    noReplyFooter: true,
  });
'@
        },
        @{
            Old = @'
    ctaLabel: "View ticket",
    ctaUrl: url,
    department: "Support team",
  });
'@
            New = @'
    ctaLabel: "View ticket",
    ctaUrl: url,
    department: "Support team",
    noReplyFooter: true,
  });
'@
        },
        @{
            Old = @'
    ctaLabel: "Go to support",
    ctaUrl: url,
    department: "Support team",
  });
'@
            New = @'
    ctaLabel: "Go to support",
    ctaUrl: url,
    department: "Support team",
    noReplyFooter: true,
  });
'@
        }
    )
    if (-not $ok) { Write-Host "STOPPED" -ForegroundColor Red; return }

    # ---------------------------------------------------------------
    # File 4: email.ts  (noReplyFooter on 5 customer-direction senders)
    # ---------------------------------------------------------------
    Write-Host "Patching src\lib\email.ts ..." -ForegroundColor Cyan
    $ok = Process-File "src\lib\email.ts" @(
        @{
            Old = @'
    title: "You're verified \u2713",
    intro: `Hi <strong>${safeName}</strong>, your business <strong>${safeBiz}</strong> has been approved on CreatixReach. You can now search and purchase phone numbers for your dialer.<br/><br/>Note: you'll need balance on your account before placing orders.`,
    ctaLabel: "Go to dashboard",
    ctaUrl: `${APP_URL}/dashboard`,
    department: "Operations team",
  });
'@
            New = @'
    title: "You're verified \u2713",
    intro: `Hi <strong>${safeName}</strong>, your business <strong>${safeBiz}</strong> has been approved on CreatixReach. You can now search and purchase phone numbers for your dialer.<br/><br/>Note: you'll need balance on your account before placing orders.`,
    ctaLabel: "Go to dashboard",
    ctaUrl: `${APP_URL}/dashboard`,
    department: "Operations team",
    noReplyFooter: true,
  });
'@
        },
        @{
            Old = @'
    ctaLabel: "Resubmit verification",
    ctaUrl: `${APP_URL}/dashboard/verification`,
    department: "Operations team",
  });
'@
            New = @'
    ctaLabel: "Resubmit verification",
    ctaUrl: `${APP_URL}/dashboard/verification`,
    department: "Operations team",
    noReplyFooter: true,
  });
'@
        },
        @{
            Old = @'
    ctaLabel: "Top up balance",
    ctaUrl: `${APP_URL}/dashboard/calling-credit`,
    department: "Billing team",
  });
'@
            New = @'
    ctaLabel: "Top up balance",
    ctaUrl: `${APP_URL}/dashboard/calling-credit`,
    department: "Billing team",
    noReplyFooter: true,
  });
'@
        },
        @{
            Old = @'
    preheader: `Your ${opts.planName} dialer is ready`,
    title: "Your dialer is ready",
    intro,
    ctaLabel: "Go to dashboard",
    ctaUrl: `${APP_URL}/dashboard`,
    department: "Operations team",
  });
'@
            New = @'
    preheader: `Your ${opts.planName} dialer is ready`,
    title: "Your dialer is ready",
    intro,
    ctaLabel: "Go to dashboard",
    ctaUrl: `${APP_URL}/dashboard`,
    department: "Operations team",
    noReplyFooter: true,
  });
'@
        },
        @{
            Old = @'
    ctaLabel: "Top up calling credit",
    ctaUrl: `${APP_URL}/dashboard/calling-credit`,
    department: "Billing team",
  });
'@
            New = @'
    ctaLabel: "Top up calling credit",
    ctaUrl: `${APP_URL}/dashboard/calling-credit`,
    department: "Billing team",
    noReplyFooter: true,
  });
'@
        }
    )
    if (-not $ok) { Write-Host "STOPPED" -ForegroundColor Red; return }

    # ---------------------------------------------------------------
    # Verify: typecheck + lint
    # ---------------------------------------------------------------
    Write-Host ""
    Write-Host "=== Verifying typecheck (pnpm exec tsc --noEmit) ===" -ForegroundColor Cyan
    Push-Location $repo
    pnpm exec tsc --noEmit
    $tsc = $LASTEXITCODE
    if ($tsc -ne 0) {
        Write-Host "TYPECHECK FAILED (exit $tsc)" -ForegroundColor Red
        Write-Host "To rollback (PowerShell):" -ForegroundColor Yellow
        Write-Host "  Get-ChildItem $repo\src\lib\*.bak.$stamp | ForEach-Object { Move-Item -Force `$_.FullName (`$_.FullName -replace '\.bak\.[0-9_]+`$', '') }" -ForegroundColor Yellow
        Pop-Location
        return
    }
    Write-Host "Typecheck OK" -ForegroundColor Green

    Write-Host ""
    Write-Host "=== Verifying lint (pnpm exec next lint --max-warnings 0) ===" -ForegroundColor Cyan
    pnpm exec next lint --max-warnings 0
    $lint = $LASTEXITCODE
    Pop-Location
    if ($lint -ne 0) {
        Write-Host "LINT FAILED (exit $lint)" -ForegroundColor Red
        Write-Host "To rollback (PowerShell):" -ForegroundColor Yellow
        Write-Host "  Get-ChildItem $repo\src\lib\*.bak.$stamp | ForEach-Object { Move-Item -Force `$_.FullName (`$_.FullName -replace '\.bak\.[0-9_]+`$', '') }" -ForegroundColor Yellow
        return
    }
    Write-Host "Lint OK" -ForegroundColor Green

    Write-Host ""
    Write-Host "=== ALL GREEN ===" -ForegroundColor Green
    Write-Host "Backups: src\lib\*.bak.$stamp"
    Write-Host ""
    Write-Host "Next - commit + push (PowerShell):" -ForegroundColor Cyan
    Write-Host "  cd $repo" -ForegroundColor White
    Write-Host "  git add -A" -ForegroundColor White
    Write-Host "  git commit -m `"feat(email): no-reply footer on customer emails + welcome opens ticket instead of reply`"" -ForegroundColor White
    Write-Host "  git push" -ForegroundColor White
    return
}

# =====================================================================
# ROLLBACK (paste in PowerShell if anything goes wrong):
#   $repo  = "C:\Users\CAVO TECH\Documents\creatixreach-portal"
#   $stamp = "<paste the .bak.<stamp> timestamp printed above>"
#   Get-ChildItem $repo\src\lib\*.bak.$stamp | ForEach-Object {
#       Move-Item -Force $_.FullName ($_.FullName -replace '\.bak\.[0-9_]+$', '')
#   }
# =====================================================================
