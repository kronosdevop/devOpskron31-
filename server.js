
const express = require('express');
const app = express();
const port = 3000;

app.get('/', (req, res) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>DevOps Pipeline - Live Demo</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: #333;
            min-height: 100vh;
            overflow-x: hidden;
        }

        .container {
            max-width: 1400px;
            margin: 0 auto;
            padding: 40px 20px;
        }

        header {
            text-align: center;
            color: white;
            margin-bottom: 60px;
            animation: fadeInDown 1s ease-out;
        }

        h1 {
            font-size: 3.5rem;
            font-weight: 700;
            margin-bottom: 15px;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.2);
        }

        .version-badge {
            display: inline-block;
            background: rgba(255,255,255,0.2);
            padding: 8px 20px;
            border-radius: 25px;
            font-size: 1.1rem;
            margin-top: 10px;
            backdrop-filter: blur(10px);
            border: 1px solid rgba(255,255,255,0.3);
        }

        .subtitle {
            font-size: 1.3rem;
            margin-top: 20px;
            opacity: 0.95;
        }

        .pipeline-flow {
            background: white;
            border-radius: 20px;
            padding: 40px;
            box-shadow: 0 20px 60px rgba(0,0,0,0.3);
            margin-bottom: 40px;
            animation: fadeInUp 1s ease-out 0.3s both;
        }

        .pipeline-title {
            font-size: 2rem;
            color: #667eea;
            margin-bottom: 30px;
            text-align: center;
            font-weight: 600;
        }

        .stages {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-bottom: 40px;
        }

        .stage {
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            padding: 30px 20px;
            border-radius: 15px;
            text-align: center;
            position: relative;
            overflow: hidden;
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            cursor: pointer;
        }

        .stage:hover {
            transform: translateY(-5px);
            box-shadow: 0 15px 35px rgba(102, 126, 234, 0.4);
        }

        .stage::before {
            content: '';
            position: absolute;
            top: -50%;
            left: -50%;
            width: 200%;
            height: 200%;
            background: radial-gradient(circle, rgba(255,255,255,0.1) 0%, transparent 70%);
            animation: pulse 3s ease-in-out infinite;
        }

        .stage-icon {
            font-size: 3rem;
            margin-bottom: 15px;
            display: block;
        }

        .stage-name {
            font-size: 1.2rem;
            font-weight: 600;
            margin-bottom: 8px;
        }

        .stage-description {
            font-size: 0.9rem;
            opacity: 0.9;
        }

        .tech-stack {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 25px;
            margin-bottom: 40px;
        }

        .tech-card {
            background: white;
            border-radius: 15px;
            padding: 30px;
            box-shadow: 0 10px 30px rgba(0,0,0,0.1);
            transition: transform 0.3s ease, box-shadow 0.3s ease;
            animation: fadeInUp 1s ease-out 0.5s both;
        }

        .tech-card:hover {
            transform: translateY(-8px);
            box-shadow: 0 15px 40px rgba(0,0,0,0.15);
        }

        .tech-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            margin-bottom: 20px;
        }

        .tech-name {
            font-size: 1.5rem;
            font-weight: 600;
            color: #667eea;
            margin-bottom: 10px;
        }

        .tech-description {
            color: #666;
            line-height: 1.6;
        }

        .metrics {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 20px;
            margin-top: 40px;
        }

        .metric-card {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            color: white;
            padding: 25px;
            border-radius: 15px;
            text-align: center;
            animation: fadeInUp 1s ease-out 0.7s both;
        }

        .metric-value {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 5px;
        }

        .metric-label {
            font-size: 1rem;
            opacity: 0.9;
        }

        .status-indicator {
            position: fixed;
            top: 20px;
            right: 20px;
            background: #10b981;
            color: white;
            padding: 12px 25px;
            border-radius: 25px;
            font-weight: 600;
            box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4);
            animation: fadeIn 1s ease-out, pulse-glow 2s ease-in-out infinite;
        }

        .status-dot {
            width: 10px;
            height: 10px;
            background: white;
            border-radius: 50%;
            display: inline-block;
            margin-right: 8px;
            animation: blink 1.5s ease-in-out infinite;
        }

        footer {
            text-align: center;
            color: white;
            margin-top: 60px;
            padding: 30px;
            opacity: 0.9;
        }

        @keyframes fadeInDown {
            from {
                opacity: 0;
                transform: translateY(-30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fadeInUp {
            from {
                opacity: 0;
                transform: translateY(30px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
        }

        @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
        }

        @keyframes pulse {
            0%, 100% { opacity: 0.5; }
            50% { opacity: 1; }
        }

        @keyframes pulse-glow {
            0%, 100% { box-shadow: 0 5px 15px rgba(16, 185, 129, 0.4); }
            50% { box-shadow: 0 5px 25px rgba(16, 185, 129, 0.6); }
        }

        @keyframes blink {
            0%, 100% { opacity: 1; }
            50% { opacity: 0.3; }
        }

        @media (max-width: 768px) {
            h1 { font-size: 2.5rem; }
            .stages { grid-template-columns: 1fr; }
            .status-indicator { position: static; margin: 20px auto; display: table; }
        }
    </style>
</head>
<body>
    <div class="status-indicator">
        <span class="status-dot"></span>
        System Online
    </div>

    <div class="container">
        <header>
            <h1>🚀 DevOps Pipeline Demo</h1>
            <div class="version-badge">Version 2.0.0</div>
            <p class="subtitle">Automated CI/CD Pipeline with Jenkins, Nexus & Kubernetes</p>
        </header>

        <div class="pipeline-flow">
            <h2 class="pipeline-title">Pipeline Stages</h2>
            <div class="stages">
                <div class="stage">
                    <span class="stage-icon">💻</span>
                    <div class="stage-name">Code</div>
                    <div class="stage-description">Git repository with version control</div>
                </div>
                <div class="stage">
                    <span class="stage-icon">🔨</span>
                    <div class="stage-name">Build</div>
                    <div class="stage-description">Maven/Gradle compilation</div>
                </div>
                <div class="stage">
                    <span class="stage-icon">✅</span>
                    <div class="stage-name">Test</div>
                    <div class="stage-description">Unit & integration tests</div>
                </div>
                <div class="stage">
                    <span class="stage-icon">📦</span>
                    <div class="stage-name">Package</div>
                    <div class="stage-description">Docker image creation</div>
                </div>
                <div class="stage">
                    <span class="stage-icon">📤</span>
                    <div class="stage-name">Deploy</div>
                    <div class="stage-description">Kubernetes cluster deployment</div>
                </div>
            </div>
        </div>

        <div class="tech-stack">
            <div class="tech-card">
                <div class="tech-icon">🔧</div>
                <h3 class="tech-name">Jenkins</h3>
                <p class="tech-description">Automation server orchestrating the entire CI/CD pipeline with declarative pipelines and webhooks for continuous integration.</p>
            </div>
            <div class="tech-card">
                <div class="tech-icon">📚</div>
                <h3 class="tech-name">Nexus Repository</h3>
                <p class="tech-description">Artifact repository manager storing built artifacts, Docker images, and managing dependencies efficiently.</p>
            </div>
            <div class="tech-card">
                <div class="tech-icon">☸️</div>
                <h3 class="tech-name">Kubernetes</h3>
                <p class="tech-description">Container orchestration platform managing deployments, scaling, and ensuring high availability of applications.</p>
            </div>
            <div class="tech-card">
                <div class="tech-icon">🐳</div>
                <h3 class="tech-name">Docker</h3>
                <p class="tech-description">Containerization technology ensuring consistent environments from development to production deployment.</p>
            </div>
            <div class="tech-card">
                <div class="tech-icon">🔍</div>
                <h3 class="tech-name">SonarQube</h3>
                <p class="tech-description">Code quality and security scanner performing static analysis to maintain high code standards.</p>
            </div>
            <div class="tech-card">
                <div class="tech-icon">📊</div>
                <h3 class="tech-name">Prometheus & Grafana</h3>
                <p class="tech-description">Monitoring and alerting stack providing real-time insights into application and infrastructure metrics.</p>
            </div>
        </div>

        <div class="metrics">
            <div class="metric-card" style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);">
                <div class="metric-value">99.9%</div>
                <div class="metric-label">Uptime</div>
            </div>
            <div class="metric-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);">
                <div class="metric-value">< 10min</div>
                <div class="metric-label">Deploy Time</div>
            </div>
            <div class="metric-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);">
                <div class="metric-value">500+</div>
                <div class="metric-label">Deployments/Month</div>
            </div>
            <div class="metric-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);">
                <div class="metric-value">95%</div>
                <div class="metric-label">Test Coverage</div>
            </div>
        </div>

        <footer>
            <p>Built with ❤️ using modern DevOps practices</p>
            <p style="margin-top: 10px; font-size: 0.9rem;">Jenkins • Nexus • Kubernetes • Docker • Git • Maven</p>
            <p style="margin-top: 15px; font-size: 0.85rem; opacity: 0.8;">© 2026 DevOps Pipeline Project</p>
        </footer>
    </div>

    <script>
        // Add interactive click events to stages
        document.querySelectorAll('.stage').forEach((stage, index) => {
            stage.addEventListener('click', () => {
                stage.style.animation = 'none';
                setTimeout(() => {
                    stage.style.animation = '';
                }, 10);
            });
        });

        // Update timestamp
        const now = new Date();
        const timestamp = now.toLocaleString();
        console.log('Pipeline Demo loaded at:', timestamp);
    </script>
</body>
</html>
  `);
});

app.listen(port, () => {
  console.log(`App running on http://localhost:${port}`);
});
