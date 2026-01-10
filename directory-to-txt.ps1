# Ausgeschlossene Ordnernamen (genauer Name, unabhängig von der Tiefe)
$exclude = @('node_modules', '.next', '.git')

# Ausgabe-Datei (hier: Desktop)
$out = Join-Path $env:USERPROFILE 'Desktop\ordnerstruktur.txt'

# Start: aktuelles Verzeichnis als Wurzel
$root = (Get-Location).Path

# Iterative Traversierung (kein Absteigen in ausgeschlossene Ordner)
$stack = [System.Collections.Stack]::new()
$list  = New-Object System.Collections.Generic.List[string]
$stack.Push($root)

while ($stack.Count -gt 0) {
    $dir = $stack.Pop()
    $list.Add($dir)

    foreach ($subDir in [System.IO.Directory]::EnumerateDirectories($dir)) {
        if ($exclude -contains ([System.IO.Path]::GetFileName($subDir))) { continue }
        $stack.Push($subDir)
    }

    foreach ($file in [System.IO.Directory]::EnumerateFiles($dir)) {
        $list.Add($file)
    }
}

# --> Jetzt alles relativ machen
$relList = $list | ForEach-Object { Resolve-Path $_ -Relative }

$relList | Set-Content -Path $out -Encoding utf8
Write-Host "Fertig -> $out"
