# Test script for Linear Algebra API endpoints

Write-Host "🧪 Testing Linear Algebra API Endpoints" -ForegroundColor Cyan
Write-Host "============================================" -ForegroundColor Cyan

$baseUrl = "http://localhost:3000"

# Test Matrix Operations
Write-Host "`n📐 MATRIX OPERATIONS" -ForegroundColor Magenta
Write-Host "===================" -ForegroundColor Magenta

# Identity matrix
Test-Endpoint -Method POST -Uri "$baseUrl/matrix/create/identity/3" -Description "Create 3x3 identity matrix"

# Zeros matrix
Test-Endpoint -Method POST -Uri "$baseUrl/matrix/create/zeros?rows=2&cols=3" -Description "Create 2x3 zeros matrix"

# Ones matrix
Test-Endpoint -Method POST -Uri "$baseUrl/matrix/create/ones?rows=2&cols=2" -Description "Create 2x2 ones matrix"

# Matrix addition
$addBody = @{
    matrixA = @{ data = @(@(1, 2), @(3, 4)) }
    matrixB = @{ data = @(@(5, 6), @(7, 8)) }
} | ConvertTo-Json -Depth 10
Test-Endpoint -Method POST -Uri "$baseUrl/matrix/add" -Body $addBody -Description "Matrix addition"

# Matrix transpose
$transposeBody = @{
    matrix = @{ data = @(@(1, 2, 3), @(4, 5, 6)) }
} | ConvertTo-Json -Depth 10
Test-Endpoint -Method POST -Uri "$baseUrl/matrix/transpose" -Body $transposeBody -Description "Matrix transpose"

# Matrix trace
$traceBody = @{
    matrix = @{ data = @(@(1, 2), @(3, 4)) }
} | ConvertTo-Json -Depth 10
Test-Endpoint -Method POST -Uri "$baseUrl/matrix/trace" -Body $traceBody -Description "Matrix trace"

# Matrix determinant
Test-Endpoint -Method POST -Uri "$baseUrl/matrix/determinant" -Body $traceBody -Description "Matrix determinant"

# Matrix eigenvalues
Test-Endpoint -Method POST -Uri "$baseUrl/matrix/eigenvalues" -Body $traceBody -Description "Matrix eigenvalues"

# Matrix info
Test-Endpoint -Method POST -Uri "$baseUrl/matrix/info" -Body $transposeBody -Description "Matrix information"

# Test Advanced Algorithms
Write-Host "`n🧮 ADVANCED ALGORITHMS" -ForegroundColor Magenta
Write-Host "=====================" -ForegroundColor Magenta

# PCA
$pcaBody = @{
    X = @{ data = @(
        @(1, 2), @(2, 4), @(3, 6), @(4, 8), @(5, 10)
    ) }
    nComponents = 1
} | ConvertTo-Json -Depth 10
Test-Endpoint -Method POST -Uri "$baseUrl/advanced/pca/train" -Body $pcaBody -Description "PCA training"

# SVD
$svdBody = @{
    matrix = @{ data = @(@(4, 0, 2), @(0, 3, -1), @(2, -1, 1)) }
} | ConvertTo-Json -Depth 10
Test-Endpoint -Method POST -Uri "$baseUrl/advanced/svd/decompose" -Body $svdBody -Description "SVD decomposition"

# QR
$qrBody = @{
    matrix = @{ data = @(@(1, 1), @(1, 0)) }
} | ConvertTo-Json -Depth 10
Test-Endpoint -Method POST -Uri "$baseUrl/advanced/qr/decompose" -Body $qrBody -Description "QR decomposition"

# Test Machine Learning
Write-Host "`n🤖 MACHINE LEARNING" -ForegroundColor Magenta
Write-Host "==================" -ForegroundColor Magenta

# Train linear regression
$trainBody = @{
    X = @{ data = @(@(1), @(2), @(3), @(4)) }
    y = @{ data = @(@(3), @(5), @(7), @(9)) }
    options = @{
        learningRate = 0.01
        maxIterations = 100
        method = "adam"
    }
} | ConvertTo-Json -Depth 10
$trainResponse = Test-Endpoint -Method POST -Uri "$baseUrl/ml/linear-regression/train" -Body $trainBody -Description "Train linear regression"

# Extract model ID from response if training was successful
if ($trainResponse) {
    try {
        $trainResult = Invoke-WebRequest -Uri "$baseUrl/ml/linear-regression/train" -Method POST -Headers $headers -Body $trainBody
        $content = $trainResult.Content | ConvertFrom-Json
        $modelId = $content.modelId

        if ($modelId) {
            Write-Host "`n📋 Using Model ID: $modelId" -ForegroundColor Cyan

            # Test predictions
            $predictBody = @{
                X = @{ data = @(@(1.5), @(2.5)) }
            } | ConvertTo-Json -Depth 10
            Test-Endpoint -Method POST -Uri "$baseUrl/ml/linear-regression/$modelId/predict" -Body $predictBody -Description "Make predictions"

            # Get model info
            Test-Endpoint -Method GET -Uri "$baseUrl/ml/models/$modelId" -Description "Get model information"
        }
    } catch {
        Write-Host "⚠️ Could not extract model ID for prediction testing" -ForegroundColor Yellow
    }
}

# List models
Test-Endpoint -Method GET -Uri "$baseUrl/ml/models" -Description "List trained models"

# Test API documentation endpoint
Write-Host "`n📚 API DOCUMENTATION" -ForegroundColor Magenta
Write-Host "===================" -ForegroundColor Magenta

try {
    $apiResponse = Invoke-WebRequest -Uri "$baseUrl/api" -Method GET
    Write-Host "✅ API Documentation: Available at http://localhost:3000/api" -ForegroundColor Green
} catch {
    Write-Host "❌ API Documentation: Not accessible" -ForegroundColor Red
}

Write-Host "`n🎉 API Testing Complete!" -ForegroundColor Cyan
