namespace EVedhikaUBDDeploymentTool
{
    partial class MainForm
    {
        private System.ComponentModel.IContainer components = null;

        protected override void Dispose(bool disposing)
        {
            if (disposing && (components != null))
            {
                components.Dispose();
            }
            base.Dispose(disposing);
        }

        #region Windows Form Designer generated code

        private void InitializeComponent()
        {
            this.components = new System.ComponentModel.Container();
            this.tabControlMain = new System.Windows.Forms.TabControl();
            this.tabDeploy = new System.Windows.Forms.TabPage();
            this.tabRemote = new System.Windows.Forms.TabPage();
            this.lblRemoteTitle = new System.Windows.Forms.Label();
            this.lblRemoteStatus = new System.Windows.Forms.Label();
            this.lblPcNameInfo = new System.Windows.Forms.Label();
            this.btnToggleRemote = new System.Windows.Forms.Button();
            this.btnSendTelemetryManual = new System.Windows.Forms.Button();
            this.txtRemoteLog = new System.Windows.Forms.TextBox();
            this.lblStatusStep = new System.Windows.Forms.Label();
            this.progressBarDeploy = new System.Windows.Forms.ProgressBar();
            this.btnStartDeploy = new System.Windows.Forms.Button();
            
            this.tabDiagnostics = new System.Windows.Forms.TabPage();
            this.btnRunDiagnostics = new System.Windows.Forms.Button();
            this.btnActivateWindows = new System.Windows.Forms.Button();
            this.btnPCBoost = new System.Windows.Forms.Button();
            this.btnFixPrinter = new System.Windows.Forms.Button();
            this.btnDeepRepair = new System.Windows.Forms.Button();
            this.btnSyncTime = new System.Windows.Forms.Button();
            this.btnRepairEdge = new System.Windows.Forms.Button();
            this.txtDiagnosticOutput = new System.Windows.Forms.TextBox();
            this.tabDrivers = new System.Windows.Forms.TabPage();
            this.btnInstallHYP2003 = new System.Windows.Forms.Button();
            this.btnInstallProxKey = new System.Windows.Forms.Button();
            this.btnInstallMToken = new System.Windows.Forms.Button();
            this.lblDriversInfo = new System.Windows.Forms.Label();
            this.tabAiTrouble = new System.Windows.Forms.TabPage();
            this.tabLiveUpdates = new System.Windows.Forms.TabPage();
            this.lblAiStatus = new System.Windows.Forms.Label();
            this.txtAiResponse = new System.Windows.Forms.TextBox();
            this.btnAskAi = new System.Windows.Forms.Button();
            this.txtAiQuery = new System.Windows.Forms.TextBox();
            this.lblAskAi = new System.Windows.Forms.Label();
            this.tabBackup = new System.Windows.Forms.TabPage();
            this.btnBackup = new System.Windows.Forms.Button();
            this.btnUninstall = new System.Windows.Forms.Button();
            this.btnCheckUpdates = new System.Windows.Forms.Button();
            this.lblBackupInfo = new System.Windows.Forms.Label();
            this.pnlMetricsCards = new EVedhikaUBDDeploymentTool.Helpers.ModernMetricsCardPanel();
            this.panelHeader = new System.Windows.Forms.Panel();
            this.lblHeaderTitle = new System.Windows.Forms.Label();
            this.lblHeaderSubtitle = new System.Windows.Forms.Label();
            this.pbUpdateProgress = new System.Windows.Forms.ProgressBar();
            this.lblUpdateStatus = new System.Windows.Forms.Label();
            this.timerDeploy = new System.Windows.Forms.Timer(this.components);
            this.statusStrip1 = new System.Windows.Forms.StatusStrip();
            this.toolStripStatusLabel = new System.Windows.Forms.ToolStripStatusLabel();
            this.tabControlMain.SuspendLayout();
            this.tabDeploy.SuspendLayout();
            this.tabRemote.SuspendLayout();
            this.tabDiagnostics.SuspendLayout();
            this.tabDrivers.SuspendLayout();
            this.tabAiTrouble.SuspendLayout();
            this.tabBackup.SuspendLayout();
            this.panelHeader.SuspendLayout();
            this.statusStrip1.SuspendLayout();
            this.SuspendLayout();
            // 
            // tabControlMain
            // 
            this.tabControlMain.Controls.Add(this.tabDeploy);
            this.tabControlMain.Controls.Add(this.tabRemote);
            this.tabControlMain.Controls.Add(this.tabDiagnostics);
            this.tabControlMain.Controls.Add(this.tabDrivers);
            this.tabControlMain.Controls.Add(this.tabAiTrouble);
            this.tabControlMain.Controls.Add(this.tabLiveUpdates);
            this.tabControlMain.Controls.Add(this.tabBackup);
            this.tabControlMain.Font = new System.Drawing.Font("Segoe UI", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.tabControlMain.Name = "tabControlMain";
            this.tabControlMain.SelectedIndex = 0;
            this.tabControlMain.TabIndex = 0;
            // 
            // tabDeploy
            // 
            this.tabDeploy.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(11)))), ((int)(((byte)(15)))), ((int)(((byte)(25)))));
            this.tabDeploy.Controls.Add(this.pnlMetricsCards);
            this.tabDeploy.Controls.Add(this.lblStatusStep);
            this.tabDeploy.Controls.Add(this.progressBarDeploy);
            this.tabDeploy.Controls.Add(this.btnStartDeploy);
            this.tabDeploy.Location = new System.Drawing.Point(4, 26);
            this.tabDeploy.Name = "tabDeploy";
            this.tabDeploy.Padding = new System.Windows.Forms.Padding(12);
            this.tabDeploy.Size = new System.Drawing.Size(876, 444);
            this.tabDeploy.TabIndex = 0;
            this.tabDeploy.Text = "🚀 15-Step Deployment";
            this.tabDeploy.UseVisualStyleBackColor = false;
            // 
            // pnlMetricsCards
            // 
            this.pnlMetricsCards.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.pnlMetricsCards.Location = new System.Drawing.Point(18, 10);
            this.pnlMetricsCards.Name = "pnlMetricsCards";
            this.pnlMetricsCards.Size = new System.Drawing.Size(840, 110);
            this.pnlMetricsCards.TabIndex = 4;
            // 
            // btnStartDeploy
            // 
            this.btnStartDeploy.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(16)))), ((int)(((byte)(185)))), ((int)(((byte)(129)))));
            this.btnStartDeploy.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnStartDeploy.Font = new System.Drawing.Font("Segoe UI", 10.5F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.btnStartDeploy.ForeColor = System.Drawing.Color.White;
            this.btnStartDeploy.Location = new System.Drawing.Point(18, 126);
            this.btnStartDeploy.Name = "btnStartDeploy";
            this.btnStartDeploy.Size = new System.Drawing.Size(250, 38);
            this.btnStartDeploy.TabIndex = 1;
            this.btnStartDeploy.Text = "▶ Start 15-Step Deployment";
            this.btnStartDeploy.UseVisualStyleBackColor = false;
            this.btnStartDeploy.Click += new System.EventHandler(this.btnStartDeploy_Click);
            // 
            // lblStatusStep
            // 
            this.lblStatusStep.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.lblStatusStep.Font = new System.Drawing.Font("Segoe UI Semibold", 10.5F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.lblStatusStep.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(203)))), ((int)(((byte)(213)))), ((int)(((byte)(225)))));
            this.lblStatusStep.Location = new System.Drawing.Point(280, 126);
            this.lblStatusStep.Name = "lblStatusStep";
            this.lblStatusStep.Size = new System.Drawing.Size(578, 38);
            this.lblStatusStep.TabIndex = 3;
            this.lblStatusStep.Text = "Status: Ready to execute C# deployment.";
            this.lblStatusStep.TextAlign = System.Drawing.ContentAlignment.MiddleLeft;
            // 
            // progressBarDeploy
            // 
            this.progressBarDeploy.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.progressBarDeploy.Location = new System.Drawing.Point(18, 172);
            this.progressBarDeploy.Name = "progressBarDeploy";
            this.progressBarDeploy.Size = new System.Drawing.Size(840, 22);
            this.progressBarDeploy.TabIndex = 2;
            // lstDeployLogs removed
            // 
            // tabRemote
            // 
            this.tabRemote.Location = new System.Drawing.Point(4, 26);
            this.tabRemote.Name = "tabRemote";
            this.tabRemote.Padding = new System.Windows.Forms.Padding(12);
            this.tabRemote.Size = new System.Drawing.Size(876, 444);
            this.tabRemote.TabIndex = 5;
            this.tabRemote.Text = "📡 Native Remote Engine";
            this.tabRemote.UseVisualStyleBackColor = true;
            // 
            // lblRemoteTitle
            // 
            this.lblRemoteTitle.AutoSize = true;
            this.lblRemoteTitle.Font = new System.Drawing.Font("Segoe UI", 11.25F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.lblRemoteTitle.Location = new System.Drawing.Point(15, 12);
            this.lblRemoteTitle.Name = "lblRemoteTitle";
            this.lblRemoteTitle.Size = new System.Drawing.Size(462, 20);
            this.lblRemoteTitle.TabIndex = 0;
            this.lblRemoteTitle.Text = "E-Vedhika Built-In Native Remote Control & Central Telemetry Engine";
            // 
            // lblRemoteStatus
            // 
            this.lblRemoteStatus.AutoSize = true;
            this.lblRemoteStatus.Font = new System.Drawing.Font("Segoe UI Semibold", 9.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.lblRemoteStatus.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(16)))), ((int)(((byte)(185)))), ((int)(((byte)(129)))));
            this.lblRemoteStatus.Location = new System.Drawing.Point(16, 40);
            this.lblRemoteStatus.Name = "lblRemoteStatus";
            this.lblRemoteStatus.Size = new System.Drawing.Size(420, 17);
            this.lblRemoteStatus.TabIndex = 1;
            this.lblRemoteStatus.Text = "Status: 🟢 LIVE ONLINE & STREAMING TO CENTRAL CLOUD DASHBOARD";
            // 
            // lblPcNameInfo
            // 
            this.lblPcNameInfo.AutoSize = true;
            this.lblPcNameInfo.Location = new System.Drawing.Point(16, 65);
            this.lblPcNameInfo.Name = "lblPcNameInfo";
            this.lblPcNameInfo.Size = new System.Drawing.Size(380, 17);
            this.lblPcNameInfo.TabIndex = 2;
            this.lblPcNameInfo.Text = "Endpoint: https://www.e-vedhika.in/contact";
            // 
            // btnToggleRemote
            // 
            this.btnToggleRemote.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(15)))), ((int)(((byte)(118)))), ((int)(((byte)(110)))));
            this.btnToggleRemote.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnToggleRemote.Font = new System.Drawing.Font("Segoe UI Semibold", 9.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.btnToggleRemote.ForeColor = System.Drawing.Color.White;
            this.btnToggleRemote.Location = new System.Drawing.Point(18, 95);
            this.btnToggleRemote.Name = "btnToggleRemote";
            this.btnToggleRemote.Size = new System.Drawing.Size(220, 35);
            this.btnToggleRemote.TabIndex = 3;
            this.btnToggleRemote.Text = "⏸️ Pause Remote Agent";
            this.btnToggleRemote.UseVisualStyleBackColor = false;
            this.btnToggleRemote.Click += new System.EventHandler(this.btnToggleRemote_Click);
            // 
            // btnSendTelemetryManual
            // 
            this.btnSendTelemetryManual.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(30)))), ((int)(((byte)(41)))), ((int)(((byte)(59)))));
            this.btnSendTelemetryManual.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnSendTelemetryManual.Font = new System.Drawing.Font("Segoe UI Semibold", 9.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.btnSendTelemetryManual.ForeColor = System.Drawing.Color.White;
            this.btnSendTelemetryManual.Location = new System.Drawing.Point(250, 95);
            this.btnSendTelemetryManual.Name = "btnSendTelemetryManual";
            this.btnSendTelemetryManual.Size = new System.Drawing.Size(320, 35);
            this.btnSendTelemetryManual.TabIndex = 4;
            this.btnSendTelemetryManual.Text = "📤 Send Live Telemetry Report to Cloud Now";
            this.btnSendTelemetryManual.UseVisualStyleBackColor = false;
            this.btnSendTelemetryManual.Click += new System.EventHandler(this.btnSendTelemetryManual_Click);
            // 
            // txtRemoteLog
            // 
            this.txtRemoteLog.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.txtRemoteLog.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(15)))), ((int)(((byte)(23)))), ((int)(((byte)(42)))));
            this.txtRemoteLog.Font = new System.Drawing.Font("Consolas", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.txtRemoteLog.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(52)))), ((int)(((byte)(211)))), ((int)(((byte)(153)))));
            this.txtRemoteLog.Location = new System.Drawing.Point(18, 142);
            this.txtRemoteLog.Multiline = true;
            this.txtRemoteLog.Name = "txtRemoteLog";
            this.txtRemoteLog.ReadOnly = true;
            this.txtRemoteLog.ScrollBars = System.Windows.Forms.ScrollBars.Both;
            this.txtRemoteLog.Size = new System.Drawing.Size(840, 280);
            this.txtRemoteLog.TabIndex = 5;
            // 
            // tabDiagnostics
            // 
            this.tabDiagnostics.Controls.Add(this.btnRunDiagnostics);
            this.tabDiagnostics.Controls.Add(this.btnActivateWindows);
            this.tabDiagnostics.Controls.Add(this.btnPCBoost);
            this.tabDiagnostics.Controls.Add(this.btnRepairEdge);
            this.tabDiagnostics.Controls.Add(this.btnFixPrinter);
            this.tabDiagnostics.Controls.Add(this.btnDeepRepair);
            this.tabDiagnostics.Controls.Add(this.btnSyncTime);
            this.tabDiagnostics.Controls.Add(this.txtDiagnosticOutput);
            this.tabDiagnostics.Location = new System.Drawing.Point(4, 26);
            this.tabDiagnostics.Name = "tabDiagnostics";
            this.tabDiagnostics.Padding = new System.Windows.Forms.Padding(12);
            this.tabDiagnostics.Size = new System.Drawing.Size(876, 444);
            this.tabDiagnostics.TabIndex = 1;
            this.tabDiagnostics.Text = "🔍 Diagnostics";
            this.tabDiagnostics.UseVisualStyleBackColor = true;
            // 
            // btnRunDiagnostics
            // 
            this.btnRunDiagnostics.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(30)))), ((int)(((byte)(41)))), ((int)(((byte)(59)))));
            this.btnRunDiagnostics.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnRunDiagnostics.ForeColor = System.Drawing.Color.White;
            this.btnRunDiagnostics.Location = new System.Drawing.Point(15, 15);
            this.btnRunDiagnostics.Name = "btnRunDiagnostics";
            this.btnRunDiagnostics.Size = new System.Drawing.Size(160, 36);
            this.btnRunDiagnostics.TabIndex = 1;
            this.btnRunDiagnostics.Text = "🔄 Run WMI Scan";
            this.btnRunDiagnostics.UseVisualStyleBackColor = false;
            this.btnRunDiagnostics.Click += new System.EventHandler(this.btnRunDiagnostics_Click);
            // 
            // btnActivateWindows
            // 
            this.btnActivateWindows.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(255)))), ((int)(((byte)(152)))), ((int)(((byte)(0)))));
            this.btnActivateWindows.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnActivateWindows.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold);
            this.btnActivateWindows.ForeColor = System.Drawing.Color.White;
            this.btnActivateWindows.Location = new System.Drawing.Point(190, 15);
            this.btnActivateWindows.Name = "btnActivateWindows";
            this.btnActivateWindows.Size = new System.Drawing.Size(190, 36);
            this.btnActivateWindows.TabIndex = 2;
            this.btnActivateWindows.Text = "Activate Windows (KMS)";
            this.btnActivateWindows.UseVisualStyleBackColor = false;
            this.btnActivateWindows.Click += new System.EventHandler(this.btnActivateWindows_Click);
            // 
            // btnPCBoost
            // 
            this.btnPCBoost.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(16)))), ((int)(((byte)(185)))), ((int)(((byte)(129)))));
            this.btnPCBoost.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnPCBoost.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold);
            this.btnPCBoost.ForeColor = System.Drawing.Color.White;
            this.btnPCBoost.Location = new System.Drawing.Point(395, 15);
            this.btnPCBoost.Name = "btnPCBoost";
            this.btnPCBoost.Size = new System.Drawing.Size(190, 36);
            this.btnPCBoost.TabIndex = 3;
            this.btnPCBoost.Text = "🚀 PC Boost & Junk Clean";
            this.btnPCBoost.UseVisualStyleBackColor = false;
            this.btnPCBoost.Click += new System.EventHandler(this.btnPCBoost_Click);
            // 
            // btnRepairEdge
            // 
            this.btnRepairEdge.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(2)))), ((int)(((byte)(132)))), ((int)(((byte)(199)))));
            this.btnRepairEdge.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnRepairEdge.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold);
            this.btnRepairEdge.ForeColor = System.Drawing.Color.White;
            this.btnRepairEdge.Location = new System.Drawing.Point(600, 15);
            this.btnRepairEdge.Name = "btnRepairEdge";
            this.btnRepairEdge.Size = new System.Drawing.Size(240, 36);
            this.btnRepairEdge.TabIndex = 7;
            this.btnRepairEdge.Text = "🌐 Install / Update Edge";
            this.btnRepairEdge.UseVisualStyleBackColor = false;
            this.btnRepairEdge.Click += new System.EventHandler(this.btnRepairEdge_Click);
            // 
            // btnFixPrinter
            // 
            this.btnFixPrinter.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(99)))), ((int)(((byte)(102)))), ((int)(((byte)(241)))));
            this.btnFixPrinter.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnFixPrinter.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold);
            this.btnFixPrinter.ForeColor = System.Drawing.Color.White;
            this.btnFixPrinter.Location = new System.Drawing.Point(15, 60);
            this.btnFixPrinter.Name = "btnFixPrinter";
            this.btnFixPrinter.Size = new System.Drawing.Size(160, 36);
            this.btnFixPrinter.TabIndex = 4;
            this.btnFixPrinter.Text = "🖨️ Fix Printer Spooler";
            this.btnFixPrinter.UseVisualStyleBackColor = false;
            this.btnFixPrinter.Click += new System.EventHandler(this.btnFixPrinter_Click);
            // 
            // btnDeepRepair
            // 
            this.btnDeepRepair.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(239)))), ((int)(((byte)(68)))), ((int)(((byte)(68)))));
            this.btnDeepRepair.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnDeepRepair.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold);
            this.btnDeepRepair.ForeColor = System.Drawing.Color.White;
            this.btnDeepRepair.Location = new System.Drawing.Point(190, 60);
            this.btnDeepRepair.Name = "btnDeepRepair";
            this.btnDeepRepair.Size = new System.Drawing.Size(190, 36);
            this.btnDeepRepair.TabIndex = 5;
            this.btnDeepRepair.Text = "🛠️ OS Deep Repair (SFC)";
            this.btnDeepRepair.UseVisualStyleBackColor = false;
            this.btnDeepRepair.Click += new System.EventHandler(this.btnDeepRepair_Click);
            // 
            // btnSyncTime
            // 
            this.btnSyncTime.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(245)))), ((int)(((byte)(158)))), ((int)(((byte)(11)))));
            this.btnSyncTime.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnSyncTime.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold);
            this.btnSyncTime.ForeColor = System.Drawing.Color.White;
            this.btnSyncTime.Location = new System.Drawing.Point(395, 60);
            this.btnSyncTime.Name = "btnSyncTime";
            this.btnSyncTime.Size = new System.Drawing.Size(190, 36);
            this.btnSyncTime.TabIndex = 6;
            this.btnSyncTime.Text = "🌐 Time && Date Fixer";
            this.btnSyncTime.UseVisualStyleBackColor = false;
            this.btnSyncTime.Click += new System.EventHandler(this.btnSyncTime_Click);
            // 
            // 
            // 
            // txtDiagnosticOutput
            // 
            this.txtDiagnosticOutput.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.txtDiagnosticOutput.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(248)))), ((int)(((byte)(250)))), ((int)(((byte)(252)))));
            this.txtDiagnosticOutput.Font = new System.Drawing.Font("Consolas", 10F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.txtDiagnosticOutput.Location = new System.Drawing.Point(15, 110);
            this.txtDiagnosticOutput.Multiline = true;
            this.txtDiagnosticOutput.Name = "txtDiagnosticOutput";
            this.txtDiagnosticOutput.ReadOnly = true;
            this.txtDiagnosticOutput.Size = new System.Drawing.Size(845, 315);
            this.txtDiagnosticOutput.TabIndex = 0;
            // 
            // tabDrivers
            // 
            this.tabDrivers.Controls.Add(this.btnInstallMToken);
            this.tabDrivers.Controls.Add(this.btnInstallHYP2003);
            this.tabDrivers.Controls.Add(this.btnInstallProxKey);
            this.tabDrivers.Controls.Add(this.lblDriversInfo);
            this.tabDrivers.Location = new System.Drawing.Point(4, 26);
            this.tabDrivers.Name = "tabDrivers";
            this.tabDrivers.Padding = new System.Windows.Forms.Padding(12);
            this.tabDrivers.Size = new System.Drawing.Size(876, 444);
            this.tabDrivers.TabIndex = 2;
            this.tabDrivers.Text = "🔌 Drivers & Token";
            this.tabDrivers.UseVisualStyleBackColor = true;
            // 
            // btnInstallMToken
            // 
            this.btnInstallMToken.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(2)))), ((int)(((byte)(132)))), ((int)(((byte)(199)))));
            this.btnInstallMToken.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnInstallMToken.ForeColor = System.Drawing.Color.White;
            this.btnInstallMToken.Location = new System.Drawing.Point(450, 60);
            this.btnInstallMToken.Name = "btnInstallMToken";
            this.btnInstallMToken.Size = new System.Drawing.Size(200, 36);
            this.btnInstallMToken.TabIndex = 3;
            this.btnInstallMToken.Text = "Install Class 3 mToken";
            this.btnInstallMToken.UseVisualStyleBackColor = false;
            this.btnInstallMToken.Click += new System.EventHandler(this.btnInstallMToken_Click);
            // 
            // btnInstallHYP2003
            // 
            this.btnInstallHYP2003.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(2)))), ((int)(((byte)(132)))), ((int)(((byte)(199)))));
            this.btnInstallHYP2003.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnInstallHYP2003.ForeColor = System.Drawing.Color.White;
            this.btnInstallHYP2003.Location = new System.Drawing.Point(235, 60);
            this.btnInstallHYP2003.Name = "btnInstallHYP2003";
            this.btnInstallHYP2003.Size = new System.Drawing.Size(200, 36);
            this.btnInstallHYP2003.TabIndex = 2;
            this.btnInstallHYP2003.Text = "Install HYP2003 Driver";
            this.btnInstallHYP2003.UseVisualStyleBackColor = false;
            this.btnInstallHYP2003.Click += new System.EventHandler(this.btnInstallHYP2003_Click);
            // 
            // btnInstallProxKey
            // 
            this.btnInstallProxKey.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(2)))), ((int)(((byte)(132)))), ((int)(((byte)(199)))));
            this.btnInstallProxKey.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnInstallProxKey.ForeColor = System.Drawing.Color.White;
            this.btnInstallProxKey.Location = new System.Drawing.Point(20, 60);
            this.btnInstallProxKey.Name = "btnInstallProxKey";
            this.btnInstallProxKey.Size = new System.Drawing.Size(200, 36);
            this.btnInstallProxKey.TabIndex = 1;
            this.btnInstallProxKey.Text = "Install ProxKey Driver";
            this.btnInstallProxKey.UseVisualStyleBackColor = false;
            this.btnInstallProxKey.Click += new System.EventHandler(this.btnInstallProxKey_Click);
            // 
            // lblDriversInfo
            // 
            this.lblDriversInfo.AutoSize = true;
            this.lblDriversInfo.Location = new System.Drawing.Point(17, 20);
            this.lblDriversInfo.Name = "lblDriversInfo";
            this.lblDriversInfo.Size = new System.Drawing.Size(430, 17);
            this.lblDriversInfo.TabIndex = 0;
            this.lblDriversInfo.Text = "Silent USB DSC Token Drivers & PKCS#11 Cryptographic Token Managers";
            // 
            // tabLiveUpdates
            // 
            this.tabLiveUpdates.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(15)))), ((int)(((byte)(23)))), ((int)(((byte)(42)))));
            this.tabLiveUpdates.Location = new System.Drawing.Point(4, 26);
            this.tabLiveUpdates.Name = "tabLiveUpdates";
            this.tabLiveUpdates.Padding = new System.Windows.Forms.Padding(12);
            this.tabLiveUpdates.Size = new System.Drawing.Size(876, 444);
            this.tabLiveUpdates.TabIndex = 6;
            this.tabLiveUpdates.Text = "✨ Live Website Posts";
            // 
            // tabAiTrouble
            // 
            this.tabAiTrouble.Controls.Add(this.lblAiStatus);
            this.tabAiTrouble.Controls.Add(this.txtAiResponse);
            this.tabAiTrouble.Controls.Add(this.btnAskAi);
            this.tabAiTrouble.Controls.Add(this.txtAiQuery);
            this.tabAiTrouble.Controls.Add(this.lblAskAi);
            this.tabAiTrouble.Location = new System.Drawing.Point(4, 26);
            this.tabAiTrouble.Name = "tabAiTrouble";
            this.tabAiTrouble.Padding = new System.Windows.Forms.Padding(12);
            this.tabAiTrouble.Size = new System.Drawing.Size(876, 444);
            this.tabAiTrouble.TabIndex = 3;
            this.tabAiTrouble.Text = "🤖 AI Troubleshooter";
            this.tabAiTrouble.UseVisualStyleBackColor = true;
            // 
            // lblAiStatus
            // 
            this.lblAiStatus.AutoSize = true;
            this.lblAiStatus.ForeColor = System.Drawing.Color.DimGray;
            this.lblAiStatus.Location = new System.Drawing.Point(15, 115);
            this.lblAiStatus.Name = "lblAiStatus";
            this.lblAiStatus.Size = new System.Drawing.Size(126, 17);
            this.lblAiStatus.TabIndex = 4;
            this.lblAiStatus.Text = "AI Diagnostic Ready";
            // 
            // txtAiResponse
            // 
            this.txtAiResponse.Anchor = ((System.Windows.Forms.AnchorStyles)((((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Bottom) 
            | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.txtAiResponse.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(241)))), ((int)(((byte)(245)))), ((int)(((byte)(249)))));
            this.txtAiResponse.Font = new System.Drawing.Font("Consolas", 9.75F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.txtAiResponse.Location = new System.Drawing.Point(18, 140);
            this.txtAiResponse.Multiline = true;
            this.txtAiResponse.Name = "txtAiResponse";
            this.txtAiResponse.ReadOnly = true;
            this.txtAiResponse.Size = new System.Drawing.Size(840, 285);
            this.txtAiResponse.TabIndex = 3;
            // 
            // btnAskAi
            // 
            this.btnAskAi.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(79)))), ((int)(((byte)(70)))), ((int)(((byte)(229)))));
            this.btnAskAi.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnAskAi.Font = new System.Drawing.Font("Segoe UI", 9.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.btnAskAi.ForeColor = System.Drawing.Color.White;
            this.btnAskAi.Location = new System.Drawing.Point(18, 75);
            this.btnAskAi.Name = "btnAskAi";
            this.btnAskAi.Size = new System.Drawing.Size(160, 32);
            this.btnAskAi.TabIndex = 2;
            this.btnAskAi.Text = "Analyze Problem";
            this.btnAskAi.UseVisualStyleBackColor = false;
            this.btnAskAi.Click += new System.EventHandler(this.btnAskAi_Click);
            // 
            // txtAiQuery
            // 
            this.txtAiQuery.Anchor = ((System.Windows.Forms.AnchorStyles)(((System.Windows.Forms.AnchorStyles.Top | System.Windows.Forms.AnchorStyles.Left) 
            | System.Windows.Forms.AnchorStyles.Right)));
            this.txtAiQuery.Location = new System.Drawing.Point(18, 40);
            this.txtAiQuery.Name = "txtAiQuery";
            this.txtAiQuery.Size = new System.Drawing.Size(840, 25);
            this.txtAiQuery.TabIndex = 1;
            this.txtAiQuery.Text = "ActiveX component automation error 0x800A01AD when opening E-Vedhika portal";
            // 
            // lblAskAi
            // 
            this.lblAskAi.AutoSize = true;
            this.lblAskAi.Font = new System.Drawing.Font("Segoe UI Semibold", 9.75F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.lblAskAi.Location = new System.Drawing.Point(15, 15);
            this.lblAskAi.Name = "lblAskAi";
            this.lblAskAi.Size = new System.Drawing.Size(262, 17);
            this.lblAskAi.TabIndex = 0;
            this.lblAskAi.Text = "Describe error code, portal bug, or message:";
            // 
            // tabBackup
            // 
            this.tabBackup.Controls.Add(this.btnBackup);
            this.tabBackup.Controls.Add(this.btnUninstall);
            this.tabBackup.Controls.Add(this.btnCheckUpdates);
            this.tabBackup.Controls.Add(this.lblBackupInfo);
            this.tabBackup.Location = new System.Drawing.Point(4, 26);
            this.tabBackup.Name = "tabBackup";
            this.tabBackup.Padding = new System.Windows.Forms.Padding(12);
            this.tabBackup.Size = new System.Drawing.Size(876, 444);
            this.tabBackup.TabIndex = 4;
            this.tabBackup.Text = "💾 Registry Snapshots";
            this.tabBackup.UseVisualStyleBackColor = true;
            // 
            // btnBackup
            // 
            this.btnBackup.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(15)))), ((int)(((byte)(118)))), ((int)(((byte)(110)))));
            this.btnBackup.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnBackup.ForeColor = System.Drawing.Color.White;
            this.btnBackup.Location = new System.Drawing.Point(20, 60);
            this.btnBackup.Name = "btnBackup";
            this.btnBackup.Size = new System.Drawing.Size(240, 36);
            this.btnBackup.TabIndex = 1;
            this.btnBackup.Text = "Export Registry Backup (.reg)";
            this.btnBackup.UseVisualStyleBackColor = false;
            this.btnBackup.Click += new System.EventHandler(this.btnBackup_Click);
            // 
            // btnUninstall
            // 
            this.btnUninstall.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(225)))), ((int)(((byte)(29)))), ((int)(((byte)(72)))));
            this.btnUninstall.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnUninstall.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold);
            this.btnUninstall.ForeColor = System.Drawing.Color.White;
            this.btnUninstall.Location = new System.Drawing.Point(280, 60);
            this.btnUninstall.Name = "btnUninstall";
            this.btnUninstall.Size = new System.Drawing.Size(280, 36);
            this.btnUninstall.TabIndex = 2;
            this.btnUninstall.Text = "🗑️ Uninstall & Revert All Settings";
            this.btnUninstall.UseVisualStyleBackColor = false;
            this.btnUninstall.Click += new System.EventHandler(this.btnUninstall_Click);
            // 
            // btnCheckUpdates
            // 
            this.btnCheckUpdates.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(37)))), ((int)(((byte)(99)))), ((int)(((byte)(235)))));
            this.btnCheckUpdates.FlatStyle = System.Windows.Forms.FlatStyle.Flat;
            this.btnCheckUpdates.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold);
            this.btnCheckUpdates.ForeColor = System.Drawing.Color.White;
            this.btnCheckUpdates.Location = new System.Drawing.Point(580, 60);
            this.btnCheckUpdates.Name = "btnCheckUpdates";
            this.btnCheckUpdates.Size = new System.Drawing.Size(270, 36);
            this.btnCheckUpdates.TabIndex = 3;
            this.btnCheckUpdates.Text = "✨ Check for Software Updates (OTA)";
            this.btnCheckUpdates.UseVisualStyleBackColor = false;
            this.btnCheckUpdates.Click += new System.EventHandler(this.btnCheckUpdates_Click);
            // 
            // lblBackupInfo
            // 
            this.lblBackupInfo.AutoSize = true;
            this.lblBackupInfo.Location = new System.Drawing.Point(17, 20);
            this.lblBackupInfo.Name = "lblBackupInfo";
            this.lblBackupInfo.Size = new System.Drawing.Size(462, 17);
            this.lblBackupInfo.TabIndex = 0;
            this.lblBackupInfo.Text = "Create full HKEY_CURRENT_USER Internet Settings backups prior to modification.";
            // 
            // panelHeader
            // 
            this.panelHeader.BackColor = System.Drawing.Color.FromArgb(((int)(((byte)(15)))), ((int)(((byte)(23)))), ((int)(((byte)(42)))));
            this.panelHeader.Controls.Add(this.lblHeaderSubtitle);
            this.panelHeader.Controls.Add(this.lblHeaderTitle);
            this.panelHeader.Controls.Add(this.pbUpdateProgress);
            this.panelHeader.Controls.Add(this.lblUpdateStatus);
            this.panelHeader.Dock = System.Windows.Forms.DockStyle.Top;
            this.panelHeader.Location = new System.Drawing.Point(0, 0);
            this.panelHeader.Name = "panelHeader";
            this.panelHeader.Size = new System.Drawing.Size(1060, 72);
            this.panelHeader.TabIndex = 1;
            // 
            // lblHeaderTitle
            // 
            this.lblHeaderTitle.AutoSize = true;
            this.lblHeaderTitle.Font = new System.Drawing.Font("Segoe UI", 11.5F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.lblHeaderTitle.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(251)))), ((int)(((byte)(233)))), ((int)(((byte)(71)))));
            this.lblHeaderTitle.Location = new System.Drawing.Point(15, 12);
            this.lblHeaderTitle.Name = "lblHeaderTitle";
            this.lblHeaderTitle.Size = new System.Drawing.Size(600, 21);
            this.lblHeaderTitle.TabIndex = 0;
            this.lblHeaderTitle.Text = "🛡️ E-VEDHIKA ALL PROBLEMS ONE SOLUTION & UBD DEPLOYMENT TOOL (v1.0.1)";
            // 
            // lblHeaderSubtitle
            // 
            this.lblHeaderSubtitle.AutoSize = true;
            this.lblHeaderSubtitle.Font = new System.Drawing.Font("Segoe UI", 8.25F, System.Drawing.FontStyle.Regular, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.lblHeaderSubtitle.ForeColor = System.Drawing.Color.FromArgb(((int)(((byte)(203)))), ((int)(((byte)(213)))), ((int)(((byte)(225)))));
            this.lblHeaderSubtitle.Location = new System.Drawing.Point(17, 38);
            this.lblHeaderSubtitle.Name = "lblHeaderSubtitle";
            this.lblHeaderSubtitle.Size = new System.Drawing.Size(560, 13);
            this.lblHeaderSubtitle.TabIndex = 1;
            this.lblHeaderSubtitle.Text = "ALL PROBLEMS ONE SOLUTION | Government Portal Edge IE Mode, ActiveX & DSC Token Engine";
            // 
            // pbUpdateProgress
            // 
            this.pbUpdateProgress.Location = new System.Drawing.Point(620, 30);
            this.pbUpdateProgress.Name = "pbUpdateProgress";
            this.pbUpdateProgress.Size = new System.Drawing.Size(240, 20);
            this.pbUpdateProgress.Style = System.Windows.Forms.ProgressBarStyle.Continuous;
            this.pbUpdateProgress.TabIndex = 2;
            this.pbUpdateProgress.Visible = false;
            // 
            // lblUpdateStatus
            // 
            this.lblUpdateStatus.AutoSize = true;
            this.lblUpdateStatus.Font = new System.Drawing.Font("Segoe UI", 9F, System.Drawing.FontStyle.Bold, System.Drawing.GraphicsUnit.Point, ((byte)(0)));
            this.lblUpdateStatus.ForeColor = System.Drawing.Color.LawnGreen;
            this.lblUpdateStatus.Location = new System.Drawing.Point(620, 10);
            this.lblUpdateStatus.Name = "lblUpdateStatus";
            this.lblUpdateStatus.Size = new System.Drawing.Size(120, 15);
            this.lblUpdateStatus.TabIndex = 3;
            this.lblUpdateStatus.Text = "Downloading Update: 0%";
            this.lblUpdateStatus.Visible = false;
            // 
            // timerDeploy
            // 
            this.timerDeploy.Interval = 400;
            this.timerDeploy.Tick += new System.EventHandler(this.timerDeploy_Tick);
            // 
            // statusStrip1
            // 
            this.statusStrip1.Items.AddRange(new System.Windows.Forms.ToolStripItem[] {
            this.toolStripStatusLabel});
            this.statusStrip1.Location = new System.Drawing.Point(0, 598);
            this.statusStrip1.Name = "statusStrip1";
            this.statusStrip1.Size = new System.Drawing.Size(1060, 22);
            this.statusStrip1.TabIndex = 2;
            this.statusStrip1.Text = "statusStrip1";
            // 
            // toolStripStatusLabel
            // 
            this.toolStripStatusLabel.Name = "toolStripStatusLabel";
            this.toolStripStatusLabel.Size = new System.Drawing.Size(420, 17);
            this.toolStripStatusLabel.Text = "Developer: Rakesh Dhawan (Admin) | E-Vedhika UBD Tool v1.0.4 | Status: Ready";
            // 
            // MainForm
            // 
            this.AutoScaleDimensions = new System.Drawing.SizeF(6F, 13F);
            this.AutoScaleMode = System.Windows.Forms.AutoScaleMode.Font;
            this.ClientSize = new System.Drawing.Size(1060, 620);
            this.Controls.Add(this.statusStrip1);
            this.Controls.Add(this.tabControlMain);
            this.Controls.Add(this.panelHeader);
            this.MinimumSize = new System.Drawing.Size(960, 560);
            this.Name = "MainForm";
            this.StartPosition = System.Windows.Forms.FormStartPosition.CenterScreen;
            this.Text = "E-Vedhika All Problems One Solution & UBD Deployment Tool";
            this.Load += new System.EventHandler(this.MainForm_Load);
            this.tabControlMain.ResumeLayout(false);
            this.tabDeploy.ResumeLayout(false);
            this.tabDeploy.PerformLayout();
            this.tabRemote.ResumeLayout(false);
            this.tabRemote.PerformLayout();
            this.tabDiagnostics.ResumeLayout(false);
            this.tabDiagnostics.PerformLayout();
            this.tabDrivers.ResumeLayout(false);
            this.tabDrivers.PerformLayout();
            this.tabAiTrouble.ResumeLayout(false);
            this.tabAiTrouble.PerformLayout();
            this.tabBackup.ResumeLayout(false);
            this.tabBackup.PerformLayout();
            this.panelHeader.ResumeLayout(false);
            this.panelHeader.PerformLayout();
            this.statusStrip1.ResumeLayout(false);
            this.statusStrip1.PerformLayout();
            this.ResumeLayout(false);
            this.PerformLayout();

        }

        #endregion

        private System.Windows.Forms.TabControl tabControlMain;
        private System.Windows.Forms.TabPage tabDeploy;
        private System.Windows.Forms.TabPage tabRemote;
        private System.Windows.Forms.Label lblRemoteTitle;
        private System.Windows.Forms.Label lblRemoteStatus;
        private System.Windows.Forms.Label lblPcNameInfo;
        private System.Windows.Forms.Button btnToggleRemote;
        private System.Windows.Forms.Button btnSendTelemetryManual;
        private System.Windows.Forms.TextBox txtRemoteLog;
        private System.Windows.Forms.TabPage tabDiagnostics;
        private System.Windows.Forms.TabPage tabDrivers;
        private System.Windows.Forms.TabPage tabAiTrouble;
        private System.Windows.Forms.TabPage tabLiveUpdates;
        private System.Windows.Forms.TabPage tabBackup;
        private System.Windows.Forms.Panel panelHeader;
        private System.Windows.Forms.Label lblHeaderTitle;
        private System.Windows.Forms.Label lblHeaderSubtitle;
        private System.Windows.Forms.Label lblUpdateStatus;
        private System.Windows.Forms.ProgressBar pbUpdateProgress;
        private System.Windows.Forms.Button btnStartDeploy;
        
        private System.Windows.Forms.ProgressBar progressBarDeploy;
        private System.Windows.Forms.Label lblStatusStep;
        private System.Windows.Forms.Timer timerDeploy;
        private System.Windows.Forms.TextBox txtDiagnosticOutput;
        private System.Windows.Forms.Button btnRunDiagnostics;
        private System.Windows.Forms.Button btnActivateWindows;
        private System.Windows.Forms.Button btnPCBoost;
        private System.Windows.Forms.Button btnFixPrinter;
        private System.Windows.Forms.Button btnDeepRepair;
        private System.Windows.Forms.Button btnSyncTime;
        private System.Windows.Forms.Button btnRepairEdge;
        private System.Windows.Forms.Label lblDriversInfo;
        private System.Windows.Forms.Button btnInstallProxKey;
        private System.Windows.Forms.Button btnInstallHYP2003;
        private System.Windows.Forms.Button btnInstallMToken;
        private System.Windows.Forms.Label lblAskAi;
        private System.Windows.Forms.TextBox txtAiQuery;
        private System.Windows.Forms.Button btnAskAi;
        private System.Windows.Forms.TextBox txtAiResponse;
        private System.Windows.Forms.Label lblAiStatus;
        private System.Windows.Forms.Button btnBackup;
        private System.Windows.Forms.Button btnUninstall;
        private System.Windows.Forms.Button btnCheckUpdates;
        private System.Windows.Forms.Label lblBackupInfo;
        public EVedhikaUBDDeploymentTool.Helpers.ModernMetricsCardPanel pnlMetricsCards;
        private System.Windows.Forms.StatusStrip statusStrip1;
        private System.Windows.Forms.ToolStripStatusLabel toolStripStatusLabel;
    }
}
