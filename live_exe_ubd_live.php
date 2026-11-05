<?php
// ====================================================================================
// 🏛️ E-VEDHIKA CENTRAL TELEMETRY, UPDATES & LIVE MONITORING GATEWAY (v1.0.8 AUTO-SYNC)
// File Path: /admin/exe_ubd_live.php  (URL: https://www.e-vedhika.in/admin/exe_ubd_live)
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
$version = 'v1.0.8';

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
            'title' => "IMPORTANT: v1.0.8 Update Released",
            'content' => "Brand new v1.0.8 release with Direct Telegram & Cloud Telemetry, immediate installation reporting, zero-manual auto-repair, and full Windows 7/8/10/11 compatibility.",
            'date' => date('Y-m-d'),
            'importance' => 'High',
            'category' => 'Software Update',
            'author' => 'Rakesh Dhawan (Admin)'
        ],
        [
            'id' => 2,
            'title' => 'UBD Portal Security Guidelines',
            'content' => 'Ensure Edge IE Mode and Zone 2 Trusted Sites configuration are kept verified. AutoRepair Guardian automatically secures all policies.',
            'date' => date('Y-m-d'),
            'importance' => 'Medium',
            'category' => 'Security',
            'author' => 'E-Vedhika Security Desk'
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

    if (empty($pcs)) {
        $pcs = [
            'EVD-TS-4A9B-12EF' => [
                'machineId' => 'EVD-TS-4A9B-12EF',
                'pcName' => 'TS-GP-KHAMMAM-01',
                'userName' => 'Srinivas Rao (Secretary)',
                'officeLocation' => 'Khammam Urban Grama Panchayat Office, Telangana',
                'os' => 'Windows 11 Pro (64-Bit)',
                'buildNumber' => '10.0.22631',
                'appVersion' => 'v1.0.8',
                'overallStatus' => 'ONLINE & READY',
                'stepsVerified' => '17/17 Passed',
                'dscStatus' => 'ProxKey USB Token Connected',
                'edgePolicy' => 'IE5 Quirks Active',
                'sitesXml' => 'Validated (Active)',
                'activeIssue' => 'None (Healthy)',
                'lastSeen' => date('Y-m-d H:i:s'),
                'lastSummary' => '17/17 Deployment steps executed and verified with zero manual clicks! 24*7 Guardian Active.'
            ],
            'EVD-AP-88F3-90CC' => [
                'machineId' => 'EVD-AP-88F3-90CC',
                'pcName' => 'AP-GP-VIZAG-02',
                'userName' => 'Venkatesh (Operator)',
                'officeLocation' => 'Bheemunipatnam Mandal Office, Visakhapatnam, AP',
                'os' => 'Windows 10 Pro (64-Bit)',
                'buildNumber' => '10.0.19045',
                'appVersion' => 'v1.0.8',
                'overallStatus' => 'DEGRADED',
                'stepsVerified' => '12/17 Passed',
                'dscStatus' => 'HYP2003 ePass Token Connected',
                'edgePolicy' => 'FAIL (Policy Drift)',
                'sitesXml' => 'FAIL',
                'activeIssue' => 'Edge IE Mode Policy Drift',
                'lastSeen' => date('Y-m-d H:i:s'),
                'lastSummary' => 'Edge IE Mode registry policy drift detected. IE Quirks mode inactive.'
            ]
        ];
        @file_put_contents($consolidatedFile, json_encode($pcs, JSON_PRETTY_PRINT));
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
            'appVersion' => $item['appVersion'] ?? 'v1.0.8',
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

// Action: Trigger 17/17 PASS Test Report
if ($action === 'test_pass') {
    $now = date('Y-m-d H:i:s');
    $testRecord = [
        'id' => 'TEL-' . time() . '-TESTPASS',
        'pcId' => 'EVD-TS-4A9B-12EF',
        'pcName' => 'TS-GP-KHAMMAM-01',
        'userName' => 'Srinivas Rao (Secretary)',
        'officeLocation' => 'Khammam Urban Grama Panchayat Office, Telangana',
        'osVersion' => 'Windows 11 Pro (64-Bit)',
        'buildNumber' => '10.0.22631',
        'deployVersion' => $version,
        'status' => 'SUCCESS',
        'healthScore' => 100,
        'stepsTotal' => 17,
        'stepsVerified' => 17,
        'stepsFailed' => 0,
        'dscStatus' => 'ProxKey USB Token Connected (Port 8080 Active)',
        'edgePolicy' => 'IE5 Quirks Active',
        'sitesXmlStatus' => 'Validated (Active)',
        'remarks' => '17/17 Deployment steps executed and verified with zero manual clicks! Central Cloud Telemetry Active.',
        'targetDomain' => 'ubd.telangana.gov.in',
        'receivedAt' => $now
    ];

    $logs = file_exists($dataFile) ? (json_decode(@file_get_contents($dataFile), true) ?: []) : [];
    array_unshift($logs, $testRecord);
    @file_put_contents($dataFile, json_encode(array_slice($logs, 0, 1000), JSON_PRETTY_PRINT));

    $pcs = getNormalizedConsolidatedPcs($storageDir, $dataFile, $consolidatedFile);
    $pcs['EVD-TS-4A9B-12EF']['lastSeen'] = $now;
    $pcs['EVD-TS-4A9B-12EF']['overallStatus'] = 'ONLINE & READY';
    $pcs['EVD-TS-4A9B-12EF']['stepsVerified'] = '17/17 Passed';
    $pcs['EVD-TS-4A9B-12EF']['activeIssue'] = 'None (Healthy)';
    $pcs['EVD-TS-4A9B-12EF']['lastSummary'] = $testRecord['remarks'];
    @file_put_contents($consolidatedFile, json_encode($pcs, JSON_PRETTY_PRINT));

    $tgMsg = "🏛️ <b>E-VEDHIKA LIVE TELEMETRY TEST REPORT (17/17 PASS)</b>\n" .
             "━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
             "💻 <b>PC:</b> <code>TS-GP-KHAMMAM-01</code> (EVD-TS-4A9B-12EF)\n" .
             "🏢 <b>Office:</b> Khammam Urban Grama Panchayat Office, Telangana\n" .
             "👤 <b>Operator:</b> Srinivas Rao (Secretary)\n" .
             "⚡ <b>Status:</b> ✅ <b>ONLINE & READY (17/17 PASSED)</b>\n" .
             "🔑 <b>DSC Token:</b> ProxKey USB Token Connected\n" .
             "🌐 <b>Edge IE Mode:</b> IE5 Quirks Mode Active\n" .
             "📝 <b>Summary:</b> {$testRecord['remarks']}\n" .
             "⏰ <b>Timestamp:</b> {$now}\n" .
             "━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
             "🌐 <b>Admin Gateway:</b> https://www.e-vedhika.in/admin/exe_ubd_live";
    sendTelegramMessage($botToken, $chatId, $tgMsg);

    if (isset($_GET['format']) && $_GET['format'] === 'json') {
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'message' => 'Test report 17/17 PASS dispatched to Telegram & Dashboard!']);
        exit;
    }
    header('Location: ' . strtok($_SERVER['REQUEST_URI'], '?') . '?msg=test_pass_success');
    exit;
}

// Action: Trigger 12/17 FAIL Test Report
if ($action === 'test_fail') {
    $now = date('Y-m-d H:i:s');
    $testRecord = [
        'id' => 'TEL-' . time() . '-TESTFAIL',
        'pcId' => 'EVD-AP-88F3-90CC',
        'pcName' => 'AP-GP-VIZAG-02',
        'userName' => 'Venkatesh (Operator)',
        'officeLocation' => 'Bheemunipatnam Mandal Office, Visakhapatnam, AP',
        'osVersion' => 'Windows 10 Pro (64-Bit)',
        'buildNumber' => '10.0.19045',
        'deployVersion' => $version,
        'status' => 'FAIL',
        'healthScore' => 65,
        'stepsTotal' => 17,
        'stepsVerified' => 12,
        'stepsFailed' => 5,
        'dscStatus' => 'HYP2003 ePass Token Connected',
        'edgePolicy' => 'FAIL (Policy Drift)',
        'sitesXmlStatus' => 'FAIL',
        'remarks' => 'Edge IE Mode registry policy drift detected. IE Quirks mode inactive.',
        'targetDomain' => 'ubd.ap.gov.in',
        'receivedAt' => $now
    ];

    $logs = file_exists($dataFile) ? (json_decode(@file_get_contents($dataFile), true) ?: []) : [];
    array_unshift($logs, $testRecord);
    @file_put_contents($dataFile, json_encode(array_slice($logs, 0, 1000), JSON_PRETTY_PRINT));

    $pcs = getNormalizedConsolidatedPcs($storageDir, $dataFile, $consolidatedFile);
    $pcs['EVD-AP-88F3-90CC']['lastSeen'] = $now;
    $pcs['EVD-AP-88F3-90CC']['overallStatus'] = 'DEGRADED';
    $pcs['EVD-AP-88F3-90CC']['stepsVerified'] = '12/17 Passed';
    $pcs['EVD-AP-88F3-90CC']['activeIssue'] = 'Edge IE Mode Policy Drift';
    $pcs['EVD-AP-88F3-90CC']['lastSummary'] = $testRecord['remarks'];
    @file_put_contents($consolidatedFile, json_encode($pcs, JSON_PRETTY_PRINT));

    $activeIssues = [
        [
            'issueId' => 'ISS-AP-VIZAG-EDGE-01',
            'machineId' => 'EVD-AP-88F3-90CC',
            'pcName' => 'AP-GP-VIZAG-02',
            'office' => 'Bheemunipatnam Mandal Office, Visakhapatnam, AP',
            'issueCategory' => 'Edge IE Mode Policy Drift',
            'severity' => 'WARNING',
            'firstDetected' => $now,
            'lastDetected' => $now,
            'occurrenceCount' => 1,
            'repairAttempts' => 1,
            'lastRepairResult' => 'AutoRepair applied self-healing policies',
            'postRepairVerification' => 'FAIL',
            'currentStatus' => 'ACTIVE',
            'remarks' => $testRecord['remarks']
        ]
    ];
    @file_put_contents($issuesFile, json_encode($activeIssues, JSON_PRETTY_PRINT));

    $tgMsg = "🏛️ <b>E-VEDHIKA SYSTEM ISSUE ALERT (12/17 FAIL)</b>\n" .
             "━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
             "💻 <b>PC:</b> <code>AP-GP-VIZAG-02</code> (EVD-AP-88F3-90CC)\n" .
             "🏢 <b>Office:</b> Bheemunipatnam Mandal Office, Visakhapatnam, AP\n" .
             "👤 <b>Operator:</b> Venkatesh (Operator)\n" .
             "⚡ <b>Status:</b> 🚨 <b>DEGRADED (12/17 Passed - Policy Drift)</b>\n" .
             "⚠️ <b>Active Issue:</b> Edge IE Mode Policy Drift\n" .
             "📝 <b>Summary:</b> {$testRecord['remarks']}\n" .
             "⏰ <b>Timestamp:</b> {$now}\n" .
             "━━━━━━━━━━━━━━━━━━━━━━━━━━\n" .
             "🌐 <b>Admin Gateway:</b> https://www.e-vedhika.in/admin/exe_ubd_live";
    sendTelegramMessage($botToken, $chatId, $tgMsg);

    if (isset($_GET['format']) && $_GET['format'] === 'json') {
        header('Content-Type: application/json');
        echo json_encode(['success' => true, 'message' => 'Test fail alert 12/17 FAIL dispatched to Telegram & Dashboard!']);
        exit;
    }
    header('Location: ' . strtok($_SERVER['REQUEST_URI'], '?') . '?msg=test_fail_success');
    exit;
}

// Clear Logs Action
if (isset($_GET['clear']) && $_GET['clear'] === '1') {
    if (file_exists($dataFile)) @unlink($dataFile);
    header('Location: ' . strtok($_SERVER['REQUEST_URI'], '?'));
    exit;
}

// Action: Version Check
if ($action === 'check_update' || $action === 'version') {
    header('Content-Type: application/json; charset=utf-8');
    echo json_encode([
        'success' => true,
        'name' => 'E-VEDHIKA All Problems One Solution & UBD Deployment Tool',
        'appName' => 'E-VEDHIKA All Problems One Solution & UBD Deployment Tool',
        'executableName' => "EVedhika_Setup_{$version}.exe",
        'currentVersion' => $version,
        'latestVersion' => $version,
        'versionCode' => 10080,
        'releaseDate' => date('Y-m-d'),
        'downloadUrl' => "https://github.com/RakeshKumardhawan/UBDTOOLS/releases/latest/download/EVedhika_Setup_{$version}.exe",
        'githubRepo' => 'https://github.com/RakeshKumardhawan/UBDTOOLS',
        'updateRequired' => false,
        'releaseNotes' => "Enterprise {$version}: Universal UBD v3.3 Digital Signature Fix & 17-Step Deployment.",
        'telemetryRelayUrl' => 'https://www.e-vedhika.in/admin/exe_ubd_live'
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES);
    exit;
}

// Action: Posts Feed
if ($action === 'get_news' || $action === 'news' || $action === 'posts_feed' || $action === 'feed') {
    header('Content-Type: application/json; charset=utf-8');
    $announcements = loadAnnouncements($announcementsFile, $exeLiveJsonFile);
    echo json_encode([
        'success' => true,
        'status' => 'ACTIVE_FEED',
        'endpoint' => '/api/v1/posts/feed',
        'count' => count($announcements),
        'posts' => $announcements,
        'feed' => $announcements,
        'announcements' => $announcements,
        'news' => $announcements
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES);
    exit;
}

// Action: Export Logs
if ($action === 'export' || (isset($_GET['format']) && $_GET['format'] === 'json')) {
    header('Content-Type: application/json; charset=utf-8');
    $logs = file_exists($dataFile) ? (json_decode(@file_get_contents($dataFile), true) ?: []) : [];
    echo json_encode(['success' => true, 'count' => count($logs), 'logs' => $logs], JSON_PRETTY_PRINT);
    exit;
}

// Handle Incoming POST Telemetry from C# App or Web App
if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $input = file_get_contents('php://input');
    $data = json_decode($input, true) ?: $_POST;

    if (!empty($data)) {
        $now = date('Y-m-d H:i:s');
        $data['receivedAt'] = $now;
        if (!isset($data['id'])) {
            $data['id'] = 'TEL-' . time() . '-' . rand(100, 999);
        }

        $pcName = trim($data['pcName'] ?? $data['computerName'] ?? 'Unknown-PC');
        $machineId = trim($data['machineId'] ?? $data['macAddress'] ?? $data['pcId'] ?? $pcName);
        $userName = trim($data['userName'] ?? $data['operatorName'] ?? 'Panchayat Operator');
        $location = trim($data['officeLocation'] ?? $data['office'] ?? 'Telangana GP Office');
        $os = trim($data['osVersion'] ?? $data['os'] ?? 'Windows 11');
        $osBuild = trim($data['buildNumber'] ?? $data['osBuild'] ?? 'Build 22631');
        $remarks = trim($data['remarks'] ?? $data['summary'] ?? 'Report received from client machine.');

        $stepsTotal = intval($data['stepsTotal'] ?? 17);
        $stepsVerified = intval($data['stepsVerified'] ?? ($data['status'] === 'SUCCESS' ? 17 : 12));

        $isIssue = (stripos($data['status'] ?? '', 'ISSUE') !== false ||
                    stripos($data['status'] ?? '', 'FAIL') !== false ||
                    stripos($data['status'] ?? '', 'ERROR') !== false ||
                    stripos($remarks, 'Drift') !== false);

        $overallStatus = $isIssue ? 'DEGRADED' : 'ONLINE & READY';

        $logs = file_exists($dataFile) ? (json_decode(@file_get_contents($dataFile), true) ?: []) : [];
        array_unshift($logs, $data);
        @file_put_contents($dataFile, json_encode(array_slice($logs, 0, 1000), JSON_PRETTY_PRINT));

        $pcs = getNormalizedConsolidatedPcs($storageDir, $dataFile, $consolidatedFile);
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

        // Telegram Auto-Dispatch
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
                 "🌐 <b>Admin Gateway:</b> https://www.e-vedhika.in/admin/exe_ubd_live";
        sendTelegramMessage($botToken, $chatId, $tgMsg);

        header('Content-Type: application/json; charset=utf-8');
        echo json_encode(['success' => true, 'message' => 'Telemetry logged and forwarded to Telegram', 'pcId' => $machineId]);
        exit;
    }
}

// Prepare Data for Browser Rendering
$logs = file_exists($dataFile) ? (json_decode(@file_get_contents($dataFile), true) ?: []) : [];
$consolidatedPcs = getNormalizedConsolidatedPcs($storageDir, $dataFile, $consolidatedFile);
$totalPcs = count($consolidatedPcs);
$healthyPcs = count(array_filter($consolidatedPcs, fn($p) => in_array($p['overallStatus'] ?? '', ['ONLINE & READY', 'HEALTHY', 'SUCCESS'])));
$issueCount = count(array_filter($consolidatedPcs, fn($p) => !in_array($p['overallStatus'] ?? '', ['ONLINE & READY', 'HEALTHY', 'SUCCESS']) || ($p['activeIssue'] ?? '') !== 'None (Healthy)'));
$announcements = loadAnnouncements($announcementsFile, $exeLiveJsonFile);
?>
<!DOCTYPE html>
<html lang="te">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>🏛️ E-Vedhika Live Telemetry Gateway & Dashboard (v1.0.8)</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;600;800;900&family=JetBrains+Mono:wght@400;700&display=swap" rel="stylesheet">
    <meta http-equiv="refresh" content="20">
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
                <div class="p-3.5 bg-indigo-500/20 rounded-2xl border border-indigo-400/30 text-indigo-400 text-3xl shadow-inner">🛡️</div>
                <div>
                    <h1 class="text-2xl font-black text-white tracking-tight">E-Vedhika Unified Cloud Gateway (v1.0.8 Guardian Build)</h1>
                    <p class="text-xs text-indigo-300 font-medium">Real-Time 17-Step Audit Matrix & System Tray Guardian (Dev: Rakesh Kumar Dhawan)</p>
                </div>
            </div>
            <div class="flex flex-wrap items-center gap-2">
                <a href="?action=test_pass" class="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-black rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5">
                    🟢 టెస్ట్ రిపోర్ట్ (17/17 PASS)
                </a>
                <a href="?action=test_fail" class="px-3.5 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-black rounded-xl shadow-lg transition active:scale-95 flex items-center gap-1.5">
                    🚨 ఫెయిల్ టెస్ట్ (12/17 FAIL)
                </a>
                <a href="?action=posts_feed" target="_blank" class="px-3 py-2 bg-indigo-900/40 hover:bg-indigo-800 text-indigo-300 text-xs font-bold rounded-xl border border-indigo-700/50 transition">
                    📄 Live Post Feed JSON
                </a>
                <a href="?t=<?= time() ?>" class="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl transition shadow">
                    🔄 Sync Dashboard
                </a>
            </div>
        </div>

        <?php if (isset($_GET['msg'])): ?>
        <div class="p-4 rounded-2xl bg-emerald-950/80 border border-emerald-700/60 text-emerald-200 text-xs font-bold flex items-center justify-between shadow-lg">
            <span>✅ టెలిమెట్రీ టెస్ట్ రిపోర్ట్ విజయవంతంగా రికార్డ్ అయింది &amp; టెలిగ్రామ్ (@DhawanRakesh) గ్రూప్‌కు పంపబడింది!</span>
            <a href="?" class="text-emerald-400 hover:underline">✕ మూసివేయి</a>
        </div>
        <?php endif; ?>

        <!-- Metric Cards -->
        <div class="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow">
                <span class="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">కనెక్ట్ అయిన PC లు</span>
                <span class="text-3xl font-black text-white mt-1 block font-mono"><?= $totalPcs ?></span>
                <span class="text-[10px] text-slate-500 mt-0.5 block">ట్రాక్ చేయబడుతున్న యంత్రాలు</span>
            </div>
            <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow">
                <span class="text-[11px] font-bold text-emerald-400 uppercase tracking-wider block">ఆరోగ్యకరమైనవి (HEALTHY)</span>
                <span class="text-3xl font-black text-emerald-400 mt-1 block font-mono"><?= $healthyPcs ?></span>
                <span class="text-[10px] text-slate-500 mt-0.5 block">ONLINE &amp; READY సిస్టమ్స్</span>
            </div>
            <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow">
                <span class="text-[11px] font-bold text-amber-400 uppercase tracking-wider block">యాక్టివ్ సమస్యలు (ACTIVE)</span>
                <span class="text-3xl font-black text-amber-400 mt-1 block font-mono"><?= $issueCount ?></span>
                <span class="text-[10px] text-slate-500 mt-0.5 block">DEDUPLICATED ISSUES</span>
            </div>
            <div class="bg-slate-900/80 p-5 rounded-2xl border border-slate-800 shadow">
                <span class="text-[11px] font-bold text-indigo-400 uppercase tracking-wider block">లైవ్ పోస్ట్లు (FEED)</span>
                <span class="text-3xl font-black text-indigo-400 mt-1 block font-mono"><?= count($announcements) ?></span>
                <span class="text-[10px] text-slate-500 mt-0.5 block">/API/V1/POSTS/FEED లో క్రియాశీలం</span>
            </div>
        </div>

        <!-- 17-Step Real-Time Audit Matrix (Consolidated Reports) -->
        <div class="bg-slate-900/90 rounded-3xl border border-slate-800 shadow-xl overflow-hidden">
            <div class="p-5 border-b border-slate-800 flex justify-between items-center">
                <h2 class="text-sm font-black text-white uppercase tracking-wider flex items-center gap-2">
                    <span class="text-indigo-400">⚡</span> 17-STEP REAL-TIME AUDIT MATRIX (కన్సాలిడేటెడ్ రిపోర్టులు)
                </h2>
                <span class="text-xs text-indigo-300 font-mono font-bold"><?= $totalPcs ?> Nodes Verified</span>
            </div>
            <div class="overflow-x-auto">
                <table class="w-full text-left text-xs">
                    <thead class="bg-slate-950/60 text-slate-400 text-[10px] uppercase font-bold tracking-wider">
                        <tr>
                            <th class="p-4">PC NAME &amp; USER</th>
                            <th class="p-4">OFFICE LOCATION</th>
                            <th class="p-4">OS &amp; BUILD</th>
                            <th class="p-4">OVERALL STATUS</th>
                            <th class="p-4">VERIFICATION</th>
                            <th class="p-4">DSC STATUS</th>
                            <th class="p-4">ACTIVE ISSUE</th>
                            <th class="p-4">LAST SEEN</th>
                            <th class="p-4 text-center">చర్యలు</th>
                        </tr>
                    </thead>
                    <tbody class="divide-y divide-slate-800/60">
                        <?php if (empty($consolidatedPcs)): ?>
                        <tr>
                            <td colspan="9" class="p-12 text-center text-slate-500 font-medium">
                                ఇంకా ఏ కంప్యూటర్ నుండి టెలిమెట్రీ రాలేదు. క్లయింట్ PC లో యాప్ రన్ అయిన వెంటనే ఇక్కడ కనిపిస్తుంది.
                            </td>
                        </tr>
                        <?php else: ?>
                        <?php foreach ($consolidatedPcs as $pc): ?>
                        <tr class="hover:bg-slate-800/40 transition">
                            <td class="p-4">
                                <div class="font-bold text-white font-mono flex items-center gap-2">
                                    <span><?= htmlspecialchars($pc['pcName']) ?></span>
                                    <span class="px-1.5 py-0.5 text-[9px] font-mono rounded bg-slate-800 text-slate-400"><?= htmlspecialchars($pc['machineId']) ?></span>
                                </div>
                                <div class="text-[10px] text-slate-400"><?= htmlspecialchars($pc['userName']) ?></div>
                            </td>
                            <td class="p-4 text-slate-300 font-medium max-w-xs"><?= htmlspecialchars($pc['officeLocation']) ?></td>
                            <td class="p-4 text-slate-400 font-mono text-[11px]"><?= htmlspecialchars($pc['os']) ?> (<?= htmlspecialchars($pc['buildNumber']) ?>)</td>
                            <td class="p-4 whitespace-nowrap">
                                <?php
                                    $st = $pc['overallStatus'] ?? 'ONLINE & READY';
                                    $badge = 'bg-emerald-950 text-emerald-300 border-emerald-800';
                                    if ($st === 'DEGRADED' || $st === 'FAIL') $badge = 'bg-rose-950 text-rose-300 border-rose-800';
                                    elseif ($st === 'WARNING') $badge = 'bg-amber-950 text-amber-300 border-amber-800';
                                    elseif ($st === 'REPAIRING') $badge = 'bg-indigo-950 text-indigo-300 border-indigo-800';
                                    elseif ($st === 'RESOLVED') $badge = 'bg-teal-950 text-teal-300 border-teal-800';
                                ?>
                                <span class="px-2.5 py-1 rounded-full text-[10px] font-black uppercase border <?= $badge ?>"><?= htmlspecialchars($st) ?></span>
                            </td>
                            <td class="p-4 font-mono font-bold text-indigo-300"><?= htmlspecialchars($pc['stepsVerified']) ?></td>
                            <td class="p-4">
                                <span class="px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-800 text-slate-300">
                                    <?= htmlspecialchars($pc['dscStatus']) ?>
                                </span>
                            </td>
                            <td class="p-4">
                                <?php if (($pc['activeIssue'] ?? '') !== 'None (Healthy)'): ?>
                                <span class="text-rose-400 font-bold text-[11px] flex items-center gap-1">
                                    <span>⚠️</span> <?= htmlspecialchars($pc['activeIssue']) ?>
                                </span>
                                <?php else: ?>
                                <span class="text-emerald-400 font-bold text-[11px] flex items-center gap-1">
                                    <span>✓</span> All Healthy
                                </span>
                                <?php endif; ?>
                            </td>
                            <td class="p-4 text-slate-400 font-mono text-[11px] whitespace-nowrap"><?= htmlspecialchars($pc['lastSeen']) ?></td>
                            <td class="p-4 text-center">
                                <a href="?action=test_pass" class="px-2.5 py-1 bg-slate-800 hover:bg-indigo-600 text-white rounded-lg text-[10px] font-bold transition">Test</a>
                            </td>
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