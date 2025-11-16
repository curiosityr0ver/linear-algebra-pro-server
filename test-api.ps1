function Test-Endpoint {
    param(
        [Parameter(Mandatory = $true)]
        [ValidateSet('GET', 'POST', 'DELETE', 'PUT', 'PATCH')]
        [string]$Method,
        [Parameter(Mandatory = $true)]
        [string]$Uri,
        [string]$Description = '',
        [string]$Body
    )

    Write-Host "`n-> $Description" -ForegroundColor DarkGray
    try {
        $request = @{
            Method      = $Method
            Uri         = $Uri
            Headers     = @{ 'Content-Type' = 'application/json' }
            ErrorAction = 'Stop'
        }
        if ($Body) {
            $request.Body = $Body
        }
        $response = Invoke-WebRequest @request
        Write-Host "[SUCCESS $($response.StatusCode)] $Description" -ForegroundColor Green
        if ($response.Content) {
            try {
                return $response.Content | ConvertFrom-Json -ErrorAction Stop
            } catch {
                return $response.Content
            }
        }
    } catch {
        $statusCode = if ($_.Exception.Response) {
            $_.Exception.Response.StatusCode.value__
        } else {
            'ERR'
        }
        Write-Host "[ERROR $statusCode] $Description" -ForegroundColor Red
        if ($_.Exception.Response -and $_.Exception.Response.Content) {
            Write-Host ($_.Exception.Response.Content | Out-String) -ForegroundColor DarkRed
        }
    }
}

Write-Host "Testing Linear Algebra API Endpoints" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

function Get-ConfiguredPort {
    $envFile = Join-Path $PSScriptRoot '.env'
    $candidate = $null

    if (Test-Path $envFile) {
        $line = Get-Content $envFile | Where-Object { $_ -match '^\s*PORT\s*=' } | Select-Object -First 1
        if ($line) {
            $value = $line -replace '^\s*PORT\s*=\s*', ''
            $value = $value.Trim()
            if ($value.StartsWith('"') -and $value.EndsWith('"')) {
                $value = $value.Substring(1, $value.Length - 2)
            } elseif ($value.StartsWith("'") -and $value.EndsWith("'")) {
                $value = $value.Substring(1, $value.Length - 2)
            }
            $candidate = $value
        }
    }

    if (-not $candidate -and $env:PORT) {
        $candidate = $env:PORT
    }

    if ([string]::IsNullOrWhiteSpace($candidate)) {
        return 3000
    }

    try {
        return [int]$candidate
    } catch {
        return 3000
    }
}

$port = Get-ConfiguredPort
$baseUrl = "http://localhost:$port"
Write-Host "Target API base URL: $baseUrl" -ForegroundColor Yellow

function New-ApiUri {
    param([string]$Path)
    return "$baseUrl$Path"
}

# Test Matrix Operations
Write-Host "`nMATRIX OPERATIONS" -ForegroundColor Magenta
Write-Host "===================" -ForegroundColor Magenta

Test-Endpoint -Method POST -Uri (New-ApiUri '/matrix/create/identity/3') -Description "Create 3x3 identity matrix"
Test-Endpoint -Method POST -Uri (New-ApiUri '/matrix/create/zeros?rows=2&cols=3') -Description "Create 2x3 zeros matrix"
Test-Endpoint -Method POST -Uri (New-ApiUri '/matrix/create/ones?rows=2&cols=2') -Description "Create 2x2 ones matrix"

$binaryBody = @{
    matrixA = @{ data = @(@(1, 2), @(3, 4)) }
    matrixB = @{ data = @(@(5, 6), @(7, 8)) }
} | ConvertTo-Json -Depth 10
Test-Endpoint -Method POST -Uri (New-ApiUri '/matrix/add') -Body $binaryBody -Description "Matrix addition"
Test-Endpoint -Method POST -Uri (New-ApiUri '/matrix/subtract') -Body $binaryBody -Description "Matrix subtraction"
Test-Endpoint -Method POST -Uri (New-ApiUri '/matrix/multiply') -Body $binaryBody -Description "Matrix multiplication"

$scalarBody = @{
    matrixA = @{ data = @(@(1, 2), @(3, 4)) }
    scalar = 2
} | ConvertTo-Json -Depth 10
Test-Endpoint -Method POST -Uri (New-ApiUri '/matrix/multiply-scalar') -Body $scalarBody -Description "Matrix x scalar"
$divideScalarBody = @{
    matrixA = @{ data = @(@(2, 4), @(6, 8)) }
    scalar = 2
} | ConvertTo-Json -Depth 10
Test-Endpoint -Method POST -Uri (New-ApiUri '/matrix/divide-scalar') -Body $divideScalarBody -Description "Matrix / scalar"

$transposeBody = @{
    matrix = @{ data = @(@(1, 2, 3), @(4, 5, 6)) }
} | ConvertTo-Json -Depth 10
Test-Endpoint -Method POST -Uri (New-ApiUri '/matrix/transpose') -Body $transposeBody -Description "Matrix transpose"
Test-Endpoint -Method POST -Uri (New-ApiUri '/matrix/info') -Body $transposeBody -Description "Matrix information"

$squareMatrix = @{
    matrix = @{ data = @(@(4, 1), @(1, 2)) }
} | ConvertTo-Json -Depth 10
Test-Endpoint -Method POST -Uri (New-ApiUri '/matrix/trace') -Body $squareMatrix -Description "Matrix trace"
Test-Endpoint -Method POST -Uri (New-ApiUri '/matrix/determinant') -Body $squareMatrix -Description "Matrix determinant"

$eigenBody = @{
    matrix = @{ data = @(@(4, 1), @(1, 2)) }
    options = @{
        maxIterations = 250
        tolerance = 1e-8
    }
} | ConvertTo-Json -Depth 10
Test-Endpoint -Method POST -Uri (New-ApiUri '/matrix/eigenvalues') -Body $eigenBody -Description "Matrix eigenvalue/vector"

$equalsBody = @{
    matrixA = @{ data = @(@(1, 2), @(3, 4)) }
    matrixB = @{ data = @(@(1, 2), @(3, 4)) }
} | ConvertTo-Json -Depth 10
Test-Endpoint -Method POST -Uri (New-ApiUri '/matrix/equals?tolerance=1e-9') -Body $equalsBody -Description "Matrix equality check"

# Test Advanced Algorithms
Write-Host "`nADVANCED ALGORITHMS" -ForegroundColor Magenta
Write-Host "=====================" -ForegroundColor Magenta

$pcaBody = @{
    X = @{ data = @(
        @(1, 2), @(2, 4), @(3, 6), @(4, 8), @(5, 10)
    ) }
    nComponents = 1
} | ConvertTo-Json -Depth 10
Test-Endpoint -Method POST -Uri (New-ApiUri '/advanced/pca/train') -Body $pcaBody -Description "PCA training"

$svdBody = @{
    matrix = @{ data = @(@(4, 0, 2), @(0, 3, -1), @(2, -1, 1)) }
} | ConvertTo-Json -Depth 10
Test-Endpoint -Method POST -Uri (New-ApiUri '/advanced/svd/decompose') -Body $svdBody -Description "SVD decomposition"

$qrBody = @{
    matrix = @{ data = @(@(1, 1), @(1, 0)) }
} | ConvertTo-Json -Depth 10
Test-Endpoint -Method POST -Uri (New-ApiUri '/advanced/qr/decompose') -Body $qrBody -Description "QR decomposition"

# Test Machine Learning
Write-Host "`nMACHINE LEARNING" -ForegroundColor Magenta
Write-Host "==================" -ForegroundColor Magenta

$trainBody = @{
    X = @{ data = @(@(1), @(2), @(3), @(4)) }
    y = @{ data = @(@(3), @(5), @(7), @(9)) }
    options = @{
        learningRate = 0.05
        maxIterations = 200
        tolerance = 1e-6
        method = "adam"
    }
    lossFunction = "mse"
} | ConvertTo-Json -Depth 10
$trainResult = Test-Endpoint -Method POST -Uri (New-ApiUri '/ml/linear-regression/train') -Body $trainBody -Description "Train linear regression"
$modelId = $trainResult?.modelId

if ($modelId) {
    Write-Host "`nUsing Model ID: $modelId" -ForegroundColor Cyan

    $predictBody = @{
        X = @{ data = @(@(1.5), @(2.5)) }
    } | ConvertTo-Json -Depth 10
    Test-Endpoint -Method POST -Uri (New-ApiUri "/ml/linear-regression/$modelId/predict") -Body $predictBody -Description "Make predictions"

    Test-Endpoint -Method GET -Uri (New-ApiUri "/ml/models/$modelId") -Description "Get model information"
    Test-Endpoint -Method GET -Uri (New-ApiUri "/ml/models/$modelId/history") -Description "Get model training history"
}

Test-Endpoint -Method GET -Uri (New-ApiUri '/ml/models') -Description "List trained models"

if ($modelId) {
    Test-Endpoint -Method DELETE -Uri (New-ApiUri "/ml/models/$modelId") -Description "Delete trained model"
}

# Test API documentation endpoint
Write-Host "`nAPI DOCUMENTATION" -ForegroundColor Magenta
Write-Host "===================" -ForegroundColor Magenta

try {
    Invoke-WebRequest -Uri (New-ApiUri '/api') -Method GET | Out-Null
    Write-Host "API Documentation: Available at http://localhost:3000/api" -ForegroundColor Green
} catch {
    Write-Host "API Documentation: Not accessible" -ForegroundColor Red
}

Write-Host "`nAPI Testing Complete!" -ForegroundColor Cyan
