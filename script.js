let img;
document.getElementById('imageUpload').addEventListener('change', handleImageUpload);
document.getElementById('transformButton').addEventListener('click', handleImageTransform);

function handleImageUpload(event) {
    const file = event.target.files[0];
    if (!file) return;

    img = new Image();
    img.src = URL.createObjectURL(file);
    img.onload = () => {
        //원본 이미지 출력
        const originalCanvas = document.getElementById('originalCanvas');
        const ctxOriginal = originalCanvas.getContext('2d');
        const scaleFactor = 600 / img.height;
        const newWidth = img.width * scaleFactor;
        originalCanvas.width = newWidth;
        originalCanvas.height = 600;
        ctxOriginal.drawImage(img, 0, 0, newWidth, 600);
    };
}
function handleImageTransform(event) {
    const originalCanvas = document.getElementById('originalCanvas');
    const ctxOriginal = originalCanvas.getContext('2d');
    //이미지 추출 및 버전 선택
    const imageData = ctxOriginal.getImageData(0, 0, originalCanvas.width, originalCanvas.height);
    const selectedVersion = document.getElementById('versionSelect').value;
    const transformedData = transformColors(imageData.data, selectedVersion);    
    //변환 이미지 출력
    const outputCanvas = document.getElementById('outputCanvas');
    const outputCtx = outputCanvas.getContext('2d');
    outputCanvas.width = originalCanvas.width;
    outputCanvas.height = originalCanvas.height;

    outputCtx.putImageData(new ImageData(transformedData, originalCanvas.width, originalCanvas.height), 0, 0);
};

function transformColors(data,version) {
    const yellow = { r: 255, g: 255, b: 0 };
    const blue = { r: 0, g: 0, b: 255 };
    const green = { r:0, g: 205, b: 0 };
    const transformedData = new Uint8ClampedArray(data.length);

    for (let i = 0; i < data.length; i += 4) {
        const r = data[i];
        const g = data[i + 1];
        const b = data[i + 2];

        const isGray = (Math.abs(r - g) < 30) && (Math.abs(g - b) < 30) && (Math.abs(b - r) < 30);

        if (isGray) {
            // 무채색인 경우 원래 색상을 그대로 유지
            if (version=="version1") {
                transformedData[i] = r;     // Red
                transformedData[i + 1] = g; // Green
                transformedData[i + 2] = b; // Blue
                transformedData[i + 3] = data[i + 3]; // Alpha
            } else {
                transformedData[i] = Math.min(r + 50, 255);     // Red
                transformedData[i + 1] = Math.min(g + 50, 255); // Green
                transformedData[i + 2] = Math.min(b + 50, 255); // Blue
                transformedData[i + 3] = data[i + 3]; // Alpha
            }
        } else {
            // 노란색과 거리 측정
            const distanceToYellow = Math.sqrt(
                Math.pow(r - yellow.r, 2) +
                Math.pow(g - yellow.g, 2) +
                Math.pow(b - yellow.b, 2)
            );
            // 파란색과 거리 측정
            const distanceToBlue = Math.sqrt(
                Math.pow(r - blue.r, 2) +
                Math.pow(g - blue.g, 2) +
                Math.pow(b - blue.b, 2)
            );
            const distanceToGreen = Math.sqrt(
                Math.pow(r - blue.r, 2) +
                Math.pow(g - blue.g, 2) +
                Math.pow(b - blue.b, 2)
            );
            const totalDistance = distanceToYellow + distanceToBlue;

            let newColor;
            if (totalDistance === 0) {
                //noting
            } else {
                const factor = distanceToYellow / totalDistance;
                newColor = (version === 'version1')
                    ? interpolateColor(yellow, blue, factor)
                    : interpolateColor(green, blue, factor);
            }

            // 색상을 밝게 만드는 부분
            if (version=='version1') {
                transformedData[i] = Math.min(newColor.r + 50, 255);     // Red
                transformedData[i + 1] = Math.min(newColor.g + 50, 255); // Green
                transformedData[i + 2] = Math.min(newColor.b + 70, 255); // Blue
                transformedData[i + 3] = data[i + 3]; // Alpha
            } else {
                transformedData[i] = Math.min(newColor.r + 70, 255);     // Red
                transformedData[i + 1] = Math.min(newColor.g + 70, 255); // Green
                transformedData[i + 2] = Math.min(newColor.b + 100, 255); // Blue
                transformedData[i + 3] = data[i + 3]; // Alpha
            }
            
            
        }
    }

    return transformedData;
}
// 색 변환
function interpolateColor(color1, color2, factor) {
    const r = Math.round(color1.r + (color2.r - color1.r) * factor);
    const g = Math.round(color1.g + (color2.g - color1.g) * factor);
    const b = Math.round(color1.b + (color2.b - color1.b) * factor);
    return { r, g, b };
}
