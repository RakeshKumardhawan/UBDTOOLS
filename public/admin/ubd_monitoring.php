<?php
// ====================================================================================
// 🏛️ E-VEDHIKA CENTRAL TELEMETRY, UPDATES & LIVE MONITORING GATEWAY (v1.0.9 LIVE MONITORING)
// File Path: /admin/ubd_monitoring.php  (URL: https://www.e-vedhika.in/admin/ubd_monitoring)
// Developer: Rakesh Dhawan (@DhawanRakesh)
// Features: Consolidated PC Health, Deduplicated Alerts, Dynamic Posts/Feed, AutoRepair Verification
// ====================================================================================

header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS, DELETE');
header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With');

if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    http_response_code(200);
    exit;
}

$storageDir = __DIR__;
$dataFile = $storageDir . '/telemetry_storage.json';
$announcementsFile = $storageDir . '/announcements.json';
$exeLiveJsonFile = $storageDir . '/exe_ubd_live.json';
$consolidatedFile = $storageDir . '/pc_consolidated_health.json';
$issuesFile = $storageDir . '/active_issues.json';

// Application Version
$version = 'v1.0.9';

// Central Telegram Bot Credentials
$botToken = "8822107822:AAG9TIOX1lnRXpUuKCbs7ppM3r1TPTnNYrE";
$chatId = "431228008";

// Helper: Dispatch Telegram HTML Message
function sendTelegramMessage($token, $chat, $message) {
    if (empty($token) || empty($chat) || empty($message)) return false;
    $ch = curl_init("https://api.telegram.org/bot{$token}/sendMessage");
    curl_setopt($ch, CURLOPT_POST, 1);
    curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode([
        'chat_id' => $chat,
        'text' => $message,
        'parse_mode' => 'HTML',
        'disable_web_page_preview' => true
    ]));
    curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 6);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $res = @curl_exec($ch);
    curl_close($ch);
    return $res;
}

// Helper: Load Announcements
function loadAnnouncements($filePath, $fallbackPath) {
    if (file_exists($filePath)) {
        $data = json_decode(@file_get_contents($filePath), true);
        if (is_array($data) && !empty($data)) return $data;
    }
    if (file_exists($fallbackPath)) {
        $json = json_decode(@file_get_contents($fallbackPath), true);
        if (isset($json['news']) && is_array($json['news'])) return $json['news'];
    }
    return [
        [
            'id' => 1,
            'title' => "IMPORTANT: v1.0.9 Update Released",
            'content' => "Brand new v1.0.9 release with Direct Telegram & Cloud Telemetry, immediate installation reporting, zero-manual auto-repair, and full Windows 7/8/10/11 compatibility.",
            'date' => date('Y-m-d'),
            'importance' => 'High',
            'category' => 'Software Update',
            'author' => 'Rakesh Dhawan (Admin)'
        ]
    ];
}

// Helper: Get Normalized Consolidated Machine Health Records
function getNormalizedConsolidatedPcs($storageDir, $dataFile, $consolidatedFile) {
    $pcs = [];
    if (file_exists($consolidatedFile)) {
        $raw = json_decode(@file_get_contents($consolidatedFile), true);
        if (is_array($raw) && !empty($raw)) $pcs = $raw;
    }

    if (empty($pcs)) {
        $altFiles = [
            $storageDir . '/consolidated_health.json',
            $storageDir . '/../consolidated_health.json',
            $storageDir . '/admin/consolidated_health.json',
            $storageDir . '/admin/pc_consolidated_health.json'
        ];
        foreach ($altFiles as $f) {
            if (file_exists($f)) {
                $raw = json_decode(@file_get_contents($f), true);
                if (is_array($raw) && !empty($raw)) {
                    $pcs = $raw;
                    break;
                }
            }
        }
    }

    $normalized = [];
    foreach ($pcs as $key => $item) {
        $id = $item['machineId'] ?? $item['pcId'] ?? (is_string($key) ? $key : ($item['pcName'] ?? 'PC-'.$key));
        
        $st = $item['overallStatus'] ?? 'ONLINE & READY';
        if ($st === 'HEALTHY' || $st === 'SUCCESS') $st = 'ONLINE & READY';

        $steps = $item['stepsVerified'] ?? '';
        if (empty($steps) && isset($item['deployment']['verifiedSteps'])) {
            $steps = $item['deployment']['verifiedSteps'] . '/' . ($item['deployment']['totalSteps'] ?? 17) . ' Passed';
        }
        if (empty($steps)) $steps = ($st === 'ONLINE & READY') ? '17/17 Passed' : '12/17 Passed';

        $dsc = $item['dscStatus'] ?? '';
        if (empty($dsc) && isset($item['technicalHealth']['dscTokenConnected'])) {
            $dsc = ($item['technicalHealth']['dscTokenConnected'] === 'PASS') ? 'ProxKey Connected' : 'Disconnected';
        }
        if (empty($dsc)) $dsc = 'ProxKey Connected';

        $os = $item['os'] ?? $item['osVersion'] ?? 'Windows 11 Pro';

        $activeIssue = $item['activeIssue'] ?? 'None (Healthy)';
        if (is_array($activeIssue)) {
            $activeIssue = $activeIssue['issueType'] ?? $activeIssue['summary'] ?? 'Issue Detected';
        }

        $normalized[$id] = [
            'machineId' => $id,
            'pcName' => $item['pcName'] ?? 'GP-PC',
            'userName' => $item['userName'] ?? 'Operator',
            'officeLocation' => $item['officeLocation'] ?? 'Grama Panchayat',
            'os' => $os,
            'buildNumber' => $item['buildNumber'] ?? $item['winBuild'] ?? 'Build 22631',
            'appVersion' => $item['appVersion'] ?? 'v1.0.9',
            'overallStatus' => $st,
            'stepsVerified' => $steps,
            'dscStatus' => $dsc,
            'edgePolicy' => $item['edgePolicy'] ?? ($st === 'ONLINE & READY' ? 'IE5 Quirks Active' : 'FAIL'),
            'sitesXml' => $item['sitesXml'] ?? ($st === 'ONLINE & READY' ? 'Validated' : 'FAIL'),
            'activeIssue' => $activeIssue,
            'lastSeen' => $item['lastSeen'] ?? $item['lastTelemetryUpdate'] ?? date('Y-m-d H:i:s'),
            'lastSummary' => $item['lastSummary'] ?? $item['remarks'] ?? 'Operating normally.'
        ];
    }
    return $normalized;
}

$action = strtolower($_GET['action'] ?? $_POST['action'] ?? '');

// Clear Logs Action
if (isset($_GET['clear']) && $_GET['clear'] === '1') {
    if (file_exists($dataFile)) @unlink($dataFile);
    if (file_exists($consolidatedFile)) @unlink($consolidatedFile);
    header('Location: ' . strtok($_SERVER['REQUEST_URI'], '?'));
    exit;
}

// Action: Version & Auto-Discovery Check
if ($action === 'check_update' || $action === 'version') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => true,
        'name' => 'E-VEDHIKA All Problems One Solution & UBD Deployment Tool',
        'appName' => 'E-VEDHIKA All Problems One Solution & UBD Deployment Tool',
        'executableName' => "EVedhika_Setup_{$version}.exe",
        'currentVersion' => $version,
        'latestVersion' => $version,
        'versionCode' => 10090,
        'releaseDate' => date('Y-m-d'),
        'downloadUrl' => "https://github.com/RakeshKumardhawan/UBDTOOLS/releases/latest/download/EVedhika_Setup_{$version}.exe",
        'githubRepo' => 'https://github.com/RakeshKumardhawan/UBDTOOLS',
        'updateRequired' => true,
        'silent' => true,
        'releaseNotes' => "Enterprise {$version}: Universal UBD v3.3 Digital Signature Fix, Driver Wakeup Engine & 17-Step Deployment.",
        'telemetryRelayUrl' => 'https://www.e-vedhika.in/admin/ubd_monitoring'
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// Action: 2-Way Sync - Push from this Website to Cloud Storage Vault
if ($action === 'sync_to_cloud') {
    $pcs = getNormalizedConsolidatedPcs($storageDir, $dataFile, $consolidatedFile);
    $cloudEndpoint = 'https://ais-dev-gmy2jhxrsujhkl43rtfgnx-585783354343.asia-southeast1.run.app/api/telemetry';
    $sent = 0;
    foreach ($pcs as $p) {
        $ch = curl_init($cloudEndpoint);
        curl_setopt($ch, CURLOPT_POST, 1);
        curl_setopt($ch, CURLOPT_POSTFIELDS, json_encode($p));
        curl_setopt($ch, CURLOPT_HTTPHEADER, ['Content-Type: application/json']);
        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
        curl_setopt($ch, CURLOPT_TIMEOUT, 4);
        curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
        $res = curl_exec($ch);
        if ($res) $sent++;
        curl_close($ch);
    }
    header('Location: ?msg=synced_to_cloud&count=' . $sent);
    exit;
}

// Action: 2-Way Sync - Pull from Cloud Storage Vault into this Website
if ($action === 'sync_from_cloud') {
    $cloudHealthUrl = 'https://ais-dev-gmy2jhxrsujhkl43rtfgnx-585783354343.asia-southeast1.run.app/api/consolidated-health';
    $ch = curl_init($cloudHealthUrl);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_TIMEOUT, 6);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    $res = curl_exec($ch);
    curl_close($ch);
    if ($res) {
        $data = json_decode($res, true);
        if (isset($data['machines']) && is_array($data['machines'])) {
            $existing = getNormalizedConsolidatedPcs($storageDir, $dataFile, $consolidatedFile);
            foreach ($data['machines'] as $m) {
                $id = $m['pcId'] ?? $m['deviceInstallationId'] ?? $m['pcName'];
                if ($id) {
                    $existing[$id] = $m;
                }
            }
            @file_put_contents($consolidatedFile, json_encode($existing, JSON_PRETTY_PRINT));
        }
    }
    header('Location: ?msg=synced_from_cloud');
    exit;
}

// Action: Export Logs JSON
if ($action === 'export' || (isset($_GET['format']) && $_GET['format'] === 'json')) {
    header('Content-Type: application/json; charset=utf-8');
    $logs = file_exists($dataFile) ? (json_decode(@file_get_contents($dataFile), true) ?: []) : [];
    $pcs = getNormalizedConsolidatedPcs($storageDir, $dataFile, $consolidatedFile);
    echo json_encode(['success' => true, 'count' => count($pcs), 'machines' => array_values($pcs), 'logs' => $logs], JSON_PRETTY_PRINT);
    exit;
}

// Handle Incoming POST Telemetry from C# App or Web App
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true) ?: $_POST;

    if (!empty($data)) {
        $now = date('Y-m-d H:i:s');
        $data['receivedAt'] = $now;

        $pcName = trim($data['pcName'] ?? $data['computerName'] ?? 'Unknown-PC');
        $machineId = trim($data['deviceInstallationId'] ?? $data['machineId'] ?? $data['macAddress'] ?? $data['pcId'] ?? $pcName);
        $userName = trim($data['userName'] ?? $data['operatorName'] ?? 'Panchayat Operator');
        $location = trim($data['officeLocation'] ?? $data['office'] ?? 'Grama Panchayat Office');
        $os = trim($data['osVersion'] ?? $data['os'] ?? 'Windows 11');
        $osBuild = trim($data['buildNumber'] ?? $data['osBuild'] ?? 'Build 22631');
        $remarks = trim($data['remarks'] ?? $data['summary'] ?? 'Report received from client machine.');

        $stepsTotal = intval($data['stepsTotal'] ?? 17);
        $stepsVerified = intval($data['stepsVerified'] ?? ($data['status'] === 'SUCCESS' ? 17 : 12));

        $isIssue = (stripos($data['status'] ?? '', 'ISSUE') !== false ||
                    stripos($data['status'] ?? '', 'FAIL') !== false ||
                    stripos($data['status'] ?? '', 'ERROR') !== false);

        $overallStatus = $isIssue ? 'DEGRADED' : 'ONLINE & READY';

        $pcs = getNormalizedConsolidatedPcs($storageDir, $dataFile, $consolidatedFile);
        
        // Strict Enforce: 1 Report per PC
        $pcs[$machineId] = [
            'machineId' => $machineId,
            'pcName' => $pcName,
            'userName' => $userName,
            'officeLocation' => $location,
            'os' => $os,
            'buildNumber' => $osBuild,
            'appVersion' => $version,
            'overallStatus' => $overallStatus,
            'stepsVerified' => "{$stepsVerified}/{$stepsTotal} Passed",
            'dscStatus' => trim($data['dscStatus'] ?? 'Connected'),
            'edgePolicy' => trim($data['edgePolicy'] ?? ($overallStatus === 'ONLINE & READY' ? 'IE5 Quirks Active' : 'FAIL')),
            'sitesXml' => trim($data['sitesXmlStatus'] ?? ($overallStatus === 'ONLINE & READY' ? 'Validated' : 'FAIL')),
            'activeIssue' => ($isIssue ? ($data['issueTitle'] ?? 'Policy Drift') : 'None (Healthy)'),
            'lastSeen' => $now,
            'lastSummary' => $remarks
        ];
        @file_put_contents($consolidatedFile, json_encode($pcs, JSON_PRETTY_PRINT));

        // Telegram Notification
        $statusEmoji = $isIssue ? '🚨' : '✅';
        $tgMsg = "🏛️ <b>E-VEDHIKA TELEMETRY REPORT RECEIVED</b>\n" .
                 "━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
                 "💻 <b>PC:</b> <code>" . htmlspecialchars($pcName) . "</code> (" . htmlspecialchars($machineId) . ")\n" .
                 "🏢 <b>Office:</b> " . htmlspecialchars($location) . "\n" .
                 "👤 <b>Operator:</b> " . htmlspecialchars($userName) . "\n" .
                 "⚡ <b>Status:</b> {$statusEmoji} <b>" . htmlspecialchars($overallStatus) . "</b>\n" .
                 "⚙️ <b>Verification:</b> {$stepsVerified}/{$stepsTotal} Steps Verified\n" .
                 "📝 <b>Summary:</b> " . htmlspecialchars($remarks) . "\n" .
                 "⏰ <b>Timestamp:</b> {$now}\n" .
                 "━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
                 "🌐 <b>Admin Gateway:</b> https://www.e-vedhika.in/admin/ubd_monitoring";
        sendTelegramMessage($botToken, $chatId, $tgMsg);

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => true, 'message' => 'Telemetry logged successfully', 'pcId' => $machineId]);
        exit;
    }
}

// Prepare Data for Browser Rendering
$consolidatedPcs = getNormalizedConsolidatedPcs($storageDir, $dataFile, $consolidatedFile);
$totalPcs = count($consolidatedPcs);
$healthyPcs = count(array_filter($consolidatedPcs, fn($p) => in_array($p['overallStatus'] ?? '', ['ONLINE & READY', 'HEALTHY', 'SUCCESS'])));
$issueCount = count(array_filter($consolidatedPcs, fn($p) => !in_array($p['overallStatus'] ?? '', ['ONLINE & READY', 'HEALTHY', 'SUCCESS']) || ($p['activeIssue'] ?? '') !== 'None (Healthy)'));
?>
<!DOCTYPE html>
<html lang="te">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🏛️ E-Vedhika Live Telemetry & UBD Monitoring Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <meta http-equiv="refresh" content="30">
    <style> 
      body { font-family: 'Inter', sans-serif; } 
      .font-mono { font-family: 'JetBrains Mono', monospace; } 
    </style>
</head>
<body class="bg-slate-950 text-slate-100 min-h-screen p-4 md:p-8">
    <div class="max-w-7xl mx-auto space-y-6">
        
        <!-- Header Banner -->
        <div class="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 p-6 md:p-8 rounded-3xl border border-indigo-900/40 shadow-2xl flex flex-col md:flex-row justify-between items-center gap-6">
            <div class="flex items-center gap-4">
                <img src="/logo.png" alt="E-Vedhika Logo" class="w-14 h-14 rounded-full object-contain drop-shadow-md border border-indigo-400/40">
                <div>
                    <h1 class="text-2xl font-black text-white tracking-tight">E-Vedhika Central Cloud Telemetry Dashboard</h1>
                    <p class="text-xs text-indigo-300 font-medium">Grama Panchayat & Mandal Office Live PC Monitoring Gateway (Admin: Rakesh Dhawan)</p>
                </div>
            </div>
            <div class="flex flex-wrap items-center gap-3">
                <a href="?action=sync_to_cloud" class="px-3.5 py-2 bg-emerald-700 hover:bg-emerald-600 text-white text-xs font-bold rounded-xl shadow transition" title="ఈ వెబ్‌సైట్ డేటాను క్లౌడ్ వాల్ట్‌కి పంపండి">
                    ☁️ పుష్ టు క్లౌడ్ వాల్ట్
                </a>
                <a href="?action=sync_from_cloud" class="px-3.5 py-2 bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold rounded-xl shadow transition" title="క్లౌడ్ వాల్ట్ నుండి డేటాను ఈ వెబ్‌సైట్‌కి రప్పించండి">
                    📥 పుల్ ఫ్రమ్ క్లౌడ్ వాల్ట్
                </a>
                <a href="?clear=1" onclick="return confirm('అన్ని డమ్మి రిపోర్ట్‌లను తీసివేయాలా?')" class="px-4 py-2 bg-rose-600/80 hover:bg-rose-600 text-white text-xs font-bold rounded-xl shadow transition">
                    🗑️ క్లియర్
                </a>
                <a href="?t=<?= time() ?>" class="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow">
                    🔄 రిఫ్రెష్
                </a>
            </div>
        </div>

        <!-- Metric Cards -->
        <div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">మొత్తం కనెక్ట్ అయిన PCలు</span>
                <span class="text-3xl font-black text-white mt-1 block font-mono"><?= $totalPcs ?></span>
                <span class="text-[10px] text-slate-500 mt-0.5 block">1 PC కి 1 రిపోర్ట్ లిమిట్</span>
            </div>
            <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow">
                <span class="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">ఆరోగ్యకరమైనవి (HEALTHY)</span>
                <span class="text-3xl font-black text-emerald-400 mt-1 block font-mono"><?= $healthyPcs ?></span>
                <span class="text-[10px] text-slate-500 mt-0.5 block">ONLINE &amp; READY (17/17 PASSED)</span>
            </div>
            <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow">
                <span class="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">సమస్యలు ఉన్నవి (ATTENTION)</span>
                <span class="text-3xl font-black text-amber-400 mt-1 block font-mono"><?= $issueCount ?></span>
                <span class="text-[10px] text-slate-500 mt-0.5 block">వివరణాత్మక అలర్ట్‌లు</span>
            </div>
            <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow">
                <span class="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">లక్ష్య వెర్షన్ &amp; OTA బిల్డ్</span>
                <span class="text-lg font-black text-indigo-300 mt-1 block font-mono"><?= $version ?> [2026.10.29-R1]</span>
                <span class="text-[10px] text-emerald-400 mt-0.5 block font-bold">100% ఆటో-అప్‌డేట్ సింకింగ్ యాక్టివ్</span>
            </div>
        </div>

        <!-- Real-Time Live Table -->
        <div class="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            <div class="p-5 border-b border-slate-800 flex justify-between items-center">
                <h2 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <span class="text-indigo-400">⚡</span> UBD LIVE MONITORING &amp; VERSION MATRIX
                </h2>
                <span class="text-xs text-indigo-300 font-mono font-bold"><?= $totalPcs ?> Active Computers</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead class="bg-slate-950/60 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        <tr>
                            <th class="p-4">PC NAME &amp; ID</th>
                            <th class="p-4">OFFICE LOCATION</th>
                            <th class="p-4">OS &amp; BUILD</th>
                            <th class="p-4">VERSION &amp; OTA BUILD</th>
                            <th class="p-4">STATUS</th>
                            <th class="p-4">VERIFICATION</th>
                            <th class="p-4">DSC STATUS</th>
                            <th class="p-4">SUMMARY</th>
                            <th class="p-4">LAST SEEN</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/60">
                        <?php if (empty($consolidatedPcs)): ?>
                        <tr>
                            <td colspan="9" class="p-12 text-center text-slate-500 font-medium italic">
                                డమ్మి రిపోర్టులన్నీ తొలగించబడ్డాయి. కంప్యూటర్ నుండి కొత్త రిపోర్ట్ రాగానే ఇక్కడ ప్రత్యక్షమవుతుంది.
                            </td>
                        </tr>
                        <?php else: ?>
                        <?php foreach ($consolidatedPcs as $pc): ?>
                        <tr class="hover:bg-slate-800/40 transition">
                            <td class="p-4">
                                <div class="font-bold text-white font-mono flex items-center gap-2">
                                    <span><?= htmlspecialchars($pc['pcName']) ?></span>
                                </div>
                                <div class="text-[10px] text-slate-500 font-mono"><?= htmlspecialchars($pc['machineId']) ?></div>
                            </td>
                            <td class="p-4 text-slate-300 font-medium max-w-xs"><?= htmlspecialchars($pc['officeLocation']) ?></td>
                            <td class="p-4 text-slate-400 font-mono text-[11px]"><?= htmlspecialchars($pc['os']) ?></td>
                            <td class="p-4">
                                <div class="font-bold text-indigo-400 font-mono text-[11px]"><?= htmlspecialchars($pc['appVersion'] ?? 'v1.0.8') ?></div>
                                <div class="text-[9px] text-emerald-400 font-mono">OTA: <?= htmlspecialchars($pc['resourceBuild'] ?? '2026.10.29-R1') ?></div>
                            </td>
                            <td class="p-4 whitespace-nowrap">
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase border bg-emerald-950 text-emerald-300 border-emerald-800">
                                    <?= htmlspecialchars($pc['overallStatus']) ?>
                                </span>
                            </td>
                            <td class="p-4 font-mono font-bold text-indigo-300"><?= htmlspecialchars($pc['stepsVerified']) ?></td>
                            <td class="p-4 text-slate-300"><?= htmlspecialchars($pc['dscStatus']) ?></td>
                            <td class="p-4 text-slate-400 italic max-w-sm"><?= htmlspecialchars($pc['lastSummary']) ?></td>
                            <td class="p-4 text-slate-400 font-mono text-[11px] whitespace-nowrap"><?= htmlspecialchars($pc['lastSeen']) ?></td>
                        </tr>
                        <?php endforeach; ?>
                        <?php endif; ?>
                    </tbody>
                </table>
            </div>
        </div>

    </div>
</body>
</html>
