$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Join-Path $PSScriptRoot 'AniProTech_UI-main')
npm.cmd run dev -- --host 127.0.0.1 --strictPort
