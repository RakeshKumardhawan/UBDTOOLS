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
        public string StatusCode = "FREE_FOR_ALL";
        public double MonthlyPriceInr = 10;
        public int DurationDays = 30;
        public int DaysRemaining = 999;
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
        private const string DefaultCheckoutBaseUrl = "https://rakeshkumardhawan.github.io/UBDTOOLS/pay-checkout";
        private const string FallbackVersionManifestUrl = "https://raw.githubusercontent.com/RakeshKumardhawan/UBDTOOLS/main/public/version.json";
        private static readonly object _memCacheLock = new object();
        private static LicenseStatusResult _memCachedResult = null;
        private static DateTime _memCachedUtc = DateTime.MinValue;
        private const int MemoryCacheTtlSeconds = 45;

        public static void InvalidateMemoryCache()
        {
            lock (_memCacheLock)
            {
                _memCachedResult = null;
                _memCachedUtc = DateTime.MinValue;
            }
        }

        private static string GetLicenseCachePath()
        {
            try
            {
                string progData = Environment.GetFolderPath(Environment.SpecialFolder.CommonApplicationData);
                if (!string.IsNullOrEmpty(progData))
                {
                    string dir = Path.Combine(progData, "EVedhika");
                    if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
                    return Path.Combine(dir, "license_cache.json");
                }
            }
            catch { }

            try
            {
                string localData = Environment.GetFolderPath(Environment.SpecialFolder.LocalApplicationData);
                if (!string.IsNullOrEmpty(localData))
                {
                    string dir = Path.Combine(localData, "EVedhika");
                    if (!Directory.Exists(dir)) Directory.CreateDirectory(dir);
                    return Path.Combine(dir, "license_cache.json");
                }
            }
            catch { }

            return "";
        }

        private static void SaveLicenseCache(string pcId, LicenseStatusResult res, string planType, string pcStatus)
        {
            try
            {
                string path = GetLicenseCachePath();
                if (string.IsNullOrEmpty(path)) return;
                string json =
                    "{" +
                    $"\"pcId\":\"{EscapeJson(pcId)}\"," +
                    $"\"mode\":\"{EscapeJson(res.Mode)}\"," +
                    $"\"planType\":\"{EscapeJson(planType)}\"," +
                    $"\"status\":\"{EscapeJson(pcStatus)}\"," +
                    $"\"validUntilIso\":\"{EscapeJson(res.ValidUntilIso)}\"," +
                    $"\"monthlyPriceInr\":{res.MonthlyPriceInr.ToString(CultureInfo.InvariantCulture)}," +
                    $"\"durationDays\":{res.DurationDays}," +
                    $"\"upiId\":\"{EscapeJson(res.UpiId)}\"," +
                    $"\"paymentLinkUrl\":\"{EscapeJson(res.PaymentLinkUrl)}\"," +
                    $"\"cachedUtc\":\"{DateTime.UtcNow.ToString("O", CultureInfo.InvariantCulture)}\"" +
                    "}";
                File.WriteAllText(path, json, Encoding.UTF8);
            }
            catch { }
        }

        private static LicenseStatusResult TryReadOfflineCache(string pcId, out DateTime cachedUtc)
        {
            cachedUtc = DateTime.MinValue;
            try
            {
                string path = GetLicenseCachePath();
                if (string.IsNullOrEmpty(path) || !File.Exists(path)) return null;
                string json = File.ReadAllText(path, Encoding.UTF8);
                if (string.IsNullOrWhiteSpace(json)) return null;

                string cachedPcId = ExtractFlatString(json, "pcId");
                if (!string.IsNullOrEmpty(cachedPcId) &&
                    !string.Equals(cachedPcId, pcId, StringComparison.OrdinalIgnoreCase))
                {
                    return null;
                }

                string cachedUtcStr = ExtractFlatString(json, "cachedUtc");
                DateTime.TryParse(
                    cachedUtcStr,
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal,
                    out cachedUtc);

                LicenseStatusResult res = new LicenseStatusResult();
                string mode = ExtractFlatString(json, "mode");
                string planType = ExtractFlatString(json, "planType");
                string pcStatus = ExtractFlatString(json, "status");
                string validUntilIso = ExtractFlatString(json, "validUntilIso");
                string upiId = ExtractFlatString(json, "upiId");
                string payLink = ExtractFlatString(json, "paymentLinkUrl");
                double price = ExtractFlatNumber(json, "monthlyPriceInr", 10);
                int days = (int)ExtractFlatNumber(json, "durationDays", 30);

                res.Mode = string.IsNullOrEmpty(mode) ? "FREE_FOR_ALL" : mode;
                res.MonthlyPriceInr = price >= 0 ? price : 10;
                res.DurationDays = days >= 1 ? days : 30;
                res.UpiId = upiId;
                res.PaymentLinkUrl = payLink;
                res.ValidUntilIso = validUntilIso;

                if (string.Equals(res.Mode, "FREE_FOR_ALL", StringComparison.OrdinalIgnoreCase))
                {
                    res.IsAllowed = true;
                    res.StatusCode = "OFFLINE_FREE";
                    res.DaysRemaining = 999;
                    res.SummaryText = "Free Early Access Active (Offline Cache)";
                    return res;
                }

                if (string.Equals(pcStatus, "ACTIVE", StringComparison.OrdinalIgnoreCase) &&
                    string.Equals(planType, "FREE_ACCESS", StringComparison.OrdinalIgnoreCase))
                {
                    res.IsAllowed = true;
                    res.StatusCode = "FREE_BYPASS";
                    res.DaysRemaining = 9999;
                    res.SummaryText = "Admin Free Access Active (Offline Cache)";
                    return res;
                }

                if (string.Equals(pcStatus, "REVOKED", StringComparison.OrdinalIgnoreCase))
                {
                    res.IsAllowed = false;
                    res.StatusCode = "REVOKED";
                    res.DaysRemaining = 0;
                    res.SummaryText = "Access Revoked by Admin - Subscription Renewal Required";
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
                    res.StatusCode = daysLeft <= 5 ? "EXPIRING_SOON" : "OFFLINE_CACHE";
                    res.DaysRemaining = daysLeft;
                    res.SummaryText = $"Active Subscription (Offline Cache | {daysLeft} Days Left)";
                    return res;
                }

                // PAID_MONTHLY is cached and this PC does NOT have an active unexpired license -> STRICTLY BLOCK!
                res.IsAllowed = false;
                res.StatusCode = "PAYMENT_REQUIRED";
                res.DaysRemaining = 0;
                res.SummaryText = $"Subscription Required (Rs.{res.MonthlyPriceInr:0} / {res.DurationDays} Days)";
                return res;
            }
            catch
            {
                return null;
            }
        }

        private static bool TryReadFallbackVersionPolicy(out string mode, out DateTime policyUpdatedUtc, out double price, out int days, out string upiId, out string payLink)
        {
            mode = "";
            policyUpdatedUtc = DateTime.MinValue;
            price = 10;
            days = 30;
            upiId = "";
            payLink = "";
            try
            {
                string json = DownloadJsonSafe(FallbackVersionManifestUrl + "?t=" + DateTime.UtcNow.Ticks);
                if (string.IsNullOrWhiteSpace(json)) return false;

                mode = ExtractFlatString(json, "paymentMode");
                if (string.IsNullOrWhiteSpace(mode)) return false;

                string updatedStr = ExtractFlatString(json, "paymentPolicyUpdatedAt");
                DateTime.TryParse(
                    updatedStr,
                    CultureInfo.InvariantCulture,
                    DateTimeStyles.AdjustToUniversal | DateTimeStyles.AssumeUniversal,
                    out policyUpdatedUtc);

                price = ExtractFlatNumber(json, "monthlyPriceInr", 10);
                days = (int)ExtractFlatNumber(json, "durationDays", 30);
                upiId = ExtractFlatString(json, "upiId");
                payLink = ExtractFlatString(json, "paymentLinkUrl");
                return true;
            }
            catch
            {
                return false;
            }
        }

        private static LicenseStatusResult BuildPaidFallbackDecision(string pcId, LicenseStatusResult cached, double price, int days, string upiId, string payLink)
        {
            // Only honor offline cache if it proves an active unexpired paid license or explicit admin free bypass
            if (cached != null && cached.IsAllowed &&
                (string.Equals(cached.StatusCode, "FREE_BYPASS", StringComparison.OrdinalIgnoreCase) ||
                 string.Equals(cached.StatusCode, "OFFLINE_CACHE", StringComparison.OrdinalIgnoreCase) ||
                 string.Equals(cached.StatusCode, "EXPIRING_SOON", StringComparison.OrdinalIgnoreCase)))
            {
                return cached;
            }

            LicenseStatusResult locked = new LicenseStatusResult();
            locked.Mode = "PAID_MONTHLY";
            locked.StatusCode = (cached != null && string.Equals(cached.StatusCode, "REVOKED", StringComparison.OrdinalIgnoreCase))
                ? "REVOKED"
                : "PAYMENT_REQUIRED";
            locked.MonthlyPriceInr = price >= 0 ? price : 10;
            locked.DurationDays = days >= 1 ? days : 30;
            locked.UpiId = !string.IsNullOrEmpty(upiId) ? upiId : (cached != null ? cached.UpiId : "");
            locked.PaymentLinkUrl = !string.IsNullOrEmpty(payLink) ? payLink : (cached != null ? cached.PaymentLinkUrl : "");
            locked.IsAllowed = false;
            locked.DaysRemaining = 0;
            locked.SummaryText = locked.StatusCode == "REVOKED"
                ? "Access Revoked by Admin - Subscription Renewal Required"
                : $"Subscription Required (Rs.{locked.MonthlyPriceInr:0} / {locked.DurationDays} Days)";
            SaveLicenseCache(pcId, locked, "PAID_30_DAYS", locked.StatusCode == "REVOKED" ? "REVOKED" : "EXPIRED");
            return locked;
        }

        private static LicenseStatusResult StoreMemoryCache(LicenseStatusResult result)
        {
            lock (_memCacheLock)
            {
                _memCachedResult = result;
                _memCachedUtc = DateTime.UtcNow;
            }
            return result;
        }

        public static LicenseStatusResult CheckRemoteLicenseStatus()
        {
            return CheckRemoteLicenseStatus(false);
        }

        public static LicenseStatusResult CheckRemoteLicenseStatus(bool forceRefresh)
        {
            if (!forceRefresh)
            {
                lock (_memCacheLock)
                {
                    if (_memCachedResult != null &&
                        (DateTime.UtcNow - _memCachedUtc).TotalSeconds < MemoryCacheTtlSeconds)
                    {
                        return _memCachedResult;
                    }
                }
            }

            LicenseStatusResult res = new LicenseStatusResult();
            string pcId = Logger.SanitizeFirestoreId(Logger.GetUniqueMachineId(), "EVD-PC");
            try
            {
                OSCompatibilityEngine.ConfigureResilientTls();
                string policyUrl = $"https://firestore.googleapis.com/v1/{Logger.FirestoreDocBase}/app_settings/licensing{FirestoreApiKeyParam}";
                string policyJson = DownloadJsonSafe(policyUrl);

                if (string.IsNullOrEmpty(policyJson) || policyJson.IndexOf("\"error\"", StringComparison.OrdinalIgnoreCase) >= 0)
                {
                    DateTime cachedUtc;
                    LicenseStatusResult cached = TryReadOfflineCache(pcId, out cachedUtc);

                    // Zero-quota fallback mirror from GitHub public/version.json (works even if Firestore returns 429 Quota Exceeded!)
                    string fbMode;
                    DateTime fbUpdatedUtc;
                    double fbPrice;
                    int fbDays;
                    string fbUpi;
                    string fbPayLink;
                    bool hasFallbackManifest = TryReadFallbackVersionPolicy(out fbMode, out fbUpdatedUtc, out fbPrice, out fbDays, out fbUpi, out fbPayLink);

                    if (hasFallbackManifest &&
                        string.Equals(fbMode, "PAID_MONTHLY", StringComparison.OrdinalIgnoreCase) &&
                        (cached == null || fbUpdatedUtc > cachedUtc || !string.Equals(cached.Mode, "FREE_FOR_ALL", StringComparison.OrdinalIgnoreCase)))
                    {
                        return StoreMemoryCache(BuildPaidFallbackDecision(pcId, cached, fbPrice, fbDays, fbUpi, fbPayLink));
                    }

                    if (cached != null)
                    {
                        return StoreMemoryCache(cached);
                    }

                    if (hasFallbackManifest && string.Equals(fbMode, "PAID_MONTHLY", StringComparison.OrdinalIgnoreCase))
                    {
                        return StoreMemoryCache(BuildPaidFallbackDecision(pcId, null, fbPrice, fbDays, fbUpi, fbPayLink));
                    }

                    res.Mode = "FREE_FOR_ALL";
                    res.StatusCode = "OFFLINE_GRACE";
                    res.IsAllowed = true;
                    res.DaysRemaining = 999;
                    res.SummaryText = "Free Early Access Active (Offline Mode)";
                    return StoreMemoryCache(res);
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
                    res.StatusCode = "FREE_FOR_ALL";
                    res.DaysRemaining = 999;
                    res.SummaryText = $"Free Early Access Active (Future Rate: Rs.{res.MonthlyPriceInr:0}/Month)";
                    SaveLicenseCache(pcId, res, "FREE_ACCESS", "ACTIVE");
                    return StoreMemoryCache(res);
                }

                // PAID_MONTHLY is enabled by Admin -> validate pc_licenses/{pcId}
                string pcUrl = $"https://firestore.googleapis.com/v1/{Logger.FirestoreDocBase}/pc_licenses/{Uri.EscapeDataString(pcId)}{FirestoreApiKeyParam}";
                bool pcDocNotFound;
                string pcJson = DownloadJsonWithStatus(pcUrl, out pcDocNotFound);

                // Network glitch or 429 while checking pc_licenses (not a 404): honor ONLY valid active paid/bypass cache; NEVER fall back to FREE!
                if ((string.IsNullOrEmpty(pcJson) || pcJson.IndexOf("\"error\"", StringComparison.OrdinalIgnoreCase) >= 0) && !pcDocNotFound)
                {
                    DateTime cachedUtc;
                    LicenseStatusResult cached = TryReadOfflineCache(pcId, out cachedUtc);
                    return StoreMemoryCache(BuildPaidFallbackDecision(pcId, cached, res.MonthlyPriceInr, res.DurationDays, res.UpiId, res.PaymentLinkUrl));
                }

                if (pcDocNotFound || string.IsNullOrEmpty(pcJson) || pcJson.IndexOf("\"fields\"", StringComparison.OrdinalIgnoreCase) < 0)
                {
                    res.IsAllowed = false;
                    res.StatusCode = "PAYMENT_REQUIRED";
                    res.DaysRemaining = 0;
                    res.SummaryText = $"Subscription Required (Rs.{res.MonthlyPriceInr:0} / {res.DurationDays} Days)";
                    SaveLicenseCache(pcId, res, "PAID_30_DAYS", "EXPIRED");
                    return StoreMemoryCache(res);
                }

                string pcPlanType = ExtractFirestoreString(pcJson, "planType");
                string pcStatus = ExtractFirestoreString(pcJson, "status");
                string validUntilIso = ExtractFirestoreString(pcJson, "validUntilIso");
                res.ValidUntilIso = validUntilIso;

                if (string.Equals(pcStatus, "ACTIVE", StringComparison.OrdinalIgnoreCase) &&
                    string.Equals(pcPlanType, "FREE_ACCESS", StringComparison.OrdinalIgnoreCase))
                {
                    res.IsAllowed = true;
                    res.StatusCode = "FREE_BYPASS";
                    res.DaysRemaining = 9999;
                    res.SummaryText = "Admin Free Access Active (Payment Mode OFF for this PC)";
                    SaveLicenseCache(pcId, res, pcPlanType, pcStatus);
                    return StoreMemoryCache(res);
                }

                if (string.Equals(pcStatus, "REVOKED", StringComparison.OrdinalIgnoreCase))
                {
                    res.IsAllowed = false;
                    res.StatusCode = "REVOKED";
                    res.DaysRemaining = 0;
                    res.SummaryText = "Access Revoked by Admin - Subscription Renewal Required";
                    SaveLicenseCache(pcId, res, pcPlanType, pcStatus);
                    return StoreMemoryCache(res);
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
                    res.DaysRemaining = daysLeft;
                    res.StatusCode = daysLeft <= 5 ? "EXPIRING_SOON" : "ACTIVE_PAID";
                    res.SummaryText = daysLeft <= 5
                        ? $"Active Subscription (Rs.{res.MonthlyPriceInr:0}/Mo | {daysLeft} Days Left - Renew Soon)"
                        : $"Active Subscription (Rs.{res.MonthlyPriceInr:0}/Mo | {daysLeft} Days Left)";
                    SaveLicenseCache(pcId, res, pcPlanType, pcStatus);
                }
                else
                {
                    res.IsAllowed = false;
                    res.StatusCode = "EXPIRED";
                    res.DaysRemaining = 0;
                    res.SummaryText = $"Subscription Expired - Renew Rs.{res.MonthlyPriceInr:0} for {res.DurationDays} Days";
                    SaveLicenseCache(pcId, res, pcPlanType, "EXPIRED");
                }
            }
            catch
            {
                DateTime cachedUtc;
                LicenseStatusResult cached = TryReadOfflineCache(pcId, out cachedUtc);
                if (cached != null) return StoreMemoryCache(cached);

                res.IsAllowed = true;
                res.StatusCode = "OFFLINE_GRACE";
                res.DaysRemaining = 999;
                res.SummaryText = "Free Early Access Active (Offline Mode)";
            }

            return StoreMemoryCache(res);
        }

        public static bool EnsureAllowedOrShowSubscriptionDialog(Form owner)
        {
            LicenseStatusResult status = CheckRemoteLicenseStatus(false);
            if (status.IsAllowed) return true;

            ShowSubscriptionModal(owner, status);
            LicenseStatusResult recheck = CheckRemoteLicenseStatus(true);
            return recheck.IsAllowed;
        }

        public static void OpenSubscriptionCenter(Form owner)
        {
            LicenseStatusResult status = CheckRemoteLicenseStatus(true);
            ShowSubscriptionModal(owner, status);
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
            int durationDays = status != null && status.DurationDays >= 1 ? status.DurationDays : 30;

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
                $"\"note\":{{\"stringValue\":\"Submitted from desktop v1.1.0 for Rs.{Math.Round(amount)} / {durationDays}d verification\"}}" +
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
                    string tgMsg = "NEW UTR PAYMENT CLAIM (DESKTOP)\n" +
                                   "------------------------------\n" +
                                   "UTR: <code>" + cleanUtr + "</code>\n" +
                                   "PC: " + EscapeJson(pcName) + " (<code>" + pcId + "</code>)\n" +
                                   "Operator: " + EscapeJson(opName) + "\n" +
                                   "District: " + EscapeJson(district) + " (" + state + ")\n" +
                                   "Amount: Rs." + Math.Round(amount) + " / " + durationDays + "d\n" +
                                   "------------------------------";
                    string tgJson = "{\"chat_id\":\"431228008\",\"text\":\"" + EscapeJson(tgMsg) + "\",\"parse_mode\":\"HTML\",\"reply_markup\":{\"inline_keyboard\":[[{\"text\":\"Open Admin Hub & Review " + cleanUtr + "\",\"url\":\"https://rakeshkumardhawan.github.io/UBDTOOLS/admin/?section=payments&utr=" + cleanUtr + "\"}]]}}";
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
                    $"This window is now auto-checking every 10 seconds.\n" +
                    $"As soon as Admin approves Rs.{Math.Round(amount)} in PhonePe/GPay, your app will unlock automatically!";
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
            if (status == null) status = new LicenseStatusResult();
            string pcId = Logger.SanitizeFirestoreId(Logger.GetUniqueMachineId(), "EVD-PC");
            string machineName = string.IsNullOrEmpty(Environment.MachineName) ? "GP-PC" : Environment.MachineName;

            using (Form dlg = new Form())
            {
                dlg.Text = $"E-Vedhika Subscription Plan (Rs.{status.MonthlyPriceInr:0} / {status.DurationDays} Days)";
                dlg.Size = new Size(740, 548);
                dlg.StartPosition = FormStartPosition.CenterParent;
                dlg.FormBorderStyle = FormBorderStyle.FixedDialog;
                dlg.MaximizeBox = false;
                dlg.MinimizeBox = false;
                dlg.BackColor = Color.FromArgb(15, 23, 42);
                dlg.ForeColor = Color.White;

                Label lblTitle = new Label();
                lblTitle.Text = $"E-Vedhika Subscription Activation (Rs.{status.MonthlyPriceInr:0} / {status.DurationDays} Days)";
                lblTitle.Font = new Font("Segoe UI", 12, FontStyle.Bold);
                lblTitle.ForeColor = Color.FromArgb(56, 189, 248);
                lblTitle.UseMnemonic = false;
                lblTitle.Location = new Point(20, 14);
                lblTitle.Size = new Size(690, 26);

                // Clean 3-Step Strip
                Panel pnlSteps = new Panel();
                pnlSteps.BackColor = Color.FromArgb(30, 41, 59);
                pnlSteps.BorderStyle = BorderStyle.FixedSingle;
                pnlSteps.Location = new Point(20, 46);
                pnlSteps.Size = new Size(685, 30);

                Label lblSteps = new Label();
                lblSteps.Text = $"[1] Scan UPI QR & Pay Rs.{status.MonthlyPriceInr:0}   -->   [2] Submit 12-Digit UTR   -->   [3] Auto-Unlocks Every 10s";
                lblSteps.Font = new Font("Segoe UI", 8.5f, FontStyle.Bold);
                lblSteps.ForeColor = Color.FromArgb(167, 243, 208);
                lblSteps.UseMnemonic = false;
                lblSteps.TextAlign = ContentAlignment.MiddleCenter;
                lblSteps.Dock = DockStyle.Fill;
                pnlSteps.Controls.Add(lblSteps);

                Label lblInfo = new Label();
                lblInfo.Text =
                    $"Status: {status.SummaryText}\n\n" +
                    $"1. Scan the QR code on the right using PhonePe / GPay / Paytm / BHIM:\n" +
                    (!string.IsNullOrEmpty(status.UpiId) ? $"   UPI ID: {status.UpiId}\n" : "   UPI ID: QR loads automatically from Admin settings\n") +
                    $"2. Enter the 12-digit UTR / Ref ID from your UPI payment receipt below.\n" +
                    $"3. Once Admin approves, this window unlocks AUTOMATICALLY within 10 seconds.";
                lblInfo.Font = new Font("Segoe UI", 9.0f, FontStyle.Regular);
                lblInfo.UseMnemonic = false;
                lblInfo.Location = new Point(20, 84);
                lblInfo.Size = new Size(455, 112);

                // In-App UPI QR Code Box (Right column)
                Panel pnlQr = new Panel();
                pnlQr.BackColor = Color.FromArgb(30, 41, 59);
                pnlQr.BorderStyle = BorderStyle.FixedSingle;
                pnlQr.Location = new Point(490, 84);
                pnlQr.Size = new Size(215, 290);

                Label lblQrHeader = new Label();
                lblQrHeader.Text = $"Scan & Pay Rs.{status.MonthlyPriceInr:0} ({status.DurationDays}d)";
                lblQrHeader.UseMnemonic = false;
                lblQrHeader.Font = new Font("Segoe UI", 9.0f, FontStyle.Bold);
                lblQrHeader.ForeColor = Color.FromArgb(52, 211, 153);
                lblQrHeader.TextAlign = ContentAlignment.MiddleCenter;
                lblQrHeader.Location = new Point(4, 6);
                lblQrHeader.Size = new Size(205, 20);

                PictureBox picQr = new PictureBox();
                picQr.BackColor = Color.White;
                picQr.Location = new Point(26, 30);
                picQr.Size = new Size(162, 162);
                picQr.SizeMode = PictureBoxSizeMode.StretchImage;

                Label lblQrSub = new Label();
                string qrTargetData = !string.IsNullOrEmpty(status.UpiId)
                    ? $"upi://pay?pa={Uri.EscapeDataString(status.UpiId.Trim())}&pn=EVedhika&am={status.MonthlyPriceInr:0}&cu=INR&tn={Uri.EscapeDataString("EVD-" + pcId)}"
                    : ((!string.IsNullOrEmpty(status.PaymentLinkUrl) && status.PaymentLinkUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                        ? status.PaymentLinkUrl.Trim()
                        : $"{DefaultCheckoutBaseUrl}?pay=1&pcId={Uri.EscapeDataString(pcId)}&pcName={Uri.EscapeDataString(machineName)}");
                lblQrSub.Text = !string.IsNullOrEmpty(status.UpiId) ? status.UpiId : "Scan Secure Checkout QR";
                lblQrSub.UseMnemonic = false;
                lblQrSub.Font = new Font("Consolas", 8.0f, FontStyle.Bold);
                lblQrSub.ForeColor = Color.FromArgb(203, 213, 225);
                lblQrSub.TextAlign = ContentAlignment.MiddleCenter;
                lblQrSub.Location = new Point(6, 198);
                lblQrSub.Size = new Size(201, 28);

                Button btnCopyUpi = new Button();
                btnCopyUpi.Text = !string.IsNullOrEmpty(status.UpiId) ? "Copy UPI ID" : "Copy Checkout Link";
                btnCopyUpi.UseMnemonic = false;
                btnCopyUpi.Location = new Point(14, 230);
                btnCopyUpi.Size = new Size(185, 25);
                btnCopyUpi.BackColor = Color.FromArgb(51, 65, 85);
                btnCopyUpi.ForeColor = Color.White;
                btnCopyUpi.Font = new Font("Segoe UI", 8.0f, FontStyle.Bold);
                btnCopyUpi.FlatStyle = FlatStyle.Flat;
                btnCopyUpi.Click += delegate {
                    try
                    {
                        string toCopy = !string.IsNullOrEmpty(status.UpiId)
                            ? status.UpiId.Trim()
                            : $"{DefaultCheckoutBaseUrl}?pay=1&pcId={Uri.EscapeDataString(pcId)}&pcName={Uri.EscapeDataString(machineName)}";
                        Clipboard.SetText(toCopy);
                        btnCopyUpi.Text = "Copied!";
                    }
                    catch { }
                };

                Button btnRefreshQr = new Button();
                btnRefreshQr.Text = "Reload QR Image";
                btnRefreshQr.UseMnemonic = false;
                btnRefreshQr.Location = new Point(14, 259);
                btnRefreshQr.Size = new Size(185, 23);
                btnRefreshQr.BackColor = Color.FromArgb(15, 23, 42);
                btnRefreshQr.ForeColor = Color.FromArgb(148, 163, 184);
                btnRefreshQr.Font = new Font("Segoe UI", 7.5f, FontStyle.Regular);
                btnRefreshQr.FlatStyle = FlatStyle.Flat;

                pnlQr.Controls.Add(lblQrHeader);
                pnlQr.Controls.Add(picQr);
                pnlQr.Controls.Add(lblQrSub);
                pnlQr.Controls.Add(btnCopyUpi);
                pnlQr.Controls.Add(btnRefreshQr);

                Action loadInAppQr = delegate {
                    System.Threading.ThreadPool.QueueUserWorkItem(delegate {
                        string[] qrEndpoints = new string[] {
                            "https://api.qrserver.com/v1/create-qr-code/?size=162x162&margin=4&data=" + Uri.EscapeDataString(qrTargetData),
                            "https://quickchart.io/qr?size=162&text=" + Uri.EscapeDataString(qrTargetData)
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
                                                    if (!dlg.IsDisposed && !picQr.IsDisposed)
                                                    {
                                                        Image prev = picQr.Image;
                                                        picQr.Image = bmp;
                                                        if (prev != null) { try { prev.Dispose(); } catch { } }
                                                    }
                                                    else
                                                    {
                                                        bmp.Dispose();
                                                    }
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
                btnRefreshQr.Click += delegate { loadInAppQr(); };
                loadInAppQr();

                Label lblPcIdTag = new Label();
                lblPcIdTag.Text = "Your PC Machine ID:";
                lblPcIdTag.Font = new Font("Segoe UI", 8.5f, FontStyle.Bold);
                lblPcIdTag.ForeColor = Color.FromArgb(148, 163, 184);
                lblPcIdTag.UseMnemonic = false;
                lblPcIdTag.Location = new Point(20, 200);
                lblPcIdTag.Size = new Size(300, 18);

                TextBox txtPcId = new TextBox();
                txtPcId.Text = $"{pcId} ({machineName})";
                txtPcId.ReadOnly = true;
                txtPcId.BackColor = Color.FromArgb(30, 41, 59);
                txtPcId.ForeColor = Color.FromArgb(52, 211, 153);
                txtPcId.Font = new Font("Consolas", 9.5f, FontStyle.Bold);
                txtPcId.Location = new Point(20, 220);
                txtPcId.Size = new Size(310, 26);

                Button btnCopy = new Button();
                btnCopy.Text = "Copy PC ID";
                btnCopy.UseMnemonic = false;
                btnCopy.Location = new Point(340, 218);
                btnCopy.Size = new Size(135, 28);
                btnCopy.BackColor = Color.FromArgb(51, 65, 85);
                btnCopy.ForeColor = Color.White;
                btnCopy.FlatStyle = FlatStyle.Flat;
                btnCopy.Click += delegate {
                    try
                    {
                        Clipboard.SetText(pcId);
                        btnCopy.Text = "Copied PC ID!";
                    }
                    catch { }
                };

                Label lblUtrPrompt = new Label();
                lblUtrPrompt.Text = $"Enter 12-Digit UPI UTR / Ref Number (for Rs.{status.MonthlyPriceInr:0} payment):";
                lblUtrPrompt.Font = new Font("Segoe UI", 9.0f, FontStyle.Bold);
                lblUtrPrompt.ForeColor = Color.FromArgb(251, 191, 36);
                lblUtrPrompt.UseMnemonic = false;
                lblUtrPrompt.Location = new Point(20, 258);
                lblUtrPrompt.Size = new Size(455, 20);

                TextBox txtUtr = new TextBox();
                txtUtr.Font = new Font("Consolas", 11, FontStyle.Bold);
                txtUtr.BackColor = Color.FromArgb(30, 41, 59);
                txtUtr.ForeColor = Color.White;
                txtUtr.Location = new Point(20, 282);
                txtUtr.Size = new Size(300, 30);

                Button btnSubmitUtr = new Button();
                btnSubmitUtr.Text = "Submit UTR";
                btnSubmitUtr.UseMnemonic = false;
                btnSubmitUtr.Location = new Point(330, 281);
                btnSubmitUtr.Size = new Size(145, 31);
                btnSubmitUtr.BackColor = Color.FromArgb(2, 132, 199);
                btnSubmitUtr.ForeColor = Color.White;
                btnSubmitUtr.Font = new Font("Segoe UI", 9.0f, FontStyle.Bold);
                btnSubmitUtr.FlatStyle = FlatStyle.Flat;

                Label lblUtrCounter = new Label();
                lblUtrCounter.Text = "UTR Format: 0 / 12 characters (enter 8-36 alphanumeric UTR)";
                lblUtrCounter.Font = new Font("Segoe UI", 8.0f, FontStyle.Regular);
                lblUtrCounter.ForeColor = Color.FromArgb(148, 163, 184);
                lblUtrCounter.UseMnemonic = false;
                lblUtrCounter.Location = new Point(20, 316);
                lblUtrCounter.Size = new Size(455, 18);

                txtUtr.TextChanged += delegate {
                    string clean = NormalizeUtr(txtUtr.Text);
                    if (clean.Length == 0)
                    {
                        lblUtrCounter.Text = "UTR Format: 0 / 12 characters (enter 8-36 alphanumeric UTR)";
                        lblUtrCounter.ForeColor = Color.FromArgb(148, 163, 184);
                    }
                    else if (clean.Length < 8)
                    {
                        lblUtrCounter.Text = $"UTR Format: {clean.Length} chars (need at least 8 digits/chars)";
                        lblUtrCounter.ForeColor = Color.FromArgb(251, 191, 36);
                    }
                    else if (clean.Length > 36)
                    {
                        lblUtrCounter.Text = $"UTR too long ({clean.Length} chars - max 36)";
                        lblUtrCounter.ForeColor = Color.FromArgb(248, 113, 113);
                    }
                    else
                    {
                        lblUtrCounter.Text = $"[READY] Clean UTR: {clean} ({clean.Length} chars) - Ready to Submit";
                        lblUtrCounter.ForeColor = Color.FromArgb(52, 211, 153);
                    }
                };

                Button btnOpenUpi = new Button();
                btnOpenUpi.Text = $"Open Web QR Checkout (Rs.{status.MonthlyPriceInr:0})";
                btnOpenUpi.UseMnemonic = false;
                btnOpenUpi.Location = new Point(20, 340);
                btnOpenUpi.Size = new Size(455, 34);
                btnOpenUpi.BackColor = Color.FromArgb(124, 58, 237);
                btnOpenUpi.ForeColor = Color.White;
                btnOpenUpi.Font = new Font("Segoe UI", 9.0f, FontStyle.Bold);
                btnOpenUpi.FlatStyle = FlatStyle.Flat;
                btnOpenUpi.Click += delegate {
                    try
                    {
                        if (!string.IsNullOrEmpty(status.UpiId)) Clipboard.SetText(status.UpiId);
                        loadInAppQr();
                        string targetUrl = (!string.IsNullOrEmpty(status.PaymentLinkUrl) &&
                            status.PaymentLinkUrl.StartsWith("http", StringComparison.OrdinalIgnoreCase))
                            ? status.PaymentLinkUrl.Trim()
                            : $"{DefaultCheckoutBaseUrl}?pay=1&pcId={Uri.EscapeDataString(pcId)}&pcName={Uri.EscapeDataString(machineName)}";
                        Process.Start(new ProcessStartInfo { FileName = targetUrl, UseShellExecute = true });
                    }
                    catch { }
                };

                Label lblLiveStatus = new Label();
                lblLiveStatus.Text = "Live Auto-Check: Active (auto-checks Admin approval every 10 seconds)";
                lblLiveStatus.Font = new Font("Segoe UI", 8.5f, FontStyle.Bold);
                lblLiveStatus.ForeColor = Color.FromArgb(56, 189, 248);
                lblLiveStatus.UseMnemonic = false;
                lblLiveStatus.Location = new Point(20, 386);
                lblLiveStatus.Size = new Size(685, 20);

                Label lblNote = new Label();
                lblNote.Text = SanitizeAsciiDisplay(status.PaymentNote, $"Standard Plan: Rs.{status.MonthlyPriceInr:0} for {status.DurationDays} Days. Duplicate UTRs are blocked automatically.");
                lblNote.Font = new Font("Segoe UI", 8.5f, FontStyle.Italic);
                lblNote.ForeColor = Color.FromArgb(148, 163, 184);
                lblNote.UseMnemonic = false;
                lblNote.Location = new Point(20, 410);
                lblNote.Size = new Size(685, 36);

                Button btnRecheck = new Button();
                btnRecheck.Text = "Re-Check License Now";
                btnRecheck.UseMnemonic = false;
                btnRecheck.Location = new Point(20, 454);
                btnRecheck.Size = new Size(270, 42);
                btnRecheck.BackColor = Color.FromArgb(16, 185, 129);
                btnRecheck.ForeColor = Color.White;
                btnRecheck.Font = new Font("Segoe UI", 9.5f, FontStyle.Bold);
                btnRecheck.FlatStyle = FlatStyle.Flat;

                Button btnClose = new Button();
                btnClose.Text = "Close";
                btnClose.UseMnemonic = false;
                btnClose.Location = new Point(560, 454);
                btnClose.Size = new Size(145, 42);
                btnClose.BackColor = Color.FromArgb(71, 85, 105);
                btnClose.ForeColor = Color.White;
                btnClose.FlatStyle = FlatStyle.Flat;
                btnClose.Click += delegate { dlg.Close(); };

                bool checkInFlight = false;
                bool unlocked = false;
                System.Windows.Forms.Timer autoPollTimer = new System.Windows.Forms.Timer();
                autoPollTimer.Interval = 10000;

                Action<bool> triggerLicenseCheck = delegate(bool manualClick) {
                    if (checkInFlight || unlocked || dlg.IsDisposed) return;
                    checkInFlight = true;
                    if (manualClick)
                    {
                        btnRecheck.Enabled = false;
                        btnSubmitUtr.Enabled = false;
                        btnRecheck.Text = "Checking License...";
                    }
                    else
                    {
                        lblLiveStatus.Text = "Live Auto-Check: Checking cloud approval status...";
                    }

                    System.Threading.ThreadPool.QueueUserWorkItem(delegate {
                        LicenseStatusResult fresh = null;
                        try
                        {
                            fresh = CheckRemoteLicenseStatus(true);
                        }
                        catch { }
                        if (!dlg.IsDisposed && dlg.IsHandleCreated)
                        {
                            dlg.BeginInvoke((MethodInvoker)delegate {
                                checkInFlight = false;
                                if (dlg.IsDisposed) return;
                                if (manualClick)
                                {
                                    btnRecheck.Enabled = true;
                                    btnSubmitUtr.Enabled = true;
                                    btnRecheck.Text = "Re-Check License Now";
                                }

                                if (fresh != null && fresh.IsAllowed)
                                {
                                    unlocked = true;
                                    try { autoPollTimer.Stop(); } catch { }
                                    lblLiveStatus.ForeColor = Color.FromArgb(52, 211, 153);
                                    lblLiveStatus.Text = "[ACTIVATED] " + fresh.SummaryText;
                                    MessageBox.Show(dlg, $"[OK] License Active!\n{fresh.SummaryText}", "Activated", MessageBoxButtons.OK, MessageBoxIcon.Information);
                                    dlg.DialogResult = DialogResult.OK;
                                    dlg.Close();
                                }
                                else
                                {
                                    string sum = fresh != null ? fresh.SummaryText : status.SummaryText;
                                    lblLiveStatus.Text = $"Live Auto-Check ({DateTime.Now:HH:mm:ss}): Waiting for Admin approval (checks every 10s)";
                                    if (manualClick)
                                    {
                                        MessageBox.Show(dlg, $"Still waiting for Admin activation.\n{sum}", "Not Active Yet", MessageBoxButtons.OK, MessageBoxIcon.Warning);
                                    }
                                }
                            });
                        }
                        else
                        {
                            checkInFlight = false;
                        }
                    });
                };

                autoPollTimer.Tick += delegate { triggerLicenseCheck(false); };
                btnRecheck.Click += delegate { triggerLicenseCheck(true); };

                btnSubmitUtr.Click += delegate {
                    string rawUtr = txtUtr.Text;
                    string cleanUtr = NormalizeUtr(rawUtr);
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
                                if (ok)
                                {
                                    txtUtr.Text = "";
                                    lblLiveStatus.ForeColor = Color.FromArgb(52, 211, 153);
                                    lblLiveStatus.Text = $"[UTR SUBMITTED: {cleanUtr}] Auto-checking Admin approval every 10s...";
                                }
                                MessageBox.Show(dlg, msg, ok ? "UTR Submitted" : "UTR Validation", MessageBoxButtons.OK, ok ? MessageBoxIcon.Information : MessageBoxIcon.Warning);
                            });
                        }
                    });
                };

                dlg.Shown += delegate {
                    try { autoPollTimer.Start(); } catch { }
                };

                dlg.FormClosed += delegate {
                    try { autoPollTimer.Stop(); autoPollTimer.Dispose(); } catch { }
                    try
                    {
                        if (picQr.Image != null)
                        {
                            Image img = picQr.Image;
                            picQr.Image = null;
                            img.Dispose();
                        }
                    }
                    catch { }
                };

                dlg.Controls.Add(lblTitle);
                dlg.Controls.Add(pnlSteps);
                dlg.Controls.Add(lblInfo);
                dlg.Controls.Add(pnlQr);
                dlg.Controls.Add(lblPcIdTag);
                dlg.Controls.Add(txtPcId);
                dlg.Controls.Add(btnCopy);
                dlg.Controls.Add(lblUtrPrompt);
                dlg.Controls.Add(txtUtr);
                dlg.Controls.Add(btnSubmitUtr);
                dlg.Controls.Add(lblUtrCounter);
                dlg.Controls.Add(btnOpenUpi);
                dlg.Controls.Add(lblLiveStatus);
                dlg.Controls.Add(lblNote);
                dlg.Controls.Add(btnRecheck);
                dlg.Controls.Add(btnClose);

                if (owner != null) dlg.ShowDialog(owner);
                else dlg.ShowDialog();
            }
        }

        private static string SanitizeAsciiDisplay(string text, string fallback)
        {
            if (string.IsNullOrWhiteSpace(text)) return fallback;
            StringBuilder sb = new StringBuilder();
            foreach (char c in text)
            {
                if (c >= 32 && c <= 126) sb.Append(c);
                else if (c == '\r' || c == '\n') sb.Append(' ');
            }
            string cleaned = Regex.Replace(sb.ToString(), @"\s{2,}", " ").Trim();
            return cleaned.Length >= 8 ? cleaned : fallback;
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
            bool notFound;
            return DownloadJsonWithStatus(url, out notFound);
        }

        private static string DownloadJsonWithStatus(string url, out bool notFound)
        {
            notFound = false;
            try
            {
                using (TimeoutWebClient wc = new TimeoutWebClient(8000))
                {
                    wc.Encoding = Encoding.UTF8;
                    wc.Headers[HttpRequestHeader.UserAgent] = "EVedhikaUBDTool/1.1.0";
                    return wc.DownloadString(url);
                }
            }
            catch (WebException wex)
            {
                try
                {
                    HttpWebResponse resp = wex.Response as HttpWebResponse;
                    if (resp != null && resp.StatusCode == HttpStatusCode.NotFound)
                    {
                        notFound = true;
                    }
                }
                catch { }
                return "";
            }
            catch
            {
                return "";
            }
        }

        private static string ExtractFlatString(string json, string fieldName)
        {
            if (string.IsNullOrEmpty(json) || string.IsNullOrEmpty(fieldName)) return "";
            Match m = Regex.Match(
                json,
                "\"" + Regex.Escape(fieldName) + "\"\\s*:\\s*\"((?:\\\\.|[^\"])*)\"",
                RegexOptions.Singleline);
            if (!m.Success) return "";
            return m.Groups[1].Value.Replace("\\\"", "\"").Replace("\\\\", "\\");
        }

        private static double ExtractFlatNumber(string json, string fieldName, double fallbackVal)
        {
            if (string.IsNullOrEmpty(json) || string.IsNullOrEmpty(fieldName)) return fallbackVal;
            Match m = Regex.Match(
                json,
                "\"" + Regex.Escape(fieldName) + "\"\\s*:\\s*([0-9]+(?:\\.[0-9]+)?)",
                RegexOptions.Singleline);
            if (!m.Success) return fallbackVal;
            double parsed;
            if (double.TryParse(m.Groups[1].Value, NumberStyles.Any, CultureInfo.InvariantCulture, out parsed))
                return parsed;
            return fallbackVal;
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
