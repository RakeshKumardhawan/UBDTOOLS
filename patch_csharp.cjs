const fs = require('fs');
let diagCode = fs.readFileSync('csharp_solution/EVedhikaUBDDeploymentTool/Engine/DiagnosticsEngine.cs', 'utf8');

const diagInsert = `
        public static bool VerifyDscPin(System.Windows.Forms.IWin32Window owner)
        {
            try
            {
                using (var store = new System.Security.Cryptography.X509Certificates.X509Store(System.Security.Cryptography.X509Certificates.StoreName.My, System.Security.Cryptography.X509Certificates.StoreLocation.CurrentUser))
                {
                    store.Open(System.Security.Cryptography.X509Certificates.OpenFlags.ReadOnly);
                    var certs = store.Certificates;
                    var selected = System.Security.Cryptography.X509Certificates.X509Certificate2UI.SelectFromCollection(
                        certs, "DSC Token PIN Verification", "దయచేసి మీ DSC సర్టిఫికెట్‌ను ఎంచుకుని OK నొక్కండి, ఆపై టోకెన్ PIN ఎంటర్ చేయండి.",
                        System.Security.Cryptography.X509Certificates.X509SelectionFlag.SingleSelection);
                    
                    if (selected.Count > 0)
                    {
                        var key = selected[0].PrivateKey;
                        return true;
                    }
                }
            }
            catch { }
            return false;
        }
`;

// insert before the last closing brace
diagCode = diagCode.substring(0, diagCode.lastIndexOf('}'));
diagCode = diagCode.substring(0, diagCode.lastIndexOf('}'));
diagCode += diagInsert + "    }\n}\n";

fs.writeFileSync('csharp_solution/EVedhikaUBDDeploymentTool/Engine/DiagnosticsEngine.cs', diagCode);

let mainCode = fs.readFileSync('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', 'utf8');

const t1 = `                                if (this.IsHandleCreated)
                                {
                                    Invoke((MethodInvoker)delegate {
                                        MessageBox.Show(this,
                                            "✓ USB DSC టోకెన్ విజయవంతంగా గుర్తించబడింది! [OK]\\n(USB DSC Token Hardware Detected Successfully!)",
                                            "DSC Token Verified", MessageBoxButtons.OK, MessageBoxIcon.Information);
                                    });
                                }`;

const r1 = `                                if (this.IsHandleCreated)
                                {
                                    Invoke((MethodInvoker)delegate {
                                        MessageBox.Show(this,
                                            "✓ USB DSC టోకెన్ విజయవంతంగా గుర్తించబడింది! [OK]\\nఇప్పుడు మీ DSC PIN ఎంటర్ చేయండి.\\n(USB DSC Token Detected! Please enter PIN.)",
                                            "DSC Token Verified", MessageBoxButtons.OK, MessageBoxIcon.Information);
                                        DiagnosticsEngine.VerifyDscPin(this);
                                    });
                                }`;

mainCode = mainCode.replace(t1, r1);

const t2 = `                    if (tokenFound)
                    {
                        LogMessage("HARDWARE", "USB SmartCard DSC Token is connected and ready.");
                    }`;
                    
const r2 = `                    if (tokenFound)
                    {
                        LogMessage("HARDWARE", "USB SmartCard DSC Token is connected and ready.");
                        if (this.IsHandleCreated)
                        {
                            Invoke((MethodInvoker)delegate {
                                DiagnosticsEngine.VerifyDscPin(this);
                            });
                        }
                    }`;

mainCode = mainCode.replace(t2, r2);

fs.writeFileSync('csharp_solution/EVedhikaUBDDeploymentTool/MainForm.cs', mainCode);
