#!/usr/bin/env pwsh
# Runs a production build and checks for deprecated Tailwind v4 class names.
# Exit code 0 = all clear. Exit code 1 = issues found.

$root = $PSScriptRoot | Split-Path | Split-Path | Split-Path
Set-Location $root

$issues = @()

# ── 1. Deprecated Tailwind v4 class patterns ────────────────────────────────
$deprecated = @{
  'flex-shrink-0'     = 'shrink-0'
  'flex-shrink'       = 'shrink'
  'flex-grow-0'       = 'grow-0'
  'flex-grow'         = 'grow'
  'overflow-ellipsis' = 'text-ellipsis'
  'decoration-slice'  = 'box-decoration-slice'
  'decoration-clone'  = 'box-decoration-clone'
}

$searchDirs = @('app', 'components', 'lib')
$extensions = @('*.tsx', '*.ts', '*.jsx', '*.js')

Write-Host "`n🔍 Checking for deprecated Tailwind classes..." -ForegroundColor Cyan

foreach ($dir in $searchDirs) {
  $dirPath = Join-Path $root $dir
  if (-not (Test-Path $dirPath)) { continue }

  foreach ($ext in $extensions) {
    Get-ChildItem -Path $dirPath -Filter $ext -Recurse | ForEach-Object {
      $file = $_
      $content = Get-Content -LiteralPath $file.FullName -Raw
      foreach ($old in $deprecated.Keys) {
        if ($content -match [regex]::Escape($old)) {
          $lineNumbers = (Select-String -LiteralPath $file.FullName -Pattern ([regex]::Escape($old))).LineNumber -join ', '
          $issues += "  $($file.FullName.Replace($root + '\', '')) (line $lineNumbers): ``$old`` → ``$($deprecated[$old])``"
        }
      }
    }
  }
}

if ($issues.Count -gt 0) {
  Write-Host "⚠️  Deprecated Tailwind classes found:" -ForegroundColor Yellow
  $issues | ForEach-Object { Write-Host $_ -ForegroundColor Yellow }
} else {
  Write-Host "✅ No deprecated Tailwind classes found." -ForegroundColor Green
}

# ── 2. Arbitrary px values replaceable with Tailwind scale ──────────────────
# In Tailwind v4, 1 unit = 4px. Values divisible by 2px → clean scale unit.
# e.g. h-[62px] → h-15.5, w-[48px] → w-12, p-[8px] → p-2
$arbitraryIssues = @()

Write-Host "`n🔍 Checking for arbitrary [Xpx] values with Tailwind equivalents..." -ForegroundColor Cyan

foreach ($dir in $searchDirs) {
  $dirPath = Join-Path $root $dir
  if (-not (Test-Path $dirPath)) { continue }

  foreach ($ext in $extensions) {
    Get-ChildItem -Path $dirPath -Filter $ext -Recurse | ForEach-Object {
      $file = $_
      $lines = Get-Content -LiteralPath $file.FullName
      $lineNum = 0
      foreach ($line in $lines) {
        $lineNum++
        $matches = [regex]::Matches($line, '([\w-]+)-\[(\d+)px\]')
        foreach ($m in $matches) {
          $px = [int]$m.Groups[2].Value
          if ($px -eq 1) {
            $suggestion = "$($m.Groups[1].Value)-px"
            $arbitraryIssues += "  $($file.FullName.Replace($root + '\', '')) (line $lineNum): ``$($m.Value)`` → ``$suggestion``"
          } elseif ($px % 4 -eq 0) {
            $units = $px / 4
            $suggestion = "$($m.Groups[1].Value)-$units"
            $arbitraryIssues += "  $($file.FullName.Replace($root + '\', '')) (line $lineNum): ``$($m.Value)`` → ``$suggestion``"
          } elseif ($px % 2 -eq 0) {
            $units = ($px / 4).ToString('0.#')
            $suggestion = "$($m.Groups[1].Value)-$units"
            $arbitraryIssues += "  $($file.FullName.Replace($root + '\', '')) (line $lineNum): ``$($m.Value)`` → ``$suggestion``"
          }
        }
      }
    }
  }
}

if ($arbitraryIssues.Count -gt 0) {
  Write-Host "⚠️  Arbitrary px values that can use Tailwind scale:" -ForegroundColor Yellow
  $arbitraryIssues | ForEach-Object { Write-Host $_ -ForegroundColor Yellow }
  $issues += $arbitraryIssues
} else {
  Write-Host "✅ No replaceable arbitrary px values found." -ForegroundColor Green
}

# ── 3. Mobile-first audit ────────────────────────────────────────────────────
# Rules from copilot-instructions.md:
#   - Touch targets must be at least 44px tall (h-11 = 44px)
#   - Avoid hover-only interactions (hover: must have a matching active: equivalent)
#   - Use exact color tokens, not Tailwind named colors (e.g. bg-blue-500 is wrong)
#   - Hard-coded color tokens to use: #F2F2F7, #007AFF, #34C759, #FF3B30, #FF9500, #6C6C70
$mobileIssues = @()

Write-Host "`n📱 Running mobile-first audit..." -ForegroundColor Cyan

# 3a. hover: without matching active: on the same element
foreach ($dir in $searchDirs) {
  $dirPath = Join-Path $root $dir
  if (-not (Test-Path $dirPath)) { continue }

  foreach ($ext in $extensions) {
    Get-ChildItem -Path $dirPath -Filter $ext -Recurse | ForEach-Object {
      $file = $_
      $lines = Get-Content -LiteralPath $file.FullName
      $lineNum = 0
      foreach ($line in $lines) {
        $lineNum++
        # Flag hover: classes that have no active: sibling on the same line
        if ($line -match 'hover:[a-zA-Z0-9_\-\[\]\/]+' -and $line -notmatch 'active:[a-zA-Z0-9_\-\[\]\/]+') {
          $mobileIssues += "  $($file.FullName.Replace($root + '\', '')) (line $lineNum): hover-only interaction (add matching ``active:`` for touch) — $($line.Trim())"
        }
      }
    }
  }
}

# 3b. Tailwind named colors used instead of project color tokens
# Allowed named colors in this project (used for non-brand purposes): white, black, transparent, current
$namedColorRegex = '\b(bg|text|border|ring|fill|stroke)-(red|blue|green|yellow|purple|pink|indigo|orange|teal|cyan|gray|slate|zinc|neutral|stone|amber|lime|emerald|violet|fuchsia|rose|sky)-(\d{2,3})\b'
foreach ($dir in $searchDirs) {
  $dirPath = Join-Path $root $dir
  if (-not (Test-Path $dirPath)) { continue }

  foreach ($ext in @('*.tsx', '*.jsx')) {
    Get-ChildItem -Path $dirPath -Filter $ext -Recurse | ForEach-Object {
      $file = $_
      $lines = Get-Content -LiteralPath $file.FullName
      $lineNum = 0
      foreach ($line in $lines) {
        $lineNum++
        $colorMatches = [regex]::Matches($line, $namedColorRegex)
        foreach ($cm in $colorMatches) {
          $mobileIssues += "  $($file.FullName.Replace($root + '\', '')) (line $lineNum): Tailwind named color ``$($cm.Value)`` — use project color tokens (e.g. bg-[#007AFF]) instead"
        }
      }
    }
  }
}

if ($mobileIssues.Count -gt 0) {
  Write-Host "⚠️  Mobile-first / design system violations:" -ForegroundColor Yellow
  $mobileIssues | ForEach-Object { Write-Host $_ -ForegroundColor Yellow }
  $issues += $mobileIssues
} else {
  Write-Host "✅ Mobile-first audit passed." -ForegroundColor Green
}

# ── 4. Production build ──────────────────────────────────────────────────────
Write-Host "`n🔨 Running production build..." -ForegroundColor Cyan
$buildOutput = & npm run build 2>&1
$buildExitCode = $LASTEXITCODE

if ($buildExitCode -eq 0) {
  Write-Host "✅ Build passed." -ForegroundColor Green
} else {
  Write-Host "❌ Build failed:" -ForegroundColor Red
  Write-Host ($buildOutput | Out-String) -ForegroundColor Red
}

# ── Summary ──────────────────────────────────────────────────────────────────
Write-Host ""
if ($issues.Count -gt 0 -or $buildExitCode -ne 0) {
  Write-Host "❌ Quality check failed. Fix the issues above before committing." -ForegroundColor Red
  exit 1
} else {
  Write-Host "🎉 All quality checks passed!" -ForegroundColor Green
  exit 0
}
