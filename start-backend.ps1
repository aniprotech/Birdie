$ErrorActionPreference = 'Stop'
Set-Location -LiteralPath (Join-Path $PSScriptRoot 'AniProTech_Node_Backend')
npm.cmd start
