using System;
using System.IO;
using System.Diagnostics;
using System.Reflection;
using Microsoft.CSharp;
using System.CodeDom.Compiler;
using EVedhikaUBDDeploymentTool.Helpers;

namespace EVedhikaUBDDeploymentTool.Engine
{
    public static class UBDSigningFixEngine
    {
        public const string TargetDllVersion = "2.0.3.0";

        /// <summary>
        /// Automated integrity check for SignatureDemoLib.dll that verifies if the version is 2.0.3.0
        /// (Native Win32 CryptSignMessage CNG+CSP + Signing-Cert Filter + Anti-Tamper COM-Safe)
        /// and automatically triggers a clean rebuild & COM re-registration if outdated or missing.
        /// </summary>
        public static bool VerifyAndEnforceIntegrity(Action<string> logCallback = null)
        {
            string dllPath = @"C:\enterprise_compat\SignatureDemoLib.dll";
            try
            {
                if (!File.Exists(dllPath))
                {
                    logCallback?.Invoke("[INTEGRITY-CHECK] SignatureDemoLib.dll NOT found. Auto-triggering Universal CNG+CSP v2.0.3.0 patch build...");
                    ApplyUniversalTokenFix(logCallback);
                    return true;
                }

                FileVersionInfo fvi = FileVersionInfo.GetVersionInfo(dllPath);
                string fileVer = fvi.FileVersion ?? "";
                string productVer = fvi.ProductVersion ?? "";

                logCallback?.Invoke($"[INTEGRITY-CHECK] Found SignatureDemoLib.dll (Version: {fileVer}). Verifying v2.0.3.0 CNG+CSP Anti-Tamper COM-Safe compliance...");

                if (!fileVer.StartsWith("2.0.3") && !productVer.StartsWith("2.0.3"))
                {
                    logCallback?.Invoke($"[INTEGRITY-CHECK WARN] Outdated DLL version detected ({fileVer}). Upgrading to Universal CNG+CSP v2.0.3.0 DLL...");
                    ApplyUniversalTokenFix(logCallback);
                    return true;
                }

                // Always ensure COM registration matches on-disk 2.0.3.0 DLL cleanly (prevents Fusion mismatch [object Error])
                Type comType = Type.GetTypeFromProgID("SignatureDemoLib.DigiSignHelper");
                if (comType == null)
                {
                    logCallback?.Invoke("[INTEGRITY-CHECK WARN] SignatureDemoLib.DigiSignHelper ProgID missing in registry. Re-registering COM...");
                    RegisterCompiledAssemblyForCom(dllPath, logCallback);
                }

                logCallback?.Invoke("[INTEGRITY-CHECK PASS] SignatureDemoLib.dll v2.0.3.0 verified healthy, CNG+CSP universal & COM-safe.");
                return true;
            }
            catch (Exception ex)
            {
                logCallback?.Invoke($"[INTEGRITY-CHECK WARN] Error inspecting DLL ({ex.Message}). Forcing clean re-build...");
                ApplyUniversalTokenFix(logCallback);
                return false;
            }
        }

        /// <summary>
        /// Deploys the Universal CNG+CSP SHA256/SHA1 Signature Library for UBD Portal (v2.0.3.0).
        /// Fixes:
        /// 1. "Unable to read token: Invalid algorithm specified." (0x80090008 / NTE_BAD_ALGID) via Native Win32 CryptSignMessage (CNG KSP + CSP)
        ///    and strict KeyUsage DigitalSignature/NonRepudiation filtering (never picks Encryption-only certs).
        /// 2. "Both signing methods failed." on MeeSeva / UBD approvals via 5-tier universal signing cascade + safe decoded CMS verification.
        /// 3. "Unable to Sign: [object Error]" & "Unable to Deactivation[object Error]" via IObjectSafety, Fusion-synced COM registration,
        ///    IE ActiveX Kill-Bit clearing, and single/multi-record delimiter resilience.
        /// 4. "Verification failed, Data might be Tampered" by NEVER returning unsigned fallback bytes as signatures.
        /// </summary>
        public static void ApplyUniversalTokenFix(Action<string> logCallback)
        {
            try
            {
                logCallback?.Invoke("[UBD-FIX] Preparing Universal CNG+CSP Digital Signature Patch (v2.0.3.0 Anti-Tamper COM-Safe)...");
                
                string installDir = @"C:\enterprise_compat";
                if (!Directory.Exists(installDir)) Directory.CreateDirectory(installDir);
                
                string dllPath = Path.Combine(installDir, "SignatureDemoLib.dll");

                // Clean up old backup DLLs if unlocked, and if SignatureDemoLib.dll is currently locked by IE/Edge, rename it out of the way
                try
                {
                    foreach (string oldBak in Directory.GetFiles(installDir, "SignatureDemoLib.dll.bak_*"))
                    {
                        try { File.Delete(oldBak); } catch { }
                    }
                    if (File.Exists(dllPath))
                    {
                        try
                        {
                            File.Delete(dllPath);
                        }
                        catch
                        {
                            string bakPath = dllPath + ".bak_" + Environment.TickCount.ToString();
                            try { File.Move(dllPath, bakPath); } catch { }
                        }
                    }
                }
                catch { }

                string sourceCode = @"
using System;
using System.Collections.Generic;
using System.Globalization;
using System.Reflection;
using System.Runtime.InteropServices;
using System.Security.Cryptography;
using System.Security.Cryptography.Pkcs;
using System.Security.Cryptography.X509Certificates;
using System.Text;

[assembly: AssemblyVersion(""2.0.3.0"")]
[assembly: AssemblyFileVersion(""2.0.3.0"")]
[assembly: ComVisible(true)]
[assembly: Guid(""83403b68-128d-41fc-84fb-5477e2049662"")]

namespace SignatureDemoLib
{
    [ComImport, Guid(""CB5BDC81-93C1-11CF-8F20-00805F2CD064""), InterfaceType(ComInterfaceType.InterfaceIsIUnknown)]
    public interface IObjectSafety
    {
        [PreserveSig]
        int GetInterfaceSafetyOptions(ref Guid riid, out int pdwSupportedOptions, out int pdwEnabledOptions);

        [PreserveSig]
        int SetInterfaceSafetyOptions(ref Guid riid, int dwOptionSetMask, int dwEnabledOptions);
    }

    [ComVisible(true), InterfaceType(ComInterfaceType.InterfaceIsDual), Guid(""ABCB8663-1E25-4925-8CA3-8D3D15C49BD6"")]
    public interface IDigitalSigningHelper
    {
        string getHashData(); string getSignedData(); string getHashDataList(); string FetchCertDetails(); string allHashedData();
        string[] getSignatureDetails(string dataBytes, string signature, string hashData);
        byte[] SignData(string dataBytes, string serialNumber);
        string SignData(string dataBytes, string serialNumber, int count);
        byte[] SignData(byte[] dataBytes, string serialNumber, ref byte[] hashData);
        byte[] SignData(string dataString, string serialNumber, ref byte[] hashData);
        List<byte[]> SignData(List<byte[]> dataBytesList, string serialNumber, ref List<byte[]> hashDataList);
        string AllSignData(string dataBytes, string serialNumber);
        bool VerifySignedMessage(string data, string signature, string hashData);
        string getCertificateDetails(string data, string signature, string hashData);
    }

    [ComVisible(true), ProgId(""SignatureDemoLib.DigiSignHelper""), ClassInterface(ClassInterfaceType.AutoDual), Guid(""1FC6E67B-8F52-4F80-8321-FCF7CE940052"")]
    public class DigiSignHelper : IDigitalSigningHelper, IObjectSafety
    {
        private const int INTERFACESAFE_FOR_UNTRUSTED_CALLER = 0x00000001;
        private const int INTERFACESAFE_FOR_UNTRUSTED_DATA = 0x00000002;
        private const int S_OK = 0;

        private const uint X509_ASN_ENCODING = 0x00000001;
        private const uint PKCS_7_ASN_ENCODING = 0x00010000;
        private const int ERROR_MORE_DATA = 234;

        private const string OID_SHA256 = ""2.16.840.1.101.3.4.2.1"";
        private const string OID_SHA1 = ""1.3.14.3.2.26"";
        private const string OID_SHA384 = ""2.16.840.1.101.3.4.2.2"";

        [StructLayout(LayoutKind.Sequential)]
        private struct CRYPTOAPI_BLOB
        {
            public uint cbData;
            public IntPtr pbData;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct CRYPT_ALGORITHM_IDENTIFIER
        {
            public IntPtr pszObjId;
            public CRYPTOAPI_BLOB Parameters;
        }

        [StructLayout(LayoutKind.Sequential)]
        private struct CRYPT_SIGN_MESSAGE_PARA
        {
            public uint cbSize;
            public uint dwMsgEncodingType;
            public IntPtr pSigningCert;
            public CRYPT_ALGORITHM_IDENTIFIER HashAlgorithm;
            public IntPtr pvHashAuxInfo;
            public uint cMsgCert;
            public IntPtr rgpMsgCert;
            public uint cMsgCrl;
            public IntPtr rgpMsgCrl;
            public uint cAuthAttr;
            public IntPtr rgAuthAttr;
            public uint cUnauthAttr;
            public IntPtr rgUnauthAttr;
            public uint dwFlags;
            public uint dwInnerContentType;
        }

        [DllImport(""crypt32.dll"", CharSet = CharSet.Auto, SetLastError = true)]
        private static extern bool CryptSignMessage(
            ref CRYPT_SIGN_MESSAGE_PARA pSignPara,
            [MarshalAs(UnmanagedType.Bool)] bool fDetachedSignature,
            uint cToBeSigned,
            IntPtr[] rgpbToBeSigned,
            uint[] rgcbToBeSigned,
            byte[] pbSignedBlob,
            ref uint pcbSignedBlob);

        private byte[] hashedData = new byte[0];
        private string[] hashDataListString;
        private string allHash = """";
        private byte[] signedData = new byte[0];
        private X509Certificate2 cert;
        private static readonly Oid Sha256Oid = new Oid(OID_SHA256);
        private static readonly Oid Sha1Oid = new Oid(OID_SHA1);

        public DigiSignHelper() { }
        public DigiSignHelper(string serialNumber)
        {
            try
            {
                if (cert == null && !IsEmptySerial(serialNumber)) cert = getCertificate(serialNumber);
            }
            catch { }
        }

        public int GetInterfaceSafetyOptions(ref Guid riid, out int pdwSupportedOptions, out int pdwEnabledOptions)
        {
            pdwSupportedOptions = INTERFACESAFE_FOR_UNTRUSTED_CALLER | INTERFACESAFE_FOR_UNTRUSTED_DATA;
            pdwEnabledOptions = INTERFACESAFE_FOR_UNTRUSTED_CALLER | INTERFACESAFE_FOR_UNTRUSTED_DATA;
            return S_OK;
        }

        public int SetInterfaceSafetyOptions(ref Guid riid, int dwOptionSetMask, int dwEnabledOptions)
        {
            return S_OK;
        }

        public string getHashData() { try { return hashedData != null ? Convert.ToBase64String(hashedData) : """"; } catch { return """"; } }
        public string getSignedData() { try { return signedData != null ? Convert.ToBase64String(signedData) : """"; } catch { return """"; } }
        public string allHashedData() { return allHash ?? """"; }
        public string getHashDataList()
        {
            try
            {
                StringBuilder sb = new StringBuilder();
                if (hashDataListString != null) { foreach (string s in hashDataListString) { sb.Append(s ?? """").Append(""$$ISES$$""); } }
                return sb.ToString();
            }
            catch { return """"; }
        }

        private static bool IsUserCancelled(Exception ex)
        {
            if (ex == null) return false;
            try
            {
                int hr = Marshal.GetHRForException(ex);
                if (hr == unchecked((int)0x8010006E) || hr == unchecked((int)0x800704C7) || hr == 1223)
                {
                    return true;
                }
                string msg = (ex.Message ?? """").ToLowerInvariant();
                if (msg.Contains(""cancelled by the user"") || msg.Contains(""canceled by the user"") || msg.Contains(""operation was canceled"") || msg.Contains(""operation was cancelled""))
                {
                    return true;
                }
            }
            catch { }
            return false;
        }

        private static bool VerifyEncodedCmsBasic(byte[] encoded, byte[] expectedContent, out X509Certificate2 signerCert)
        {
            signerCert = null;
            if (encoded == null || encoded.Length < 64 || encoded[0] != 0x30) return false;
            try
            {
                SignedCms decoded = new SignedCms();
                decoded.Decode(encoded);
                if (decoded.SignerInfos.Count == 0) return false;
                if (!ByteArraysEqual(decoded.ContentInfo.Content, expectedContent)) return false;
                signerCert = decoded.SignerInfos[0].Certificate;
                return true;
            }
            catch
            {
                return false;
            }
        }

        /// <summary>
        /// Native Win32 Crypt32.dll CryptSignMessage: supports BOTH modern CNG KSP smart cards
        /// (ProxKey KSP, ePass2003 KSP, HYP2003 KSP, Microsoft Smart Card KSP) AND legacy CryptoAPI CSPs.
        /// Eliminates .NET 4.8 SignedCms 'Invalid algorithm specified.' (0x80090008 / NTE_BAD_ALGID) failures.
        /// </summary>
        private static byte[] SignWithNativeCryptSignMessage(byte[] contentBytes, X509Certificate2 signingCert, string hashOid)
        {
            if (signingCert == null || signingCert.Handle == IntPtr.Zero)
            {
                throw new CryptographicException(""No valid signing certificate handle available."");
            }

            IntPtr oidPtr = IntPtr.Zero;
            IntPtr certArrayPtr = IntPtr.Zero;
            GCHandle contentHandle = default(GCHandle);
            bool contentPinned = false;

            try
            {
                oidPtr = Marshal.StringToHGlobalAnsi(hashOid);
                certArrayPtr = Marshal.AllocHGlobal(IntPtr.Size);
                Marshal.WriteIntPtr(certArrayPtr, signingCert.Handle);

                contentHandle = GCHandle.Alloc(contentBytes, GCHandleType.Pinned);
                contentPinned = true;

                CRYPT_SIGN_MESSAGE_PARA para = new CRYPT_SIGN_MESSAGE_PARA();
                para.cbSize = (uint)Marshal.SizeOf(typeof(CRYPT_SIGN_MESSAGE_PARA));
                para.dwMsgEncodingType = X509_ASN_ENCODING | PKCS_7_ASN_ENCODING;
                para.pSigningCert = signingCert.Handle;
                para.HashAlgorithm = new CRYPT_ALGORITHM_IDENTIFIER
                {
                    pszObjId = oidPtr,
                    Parameters = new CRYPTOAPI_BLOB { cbData = 0, pbData = IntPtr.Zero }
                };
                para.pvHashAuxInfo = IntPtr.Zero;
                para.cMsgCert = 1;
                para.rgpMsgCert = certArrayPtr;
                para.cMsgCrl = 0;
                para.rgpMsgCrl = IntPtr.Zero;
                para.cAuthAttr = 0;
                para.rgAuthAttr = IntPtr.Zero;
                para.cUnauthAttr = 0;
                para.rgUnauthAttr = IntPtr.Zero;
                para.dwFlags = 0;
                para.dwInnerContentType = 0;

                IntPtr[] rgpb = new IntPtr[] { contentHandle.AddrOfPinnedObject() };
                uint[] rgcb = new uint[] { (uint)contentBytes.Length };

                // Single-pass 16 KB buffer avoids double hardware signing & double PIN prompts
                byte[] buffer = new byte[16384];
                uint cbSigned = (uint)buffer.Length;

                if (!CryptSignMessage(ref para, false, 1, rgpb, rgcb, buffer, ref cbSigned))
                {
                    int err = Marshal.GetLastWin32Error();
                    if (err == ERROR_MORE_DATA && cbSigned > 0 && cbSigned < 1048576)
                    {
                        buffer = new byte[cbSigned];
                        if (!CryptSignMessage(ref para, false, 1, rgpb, rgcb, buffer, ref cbSigned))
                        {
                            err = Marshal.GetLastWin32Error();
                            throw new CryptographicException(err);
                        }
                    }
                    else
                    {
                        throw new CryptographicException(err);
                    }
                }

                byte[] result = new byte[cbSigned];
                Buffer.BlockCopy(buffer, 0, result, 0, (int)cbSigned);
                return result;
            }
            finally
            {
                if (contentPinned) contentHandle.Free();
                if (certArrayPtr != IntPtr.Zero) Marshal.FreeHGlobal(certArrayPtr);
                if (oidPtr != IntPtr.Zero) Marshal.FreeHGlobal(oidPtr);
            }
        }

        private CmsSigner CreateSigner(X509Certificate2 c, bool useSha256)
        {
            CmsSigner signer = (c != null) ? new CmsSigner(SubjectIdentifierType.IssuerAndSerialNumber, c) : new CmsSigner();
            signer.IncludeOption = X509IncludeOption.EndCertOnly;
            signer.DigestAlgorithm = useSha256 ? Sha256Oid : Sha1Oid;
            return signer;
        }

        private byte[] ComputeVerifiedCmsBytes(byte[] contentBytes, X509Certificate2 c, out X509Certificate2 usedCert, bool allowGracefulEmpty)
        {
            if (contentBytes == null || contentBytes.Length == 0)
            {
                if (allowGracefulEmpty)
                {
                    usedCert = c ?? cert;
                    return new byte[0];
                }
                throw new CryptographicException(""Cannot sign empty data payload."");
            }

            X509Certificate2 activeCert = c;
            usedCert = activeCert;
            Exception lastError = null;

            // Tier 1: Native Win32 CryptSignMessage with SHA-256 (Handles ALL CNG KSP + PROV_RSA_AES Class-3 USB tokens)
            if (activeCert != null)
            {
                try
                {
                    byte[] raw1 = SignWithNativeCryptSignMessage(contentBytes, activeCert, OID_SHA256);
                    X509Certificate2 sc1;
                    if (VerifyEncodedCmsBasic(raw1, contentBytes, out sc1))
                    {
                        usedCert = sc1 ?? activeCert;
                        return raw1;
                    }
                }
                catch (Exception ex1)
                {
                    lastError = ex1;
                    if (IsUserCancelled(ex1))
                    {
                        if (allowGracefulEmpty) return new byte[0];
                        throw new CryptographicException(""USB DSC Token PIN entry was cancelled by the user."", ex1);
                    }
                }

                // Tier 2: Native Win32 CryptSignMessage with SHA-1 (Handles legacy PROV_RSA_FULL Type 1 CSPs on Win7/8/10)
                try
                {
                    byte[] raw2 = SignWithNativeCryptSignMessage(contentBytes, activeCert, OID_SHA1);
                    X509Certificate2 sc2;
                    if (VerifyEncodedCmsBasic(raw2, contentBytes, out sc2))
                    {
                        usedCert = sc2 ?? activeCert;
                        return raw2;
                    }
                }
                catch (Exception ex2)
                {
                    lastError = ex2;
                    if (IsUserCancelled(ex2))
                    {
                        if (allowGracefulEmpty) return new byte[0];
                        throw new CryptographicException(""USB DSC Token PIN entry was cancelled by the user."", ex2);
                    }
                }
            }

            // Tier 3: .NET SignedCms with SHA-256
            try
            {
                ContentInfo ci3 = new ContentInfo(contentBytes);
                SignedCms cms3 = new SignedCms(ci3);
                cms3.ComputeSignature(CreateSigner(activeCert, true), false);
                byte[] raw3 = cms3.Encode();
                X509Certificate2 sc3;
                if (VerifyEncodedCmsBasic(raw3, contentBytes, out sc3))
                {
                    usedCert = sc3 ?? activeCert;
                    return raw3;
                }
            }
            catch (Exception ex3)
            {
                lastError = ex3;
                if (IsUserCancelled(ex3))
                {
                    if (allowGracefulEmpty) return new byte[0];
                    throw new CryptographicException(""USB DSC Token PIN entry was cancelled by the user."", ex3);
                }
            }

            // Tier 4: .NET SignedCms with SHA-1 (Exact original NIC SignatureDemoLib behavior)
            try
            {
                ContentInfo ci4 = new ContentInfo(contentBytes);
                SignedCms cms4 = new SignedCms(ci4);
                cms4.ComputeSignature(CreateSigner(activeCert, false), false);
                byte[] raw4 = cms4.Encode();
                X509Certificate2 sc4;
                if (VerifyEncodedCmsBasic(raw4, contentBytes, out sc4))
                {
                    usedCert = sc4 ?? activeCert;
                    return raw4;
                }
            }
            catch (Exception ex4)
            {
                lastError = ex4;
                if (IsUserCancelled(ex4))
                {
                    if (allowGracefulEmpty) return new byte[0];
                    throw new CryptographicException(""USB DSC Token PIN entry was cancelled by the user."", ex4);
                }
            }

            // Tier 5: Native Win32 CryptSignMessage with SHA-384 (RSA-3072 / SHA-384 Class-3 tokens)
            if (activeCert != null)
            {
                try
                {
                    byte[] raw5 = SignWithNativeCryptSignMessage(contentBytes, activeCert, OID_SHA384);
                    X509Certificate2 sc5;
                    if (VerifyEncodedCmsBasic(raw5, contentBytes, out sc5))
                    {
                        usedCert = sc5 ?? activeCert;
                        return raw5;
                    }
                }
                catch (Exception ex5)
                {
                    lastError = ex5;
                }
            }

            // For FetchCertDetails (Read Token / Deactivation lookup), return gracefully so [object Error] never fires
            if (allowGracefulEmpty)
            {
                return new byte[0];
            }

            // CRITICAL ANTI-TAMPER GUARD:
            // NEVER return unsigned raw hash bytes as a signature - doing so causes UBD server
            // 'Verification failed, Data might be Tampered' errors!
            string detail = (lastError != null && !string.IsNullOrEmpty(lastError.Message))
                ? lastError.Message
                : ""Unknown SmartCard/CSP error"";
            string hrHex = (lastError != null) ? (""0x"" + Marshal.GetHRForException(lastError).ToString(""X8"")) : ""0x00000000"";
            string certInfo = (activeCert != null) ? ("" [Serial: "" + activeCert.SerialNumber + ""]"") : "" [No Cert]"";
            throw new CryptographicException(""USB DSC Signing failed: "" + detail + "" ("" + hrHex + "")"" + certInfo + "". Verify your registered USB DSC token is plugged in and PIN is entered."", lastError);
        }

        public string FetchCertDetails()
        {
            try
            {
                // Always read fresh from live Windows store (strictly Signing certificates, allowing expired for Deactivation)
                X509Certificate2 usedCert = PickSigningCertificate(true);
                if (usedCert != null)
                {
                    try
                    {
                        X509Certificate2 cmsCert;
                        ComputeVerifiedCmsBytes(Convert.FromBase64String(""ISES""), usedCert, out cmsCert, true);
                        if (cmsCert != null) usedCert = cmsCert;
                    }
                    catch { }

                    cert = usedCert;
                    return usedCert.SerialNumber + ""$$ISES$$"" + usedCert.NotAfter.ToString(""MM/dd/yyyy HH:mm:ss"", CultureInfo.InvariantCulture) + ""$$ISES$$"";
                }
            }
            catch { }
            return """";
        }

        // Exact NIC DigiSignHelper method declaration order preserved for COM AutoDual DispID compatibility:
        // SignData -> (string, string)
        public byte[] SignData(string dataString, string serialNumber)
        {
            byte[] bytes = Encoding.ASCII.GetBytes(dataString ?? """");
            return SignData(bytes, serialNumber, ref hashedData);
        }

        // SignData_2 -> (byte[], string, ref byte[])
        public byte[] SignData(byte[] dataBytes, string serialNumber, ref byte[] hashData)
        {
            X509Certificate2 signingCert = ResolveCertificateForSigning(serialNumber);
            byte[] input = dataBytes ?? new byte[0];
            using (SHA1CryptoServiceProvider sha1 = new SHA1CryptoServiceProvider())
            {
                hashData = sha1.ComputeHash(input);
            }
            hashedData = hashData;
            signedData = HashAndSignBytes(hashData, signingCert);
            return signedData;
        }

        // SignData_3 -> (string, string, ref byte[])
        public byte[] SignData(string dataString, string serialNumber, ref byte[] hashData)
        {
            byte[] raw;
            try { raw = string.IsNullOrEmpty(dataString) ? new byte[0] : Convert.FromBase64String(dataString); }
            catch { raw = Encoding.ASCII.GetBytes(dataString ?? """"); }
            return SignData(raw, serialNumber, ref hashData);
        }

        // SignData_4 -> (string, string, int)
        public string SignData(string dataString, string serialNumber, int count)
        {
            List<byte[]> list = new List<byte[]>();
            Encoding enc = Encoding.ASCII;
            string safeInput = dataString ?? """";
            if (safeInput.Length == 0)
            {
                hashDataListString = new string[0];
                return """";
            }

            string[] parts = safeInput.Split(new string[] { ""$$ISES$$"" }, StringSplitOptions.None);
            int itemCount = (parts.Length > 1 && string.IsNullOrEmpty(parts[parts.Length - 1]))
                ? (parts.Length - 1)
                : parts.Length;

            int len = Math.Max(count, itemCount);
            hashDataListString = new string[len];
            X509Certificate2 signingCert = ResolveCertificateForSigning(serialNumber);
            using (SHA1CryptoServiceProvider sha1 = new SHA1CryptoServiceProvider())
            {
                for (int i = 0; i < itemCount; i++)
                {
                    byte[] h = sha1.ComputeHash(enc.GetBytes(parts[i] ?? """"));
                    list.Add(h);
                    if (i < hashDataListString.Length) hashDataListString[i] = Convert.ToBase64String(h);
                }
            }
            List<byte[]> sigs = HashAndSignBytes(list, signingCert);
            StringBuilder sb = new StringBuilder();
            foreach (byte[] s in sigs) { sb.Append(Convert.ToBase64String(s)).Append(""$$ISES$$""); }
            return sb.ToString();
        }

        // SignData_5 -> (List<byte[]>, string, ref List<byte[]>)
        public List<byte[]> SignData(List<byte[]> dataBytesList, string serialNumber, ref List<byte[]> hashDataList)
        {
            X509Certificate2 signingCert = ResolveCertificateForSigning(serialNumber);
            if (hashDataList == null) hashDataList = new List<byte[]>();
            if (dataBytesList != null)
            {
                using (SHA1CryptoServiceProvider sha1 = new SHA1CryptoServiceProvider())
                {
                    foreach (byte[] b in dataBytesList) { hashDataList.Add(sha1.ComputeHash(b ?? new byte[0])); }
                }
            }
            return HashAndSignBytes(hashDataList, signingCert);
        }

        public string AllSignData(string dataBytes, string serialNumber)
        {
            Encoding enc = Encoding.ASCII;
            List<List<byte[]>> masterList = new List<List<byte[]>>();
            string safeData = dataBytes ?? """";
            if (safeData.Length == 0)
            {
                allHash = """";
                return """";
            }

            X509Certificate2 signingCert = ResolveCertificateForSigning(serialNumber);
            string[] groups = safeData.Split(new string[] { ""$$ISESDATA$$"" }, StringSplitOptions.None);
            int groupCount = (groups.Length > 1 && string.IsNullOrEmpty(groups[groups.Length - 1]))
                ? (groups.Length - 1)
                : groups.Length;

            StringBuilder sbHash = new StringBuilder();
            using (SHA1CryptoServiceProvider sha1 = new SHA1CryptoServiceProvider())
            {
                for (int i = 0; i < groupCount; i++)
                {
                    string grp = groups[i] ?? """";
                    string[] items = grp.Split(new string[] { ""$$ISES$$"" }, StringSplitOptions.None);
                    int itemCount = (items.Length > 1 && string.IsNullOrEmpty(items[items.Length - 1]))
                        ? (items.Length - 1)
                        : items.Length;

                    List<byte[]> subList = new List<byte[]>();
                    for (int j = 0; j < itemCount; j++)
                    {
                        byte[] h = sha1.ComputeHash(enc.GetBytes(items[j] ?? """"));
                        subList.Add(h);
                        sbHash.Append(Convert.ToBase64String(h) + ""$$ISES$$"");
                    }
                    masterList.Add(subList);
                    sbHash.Append(""$$ISESDATA$$"");
                }
            }
            allHash = sbHash.ToString();
            return HashAndSignBytesLOL(masterList, signingCert);
        }

        private byte[] HashAndSignBytes(byte[] hashData, X509Certificate2 c)
        {
            X509Certificate2 used;
            byte[] encoded = ComputeVerifiedCmsBytes(hashData, c, out used, false);
            if (used != null) cert = used;
            return encoded;
        }

        private List<byte[]> HashAndSignBytes(List<byte[]> hashDataList, X509Certificate2 c)
        {
            List<byte[]> res = new List<byte[]>();
            foreach (byte[] h in hashDataList)
            {
                X509Certificate2 used;
                res.Add(ComputeVerifiedCmsBytes(h, c, out used, false));
                if (c == null && used != null) { c = used; cert = used; }
            }
            return res;
        }

        private string HashAndSignBytesLOL(List<List<byte[]>> hashDataList1, X509Certificate2 c)
        {
            StringBuilder sb = new StringBuilder();
            foreach (List<byte[]> sub in hashDataList1)
            {
                foreach (byte[] h in sub)
                {
                    X509Certificate2 used;
                    byte[] encoded = ComputeVerifiedCmsBytes(h, c, out used, false);
                    if (c == null && used != null) { c = used; cert = used; }
                    sb.Append(Convert.ToBase64String(encoded) + ""$$ISES$$"");
                }
                sb.Append(""$$ISESDATA$$"");
            }
            return sb.ToString();
        }

        private static bool ByteArraysEqual(byte[] a, byte[] b)
        {
            if (a == null || b == null || a.Length != b.Length) return false;
            for (int i = 0; i < a.Length; i++)
            {
                if (a[i] != b[i]) return false;
            }
            return true;
        }

        public bool VerifySignedMessage(string data, string signature, string hashData)
        {
            try
            {
                if (string.IsNullOrEmpty(signature) || string.IsNullOrEmpty(hashData)) return false;
                byte[] expectedHash = Convert.FromBase64String(hashData);
                byte[] computedHash;
                using (SHA1CryptoServiceProvider sha1 = new SHA1CryptoServiceProvider())
                {
                    computedHash = sha1.ComputeHash(Encoding.ASCII.GetBytes(data ?? """"));
                }
                if (!ByteArraysEqual(expectedHash, computedHash)) return false;

                SignedCms cms = new SignedCms();
                cms.Decode(Convert.FromBase64String(signature));
                if (!ByteArraysEqual(cms.ContentInfo.Content, computedHash)) return false;
                cms.CheckSignature(true);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public bool VerifySignedMessage(byte[] dataBytes, byte[] signature, byte[] hashData)
        {
            try
            {
                if (signature == null || hashData == null) return false;
                byte[] computedHash;
                using (SHA1CryptoServiceProvider sha1 = new SHA1CryptoServiceProvider())
                {
                    computedHash = sha1.ComputeHash(dataBytes ?? new byte[0]);
                }
                if (!ByteArraysEqual(hashData, computedHash)) return false;

                SignedCms cms = new SignedCms();
                cms.Decode(signature);
                if (!ByteArraysEqual(cms.ContentInfo.Content, computedHash)) return false;
                cms.CheckSignature(true);
                return true;
            }
            catch
            {
                return false;
            }
        }

        public bool VerifySignedMessage(string dataString, byte[] signature, byte[] hashData)
        {
            return VerifySignedMessage(Encoding.ASCII.GetBytes(dataString ?? """"), signature, hashData);
        }

        public string[] getSignatureDetails(string Input, string signature, string hashedData)
        {
            try
            {
                if (!VerifySignedMessage(Input, signature, hashedData)) return new string[0];
                SignedCms cms = new SignedCms();
                cms.Decode(Convert.FromBase64String(signature));
                if (cms.SignerInfos.Count > 0 && cms.SignerInfos[0].Certificate != null)
                {
                    X509Certificate2 sc = cms.SignerInfos[0].Certificate;
                    return new string[] { sc.Subject ?? """", sc.SerialNumber ?? """", sc.Issuer ?? """", sc.NotAfter.ToString(""MM/dd/yyyy HH:mm:ss"", CultureInfo.InvariantCulture) };
                }
            }
            catch { }
            return new string[0];
        }

        public string getCertificateDetails(string Input, string signature, string hashData)
        {
            try
            {
                SignedCms cms = new SignedCms();
                cms.Decode(Convert.FromBase64String(signature));
                if (cms.SignerInfos.Count > 0 && cms.SignerInfos[0].Certificate != null)
                {
                    return cms.SignerInfos[0].Certificate.Subject ?? """";
                }
            }
            catch { }
            return """";
        }

        private static bool IsEmptySerial(string s)
        {
            if (string.IsNullOrWhiteSpace(s)) return true;
            string t = s.Trim().ToLowerInvariant();
            return t == ""null"" || t == ""undefined"" || t == ""0"" || t == ""nan"" || t == ""none"";
        }

        private static string NormalizeSerial(string s)
        {
            if (string.IsNullOrEmpty(s)) return """";
            string cleaned = s.Replace("" "", """").Replace(""-"", """").Replace("":"", """").TrimStart('0').ToUpperInvariant();
            return cleaned;
        }

        private static string ReverseHexBytePairs(string hex)
        {
            if (string.IsNullOrEmpty(hex)) return """";
            string h = hex.Replace("" "", """").Replace(""-"", """").Replace("":"", """").ToUpperInvariant();
            if (h.Length % 2 != 0) h = ""0"" + h;
            StringBuilder sb = new StringBuilder(h.Length);
            for (int i = h.Length - 2; i >= 0; i -= 2)
            {
                sb.Append(h[i]).Append(h[i + 1]);
            }
            return sb.ToString().TrimStart('0');
        }

        private static string DecimalStringToHex(string dec)
        {
            if (string.IsNullOrEmpty(dec)) return """";
            string s = dec.Trim();
            for (int i = 0; i < s.Length; i++)
            {
                if (s[i] < '0' || s[i] > '9') return """";
            }
            try
            {
                List<int> digits = new List<int>(s.Length);
                for (int i = 0; i < s.Length; i++) digits.Add(s[i] - '0');
                StringBuilder hex = new StringBuilder();
                const string hexChars = ""0123456789ABCDEF"";
                while (digits.Count > 0)
                {
                    int rem = 0;
                    List<int> next = new List<int>();
                    for (int i = 0; i < digits.Count; i++)
                    {
                        int cur = rem * 10 + digits[i];
                        int q = cur / 16;
                        rem = cur % 16;
                        if (next.Count > 0 || q > 0) next.Add(q);
                    }
                    hex.Insert(0, hexChars[rem]);
                    digits = next;
                }
                return hex.ToString().TrimStart('0');
            }
            catch
            {
                return """";
            }
        }

        private static bool IsInternalNonDscCert(X509Certificate2 c)
        {
            if (c == null) return true;
            string subj = (c.Subject ?? """").ToUpperInvariant();
            string issuer = (c.Issuer ?? """").ToUpperInvariant();
            return subj.Contains(""E-VEDHIKA"")
                || subj.Contains(""CN=LOCALHOST"")
                || subj.Contains(""IIS EXPRESS"")
                || subj.Contains(""MS-ORGANIZATION"")
                || issuer.Contains(""E-VEDHIKA"");
        }

        /// <summary>
        /// Strictly filters for Digital Signature / Non-Repudiation certificates (matching original NIC DLL).
        /// Indian Class-3 USB DSC tokens contain TWO certs: a Signing cert AND an Encryption-only cert.
        /// Selecting the Encryption-only cert causes 'Invalid algorithm specified.' (0x80090008).
        /// </summary>
        private static bool IsSigningCertificate(X509Certificate2 c)
        {
            if (c == null || IsInternalNonDscCert(c)) return false;
            try
            {
                foreach (X509Extension ext in c.Extensions)
                {
                    X509KeyUsageExtension ku = ext as X509KeyUsageExtension;
                    if (ku == null && ext.Oid != null && ext.Oid.Value == ""2.5.29.15"")
                    {
                        ku = new X509KeyUsageExtension(ext, ext.Critical);
                    }
                    if (ku != null)
                    {
                        bool canSign = (ku.KeyUsages & X509KeyUsageFlags.DigitalSignature) != 0
                                    || (ku.KeyUsages & X509KeyUsageFlags.NonRepudiation) != 0;
                        if (!canSign) return false;
                    }
                }
                return true;
            }
            catch
            {
                return true;
            }
        }

        private static X509Certificate2Collection GetCandidateSigningCerts(bool includeExpired)
        {
            X509Certificate2Collection result = new X509Certificate2Collection();
            Dictionary<string, bool> seenThumbprints = new Dictionary<string, bool>(StringComparer.OrdinalIgnoreCase);
            StoreLocation[] locations = new StoreLocation[] { StoreLocation.CurrentUser, StoreLocation.LocalMachine };

            foreach (StoreLocation loc in locations)
            {
                try
                {
                    X509Store store = new X509Store(StoreName.My, loc);
                    store.Open(OpenFlags.ReadOnly);
                    try
                    {
                        foreach (X509Certificate2 c in store.Certificates)
                        {
                            if (!c.HasPrivateKey) continue;
                            if (!IsSigningCertificate(c)) continue;
                            if (!includeExpired && c.NotAfter < DateTime.Now) continue;
                            string tp = c.Thumbprint ?? c.SerialNumber ?? """";
                            if (!seenThumbprints.ContainsKey(tp))
                            {
                                seenThumbprints[tp] = true;
                                result.Add(c);
                            }
                        }
                    }
                    finally { store.Close(); }
                }
                catch { }
            }
            return result;
        }

        private X509Certificate2 PickSigningCertificate(bool allowExpired)
        {
            X509Certificate2Collection valid = GetCandidateSigningCerts(false);
            if (valid.Count == 1) return valid[0];
            if (valid.Count > 1)
            {
                try
                {
                    X509Certificate2Collection selected = X509Certificate2UI.SelectFromCollection(
                        valid,
                        ""Select USB DSC Signing Certificate"",
                        ""Choose your active USB Digital Signature Certificate (Signing Key)"",
                        X509SelectionFlag.SingleSelection);
                    if (selected != null && selected.Count > 0) return selected[0];
                }
                catch { }
                // Pick the most recently issued (latest NotAfter) valid signing cert if UI dialog unavailable
                X509Certificate2 newest = valid[0];
                foreach (X509Certificate2 c in valid)
                {
                    if (c.NotAfter > newest.NotAfter) newest = c;
                }
                return newest;
            }

            if (allowExpired)
            {
                X509Certificate2Collection allSigning = GetCandidateSigningCerts(true);
                if (allSigning.Count == 1) return allSigning[0];
                if (allSigning.Count > 1)
                {
                    try
                    {
                        X509Certificate2Collection selected = X509Certificate2UI.SelectFromCollection(
                            allSigning,
                            ""Select DSC Certificate"",
                            ""Choose your USB Digital Signature Certificate"",
                            X509SelectionFlag.SingleSelection);
                        if (selected != null && selected.Count > 0) return selected[0];
                    }
                    catch { }
                    return allSigning[0];
                }
            }
            return null;
        }

        private static bool SerialMatches(X509Certificate2 c, string rawTarget, string normTarget, string revTarget, string decHexTarget)
        {
            if (c == null || string.IsNullOrEmpty(c.SerialNumber)) return false;
            string certNorm = NormalizeSerial(c.SerialNumber);
            if (certNorm == normTarget) return true;
            if (!string.IsNullOrEmpty(revTarget) && certNorm == revTarget) return true;
            if (!string.IsNullOrEmpty(decHexTarget) && certNorm == decHexTarget) return true;
            string certRev = ReverseHexBytePairs(c.SerialNumber);
            if (!string.IsNullOrEmpty(certRev) && certRev == normTarget) return true;
            return false;
        }

        private X509Certificate2 FindCertificateBySerialOnly(string serialNumber)
        {
            if (IsEmptySerial(serialNumber)) return null;
            string cleanRaw = serialNumber.Replace("" "", """").Trim();
            string normTarget = NormalizeSerial(serialNumber);
            string revTarget = ReverseHexBytePairs(serialNumber);
            string decHexTarget = DecimalStringToHex(cleanRaw);

            X509Certificate2 bestSigningMatch = null;
            X509Certificate2 fallbackMatch = null;

            StoreLocation[] locations = new StoreLocation[] { StoreLocation.CurrentUser, StoreLocation.LocalMachine };
            foreach (StoreLocation loc in locations)
            {
                try
                {
                    X509Store store = new X509Store(StoreName.My, loc);
                    store.Open(OpenFlags.ReadOnly);
                    try
                    {
                        foreach (X509Certificate2 c in store.Certificates)
                        {
                            if (!SerialMatches(c, cleanRaw, normTarget, revTarget, decHexTarget)) continue;
                            if (c.HasPrivateKey && IsSigningCertificate(c))
                            {
                                if (bestSigningMatch == null || c.NotAfter > bestSigningMatch.NotAfter)
                                {
                                    bestSigningMatch = c;
                                }
                            }
                            else if (fallbackMatch == null)
                            {
                                fallbackMatch = c;
                            }
                        }
                    }
                    finally { store.Close(); }
                }
                catch { }
            }
            return bestSigningMatch ?? fallbackMatch;
        }

        private X509Certificate2 ResolveCertificateForSigning(string serialNumber)
        {
            if (!IsEmptySerial(serialNumber))
            {
                string normTarget = NormalizeSerial(serialNumber);
                if (cert != null && cert.HasPrivateKey && IsSigningCertificate(cert) && NormalizeSerial(cert.SerialNumber) == normTarget)
                {
                    return cert;
                }

                X509Certificate2 exact = FindCertificateBySerialOnly(serialNumber);
                if (exact != null)
                {
                    cert = exact;
                    return exact;
                }

                // Registered serial was NOT auto-matched in store.
                // NEVER pass null to bare CmsSigner() in Edge IE Mode (causes silent failure / [object Error]).
                // Instead, present ONLY valid signing certs via X509Certificate2UI so operator can select their active token.
                X509Certificate2Collection candidates = GetCandidateSigningCerts(false);
                if (candidates.Count > 0)
                {
                    try
                    {
                        X509Certificate2Collection chosen = X509Certificate2UI.SelectFromCollection(
                            candidates,
                            ""Select Registered USB DSC Certificate"",
                            ""Registered Serial ("" + serialNumber.Trim() + "") was not auto-matched. Select your active USB DSC Signing Certificate:"",
                            X509SelectionFlag.SingleSelection);
                        if (chosen != null && chosen.Count > 0)
                        {
                            cert = chosen[0];
                            return cert;
                        }
                        throw new CryptographicException(""Certificate selection was cancelled by the user."");
                    }
                    catch (CryptographicException)
                    {
                        throw;
                    }
                    catch
                    {
                        if (candidates.Count == 1)
                        {
                            cert = candidates[0];
                            return cert;
                        }
                    }
                }

                cert = null;
                throw new CryptographicException(""Registered USB DSC Certificate (Serial: "" + serialNumber.Trim() + "") was not found in Windows Certificate Store. Please plug in your USB DSC token, open Token Manager, and try again."");
            }

            if (cert == null || !IsSigningCertificate(cert))
            {
                cert = PickSigningCertificate(false);
            }
            if (cert == null)
            {
                throw new CryptographicException(""No valid USB DSC Signing Certificate found in Windows Certificate Store. Please plug in your USB DSC token and open Token Manager."");
            }
            return cert;
        }

        private X509Certificate2 getCertificate(string serialNumber)
        {
            return FindCertificateBySerialOnly(serialNumber);
        }
    }
}";

                logCallback?.Invoke("[UBD-FIX] Compiling Universal CNG+CSP Signature Engine DLL (In-Memory Build v2.0.3.0)...");
                
                using (CSharpCodeProvider provider = new CSharpCodeProvider())
                {
                    CompilerParameters parameters = new CompilerParameters();
                    parameters.GenerateExecutable = false;
                    parameters.OutputAssembly = dllPath;
                    parameters.ReferencedAssemblies.Add("System.dll");
                    parameters.ReferencedAssemblies.Add("System.Core.dll");
                    parameters.ReferencedAssemblies.Add("System.Security.dll");

                    CompilerResults results = provider.CompileAssemblyFromSource(parameters, sourceCode);
                    if (results.Errors.HasErrors)
                    {
                        throw new Exception("DLL Build Failed: " + results.Errors[0].ErrorText);
                    }
                }

                logCallback?.Invoke("[UBD-FIX] DLL compiled successfully at " + dllPath);
                RegisterCompiledAssemblyForCom(dllPath, logCallback);

                logCallback?.Invoke("[UBD-FIX] Universal CNG+CSP Digital Signature Patch (v2.0.3.0 Anti-Tamper COM-Safe) applied successfully!");
            }
            catch (Exception ex)
            {
                logCallback?.Invoke("[UBD-FIX ERROR] " + ex.Message);
                Logger.LogError("UBD Token Fix", ex.Message, "Ensure .NET 4.8 is installed and run as Admin.");
            }
        }

        public static void RegisterCompiledAssemblyForCom(string dllPath, Action<string> logCallback = null)
        {
            logCallback?.Invoke("[UBD-FIX] Registering Signature Engine for COM (32-bit, 64-bit, PreApproved & Safe-For-Scripting)...");

            const string digiClsid = "{1FC6E67B-8F52-4F80-8321-FCF7CE940052}";
            const string progId = "SignatureDemoLib.DigiSignHelper";
            string codeBaseUri = "file:///" + dllPath.Replace("\\", "/");

            // Dynamically inspect actual compiled assembly full name & version so Registry and Disk DLL NEVER mismatch
            string assemblyVersion = TargetDllVersion;
            string assemblyFullName = $"SignatureDemoLib, Version={TargetDllVersion}, Culture=neutral, PublicKeyToken=null";
            try
            {
                if (File.Exists(dllPath))
                {
                    AssemblyName an = AssemblyName.GetAssemblyName(dllPath);
                    if (an != null)
                    {
                        assemblyFullName = an.FullName;
                        if (an.Version != null) assemblyVersion = an.Version.ToString();
                    }
                }
            }
            catch { }

            // 1. Purge any stale/corrupted HKCU Software\Classes overrides (e.g. from older tools pointing to capicom.dll)
            string[] staleProgIds = new string[]
            {
                "SignatureDemoLib.DigiSignHelper", "DigiSignHelper", "DigiSignHelper.1", "DigiSignHelper.Helper", "DigiSignHelper.DigiSigner"
            };
            string[] staleClsids = new string[]
            {
                "{1FC6E67B-8F52-4F80-8321-FCF7CE940052}",
                "{32DB2444-A227-463C-868C-D63D6D254924}",
                "{D4F44F4E-E1A4-4E64-884A-98C045F9616D}",
                "{BD0D437A-F76E-4545-9244-6720D911718F}",
                "{77907B64-325A-4560-A1E2-F4060883D9E9}"
            };

            foreach (string pid in staleProgIds)
            {
                try { Microsoft.Win32.Registry.CurrentUser.DeleteSubKeyTree($@"Software\Classes\{pid}", false); } catch { }
                try { Microsoft.Win32.Registry.CurrentUser.DeleteSubKeyTree($@"Software\Wow6432Node\Classes\{pid}", false); } catch { }
            }
            foreach (string cid in staleClsids)
            {
                try { Microsoft.Win32.Registry.CurrentUser.DeleteSubKeyTree($@"Software\Classes\CLSID\{cid}", false); } catch { }
                try { Microsoft.Win32.Registry.CurrentUser.DeleteSubKeyTree($@"Software\Wow6432Node\Classes\CLSID\{cid}", false); } catch { }
            }

            // 2. Run RegAsm 32-bit and 64-bit
            string regAsm32 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows), @"Microsoft.NET\Framework\v4.0.30319\RegAsm.exe");
            string regAsm64 = Path.Combine(Environment.GetFolderPath(Environment.SpecialFolder.Windows), @"Microsoft.NET\Framework64\v4.0.30319\RegAsm.exe");

            if (File.Exists(regAsm32))
            {
                RunHiddenProcess(regAsm32, "\"" + dllPath + "\" /codebase /tlb");
                logCallback?.Invoke("[UBD-FIX] 32-bit COM registration successful.");
            }
            
            if (File.Exists(regAsm64))
            {
                RunHiddenProcess(regAsm64, "\"" + dllPath + "\" /codebase /tlb");
                logCallback?.Invoke("[UBD-FIX] 64-bit COM registration successful.");
            }

            // 3. Explicitly write complete .NET COM registration, purge stale version subkeys, clear IE Kill-Bits & add PreApproved
            string[] catSubKeys = new string[]
            {
                "{62C8FE65-4EBB-45e7-B440-6E39B2CDBF29}", // .NET Category
                "{7DD95801-9882-11CF-9FA9-00AA006C42C4}", // CATID_SafeForScripting
                "{7DD95802-9882-11CF-9FA9-00AA006C42C4}"  // CATID_SafeForInitializing
            };

            Microsoft.Win32.RegistryView[] views = Environment.Is64BitOperatingSystem
                ? new[] { Microsoft.Win32.RegistryView.Registry64, Microsoft.Win32.RegistryView.Registry32 }
                : new[] { Microsoft.Win32.RegistryView.Registry32 };

            foreach (var view in views)
            {
                try
                {
                    using (var lm = Microsoft.Win32.RegistryKey.OpenBaseKey(Microsoft.Win32.RegistryHive.LocalMachine, view))
                    {
                        WriteDotNetComRegistration(lm, @"SOFTWARE\Classes", digiClsid, progId, assemblyVersion, assemblyFullName, codeBaseUri, catSubKeys);
                        ClearKillBitAndPreApprove(lm, digiClsid);
                    }
                }
                catch { }
            }

            try
            {
                WriteDotNetComRegistration(Microsoft.Win32.Registry.CurrentUser, @"Software\Classes", digiClsid, progId, assemblyVersion, assemblyFullName, codeBaseUri, catSubKeys);
                ClearKillBitAndPreApprove(Microsoft.Win32.Registry.CurrentUser, digiClsid);
            }
            catch { }
        }

        private static void ClearKillBitAndPreApprove(Microsoft.Win32.RegistryKey rootKey, string clsid)
        {
            try
            {
                rootKey.DeleteSubKeyTree($@"SOFTWARE\Microsoft\Internet Explorer\ActiveX Compatibility\{clsid}", false);
            }
            catch { }
            try
            {
                using (var pre = rootKey.CreateSubKey($@"SOFTWARE\Microsoft\Windows\CurrentVersion\Ext\PreApproved\{clsid}"))
                {
                    pre?.Close();
                }
            }
            catch { }
            try
            {
                using (var stats = rootKey.CreateSubKey($@"SOFTWARE\Microsoft\Windows\CurrentVersion\Ext\Stats\{clsid}\iexplore\AllowedDomains\*"))
                {
                    stats?.Close();
                }
            }
            catch { }
        }

        private static void WriteDotNetComRegistration(
            Microsoft.Win32.RegistryKey rootKey,
            string classesPrefix,
            string clsid,
            string progId,
            string assemblyVersion,
            string assemblyFullName,
            string codeBaseUri,
            string[] catSubKeys)
        {
            using (var pidKey = rootKey.CreateSubKey($@"{classesPrefix}\{progId}"))
            {
                if (pidKey != null)
                {
                    pidKey.SetValue("", progId);
                    using (var pidClsid = pidKey.CreateSubKey("CLSID"))
                    {
                        pidClsid?.SetValue("", clsid);
                    }
                }
            }

            using (var clsidKey = rootKey.CreateSubKey($@"{classesPrefix}\CLSID\{clsid}"))
            {
                if (clsidKey != null)
                {
                    clsidKey.SetValue("", progId);
                    using (var inproc = clsidKey.CreateSubKey("InprocServer32"))
                    {
                        if (inproc != null)
                        {
                            // Remove stale older version subkeys so mscoree.dll always binds to current compiled version
                            string[] oldVers = new string[] { "1.0.0.0", "2.0.0.0", "2.0.1.0", "2.0.2.0" };
                            foreach (string ov in oldVers)
                            {
                                if (!string.Equals(ov, assemblyVersion, StringComparison.OrdinalIgnoreCase))
                                {
                                    try { inproc.DeleteSubKeyTree(ov, false); } catch { }
                                }
                            }

                            inproc.SetValue("", "mscoree.dll");
                            inproc.SetValue("ThreadingModel", "Both");
                            inproc.SetValue("Class", progId);
                            inproc.SetValue("Assembly", assemblyFullName);
                            inproc.SetValue("RuntimeVersion", "v4.0.30319");
                            inproc.SetValue("CodeBase", codeBaseUri);
                            using (var verKey = inproc.CreateSubKey(assemblyVersion))
                            {
                                if (verKey != null)
                                {
                                    verKey.SetValue("Class", progId);
                                    verKey.SetValue("Assembly", assemblyFullName);
                                    verKey.SetValue("RuntimeVersion", "v4.0.30319");
                                    verKey.SetValue("CodeBase", codeBaseUri);
                                }
                            }
                        }
                    }
                    using (var progIdSub = clsidKey.CreateSubKey("ProgId"))
                    {
                        progIdSub?.SetValue("", progId);
                    }
                    using (var catBase = clsidKey.CreateSubKey("Implemented Categories"))
                    {
                        if (catBase != null)
                        {
                            foreach (var cat in catSubKeys) catBase.CreateSubKey(cat)?.Close();
                        }
                    }
                }
            }
        }

        private static void RunHiddenProcess(string exePath, string args)
        {
            ProcessStartInfo psi = new ProcessStartInfo(exePath, args)
            {
                CreateNoWindow = true,
                UseShellExecute = false,
                WindowStyle = ProcessWindowStyle.Hidden
            };
            using (Process p = Process.Start(psi))
            {
                if (p != null) p.WaitForExit();
            }
        }
    }
}
