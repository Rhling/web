document.addEventListener('DOMContentLoaded', function() {
    console.log('全畫面波浪動畫已載入！');
    
    // 建立 canvas 元素並插入 body
    let canvas = document.getElementById('waveCanvas');
    if (!canvas) {
        canvas = document.createElement('canvas');
        canvas.id = 'waveCanvas';
        document.body.appendChild(canvas);
    }

    const ctx = canvas.getContext('2d');
    
    // 設定基本參數，使用更大範圍
    const verticalCenter = window.innerHeight * (0.3 + Math.random() * 0.4);
    const baseAmplitude = (150 + Math.random() * 120); // 變化更大，150~270
    
    // 波形參數 - 使用更大範圍
    const waveParams = {
        frequency: (0.0008 + Math.random() * 0.003), // 變化更大
        phase: Math.random() * Math.PI * 2,
        speed: 0.02 + Math.random() * 0.03, // 更快
        horizontalSpeed: 2 + Math.random() * 1.5, // 更快
        floatSpeed: 0.0008 + Math.random() * 0.001,
        floatAmplitude: 60 + Math.random() * 40 // 飄浮幅度更大
    };
    
    // 用於創建自然變化的多個波
    const subWaves = [
        {
            frequency: waveParams.frequency * (0.25 + Math.random() * 0.18),
            amplitude: baseAmplitude * 0.25,
            speed: waveParams.speed * 0.7,
            phase: Math.random() * Math.PI * 2
        },
        {
            frequency: waveParams.frequency * (1.1 + Math.random() * 0.25),
            amplitude: baseAmplitude * 0.13,
            speed: waveParams.speed * 1.3,
            phase: Math.random() * Math.PI * 2
        }
    ];
    
    // 時間變數
    let time = Math.random() * 100; // 隨機的起始時間
    
    // 水平偏移量 - 用於實現右至左的移動
    let horizontalOffset = 0;
    
    // 儲存前一幀的波形，用於高比例平滑過渡
    let previousWavePoints = [];
    
    // 延伸參數 - 讓線條延伸到畫面外
    const extensionFactor = 0.3; // 每側延伸畫面寬度的30%

    // 星空背景參數
    const STAR_COUNT = 120;
    let stars = [];
    function createStars() {
        stars = [];
        for (let i = 0; i < STAR_COUNT; i++) {
            stars.push({
                x: Math.random() * canvas.width,
                y: Math.random() * canvas.height,
                r: Math.random() * 1.2 + 0.3,
                alpha: Math.random() * 0.5 + 0.5,
                speed: Math.random() * 0.2 + 0.05
            });
        }
    }

    function drawStars() {
        ctx.save();
        ctx.globalAlpha = 1;
        ctx.fillStyle = '#fff';
        for (const s of stars) {
            ctx.globalAlpha = s.alpha;
            ctx.beginPath();
            ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
            ctx.fill();
            // 星星閃爍
            s.alpha += (Math.random() - 0.5) * 0.04;
            if (s.alpha > 1) s.alpha = 1;
            if (s.alpha < 0.3) s.alpha = 0.3;
            // 星星緩慢移動
            s.x += s.speed;
            if (s.x > canvas.width) s.x = 0;
        }
        ctx.restore();
    }

    function resizeCanvas() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        previousWavePoints = Array(Math.ceil(canvas.width * (1 + extensionFactor * 2))).fill(verticalCenter);
        createStars(); // 重新產生星星
    }

    // 多條曲線參數
    const WAVE_COUNT = 23; // 原本3，改成23條
    // 每條曲線的顏色偏移
    const colorOffsets = Array.from({length: WAVE_COUNT}, (_, i) => i / WAVE_COUNT);
    // 每條曲線的透明度
    const alphaList = Array.from({length: WAVE_COUNT}, (_, i) => 0.98 - i * 0.035);
    // 每條曲線的寬度
    const widthList = Array.from({length: WAVE_COUNT}, (_, i) => 3.2 - i * 0.1 > 0.5 ? 3.2 - i * 0.1 : 0.5);

    function drawSmoothWave(points, colorOffset = 0, alpha = 1, width = 3.2) {
        if (points.length < 2) return;
        const startX = -canvas.width * extensionFactor;
        // 星雲色彩：藍紫-青-粉，根據 colorOffset 做色相偏移
        let c1 = '#6ecaff', c2 = '#b7f0ff', c3 = '#e2b6ff';
        if (serialColorValue !== null) {
            // 色相 210~320
            const h1 = 210 + (serialColorValue + colorOffset) * 60;
            const h2 = 180 + (serialColorValue + colorOffset) * 60;
            const h3 = 280 + (serialColorValue + colorOffset) * 40;
            c1 = `hsl(${h1}, 100%, 70%)`;
            c2 = `hsl(${h2}, 100%, 85%)`;
            c3 = `hsl(${h3}, 100%, 80%)`;
        }
        const gradient = ctx.createLinearGradient(0, 0, canvas.width, 0);
        gradient.addColorStop(0, c1);
        gradient.addColorStop(0.5, c2);
        gradient.addColorStop(1, c3);
        ctx.save();
        ctx.beginPath();
        ctx.moveTo(startX, points[0]);
        for (let i = 1; i < points.length; i++) {
            const x = startX + i;
            ctx.lineTo(x, points[i]);
        }
        ctx.strokeStyle = gradient;
        ctx.lineWidth = width;
        ctx.shadowColor = 'rgba(180,180,255,0.25)';
        ctx.shadowBlur = 16;
        ctx.globalAlpha = alpha;
        ctx.stroke();
        ctx.restore();
    }
    
    // 自然平滑波形函數 - 加入水平偏移
    function generateWavePoint(x, time, offset) {
        // 添加水平偏移，實現右至左移動
        const adjustedX = x + offset;
        
        // 主波
        let value = Math.sin(adjustedX * waveParams.frequency + time * waveParams.speed + waveParams.phase) * baseAmplitude;
        
        // 添加子波，創造更自然的波形
        for (const wave of subWaves) {
            value += Math.sin(adjustedX * wave.frequency + time * wave.speed + wave.phase) * wave.amplitude;
        }
        
        return value;
    }

    function drawWave() {
        // 增加時間
        time += 0.01;
        
        // 增加水平偏移量，實現從右到左的移動
        horizontalOffset += waveParams.horizontalSpeed;
        
        // 計算垂直位置的緩慢自然變化 - 使用新的飄浮參數
        const verticalShift = Math.sin(time * waveParams.floatSpeed) * waveParams.floatAmplitude;

        ctx.clearRect(0, 0, canvas.width, canvas.height);
        // 星空背景
        ctx.save();
        // 背景顏色隨電阻值變化
        let t_bg = serialColorValue !== null ? serialColorValue : (Math.sin(time * 0.1) + 1) / 2;
        const bgGradient1 = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient1.addColorStop(0, `hsl(${180 + t_bg * 120}, 80%, 30%)`);
        bgGradient1.addColorStop(1, `hsl(${260 + t_bg * 80}, 80%, 10%)`);
        ctx.globalAlpha = 1;
        ctx.fillStyle = bgGradient1;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();
        drawStars();
        
        // 動態背景：根據 serialColorValue 改變顏色
        let t = (Math.sin(time * 0.1) + 1) / 2;
        if (serialColorValue !== null) t = serialColorValue;
        const bgGradient = ctx.createLinearGradient(0, 0, 0, canvas.height);
        bgGradient.addColorStop(0, `hsl(${200 + t * 80}, 80%, 60%)`);
        bgGradient.addColorStop(1, `hsl(${320 - t * 80}, 80%, 85%)`);
        ctx.save();
        ctx.globalAlpha = 0.7;
        ctx.fillStyle = bgGradient;
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.restore();

        // 創建多條曲線的波形點
        const totalWidth = Math.ceil(canvas.width * (1 + extensionFactor * 2));
        const allWavePoints = [];
        for (let w = 0; w < WAVE_COUNT; w++) {
            const currentWavePoints = [];
            // 每條曲線的振幅、相位有微小差異，並隨可變電阻變化
            let amplitude = baseAmplitude * (1 + w * 0.08);
            if (serialAmplitude !== null) amplitude = serialAmplitude * (1 + w * 0.08 + serialColorValue * 0.18 * w);
            let speed = waveParams.speed;
            if (window._serialSpeed !== undefined) speed = window._serialSpeed * (1 + w * 0.04);
            let phaseOffset = w * Math.PI / 16 + (serialColorValue || 0) * Math.PI * w;
            for (let i = 0; i < totalWidth; i++) {
                const x = i;
                let waveValue = Math.sin((x + horizontalOffset) * waveParams.frequency + time * speed + waveParams.phase + phaseOffset) * amplitude;
                for (const wave of subWaves) {
                    waveValue += Math.sin((x + horizontalOffset) * wave.frequency + time * wave.speed + wave.phase + phaseOffset) * wave.amplitude;
                }
                let y = verticalCenter + waveValue + verticalShift;
                if (previousWavePoints[i]) {
                    y = previousWavePoints[i] * 0.85 + y * 0.15;
                }
                currentWavePoints[i] = y;
            }
            allWavePoints.push(currentWavePoints);
        }
        // 繪製多條曲線，主線在最上層
        for (let w = WAVE_COUNT - 1; w >= 0; w--) {
            drawSmoothWave(allWavePoints[w], colorOffsets[w], alphaList[w], widthList[w]);
        }
        previousWavePoints = [...allWavePoints[0]];
        
        // 使用 requestAnimationFrame 以獲得更流暢的動畫
        requestAnimationFrame(drawWave);
    }

    window.addEventListener('resize', function() {
        resizeCanvas();
    });
    
    resizeCanvas();
    // 新增按鈕
    createSerialButton();
    // 開始動畫循環
    requestAnimationFrame(drawWave);
});

// 新增 Web Serial 連接功能
let serialAmplitude = null;
let serialColorValue = null; // 新增：用於顏色控制
let lastSerialValue = null; // 新增：記錄上次的原始值

function createSerialButton() {
    const btn = document.createElement('button');
    btn.textContent = '連接 Arduino 可變電阻';
    btn.style.position = 'fixed';
    btn.style.top = '20px';
    btn.style.left = '20px';
    btn.style.zIndex = 10;
    btn.onclick = async () => {
        if (!('serial' in navigator)) {
            alert('此瀏覽器不支援 Web Serial API，請用 Chrome!');
            return;
        }
        try {
            const port = await navigator.serial.requestPort();
            await port.open({ baudRate: 9600 });
            const reader = port.readable.getReader();
            while (true) {
                const { value, done } = await reader.read();
                if (done) break;
                if (value) {
                    const str = new TextDecoder().decode(value);
                    const match = str.match(/\d+/);
                    if (match) {
                        // 取多筆平均，減少亂跳
                        const v = parseInt(match[0]);
                        if (!window._serialBuffer) window._serialBuffer = [];
                        window._serialBuffer.push(v);
                        if (window._serialBuffer.length > 8) window._serialBuffer.shift();
                        const avg = window._serialBuffer.reduce((a, b) => a + b, 0) / window._serialBuffer.length;
                        lastSerialValue = Math.round(avg);
                        serialAmplitude = 200 + (avg / 1023) * 700;
                        serialColorValue = avg / 1023;
                        window._serialSpeed = 0.01 + (avg / 1023) * 0.14;
                    }
                }
            }
        } catch (e) {
            alert('連接失敗: ' + e);
        }
    };
    document.body.appendChild(btn);
    // 新增：顯示目前可變電阻值
    const info = document.createElement('div');
    info.id = 'serialInfo';
    info.style.position = 'fixed';
    info.style.top = '60px';
    info.style.left = '20px';
    info.style.zIndex = 10;
    info.style.color = '#fff';
    info.style.fontSize = '1.2em';
    info.style.textShadow = '0 0 8px #000, 0 0 2px #fff';
    document.body.appendChild(info);
    setInterval(() => {
        if (lastSerialValue !== null) {
            info.innerHTML = `可變電阻值: <b>${lastSerialValue}</b><br>振幅: <b>${serialAmplitude && serialAmplitude.toFixed(1)}</b><br>速度: <b>${window._serialSpeed && window._serialSpeed.toFixed(3)}</b>`;
        } else {
            info.innerHTML = '可變電阻未連接';
        }
    }, 100);
}