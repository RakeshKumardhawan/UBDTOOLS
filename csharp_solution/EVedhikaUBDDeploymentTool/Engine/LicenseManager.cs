using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Drawing;
using System.Globalization;
using System.IO;
using System.Net;
using System.Text;
using System.Text.RegularExpressions;
using System.Windows.Forms;
using EVedhikaUBDDeploymentTool.Helpers;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public class LicenseStatusResult
    {
        public string Mode = "FREE_FOR_ALL";
        public double MonthlyPriceInr = 10;
        public int DurationDays = 30;
        public string UpiId = "";
        public string PaymentLinkUrl = "";
        public string PaymentNote = "Currently Free for all Operators (Future Plan: ₹10/Month).";
        public bool IsAllowed = true;
        public string SummaryText = "Free Early Access Active (Future ₹10/Mo Plan)";
        public string ValidUntilIso = "";
    }

    public static class LicenseManager
    {
        private const string FirestoreApiKeyParam = "?key=AIzaSyC_oLAFLdpErutmSmR9bQnm0ETq5hd9qnU";

        public static LicenseStatusResult CheckRemoteLicenseStatus()
        {
            LicenseStatusResult res = new LicenseStatusResult();
            try
            {
                OSCompatibilityEngine.ConfigureResilientTls();
                string policyUrl = $"https://firestore.googleapis.com/v1/{Logger.FirestoreDocBase}/app_settings/licensing{FirestoreApiKeyParam}";
                string policyJson = DownloadJsonSafe(policyUrl);

                if (string.IsNullOrEmpty(policyJson) || policyJson.IndexOf("\"error\"", StringComparison.OrdinalIgnoreCase) >= 0)
                {
                    res.Mode = "FREE_FOR_ALL";
                    res.IsAllowed = true;
                    res.SummaryText = "Free Early Access Active (Future Plan: ₹10 / Month)";
                    return res;
                }

                string mode = ExtractFirestoreString(policyJson, "mode");
                if (!string.IsNullOrEmpty(mode)) res.Mode = mode;

                double price = ExtractFirestoreNumber(policyJson, "monthlyPriceInr", 10);
                if (price >= 0) res.MonthlyPriceInr = price;

                int days = (int)ExtractFirestoreNumber(policyJson, "durationDays", 30);
                if (days >= 1) res.DurationDays = days;

                string upi = ExtractFirestoreString(policyJson, "upiId");
                if (!string.IsNullOrEmpty(upi)) res.UpiId = upi;

                string payLink = ExtractFirestoreString(policyJson, "paymentLinkUrl");
                if (!string.IsNullOrEmpty(payLink)) res.PaymentLinkUrl = payLink;

                string note = ExtractFirestoreString(policyJson, "paymentNote");
                if (!string.IsNullOrEmpty(note)) res.PaymentNote = note;

                if (string.Equals(res.Mode, "FREE_FOR_ALL", StringComparison.OrdinalIgnoreCase))
                {
                    res.IsAllowed = true;
                    res.SummaryText = $"Free Early Access Active (Planned Future Rate: ₹{res.MonthlyPriceInr:0}/Month)";
                    return res;
                }

                // PAID_MONTHLY is enabled by Admin -> validate pc_licenses/{pcId}
                string pcId = Logger.SanitizeFirestoreId(Logger.GetUniqueMachineId(), "EVD-PC");
                string pcUrl = $"https://firestore.googleapis.com/v1/{Logger.FirestoreDocBase}/pc_licenses/{Uri.EscapeDataString(pcId)}{FirestoreApiKeyParam}";
                string pcJson = DownloadJsonSafe(pcUrl);

                if (string.IsNullOrEmpty(pcJson) || pcJson.IndexOf("\"fields\"", StringComparison.OrdinalIgnoreCase) < 0)
                {
                    res.IsAllowed = false;
                    res.SummaryText = $"Monthly Subscription Required (₹{res.MonthlyPriceInr:0} / {res.DurationDays} Days)";
                    return res;
                }

                string pcStatus = ExtractFirestoreString(pcJson, "status");
                string validUntilIso = ExtractFirestoreString(pcJson, "validUntilIso");
                res.ValidUntilIso = validUntilIso;

                DateTime expiryUtc;
                bool validDate = DateTime.TryParse(
                    validUntilIso,
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal,
                    out expiryUtc);

                if (string.Equals(pcStatus, "ACTIVE", StringComparison.OrdinalIgnoreCase) && validDate && expiryUtc > DateTime.UtcNow)
                {
                    int daysLeft = Math.Max(1, (int)Math.Ceiling((expiryUtc - DateTime.UtcNow).TotalDays));
                    res.IsAllowed = true;
                    res.SummaryText = $"Active Subscription (₹{res.MonthlyPriceInr:0}/Mo • {daysLeft} Days Left)";
                }
                else
                {
                    res.IsAllowed = false;
                    res.SummaryText = $"Subscription Expired/Inactive (Renew ₹{res.MonthlyPriceInr:0} / {res.DurationDays} Days)";
                }
            }
            catch
            {
                // Fail-open in FREE_FOR_ALL offline scenarios so legitimate free users are never locked out by network glitches
                res.IsAllowed = true;
                res.SummaryText = "Free Early Access Active (Offline Mode)";
            }

            return res;
        }

        public static bool EnsureAllowedOrShowSubscriptionDialog(Form owner)
        {
            LicenseStatusResult status = CheckRemoteLicenseStatus();
            if (status.IsAllowed) return true;

            ShowSubscriptionModal(owner, status);
            LicenseStatusResult recheck = CheckRemoteLicenseStatus();
            return recheck.IsAllowed;
        }

        public static string NormalizeUtr(string rawUtr)
        {
            if (string.IsNullOrWhiteSpace(rawUtr)) return "";
            string clean = Regex.Replace(rawUtr.Trim().ToUpperInvariant(), @"[^A-Z0-9]", "");
            return clean;
        }

        public static bool SubmitUniquePaymentUtrClaim(string rawUtr, LicenseStatusResult status, out string resultMessage)
        {
            string cleanUtr = NormalizeUtr(rawUtr);
            if (cleanUtr.Length < 8 || cleanUtr.Length > 36)
            {
                resultMessage = "దయచేసి సరైన 12-అంకెల UPI UTR / Transaction ID (కనీసం 8–36 అక్షరాలు/అంకెలు) ఎంటర్ చేయండి.";
                return false;
            }

            string claimId = "UTR-" + cleanUtr;
            string pcId = Logger.SanitizeFirestoreId(Logger.GetUniqueMachineId(), "EVD-PC");
            string pcName = string.IsNullOrEmpty(Environment.MachineName) ? "GP-OFFICE-PC" : Environment.MachineName;
            string state = SystemInfoHelper.GetConfiguredState("Telangana");
            string district = SystemInfoHelper.GetConfiguredDistrict(state);
            string opName = SystemInfoHelper.GetConfiguredOperatorName();
            double amount = status != null && status.MonthlyPriceInr >= 1 ? status.MonthlyPriceInr : 10;

            string payload =
                "{\"writes\":[{\"update\":{" +
                $"\"name\":\"{Logger.FirestoreDocBase}/payment_claims/{EscapeJson(claimId)}\"," +
                "\"fields\":{" +
                $"\"claimId\":{{\"stringValue\":\"{EscapeJson(claimId)}\"}}," +
                $"\"utrNumber\":{{\"stringValue\":\"{EscapeJson(cleanUtr)}\"}}," +
                $"\"pcId\":{{\"stringValue\":\"{EscapeJson(pcId)}\"}}," +
                $"\"pcName\":{{\"stringValue\":\"{EscapeJson(Truncate(pcName, 128))}\"}}," +
                $"\"operatorName\":{{\"stringValue\":\"{EscapeJson(Truncate(opName, 128))}\"}}," +
                $"\"district\":{{\"stringValue\":\"{EscapeJson(Truncate(district, 100))}\"}}," +
                $"\"state\":{{\"stringValue\":\"{EscapeJson(Truncate(state, 64))}\"}}," +
                $"\"amountInr\":{{\"integerValue\":\"{Math.Round(amount)}\"}}," +
                "\"status\":{\"stringValue\":\"PENDING\"}," +
                $"\"note\":{{\"stringValue\":\"Submitted from desktop v1.1.0 for ₹{Math.Round(amount)} / {status?.DurationDays ?? 30}d verification\"}}" +
                "}}," +
                "\"currentDocument\":{\"exists\":false}," +
                "\"updateTransforms\":[{\"fieldPath\":\"createdAt\",\"setToServerValue\":\"REQUEST_TIME\"}]" +
                "}]}";

            try
            {
                OSCompatibilityEngine.ConfigureResilientTls();
                using (WebClient wc = new WebClient())
                {
                    wc.Encoding = Encoding.UTF8;
                    wc.Headers[HttpRequestHeader.ContentType] = "application/json";
                    wc.Headers[HttpRequestHeader.UserAgent] = "EVedhikaUBDTool/1.1.0";
                    wc.UploadString(Logger.FirestoreCommitUrl, "POST", payload);
                }

                // Notify Central Admin Hub & Telegram immediately so Admin sees which PC paid & UTR
                try
                {
                    var claimReport = new Dictionary<string, string>
                    {
                        { "reportId", "PAY-" + DateTime.UtcNow.ToString("yyyyMMddHHmmss") + "-" + cleanUtr.Substring(0, Math.Min(6, cleanUtr.Length)) },
                        { "eventType", "PAYMENT_CLAIM" },
                        { "pcId", pcId },
                        { "pcName", pcName },
                        { "userName", opName },
                        { "district", district },
                        { "state", state },
                        { "officeLocation", $"{district} ({state})" },
                        { "status", "PENDING" },
                        { "remarks", $"💳 UPI ₹{Math.Round(amount)} Claim: UTR {cleanUtr} submitted by {pcName} ({pcId}). Check UPI & Approve in Tab 7." },
                        { "sendTelegram", "true" },
                        { "forceTelegram", "true" }
                    };
                    Logger.SendCentralTelemetry(claimReport);
                }
                catch { }

                resultMessage =
                    $"✅ పేమెంట్ UTR ({cleanUtr}) Admin వెరిఫికేషన్ క్యూకు పంపబడింది!\n\n" +
                    $"Admin గారు తమ PhonePe/GPay లో ₹{Math.Round(amount)} చెక్ చేసి 'Approve UTR & +30d' క్లిక్ చేసిన తర్వాత,\n" +
                    $"మీరు '🔄 Re-Check License Now' నొక్కితే యాప్ వెంటనే యాక్టివేట్ అవుతుంది.";
                return true;
            }
            catch (WebException wex)
            {
                string errBody = "";
                try
                {
                    if (wex.Response != null)
                    {
                        using (var sr = new StreamReader(wex.Response.GetResponseStream(), Encoding.UTF8))
                        {
                            errBody = sr.ReadToEnd();
                        }
                    }
                }
                catch { }

                if (errBody.IndexOf("ALREADY_EXISTS", StringComparison.OrdinalIgnoreCase) >= 0 ||
                    errBody.IndexOf("FAILED_PRECONDITION", StringComparison.OrdinalIgnoreCase) >= 0 ||
                    errBody.IndexOf("already exists", StringComparison.OrdinalIgnoreCase) >= 0)
                {
                    resultMessage =
                        $"🚫 Duplicate / Already Used UTR Blocked!\n\n" +
                        $"ఈ UTR నంబర్ ({cleanUtr}) ఇప్పటికే వేరే లేదా పాత క్లెయిమ్‌లో ఉపయోగించబడింది.\n" +
                        $"ఒకే UTR నంబర్‌ను రెండుసార్లు / వేరే PC కి వాడడం సాధ్యం కాదు.\n" +
                        $"మీరు నిజంగా ₹{Math.Round(amount)} చెల్లించిన కొత్త 12-అంకెల UTR నంబర్‌ను మాత్రమే ఎంటర్ చేయండి.";
                    return false;
                }

                resultMessage = $"నెట్‌వర్క్ సమస్య కారణంగా UTR పంపడం విఫలమైంది. దయచేసి మళ్ళీ ప్రయత్నించండి.\n({wex.Message})";
                return false;
            }
            catch (Exception ex)
            {
                resultMessage = $"UTR సమర్పించడంలో లోపం: {ex.Message}";
                return false;
            }
        }

        public static void ShowSubscriptionModal(Form owner, LicenseStatusResult status)
        {
            string pcId = Logger.SanitizeFirestoreId(Logger.GetUniqueMachineId(), "EVD-PC");
            using (Form dlg = new Form())
            {
                dlg.Text = "E-Vedhika Subscription Plan (₹10 / Month)";
                dlg.Size = new Size(550, 500);
                dlg.StartPosition = FormStartPosition.CenterParent;
                dlg.FormBorderStyle = FormBorderStyle.FixedDialog;
                dlg.MaximizeBox = false;
                dlg.MinimizeBox = false;
                dlg.BackColor = Color.FromArgb(15, 23, 42);
                dlg.ForeColor = Color.White;

                Label lblTitle = new Label();
                lblTitle.Text = $"💳 E-Vedhika Monthly Subscription (₹{status.MonthlyPriceInr:0} / {status.DurationDays} Days)";
                lblTitle.Font = new Font("Segoe UI", 12, FontStyle.Bold);
                lblTitle.ForeColor = Color.FromArgb(56, 189, 248);
                lblTitle.Location = new Point(20, 16);
                lblTitle.Size = new Size(495, 28);

                Label lblInfo = new Label();
                lblInfo.Text =
                    $"మీ PC కి నెలవారీ సబ్‌స్క్రిప్షన్ ({status.DurationDays} రోజులు - ₹{status.MonthlyPriceInr:0}) అవసరం ఉంది.\n" +
                    $"Status: {status.SummaryText}\n\n" +
                    $"1. Admin UPI ID కి ₹{status.MonthlyPriceInr:0} చెల్లించండి (Transaction Note లో Machine ID రాయండి):\n" +
                    (!string.IsNullOrEmpty(status.UpiId) ? $"   UPI ID: {status.UpiId}\n" : "   UPI ID: Admin వద్ద అడగండి\n") +
                    $"2. చెల్లించిన తర్వాత వచ్చిన 12-అంకెల UTR నంబర్‌ను క్రింద ఎంటర్ చేసి Submit చేయండి (Duplicate UTR అంగీకరించబడదు).\n" +
                    $"3. Admin అప్రూవ్ చేసిన వెంటనే '🔄 Re-Check License Now' క్లిక్ చేయండి.";
                lblInfo.Font = new Font("Segoe UI", 9.0f, FontStyle.Regular);
                lblInfo.Location = new Point(20, 50);
                lblInfo.Size = new Size(495, 130);

                TextBox txtPcId = new TextBox();
                txtPcId.Text = $"{pcId} ({Environment.MachineName})";
                txtPcId.ReadOnly = true;
                txtPcId.BackColor = Color.FromArgb(30, 41, 59);
                txtPcId.ForeColor = Color.FromArgb(52, 211, 153);
                txtPcId.Font = new Font("Consolas", 9.5f, FontStyle.Bold);
                txtPcId.Location = new Point(20, 188);
                txtPcId.Size = new Size(340, 26);

                Button btnCopy = new Button();
                btnCopy.Text = "📋 Copy PC ID";
                btnCopy.Location = new Point(370, 186);
                btnCopy.Size = new Size(145, 28);
                btnCopy.BackColor = Color.FromArgb(51, 65, 85);
                btnCopy.ForeColor = Color.White;
                btnCopy.FlatStyle = FlatStyle.Flat;
                btnCopy.Click += delegate {
                    try
                    {
                        Clipboard.SetText(pcId);
                        MessageBox.Show($"Copied Machine ID: {pcId}", "Copied", MessageBoxButtons.OK, MessageBoxIcon.Information);
                    }
                    catch { }
                };

                Label lblUtrPrompt = new Label();
                lblUtrPrompt.Text = $"UPI 12-Digit UTR / Ref Number (₹{status.MonthlyPriceInr:0} చెల్లించిన రిఫరెన్స్ నంబర్):";
                lblUtrPrompt.Font = new Font("Segoe UI", 9.0f, FontStyle.Bold);
                lblUtrPrompt.ForeColor = Color.FromArgb(251, 191, 36);
                lblUtrPrompt.Location = new Point(20, 228);
                lblUtrPrompt.Size = new Size(495, 22);

                TextBox txtUtr = new TextBox();
                txtUtr.Font = new Font("Consolas", 11, FontStyle.Bold);
                txtUtr.BackColor = Color.FromArgb(30, 41, 59);
                txtUtr.ForeColor = Color.White;
                txtUtr.Location = new Point(20, 254);
                txtUtr.Size = new Size(320, 30);

                Button btnSubmitUtr = new Button();
                btnSubmitUtr.Text = "📩 Submit UTR";
                btnSubmitUtr.Location = new Point(350, 253);
                btnSubmitUtr.Size = new Size(165, 31);
                btnSubmitUtr.BackColor = Color.FromArgb(2, 132, 199);
                btnSubmitUtr.ForeColor = Color.White;
                btnSubmitUtr.Font = new Font("Segoe UI", 9.0f, FontStyle.Bold);
                btnSubmitUtr.FlatStyle = FlatStyle.Flat;
                btnSubmitUtr.Click += delegate {
                    btnSubmitUtr.Enabled = false;
                    string msg;
                    bool ok = SubmitUniquePaymentUtrClaim(txtUtr.Text, status, out msg);
                    btnSubmitUtr.Enabled = true;
                    MessageBox.Show(msg, ok ? "UTR Submitted" : "UTR Validation", MessageBoxButtons.OK, ok ? MessageBoxIcon.Information : MessageBoxIcon.Warning);
                };

                Button btnOpenUpi = new Button();
                btnOpenUpi.Text = $"📱 Scan QR / Pay ₹{status.MonthlyPriceInr:0} Online";
                btnOpenUpi.Location = new Point(20, 300);
                btnOpenUpi.Size = new Size(275, 36);
                btnOpenUpi.BackColor = Color.FromArgb(124, 58, 237);
                btnOpenUpi.ForeColor = Color.White;
                btnOpenUpi.Font = new Font("Segoe UI", 9.0f, FontStyle.Bold);
                btnOpenUpi.FlatStyle = FlatStyle.Flat;
                btnOpenUpi.Enabled = true;
                btnOpenUpi.Click += delegate {
                    try
                    {
                        string targetUrl = (!string.IsNullOrEmpty(status.PaymentLinkUrl) &&
                            status.PaymentLinkUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                            ? status.PaymentLinkUrl.Trim()
                            : $"https://rakeshkumardhawan.github.io/UBDTOOLS/?pay=1&pcId={Uri.EscapeDataString(pcId)}&pcName={Uri.EscapeDataString(Environment.MachineName ?? "GP-PC")}";
                        if (!string.IsNullOrEmpty(status.UpiId)) Clipboard.SetText(status.UpiId);
                        Process.Start(new ProcessStartInfo { FileName = targetUrl, UseShellExecute = true });
                    }
                    catch { }
                };

                Label lblNote = new Label();
                lblNote.Text = status.PaymentNote;
                lblNote.Font = new Font("Segoe UI", 8.5f, FontStyle.Italic);
                lblNote.ForeColor = Color.FromArgb(148, 163, 184);
                lblNote.Location = new Point(20, 345);
                lblNote.Size = new Size(495, 42);

                Button btnRecheck = new Button();
                btnRecheck.Text = "🔄 Re-Check License Now";
                btnRecheck.Location = new Point(20, 400);
                btnRecheck.Size = new Size(260, 42);
                btnRecheck.BackColor = Color.FromArgb(16, 185, 129);
                btnRecheck.ForeColor = Color.White;
                btnRecheck.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
                btnRecheck.FlatStyle = FlatStyle.Flat;
                btnRecheck.Click += delegate {
                    var fresh = CheckRemoteLicenseStatus();
                    if (fresh.IsAllowed)
                    {
                        MessageBox.Show($"✅ License Active!\n{fresh.SummaryText}", "Activated", MessageBoxButtons.OK, MessageBoxIcon.Information);
                        dlg.DialogResult = DialogResult.OK;
                        dlg.Close();
                    }
                    else
                    {
                        MessageBox.Show($"⏳ Still waiting for Admin activation.\n{fresh.SummaryText}", "Not Active Yet", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                    }
                };

                Button btnClose = new Button();
                btnClose.Text = "Close";
                btnClose.Location = new Point(370, 400);
                btnClose.Size = new Size(145, 42);
                btnClose.BackColor = Color.FromArgb(71, 85, 105);
                btnClose.ForeColor = Color.White;
                btnClose.FlatStyle = FlatStyle.Flat;
                btnClose.Click += delegate { dlg.Close(); };

                dlg.Controls.Add(lblTitle);
                dlg.Controls.Add(lblInfo);
                dlg.Controls.Add(txtPcId);
                dlg.Controls.Add(btnCopy);
                dlg.Controls.Add(lblUtrPrompt);
                dlg.Controls.Add(txtUtr);
                dlg.Controls.Add(btnSubmitUtr);
                dlg.Controls.Add(btnOpenUpi);
                dlg.Controls.Add(lblNote);
                dlg.Controls.Add(btnRecheck);
                dlg.Controls.Add(btnClose);

                if (owner != null) dlg.ShowDialog(owner);
                else dlg.ShowDialog();
            }
        }

        private static string EscapeJson(string s)
        {
            if (string.IsNullOrEmpty(s)) return "";
            return s.Replace("\\", "\\\\").Replace("\"", "\\\"").Replace("\r", " ").Replace("\n", " ");
        }

        private static string Truncate(string s, int max)
        {
            if (string.IsNullOrEmpty(s)) return "";
            s = s.Trim();
            return s.Length > max ? s.Substring(0, max) : s;
        }

        private static string DownloadJsonSafe(string url)
        {
            try
            {
                using (WebClient wc = new WebClient())
                {
                    wc.Encoding = Encoding.UTF8;
                    wc.Headers[HttpRequestHeader.UserAgent] = "EVedhikaUBDTool/1.1.0";
                    return wc.DownloadString(url);
                }
            }
            catch
            {
                return "";
            }
        }

        private static string ExtractFirestoreString(string json, string fieldName)
        {
            if (string.IsNullOrEmpty(json) || string.IsNullOrEmpty(fieldName)) return "";
            Match m = Regex.Match(
                json,
                "\"" + Regex.Escape(fieldName) + "\"\\s*:\\s*\\{\\s*\"stringValue\"\\s*:\\s*\"((?:\\\\.|[^\"])*)\"",
                RegexOptions.Singleline);
            if (!m.Success) return "";
            return m.Groups[1].Value.Replace("\\\"", "\"").Replace("\\n", "\n").Replace("\\\\", "\\");
        }

        private static double ExtractFirestoreNumber(string json, string fieldName, double fallbackVal)
        {
            if (string.IsNullOrEmpty(json) || string.IsNullOrEmpty(fieldName)) return fallbackVal;
            Match m = Regex.Match(
                json,
                "\"" + Regex.Escape(fieldName) + "\"\\s*:\\s*\\{\\s*\"(?:integerValue|doubleValue)\"\\s*:\\s*\"?([0-9]+(?:\\.[0-9]+)?)\"?",
                RegexOptions.Singleline);
            if (!m.Success) return fallbackVal;
            double parsed;
            if (double.TryParse(m.Groups[1].Value, NumberStyles.Any, CultureInfo.InvariantCulture, out parsed))
                return parsed;
            return fallbackVal;
        }
    }
}
