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
        public string PaymentNote = "Currently Free for all Operators (Future Plan: Rs.10/Month).";
        public bool IsAllowed = true;
        public string SummaryText = "Free Early Access Active (Future Rs.10/Mo Plan)";
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
                    res.SummaryText = "Free Early Access Active (Future Plan: Rs.10 / Month)";
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
                    res.SummaryText = $"Free Early Access Active (Planned Future Rate: Rs.{res.MonthlyPriceInr:0}/Month)";
                    return res;
                }

                // PAID_MONTHLY is enabled by Admin -> validate pc_licenses/{pcId}
                string pcId = Logger.SanitizeFirestoreId(Logger.GetUniqueMachineId(), "EVD-PC");
                string pcUrl = $"https://firestore.googleapis.com/v1/{Logger.FirestoreDocBase}/pc_licenses/{Uri.EscapeDataString(pcId)}{FirestoreApiKeyParam}";
                string pcJson = DownloadJsonSafe(pcUrl);

                if (string.IsNullOrEmpty(pcJson) || pcJson.IndexOf("\"fields\"", StringComparison.OrdinalIgnoreCase) < 0)
                {
                    res.IsAllowed = true; // Offline grace so operator work is never blocked while Admin is away
                    res.SummaryText = $"Offline Grace Active (Admin Approval Pending • Rs.{res.MonthlyPriceInr:0}/Mo)";
                    return res;
                }

                string pcPlanType = ExtractFirestoreString(pcJson, "planType");
                string pcStatus = ExtractFirestoreString(pcJson, "status");
                string validUntilIso = ExtractFirestoreString(pcJson, "validUntilIso");
                res.ValidUntilIso = validUntilIso;

                if (string.Equals(pcStatus, "ACTIVE", StringComparison.OrdinalIgnoreCase) &&
                    string.Equals(pcPlanType, "FREE_ACCESS", StringComparison.OrdinalIgnoreCase))
                {
                    res.IsAllowed = true;
                    res.SummaryText = "Admin Free Access Active (Payment Mode OFF for this PC)";
                    return res;
                }

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
                    res.SummaryText = $"Active Subscription (Rs.{res.MonthlyPriceInr:0}/Mo | {daysLeft} Days Left)";
                }
                else
                {
                    res.IsAllowed = true; // Grace period active
                    res.SummaryText = $"Grace Period Active (Subscription Expired/Pending • Rs.{res.MonthlyPriceInr:0})";
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
                resultMessage = "Please enter a valid 12-digit UPI UTR / Transaction Reference ID (8-36 alphanumeric characters).";
                return false;
            }

            string claimId = "UTR-" + cleanUtr;
            string pcId = Logger.SanitizeFirestoreId(Logger.GetUniqueMachineId(), "EVD-PC");
            string pcName = string.IsNullOrEmpty(Environment.MachineName) ? "GP-OFFICE-PC" : Environment.MachineName;
            string state = SystemInfoHelper.GetConfiguredState("Telangana");
            string district = SystemInfoHelper.GetConfiguredDistrict(state);
            string opName = SystemInfoHelper.GetConfiguredOperatorName();
            double amount = status != null && status.MonthlyPriceInr >= 1
                ? Math.Min(10000, Math.Max(1, Math.Round(status.MonthlyPriceInr)))
                : 10;

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
                $"\"note\":{{\"stringValue\":\"Submitted from desktop v1.1.0 for Rs.{Math.Round(amount)} / {status?.DurationDays ?? 30}d verification\"}}" +
                "}}," +
                "\"currentDocument\":{\"exists\":false}," +
                "\"updateTransforms\":[{\"fieldPath\":\"createdAt\",\"setToServerValue\":\"REQUEST_TIME\"}]" +
                "}]}";

            try
            {
                OSCompatibilityEngine.ConfigureResilientTls();
                using (TimeoutWebClient wc = new TimeoutWebClient(10000))
                {
                    wc.Encoding = Encoding.UTF8;
                    wc.Headers[HttpRequestHeader.ContentType] = "application/json";
                    wc.Headers[HttpRequestHeader.UserAgent] = "EVedhikaUBDTool/1.1.0";
                    wc.UploadString(Logger.FirestoreCommitUrl, "POST", payload);
                }

                try
                {
                    string tgUrl = "https://api.telegram.org/bot8681492578:AAH23013347X5tI6qU5E6z2D2u1R3S0P1O0/sendMessage";
                    string tgMsg = "💳 <b>NEW UTR PAYMENT CLAIM (DESKTOP)</b>\n" +
                                   "━━━━━━━━━━━━━━━━━━━━━━\n" +
                                   "🔑 <b>UTR:</b> <code>" + cleanUtr + "</code>\n" +
                                   "🖥️ <b>PC:</b> " + EscapeJson(pcName) + " (<code>" + pcId + "</code>)\n" +
                                   "👤 <b>Operator:</b> " + EscapeJson(opName) + "\n" +
                                   "📍 <b>District:</b> " + EscapeJson(district) + " (" + state + ")\n" +
                                   "💰 <b>Amount:</b> Rs." + Math.Round(amount) + "\n" +
                                   "━━━━━━━━━━━━━━━━━━━━━━";
                    string tgJson = "{\"chat_id\":\"431228008\",\"text\":\"" + EscapeJson(tgMsg) + "\",\"parse_mode\":\"HTML\",\"reply_markup\":{\"inline_keyboard\":[[{\"text\":\"✅ Open Admin Hub & Review " + cleanUtr + "\",\"url\":\"https://rakeshkumardhawan.github.io/UBDTOOLS/admin/?section=payments&utr=" + cleanUtr + "\"}]]}}";
                    using (var wcTg = new TimeoutWebClient(8000))
                    {
                        wcTg.Encoding = Encoding.UTF8;
                        wcTg.Headers[HttpRequestHeader.ContentType] = "application/json; charset=utf-8";
                        wcTg.UploadString(tgUrl, "POST", tgJson);
                    }
                }
                catch { }

                resultMessage =
                    $"[OK] Payment UTR ({cleanUtr}) submitted to Admin verification queue!\n\n" +
                    $"Once Admin verifies Rs.{Math.Round(amount)} in PhonePe/GPay and clicks 'Approve UTR & +30d',\n" +
                    $"click 'Re-Check License Now' in this window to activate immediately.";
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
                        $"[BLOCKED] Duplicate / Already Used UTR!\n\n" +
                        $"This UTR number ({cleanUtr}) was already used in an existing or previous claim.\n" +
                        $"Reusing the same UTR across submissions or other PCs is not allowed.\n" +
                        $"Please enter a fresh 12-digit UTR for your Rs.{Math.Round(amount)} payment.";
                    return false;
                }

                resultMessage = $"Network error while submitting UTR. Please check your internet connection and retry.\n({wex.Message})";
                return false;
            }
            catch (Exception ex)
            {
                resultMessage = $"Failed to submit UTR: {ex.Message}";
                return false;
            }
        }

        public static void ShowSubscriptionModal(Form owner, LicenseStatusResult status)
        {
            string pcId = Logger.SanitizeFirestoreId(Logger.GetUniqueMachineId(), "EVD-PC");
            using (Form dlg = new Form())
            {
                dlg.Text = $"E-Vedhika Subscription Plan (Rs.{status.MonthlyPriceInr:0} / {status.DurationDays} Days)";
                dlg.Size = new Size(710, 500);
                dlg.StartPosition = FormStartPosition.CenterParent;
                dlg.FormBorderStyle = FormBorderStyle.FixedDialog;
                dlg.MaximizeBox = false;
                dlg.MinimizeBox = false;
                dlg.BackColor = Color.FromArgb(15, 23, 42);
                dlg.ForeColor = Color.White;

                Label lblTitle = new Label();
                lblTitle.Text = $"E-Vedhika Monthly Subscription (Rs.{status.MonthlyPriceInr:0} / {status.DurationDays} Days)";
                lblTitle.Font = new Font("Segoe UI", 12, FontStyle.Bold);
                lblTitle.ForeColor = Color.FromArgb(56, 189, 248);
                lblTitle.UseMnemonic = false;
                lblTitle.Location = new Point(20, 16);
                lblTitle.Size = new Size(650, 28);

                Label lblInfo = new Label();
                lblInfo.Text =
                    $"Your PC requires an active subscription ({status.DurationDays} Days - Rs.{status.MonthlyPriceInr:0}).\n" +
                    $"Status: {status.SummaryText}\n\n" +
                    $"1. Scan the QR code on the right with PhonePe / GPay / Paytm to pay Rs.{status.MonthlyPriceInr:0}:\n" +
                    (!string.IsNullOrEmpty(status.UpiId) ? $"   UPI ID: {status.UpiId}\n" : "   UPI ID: QR appears automatically once configured by Admin\n") +
                    $"2. Enter the 12-digit UTR number below and click Submit (duplicate UTRs are blocked).\n" +
                    $"3. Once Admin approves, click 'Re-Check License Now' to unlock immediately.";
                lblInfo.Font = new Font("Segoe UI", 9.0f, FontStyle.Regular);
                lblInfo.UseMnemonic = false;
                lblInfo.Location = new Point(20, 50);
                lblInfo.Size = new Size(440, 130);

                // In-App UPI QR Code Box (No Browser / No URL shown to user)
                Panel pnlQr = new Panel();
                pnlQr.BackColor = Color.FromArgb(30, 41, 59);
                pnlQr.BorderStyle = BorderStyle.FixedSingle;
                pnlQr.Location = new Point(475, 50);
                pnlQr.Size = new Size(200, 235);

                Label lblQrHeader = new Label();
                lblQrHeader.Text = $"Scan & Pay Rs.{status.MonthlyPriceInr:0}";
                lblQrHeader.UseMnemonic = false;
                lblQrHeader.Font = new Font("Segoe UI", 9.0f, FontStyle.Bold);
                lblQrHeader.ForeColor = Color.FromArgb(52, 211, 153);
                lblQrHeader.TextAlign = ContentAlignment.MiddleCenter;
                lblQrHeader.Location = new Point(4, 6);
                lblQrHeader.Size = new Size(190, 20);

                PictureBox picQr = new PictureBox();
                picQr.BackColor = Color.White;
                picQr.Location = new Point(20, 30);
                picQr.Size = new Size(160, 160);
                picQr.SizeMode = PictureBoxSizeMode.StretchImage;

                Label lblQrSub = new Label();
                string qrTargetData = !string.IsNullOrEmpty(status.UpiId)
                    ? $"upi://pay?pa={Uri.EscapeDataString(status.UpiId.Trim())}&pn=EVedhika&am={status.MonthlyPriceInr:0}&cu=INR&tn={Uri.EscapeDataString("EVD-" + pcId)}"
                    : ((!string.IsNullOrEmpty(status.PaymentLinkUrl) && status.PaymentLinkUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                        ? status.PaymentLinkUrl.Trim()
                        : $"https://rakeshkumardhawan.github.io/UBDTOOLS/pay-checkout?pay=1&pcId={Uri.EscapeDataString(pcId)}&pcName={Uri.EscapeDataString(Environment.MachineName ?? "GP-PC")}");
                lblQrSub.Text = !string.IsNullOrEmpty(status.UpiId) ? status.UpiId : "Scan Gateway QR";
                lblQrSub.UseMnemonic = false;
                lblQrSub.Font = new Font("Consolas", 8.0f, FontStyle.Bold);
                lblQrSub.ForeColor = Color.FromArgb(203, 213, 225);
                lblQrSub.TextAlign = ContentAlignment.MiddleCenter;
                lblQrSub.Location = new Point(4, 196);
                lblQrSub.Size = new Size(190, 32);

                pnlQr.Controls.Add(lblQrHeader);
                pnlQr.Controls.Add(picQr);
                pnlQr.Controls.Add(lblQrSub);

                Action loadInAppQr = delegate {
                    System.Threading.ThreadPool.QueueUserWorkItem(delegate {
                        string[] qrEndpoints = new string[] {
                            "https://api.qrserver.com/v1/create-qr-code/?size=160x160&margin=4&data=" + Uri.EscapeDataString(qrTargetData),
                            "https://quickchart.io/qr?size=160&text=" + Uri.EscapeDataString(qrTargetData)
                        };
                        foreach (string qrImgEndpoint in qrEndpoints)
                        {
                            try
                            {
                                OSCompatibilityEngine.ConfigureResilientTls();
                                using (TimeoutWebClient wc = new TimeoutWebClient(8000))
                                {
                                    byte[] imgBytes = wc.DownloadData(qrImgEndpoint);
                                    if (imgBytes != null && imgBytes.Length > 100)
                                    {
                                        using (var ms = new MemoryStream(imgBytes))
                                        using (Image qrImg = Image.FromStream(ms))
                                        {
                                            if (!dlg.IsDisposed && dlg.IsHandleCreated)
                                            {
                                                Bitmap bmp = new Bitmap(qrImg);
                                                dlg.BeginInvoke((MethodInvoker)delegate {
                                                    if (!dlg.IsDisposed && !picQr.IsDisposed) picQr.Image = bmp;
                                                    else bmp.Dispose();
                                                });
                                            }
                                            return;
                                        }
                                    }
                                }
                            }
                            catch { }
                        }
                    });
                };
                loadInAppQr();

                TextBox txtPcId = new TextBox();
                txtPcId.Text = $"{pcId} ({Environment.MachineName})";
                txtPcId.ReadOnly = true;
                txtPcId.BackColor = Color.FromArgb(30, 41, 59);
                txtPcId.ForeColor = Color.FromArgb(52, 211, 153);
                txtPcId.Font = new Font("Consolas", 9.5f, FontStyle.Bold);
                txtPcId.Location = new Point(20, 188);
                txtPcId.Size = new Size(295, 26);

                Button btnCopy = new Button();
                btnCopy.Text = "Copy PC ID";
                btnCopy.UseMnemonic = false;
                btnCopy.Location = new Point(325, 186);
                btnCopy.Size = new Size(135, 28);
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
                lblUtrPrompt.Text = $"UPI 12-Digit UTR / Ref Number (for Rs.{status.MonthlyPriceInr:0} payment):";
                lblUtrPrompt.Font = new Font("Segoe UI", 9.0f, FontStyle.Bold);
                lblUtrPrompt.ForeColor = Color.FromArgb(251, 191, 36);
                lblUtrPrompt.UseMnemonic = false;
                lblUtrPrompt.Location = new Point(20, 228);
                lblUtrPrompt.Size = new Size(440, 22);

                TextBox txtUtr = new TextBox();
                txtUtr.Font = new Font("Consolas", 11, FontStyle.Bold);
                txtUtr.BackColor = Color.FromArgb(30, 41, 59);
                txtUtr.ForeColor = Color.White;
                txtUtr.Location = new Point(20, 254);
                txtUtr.Size = new Size(285, 30);

                Button btnSubmitUtr = new Button();
                btnSubmitUtr.Text = "Submit UTR";
                btnSubmitUtr.UseMnemonic = false;
                btnSubmitUtr.Location = new Point(315, 253);
                btnSubmitUtr.Size = new Size(145, 31);
                btnSubmitUtr.BackColor = Color.FromArgb(2, 132, 199);
                btnSubmitUtr.ForeColor = Color.White;
                btnSubmitUtr.Font = new Font("Segoe UI", 9.0f, FontStyle.Bold);
                btnSubmitUtr.FlatStyle = FlatStyle.Flat;
                Button btnRecheck = new Button();
                btnRecheck.Text = "Re-Check License Now";
                btnRecheck.UseMnemonic = false;
                btnRecheck.Location = new Point(20, 400);
                btnRecheck.Size = new Size(260, 42);
                btnRecheck.BackColor = Color.FromArgb(16, 185, 129);
                btnRecheck.ForeColor = Color.White;
                btnRecheck.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
                btnRecheck.FlatStyle = FlatStyle.Flat;

                btnSubmitUtr.Click += delegate {
                    string rawUtr = txtUtr.Text;
                    btnSubmitUtr.Enabled = false;
                    btnRecheck.Enabled = false;
                    txtUtr.Enabled = false;
                    btnSubmitUtr.Text = "Submitting...";
                    System.Threading.ThreadPool.QueueUserWorkItem(delegate {
                        string msg = "";
                        bool ok = false;
                        try
                        {
                            ok = SubmitUniquePaymentUtrClaim(rawUtr, status, out msg);
                        }
                        catch (Exception ex)
                        {
                            msg = "Failed to submit UTR: " + ex.Message;
                        }
                        if (!dlg.IsDisposed && dlg.IsHandleCreated)
                        {
                            dlg.BeginInvoke((MethodInvoker)delegate {
                                if (dlg.IsDisposed) return;
                                btnSubmitUtr.Enabled = true;
                                btnRecheck.Enabled = true;
                                txtUtr.Enabled = true;
                                btnSubmitUtr.Text = "Submit UTR";
                                MessageBox.Show(dlg, msg, ok ? "UTR Submitted" : "UTR Validation", MessageBoxButtons.OK, ok ? MessageBoxIcon.Information : MessageBoxIcon.Warning);
                            });
                        }
                    });
                };

                Button btnOpenUpi = new Button();
                btnOpenUpi.Text = $"Scan QR / Pay Rs.{status.MonthlyPriceInr:0} Online";
                btnOpenUpi.UseMnemonic = false;
                btnOpenUpi.Location = new Point(20, 300);
                btnOpenUpi.Size = new Size(320, 36);
                btnOpenUpi.BackColor = Color.FromArgb(124, 58, 237);
                btnOpenUpi.ForeColor = Color.White;
                btnOpenUpi.Font = new Font("Segoe UI", 9.0f, FontStyle.Bold);
                btnOpenUpi.FlatStyle = FlatStyle.Flat;
                btnOpenUpi.Enabled = true;
                btnOpenUpi.Click += delegate {
                    try
                    {
                        if (!string.IsNullOrEmpty(status.UpiId)) Clipboard.SetText(status.UpiId);
                        loadInAppQr();
                        string targetUrl = (!string.IsNullOrEmpty(status.PaymentLinkUrl) &&
                            status.PaymentLinkUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                            ? status.PaymentLinkUrl.Trim()
                            : $"https://rakeshkumardhawan.github.io/UBDTOOLS/pay-checkout?pay=1&pcId={Uri.EscapeDataString(pcId)}&pcName={Uri.EscapeDataString(Environment.MachineName ?? "GP-PC")}";
                        Process.Start(new ProcessStartInfo { FileName = targetUrl, UseShellExecute = true });
                    }
                    catch { }
                };

                Label lblNote = new Label();
                lblNote.Text = status.PaymentNote;
                lblNote.Font = new Font("Segoe UI", 8.5f, FontStyle.Italic);
                lblNote.ForeColor = Color.FromArgb(148, 163, 184);
                lblNote.UseMnemonic = false;
                lblNote.Location = new Point(20, 345);
                lblNote.Size = new Size(650, 42);

                btnRecheck.Click += delegate {
                    btnRecheck.Enabled = false;
                    btnSubmitUtr.Enabled = false;
                    btnRecheck.Text = "Checking License...";
                    System.Threading.ThreadPool.QueueUserWorkItem(delegate {
                        LicenseStatusResult fresh = null;
                        try
                        {
                            fresh = CheckRemoteLicenseStatus();
                        }
                        catch { }
                        if (!dlg.IsDisposed && dlg.IsHandleCreated)
                        {
                            dlg.BeginInvoke((MethodInvoker)delegate {
                                if (dlg.IsDisposed) return;
                                btnRecheck.Enabled = true;
                                btnSubmitUtr.Enabled = true;
                                btnRecheck.Text = "Re-Check License Now";
                                if (fresh != null && fresh.IsAllowed)
                                {
                                    MessageBox.Show(dlg, $"[OK] License Active!\n{fresh.SummaryText}", "Activated", MessageBoxButtons.OK, MessageBoxIcon.Information);
                                    dlg.DialogResult = DialogResult.OK;
                                    dlg.Close();
                                }
                                else
                                {
                                    string sum = fresh != null ? fresh.SummaryText : status.SummaryText;
                                    MessageBox.Show(dlg, $"Still waiting for Admin activation.\n{sum}", "Not Active Yet", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                                }
                            });
                        }
                    });
                };

                Button btnClose = new Button();
                btnClose.Text = "Close";
                btnClose.UseMnemonic = false;
                btnClose.Location = new Point(530, 400);
                btnClose.Size = new Size(145, 42);
                btnClose.BackColor = Color.FromArgb(71, 85, 105);
                btnClose.ForeColor = Color.White;
                btnClose.FlatStyle = FlatStyle.Flat;
                btnClose.Click += delegate { dlg.Close(); };

                dlg.Controls.Add(lblTitle);
                dlg.Controls.Add(lblInfo);
                dlg.Controls.Add(pnlQr);
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
                using (TimeoutWebClient wc = new TimeoutWebClient(8000))
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
