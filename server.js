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
    <title>DevOps Pipeline - Interactive Demo</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }

        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background: linear-gradient(135deg, #DC143C 0%, #008080 100%);
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
            color: #DC143C;
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
            background: linear-gradient(135deg, #008080  0%, #DC143C 100%);
            color: white;
            padding: 30px 20px;
            border-radius: 15px;
            text-align: center;
            position: relative;
            overflow: hidden;
            transition: all 0.4s ease;
            cursor: pointer;
            border: 3px solid transparent;
        }

        .stage:hover {
            transform: translateY(-8px) scale(1.05);
            box-shadow: 0 20px 40px rgba(102, 126, 234, 0.5);
            border-color: rgba(255,255,255,0.5);
        }

        .stage.active {
            background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);
            transform: translateY(-8px) scale(1.05);
            box-shadow: 0 20px 40px rgba(245, 87, 108, 0.6);
            border-color: white;
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
            transition: transform 0.3s ease;
        }

        .stage:hover .stage-icon {
            transform: scale(1.2) rotate(5deg);
        }

        .stage.active .stage-icon {
            animation: bounce 0.6s ease;
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

        /* Explanation Modal */
        .explanation-modal {
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: none;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            animation: fadeIn 0.3s ease;
        }

        .explanation-modal.active {
            display: flex;
        }

        .modal-content {
            background: white;
            border-radius: 20px;
            padding: 40px;
            max-width: 700px;
            width: 90%;
            max-height: 80vh;
            overflow-y: auto;
            position: relative;
            animation: slideUp 0.4s ease;
            box-shadow: 0 30px 60px rgba(0,0,0,0.5);
        }

        .modal-header {
            display: flex;
            align-items: center;
            margin-bottom: 25px;
            padding-bottom: 20px;
            border-bottom: 2px solid #f0f0f0;
        }

        .modal-icon {
            font-size: 4rem;
            margin-right: 20px;
        }

        .modal-title {
            font-size: 2rem;
            color: #DC143C;
            font-weight: 700;
        }

        .close-btn {
            position: absolute;
            top: 20px;
            right: 20px;
            background: #f5576c;
            color: white;
            border: none;
            width: 40px;
            height: 40px;
            border-radius: 50%;
            font-size: 1.5rem;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
        }

        .close-btn:hover {
            background: #d94458;
            transform: rotate(90deg);
        }

        .modal-section {
            margin-bottom: 25px;
        }

        .modal-section h3 {
            color: #008080;
            font-size: 1.3rem;
            margin-bottom: 10px;
            display: flex;
            align-items: center;
        }

        .modal-section h3::before {
            content: '▶';
            margin-right: 10px;
            color: #DC143C;
        }

        .modal-section p, .modal-section ul {
            color: #555;
            line-height: 1.8;
            font-size: 1rem;
        }

        .modal-section ul {
            list-style: none;
            padding-left: 0;
        }

        .modal-section li {
            padding: 8px 0;
            padding-left: 25px;
            position: relative;
        }

        .modal-section li::before {
            content: '✓';
            position: absolute;
            left: 0;
            color: #10b981;
            font-weight: bold;
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
            transition: all 0.4s ease;
            animation: fadeInUp 1s ease-out 0.5s both;
            cursor: pointer;
            border: 3px solid transparent;
        }

        .tech-card:hover {
            transform: translateY(-10px);
            box-shadow: 0 20px 50px rgba(0,0,0,0.2);
            border-color: #DC143C;
        }

        .tech-card.active {
            background: linear-gradient(135deg, #DC143C 0%, #008080 100%);
            color: white;
            transform: translateY(-10px) scale(1.05);
        }

        .tech-card.active .tech-name,
        .tech-card.active .tech-description {
            color: white;
        }

        .tech-icon {
            width: 60px;
            height: 60px;
            background: linear-gradient(135deg, #DC143C 0%, #008080 100%);
            border-radius: 12px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 2rem;
            margin-bottom: 20px;
            transition: transform 0.3s ease;
        }

        .tech-card:hover .tech-icon {
            transform: rotate(360deg) scale(1.1);
        }

        .tech-card.active .tech-icon {
            background: white;
        }

        .tech-name {
            font-size: 1.5rem;
            font-weight: 600;
            color: #DC143C;
            margin-bottom: 10px;
            transition: color 0.3s ease;
        }

        .tech-description {
            color: #666;
            line-height: 1.6;
            transition: color 0.3s ease;
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
            cursor: pointer;
            transition: all 0.4s ease;
            border: 3px solid transparent;
        }

        .metric-card:hover {
            transform: scale(1.1) rotate(-2deg);
            box-shadow: 0 15px 40px rgba(0,0,0,0.3);
            border-color: white;
        }

        .metric-value {
            font-size: 2.5rem;
            font-weight: 700;
            margin-bottom: 5px;
            transition: transform 0.3s ease;
        }

        .metric-card:hover .metric-value {
            transform: scale(1.2);
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
            cursor: pointer;
            transition: all 0.3s ease;
        }

        .status-indicator:hover {
            background: #059669;
            transform: scale(1.05);
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

        .info-tooltip {
            position: fixed;
            background: rgba(0,0,0,0.9);
            color: white;
            padding: 15px 20px;
            border-radius: 10px;
            font-size: 0.9rem;
            max-width: 300px;
            pointer-events: none;
            opacity: 0;
            transition: opacity 0.3s ease;
            z-index: 999;
            box-shadow: 0 5px 20px rgba(0,0,0,0.5);
        }

        .info-tooltip.show {
            opacity: 1;
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

        @keyframes slideUp {
            from {
                opacity: 0;
                transform: translateY(50px);
            }
            to {
                opacity: 1;
                transform: translateY(0);
            }
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

        @keyframes bounce {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.3); }
        }

        @media (max-width: 768px) {
            h1 { font-size: 2.5rem; }
            .stages { grid-template-columns: 1fr; }
            .status-indicator { position: static; margin: 20px auto; display: table; }
            .modal-content { padding: 30px 20px; }
        }
    </style>
</head>
<body>
    <div class="status-indicator" onclick="showSystemStatus()">
        <span class="status-dot"></span>
        System Online
    </div>

    <div class="info-tooltip" id="tooltip"></div>

    <div class="explanation-modal" id="explanationModal">
        <div class="modal-content" id="modalContent">
            <button class="close-btn" onclick="closeModal()">×</button>
            <div id="modalBody"></div>
        </div>
    </div>

    <div class="container">
        <header>
            <h1>🚀 DevOps Pipeline Demo</h1>
            <div class="version-badge">Version 2.0.0 - Interactive</div>
            <p class="subtitle">Click on any stage or technology to learn more!</p>
        </header>

        <div class="pipeline-flow">
            <h2 class="pipeline-title">Pipeline Stages - Click to Explore</h2>
            <div class="stages">
                <div class="stage" onclick="showStageDetails('code')" data-tooltip="Click to learn about the Code stage">
                    <span class="stage-icon">💻</span>
                    <div class="stage-name">Code</div>
                    <div class="stage-description">Git repository with version control</div>
                </div>
                <div class="stage" onclick="showStageDetails('build')" data-tooltip="Click to learn about the Build stage">
                    <span class="stage-icon">🔨</span>
                    <div class="stage-name">Build</div>
                    <div class="stage-description">Maven/Gradle compilation</div>
                </div>
                <div class="stage" onclick="showStageDetails('test')" data-tooltip="Click to learn about the Test stage">
                    <span class="stage-icon">✅</span>
                    <div class="stage-name">Test</div>
                    <div class="stage-description">Unit & integration tests</div>
                </div>
                <div class="stage" onclick="showStageDetails('package')" data-tooltip="Click to learn about the Package stage">
                    <span class="stage-icon">📦</span>
                    <div class="stage-name">Package</div>
                    <div class="stage-description">Docker image creation</div>
                </div>
                <div class="stage" onclick="showStageDetails('deploy')" data-tooltip="Click to learn about the Deploy stage">
                    <span class="stage-icon">📤</span>
                    <div class="stage-name">Deploy</div>
                    <div class="stage-description">Kubernetes cluster deployment</div>
                </div>
            </div>
        </div>

        <div class="tech-stack">
            <div class="tech-card" onclick="showTechDetails('jenkins')" data-tooltip="Click to explore Jenkins automation">
                <div class="tech-icon">🔧</div>
                <h3 class="tech-name">Jenkins</h3>
                <p class="tech-description">Automation server orchestrating the entire CI/CD pipeline with declarative pipelines and webhooks.</p>
            </div>
            <div class="tech-card" onclick="showTechDetails('nexus')" data-tooltip="Click to explore Nexus Repository">
                <div class="tech-icon">📚</div>
                <h3 class="tech-name">Nexus Repository</h3>
                <p class="tech-description">Artifact repository manager storing built artifacts, Docker images, and dependencies.</p>
            </div>
            <div class="tech-card" onclick="showTechDetails('kubernetes')" data-tooltip="Click to explore Kubernetes orchestration">
                <div class="tech-icon">☸️</div>
                <h3 class="tech-name">Kubernetes</h3>
                <p class="tech-description">Container orchestration platform managing deployments, scaling, and high availability.</p>
            </div>
            <div class="tech-card" onclick="showTechDetails('docker')" data-tooltip="Click to explore Docker containers">
                <div class="tech-icon">🐳</div>
                <h3 class="tech-name">Docker</h3>
                <p class="tech-description">Containerization technology ensuring consistent environments from dev to production.</p>
            </div>
            <div class="tech-card" onclick="showTechDetails('sonarqube')" data-tooltip="Click to explore SonarQube analysis">
                <div class="tech-icon">🔍</div>
                <h3 class="tech-name">SonarQube</h3>
                <p class="tech-description">Code quality and security scanner performing static analysis for high standards.</p>
            </div>
            <div class="tech-card" onclick="showTechDetails('monitoring')" data-tooltip="Click to explore Monitoring stack">
                <div class="tech-icon">📊</div>
                <h3 class="tech-name">Prometheus & Grafana</h3>
                <p class="tech-description">Monitoring and alerting stack providing real-time application insights.</p>
            </div>
        </div>

        <div class="metrics">
            <div class="metric-card" style="background: linear-gradient(135deg, #DC143C 0%, #008080 100%);" data-tooltip="Our system maintains 99.9% uptime">
                <div class="metric-value">99.9%</div>
                <div class="metric-label">Uptime</div>
            </div>
            <div class="metric-card" style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%);" data-tooltip="Average deployment time is under 10 minutes">
                <div class="metric-value">< 10min</div>
                <div class="metric-label">Deploy Time</div>
            </div>
            <div class="metric-card" style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);" data-tooltip="We deploy over 500 times per month">
                <div class="metric-value">500+</div>
                <div class="metric-label">Deployments/Month</div>
            </div>
            <div class="metric-card" style="background: linear-gradient(135deg, #43e97b 0%, #38f9d7 100%);" data-tooltip="Maintaining 95% test coverage across all projects">
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
        // Stage Details Data
        const stageDetails = {
            code: {
                icon: '💻',
                title: 'Code Stage',
                sections: [
                    {
                        heading: 'What Happens Here',
                        content: 'Developers write code and commit changes to a Git repository. Version control ensures all changes are tracked, allowing easy rollback and collaboration among team members.'
                    },
                    {
                        heading: 'Key Activities',
                        list: [
                            'Developers commit code to Git branches',
                            'Pull requests are created for code review',
                            'Code reviews ensure quality and best practices',
                            'Merge to main branch triggers CI/CD pipeline',
                            'Webhooks notify Jenkins of new commits'
                        ]
                    },
                    {
                        heading: 'Tools Used',
                        content: 'Git, GitHub/GitLab/Bitbucket, Git hooks, Branch protection rules'
                    },
                    {
                        heading: 'Best Practices',
                        list: [
                            'Use meaningful commit messages',
                            'Create feature branches for new work',
                            'Regular code reviews before merging',
                            'Keep commits small and focused',
                            'Use .gitignore to exclude unnecessary files'
                        ]
                    }
                ]
            },
            build: {
                icon: '🔨',
                title: 'Build Stage',
                sections: [
                    {
                        heading: 'What Happens Here',
                        content: 'Source code is compiled and dependencies are resolved. Build tools like Maven or Gradle download required libraries and package the application into executable artifacts.'
                    },
                    {
                        heading: 'Key Activities',
                        list: [
                            'Compile source code into bytecode/binaries',
                            'Download and resolve dependencies',
                            'Run static code analysis',
                            'Generate build artifacts (JAR, WAR, etc.)',
                            'Create build reports and logs'
                        ]
                    },
                    {
                        heading: 'Tools Used',
                        content: 'Maven, Gradle, npm, webpack, Jenkins build agents'
                    },
                    {
                        heading: 'Success Criteria',
                        list: [
                            'Zero compilation errors',
                            'All dependencies successfully resolved',
                            'Build completes within acceptable time',
                            'Artifacts are properly generated',
                            'Build logs are clear and informative'
                        ]
                    }
                ]
            },
            test: {
                icon: '✅',
                title: 'Test Stage',
                sections: [
                    {
                        heading: 'What Happens Here',
                        content: 'Automated tests verify code functionality, performance, and security. Multiple test levels ensure the application works correctly before deployment.'
                    },
                    {
                        heading: 'Test Types',
                        list: [
                            'Unit Tests - Test individual components',
                            'Integration Tests - Test component interactions',
                            'End-to-End Tests - Test complete user workflows',
                            'Security Tests - Scan for vulnerabilities',
                            'Performance Tests - Verify speed and scalability'
                        ]
                    },
                    {
                        heading: 'Tools Used',
                        content: 'JUnit, Selenium, Jest, SonarQube, OWASP ZAP, JMeter'
                    },
                    {
                        heading: 'Quality Gates',
                        list: [
                            'Minimum 80% code coverage',
                            'Zero critical security vulnerabilities',
                            'All tests must pass',
                            'Performance benchmarks met',
                            'Code quality score above threshold'
                        ]
                    }
                ]
            },
            package: {
                icon: '📦',
                title: 'Package Stage',
                sections: [
                    {
                        heading: 'What Happens Here',
                        content: 'Application and dependencies are packaged into Docker containers. This ensures consistent execution across different environments - from development to production.'
                    },
                    {
                        heading: 'Key Activities',
                        list: [
                            'Create Dockerfile with application setup',
                            'Build Docker image with all dependencies',
                            'Tag image with version numbers',
                            'Push image to Nexus/Docker registry',
                            'Scan image for vulnerabilities'
                        ]
                    },
                    {
                        heading: 'Tools Used',
                        content: 'Docker, Docker Compose, Nexus Repository, Trivy (image scanning)'
                    },
                    {
                        heading: 'Best Practices',
                        list: [
                            'Use multi-stage builds to reduce image size',
                            'Include only necessary dependencies',
                            'Use semantic versioning for tags',
                            'Scan images for security issues',
                            'Keep base images updated'
                        ]
                    }
                ]
            },
            deploy: {
                icon: '📤',
                title: 'Deploy Stage',
                sections: [
                    {
                        heading: 'What Happens Here',
                        content: 'Docker containers are deployed to Kubernetes cluster. Kubernetes manages the application lifecycle, scaling, and ensures high availability automatically.'
                    },
                    {
                        heading: 'Deployment Process',
                        list: [
                            'Pull Docker image from registry',
                            'Create/update Kubernetes deployments',
                            'Configure services and load balancers',
                            'Set up health checks and monitoring',
                            'Perform rolling updates with zero downtime'
                        ]
                    },
                    {
                        heading: 'Tools Used',
                        content: 'Kubernetes, kubectl, Helm charts, Jenkins Kubernetes plugin'
                    },
                    {
                        heading: 'Deployment Strategies',
                        list: [
                            'Rolling Update - Gradual pod replacement',
                            'Blue-Green - Switch between two environments',
                            'Canary - Test with small user subset first',
                            'Automatic rollback on failures',
                            'Health checks before marking ready'
                        ]
                    }
                ]
            }
        };

        // Technology Details Data
        const techDetails = {
            jenkins: {
                icon: '🔧',
                title: 'Jenkins - CI/CD Automation',
                sections: [
                    {
                        heading: 'Overview',
                        content: 'Jenkins is an open-source automation server that orchestrates the entire CI/CD pipeline. It monitors version control systems and automatically triggers builds, tests, and deployments.'
                    },
                    {
                        heading: 'Key Features',
                        list: [
                            'Pipeline as Code - Define builds using Jenkinsfile',
                            'Extensive plugin ecosystem (1800+ plugins)',
                            'Distributed builds across multiple agents',
                            'Integration with all major DevOps tools',
                            'Real-time build monitoring and notifications'
                        ]
                    },
                    {
                        heading: 'In Our Pipeline',
                        content: 'Jenkins monitors Git repositories, triggers builds on commits, runs tests, builds Docker images, and deploys to Kubernetes. It provides a central dashboard for all CI/CD activities.'
                    },
                    {
                        heading: 'Benefits',
                        list: [
                            'Automates repetitive tasks',
                            'Reduces manual errors',
                            'Provides fast feedback to developers',
                            'Enables continuous delivery',
                            'Scales to handle multiple projects'
                        ]
                    }
                ]
            },
            nexus: {
                icon: '📚',
                title: 'Nexus Repository Manager',
                sections: [
                    {
                        heading: 'Overview',
                        content: 'Nexus is a repository manager that stores and manages build artifacts, Docker images, and dependencies. It acts as a central hub for all binary components in the software development lifecycle.'
                    },
                    {
                        heading: 'What It Stores',
                        list: [
                            'Maven/Gradle artifacts (JAR, WAR files)',
                            'Docker container images',
                            'npm packages for Node.js',
                            'Python packages (PyPI)',
                            'Third-party dependencies and libraries'
                        ]
                    },
                    {
                        heading: 'Key Benefits',
                        list: [
                            'Faster builds with caching',
                            'Version control for artifacts',
                            'Security scanning of components',
                            'Bandwidth optimization',
                            'Centralized dependency management'
                        ]
                    },
                    {
                        heading: 'In Our Pipeline',
                        content: 'After Jenkins builds the application, it pushes Docker images to Nexus. Kubernetes pulls these images during deployment. This ensures consistent, versioned artifacts across all environments.'
                    }
                ]
            },
            kubernetes: {
                icon: '☸️',
                title: 'Kubernetes - Container Orchestration',
                sections: [
                    {
                        heading: 'Overview',
                        content: 'Kubernetes (K8s) is a container orchestration platform that automates deployment, scaling, and management of containerized applications. It ensures applications run reliably at scale.'
                    },
                    {
                        heading: 'Core Concepts',
                        list: [
                            'Pods - Smallest deployable units',
                            'Deployments - Manage pod replicas',
                            'Services - Network access to pods',
                            'ConfigMaps/Secrets - Configuration management',
                            'Ingress - External access routing'
                        ]
                    },
                    {
                        heading: 'Automatic Features',
                        list: [
                            'Self-healing - Restarts failed containers',
                            'Auto-scaling - Scales based on load',
                            'Load balancing - Distributes traffic',
                            'Rolling updates - Zero-downtime deployments',
                            'Resource optimization - Efficient scheduling'
                        ]
                    },
                    {
                        heading: 'Why We Use It',
                        content: 'Kubernetes provides high availability, automatic scaling, and efficient resource utilization. It manages our application lifecycle and ensures consistent behavior across development, staging, and production.'
                    }
                ]
            },
            docker: {
                icon: '🐳',
                title: 'Docker - Containerization Platform',
                sections: [
                    {
                        heading: 'Overview',
                        content: 'Docker packages applications and their dependencies into standardized containers. This ensures the application runs identically everywhere - from a developer laptop to production servers.'
                    },
                    {
                        heading: 'Key Concepts',
                        list: [
                            'Images - Read-only templates with application code',
                            'Containers - Running instances of images',
                            'Dockerfile - Instructions to build images',
                            'Layers - Images built in reusable layers',
                            'Registry - Storage for container images'
                        ]
                    },
                    {
                        heading: 'Advantages',
                        list: [
                            'Consistency across environments',
                            'Isolation between applications',
                            'Fast startup and deployment',
                            'Efficient resource utilization',
                            'Easy version management'
                        ]
                    },
                    {
                        heading: 'In Our Workflow',
                        content: 'We create Dockerfiles that define application setup. Jenkins builds Docker images during CI/CD. Nexus stores these images. Kubernetes runs them in production. This creates a seamless, automated pipeline.'
                    }
                ]
            },
            sonarqube: {
                icon: '🔍',
                title: 'SonarQube - Code Quality Platform',
                sections: [
                    {
                        heading: 'Overview',
                        content: 'SonarQube performs continuous code quality inspection. It analyzes source code to detect bugs, security vulnerabilities, code smells, and ensures coding standards are met.'
                    },
                    {
                        heading: 'What It Analyzes',
                        list: [
                            'Code bugs and potential errors',
                            'Security vulnerabilities (OWASP Top 10)',
                            'Code smells and maintainability issues',
                            'Code duplication',
                            'Test coverage percentages'
                        ]
                    },
                    {
                        heading: 'Quality Gates',
                        list: [
                            'Minimum code coverage threshold',
                            'Maximum number of bugs allowed',
                            'Security vulnerability limits',
                            'Code duplication percentage',
                            'Technical debt ratio'
                        ]
                    },
                    {
                        heading: 'Integration',
                        content: 'SonarQube integrates with Jenkins to scan code during builds. If quality gates fail, the pipeline stops, preventing poor-quality code from reaching production. Developers get immediate feedback.'
                    }
                ]
            },
            monitoring: {
                icon: '📊',
                title: 'Prometheus & Grafana - Monitoring Stack',
                sections: [
                    {
                        heading: 'Prometheus - Metrics Collection',
                        content: 'Prometheus collects time-series metrics from applications and infrastructure. It scrapes endpoints, stores data efficiently, and provides powerful querying capabilities.'
                    },
                    {
                        heading: 'What We Monitor',
                        list: [
                            'Application metrics (response time, errors)',
                            'System metrics (CPU, memory, disk)',
                            'Kubernetes cluster health',
                            'Container resource usage',
                            'Custom business metrics'
                        ]
                    },
                    {
                        heading: 'Grafana - Visualization',
                        content: 'Grafana creates beautiful dashboards from Prometheus data. It provides real-time visibility into system health, performance trends, and helps identify issues before they become critical.'
                    },
                    {
                        heading: 'Alerting',
                        list: [
                            'Automated alerts on threshold violations',
                            'Integration with Slack, PagerDuty, email',
                            'Predictive alerting using trends',
                            'Alert routing based on severity',
                            'Historical alert tracking'
                        ]
                    }
                ]
            }
        };

        // Show Stage Details
        function showStageDetails(stage) {
            const details = stageDetails[stage];
            let html = \`
                <div class="modal-header">
                    <span class="modal-icon">\${details.icon}</span>
                    <h2 class="modal-title">\${details.title}</h2>
                </div>
            \`;
            
            details.sections.forEach(section => {
                html += \`<div class="modal-section">
                    <h3>\${section.heading}</h3>
                \`;
                
                if (section.content) {
                    html += \`<p>\${section.content}</p>\`;
                }
                
                if (section.list) {
                    html += '<ul>';
                    section.list.forEach(item => {
                        html += \`<li>\${item}</li>\`;
                    });
                    html += '</ul>';
                }
                
                html += '</div>';
            });
            
            document.getElementById('modalBody').innerHTML = html;
            document.getElementById('explanationModal').classList.add('active');
            
            // Highlight the clicked stage
            document.querySelectorAll('.stage').forEach(s => s.classList.remove('active'));
            event.currentTarget.classList.add('active');
        }

        // Show Technology Details
        function showTechDetails(tech) {
            const details = techDetails[tech];
            let html = \`
                <div class="modal-header">
                    <span class="modal-icon">\${details.icon}</span>
                    <h2 class="modal-title">\${details.title}</h2>
                </div>
            \`;
            
            details.sections.forEach(section => {
                html += \`<div class="modal-section">
                    <h3>\${section.heading}</h3>
                \`;
                
                if (section.content) {
                    html += \`<p>\${section.content}</p>\`;
                }
                
                if (section.list) {
                    html += '<ul>';
                    section.list.forEach(item => {
                        html += \`<li>\${item}</li>\`;
                    });
                    html += '</ul>';
                }
                
                html += '</div>';
            });
            
            document.getElementById('modalBody').innerHTML = html;
            document.getElementById('explanationModal').classList.add('active');
            
            // Highlight the clicked tech card
            document.querySelectorAll('.tech-card').forEach(t => t.classList.remove('active'));
            event.currentTarget.classList.add('active');
        }

        // Close Modal
        function closeModal() {
            document.getElementById('explanationModal').classList.remove('active');
            document.querySelectorAll('.stage').forEach(s => s.classList.remove('active'));
            document.querySelectorAll('.tech-card').forEach(t => t.classList.remove('active'));
        }

        // Close modal when clicking outside
        document.getElementById('explanationModal').addEventListener('click', function(e) {
            if (e.target === this) {
                closeModal();
            }
        });

        // Escape key to close modal
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape') {
                closeModal();
            }
        });

        // Show System Status
        function showSystemStatus() {
            alert('🟢 System Status: All services operational\\n\\n✅ Jenkins: Running\\n✅ Nexus: Running\\n✅ Kubernetes: 2/2 nodes ready\\n✅ Docker: Running\\n✅ SonarQube: Running\\n✅ Monitoring: Active');
        }

        // Tooltip functionality
        const tooltip = document.getElementById('tooltip');
        
        document.querySelectorAll('[data-tooltip]').forEach(element => {
            element.addEventListener('mouseenter', function(e) {
                const text = this.getAttribute('data-tooltip');
                tooltip.textContent = text;
                tooltip.classList.add('show');
                updateTooltipPosition(e);
            });
            
            element.addEventListener('mousemove', updateTooltipPosition);
            
            element.addEventListener('mouseleave', function() {
                tooltip.classList.remove('show');
            });
        });

        function updateTooltipPosition(e) {
            const offset = 15;
            tooltip.style.left = e.pageX + offset + 'px';
            tooltip.style.top = e.pageY + offset + 'px';
        }

        // Log startup
        console.log('%c🚀 DevOps Pipeline Interactive Demo Loaded!', 'color: #DC143C; font-size: 16px; font-weight: bold;');
        console.log('%cClick on any stage or technology card to learn more!', 'color: #008080; font-size: 14px;');
    </script>
</body>
</html>
  `);
});

app.listen(port, () => {
  console.log('✨ Features:');
  console.log('   - Click stages to see detailed explanations');
  console.log('   - Click tech cards to learn about each technology');
  console.log('   - Hover for tooltips and color changes');
  console.log('   - Interactive animations and transitions');
});