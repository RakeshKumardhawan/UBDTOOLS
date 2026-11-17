using System;
using System.Drawing;
using System.IO;
using System.Windows.Forms;
using Microsoft.Win32;
using EVedhikaUBDDeploymentTool.Helpers;

namespace EVedhikaUBDDeploymentTool
{
    public class StateSelectionDialog : Form
    {
        public string SelectedState { get; private set; } = "Telangana";
        public string SelectedDistrict { get; private set; } = "";
        public string SelectedMandalName { get; private set; } = "";
        public string SelectedOfficeName { get; private set; } = "";

        private RadioButton rbTelangana;
        private RadioButton rbAndhra;
        private ComboBox cboDistrict;
        private TextBox txtMandalName;
        private TextBox txtOfficeName;
        private TextBox txtOperatorName;
        private Button btnContinue;

        private static readonly string[] TelanganaDistricts = new string[]
        {
            "Mancherial (మంచిర్యాల)",
            "Khammam (ఖమ్మం)",
            "Suryapet (సూర్యాపేట)",
            "Nalgonda (నల్గొండ)",
            "Warangal (వరంగల్)",
            "Hanumakonda (హనుమకొండ)",
            "Karimnagar (కరీంనగర్)",
            "Nizamabad (నిజామాబాద్)",
            "Adilabad (ఆదిలాబాద్)",
            "Bhadradri Kothagudem (భద్రాద్రి కొత్తగూడెం)",
            "Jagtial (జగిత్యాల)",
            "Jangaon (జనగామ)",
            "Jayashankar Bhupalpally (జయశంకర్ భూపాలపల్లి)",
            "Jogulamba Gadwal (జోగులాంబ గద్వాల)",
            "Kamareddy (కామారెడ్డి)",
            "Kumuram Bheem Asifabad (కుమ్రం భీమ్ ఆసిఫాబాద్)",
            "Mahabubabad (మహబూబాబాద్)",
            "Mahabubnagar (మహబూబ్ నగర్)",
            "Medak (మెదక్)",
            "Medchal-Malkajgiri (మేడ్చల్-మల్కాజిగిరి)",
            "Mulugu (ములుగు)",
            "Nagarkurnool (నాగర్ కర్నూల్)",
            "Narayanpet (నారాయణపేట)",
            "Nirmal (నిర్మల్)",
            "Peddapalli (పెద్దపల్లి)",
            "Rajanna Sircilla (రాజన్న సిరిసిల్ల)",
            "Rangareddy (రంగారెడ్డి)",
            "Sangareddy (సంగారెడ్డి)",
            "Siddipet (సిద్దిపేట)",
            "Vikarabad (వికారాబాద్)",
            "Wanaparthy (వనపర్తి)",
            "Yadadri Bhuvanagiri (యాదాద్రి భువనగిరి)",
            "Hyderabad (హైదరాబాద్)"
        };

        private static readonly string[] AndhraDistricts = new string[]
        {
            "Visakhapatnam (విశాఖపట్నం)",
            "NTR Vijayawada (ఎన్టీఆర్ విజయవాడ)",
            "Guntur (గుంటూరు)",
            "YSR Kadapa (వైఎస్ఆర్ కడప)",
            "Kurnool (కర్నూలు)",
            "Anantapuramu (అనంతపురం)",
            "Chittoor (చిత్తూరు)",
            "Tirupati (తిరుపతి)",
            "SPSR Nellore (నెల్లూరు)",
            "Prakasam (ప్రకాశం)",
            "Kakinada (కాకినాడ)",
            "East Godavari (తూర్పు గోదావరి)",
            "West Godavari (పశ్చిమ గోదావరి)",
            "Eluru (ఏలూరు)",
            "Krishna (కృష్ణా)",
            "Srikakulam (శ్రీకాకుళం)",
            "Vizianagaram (విజయనగరం)",
            "Bapatla (బాపట్ల)",
            "Palnadu (పల్నాడు)",
            "Nandyal (నంద్యాల)",
            "Sri Sathya Sai (శ్రీ సత్యసాయి)",
            "Annamayya (అన్నమయ్య)",
            "Konaseema (కోనసీమ)",
            "Anakapalli (అనకాపల్లి)",
            "Alluri Sitharama Raju (అల్లూరి సీతారామరాజు)",
            "Parvathipuram Manyam (పార్వతీపురం మన్యం)"
        };

        public StateSelectionDialog()
        {
            InitializeComponent();
            LoadSavedOfficeProfile();
        }

        private void InitializeComponent()
        {
            this.Text = "E-Vedhika UBD Tool - Select State, District, Mandal & Office Location";
            this.ClientSize = new Size(540, 520);
            this.StartPosition = FormStartPosition.CenterScreen;
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.AutoScaleMode = AutoScaleMode.Font;
            this.BackColor = Color.FromArgb(15, 23, 42);
            this.ForeColor = Color.White;

            Label lblHeader = new Label();
            lblHeader.Text = "E-Vedhika UBD Deployment Tool";
            lblHeader.Font = new Font("Segoe UI", 13.5F, FontStyle.Bold);
            lblHeader.ForeColor = Color.FromArgb(56, 189, 248);
            lblHeader.AutoSize = false;
            lblHeader.UseMnemonic = false;
            lblHeader.TextAlign = ContentAlignment.MiddleCenter;
            lblHeader.Bounds = new Rectangle(16, 12, 508, 28);
            this.Controls.Add(lblHeader);

            Label lblSub = new Label();
            lblSub.Text = "మీ రాష్ట్రం, జిల్లా, మండలం, గ్రామ పంచాయతీ & ఆపరేటర్ వివరాలను స్పష్టంగా ఎంటర్ చేయండి:";
            lblSub.Font = new Font("Segoe UI", 9F, FontStyle.Regular);
            lblSub.ForeColor = Color.FromArgb(203, 213, 225);
            lblSub.AutoSize = false;
            lblSub.UseMnemonic = false;
            lblSub.TextAlign = ContentAlignment.MiddleCenter;
            lblSub.Bounds = new Rectangle(16, 42, 508, 34);
            this.Controls.Add(lblSub);

            Panel pnlState = new Panel();
            pnlState.BackColor = Color.FromArgb(30, 41, 59);
            pnlState.Bounds = new Rectangle(24, 82, 492, 78);

            rbTelangana = new RadioButton();
            rbTelangana.Text = "Telangana (తెలంగాణ - Official UBD Portal)";
            rbTelangana.Font = new Font("Segoe UI", 10F, FontStyle.Bold);
            rbTelangana.ForeColor = Color.White;
            rbTelangana.UseMnemonic = false;
            rbTelangana.Bounds = new Rectangle(14, 10, 464, 28);
            rbTelangana.Checked = true;
            rbTelangana.CheckedChanged += RbState_CheckedChanged;
            pnlState.Controls.Add(rbTelangana);

            rbAndhra = new RadioButton();
            rbAndhra.Text = "Andhra Pradesh (ఆంధ్రప్రదేశ్ - Official UBD Portal)";
            rbAndhra.Font = new Font("Segoe UI", 10F, FontStyle.Bold);
            rbAndhra.ForeColor = Color.White;
            rbAndhra.UseMnemonic = false;
            rbAndhra.Bounds = new Rectangle(14, 42, 464, 28);
            rbAndhra.CheckedChanged += RbState_CheckedChanged;
            pnlState.Controls.Add(rbAndhra);

            this.Controls.Add(pnlState);

            // Row 1: District
            Label lblDistrict = new Label();
            lblDistrict.Text = "1. జిల్లా ఎంచుకోండి (Select District) *:";
            lblDistrict.Font = new Font("Segoe UI", 9.5F, FontStyle.Bold);
            lblDistrict.ForeColor = Color.FromArgb(251, 191, 36);
            lblDistrict.UseMnemonic = false;
            lblDistrict.Bounds = new Rectangle(24, 170, 492, 22);
            this.Controls.Add(lblDistrict);

            cboDistrict = new ComboBox();
            cboDistrict.DropDownStyle = ComboBoxStyle.DropDownList;
            cboDistrict.Font = new Font("Segoe UI", 10F, FontStyle.Bold);
            cboDistrict.BackColor = Color.FromArgb(30, 41, 59);
            cboDistrict.ForeColor = Color.White;
            cboDistrict.Bounds = new Rectangle(24, 194, 492, 30);
            this.Controls.Add(cboDistrict);

            // Row 2: Mandal Name (Separate, Unambiguous Full-Width Row)
            Label lblMandal = new Label();
            lblMandal.Text = "2. మండలం పేరు (Mandal Name) *  [ఉదా: Yadagirigutta / Mancherial]:";
            lblMandal.Font = new Font("Segoe UI", 9.5F, FontStyle.Bold);
            lblMandal.ForeColor = Color.FromArgb(56, 189, 248);
            lblMandal.UseMnemonic = false;
            lblMandal.Bounds = new Rectangle(24, 232, 492, 22);
            this.Controls.Add(lblMandal);

            txtMandalName = new TextBox();
            txtMandalName.Font = new Font("Segoe UI", 10F, FontStyle.Regular);
            txtMandalName.BackColor = Color.FromArgb(30, 41, 59);
            txtMandalName.ForeColor = Color.White;
            txtMandalName.Bounds = new Rectangle(24, 256, 492, 28);
            txtMandalName.Text = "";
            this.Controls.Add(txtMandalName);

            // Row 3: Grama Panchayat / Office Name (Separate Full-Width Row)
            Label lblOffice = new Label();
            lblOffice.Text = "3. గ్రామ పంచాయతీ / ఆఫీస్ పేరు (GP / Office Name) *  [ఉదా: Mailargudem GP]:";
            lblOffice.Font = new Font("Segoe UI", 9.5F, FontStyle.Bold);
            lblOffice.ForeColor = Color.White;
            lblOffice.UseMnemonic = false;
            lblOffice.Bounds = new Rectangle(24, 292, 492, 22);
            this.Controls.Add(lblOffice);

            txtOfficeName = new TextBox();
            txtOfficeName.Font = new Font("Segoe UI", 10F, FontStyle.Regular);
            txtOfficeName.BackColor = Color.FromArgb(30, 41, 59);
            txtOfficeName.ForeColor = Color.White;
            txtOfficeName.Bounds = new Rectangle(24, 316, 492, 28);
            txtOfficeName.Text = (Environment.MachineName ?? "GP-OFFICE") + " GP Office";
            this.Controls.Add(txtOfficeName);

            // Row 4: Operator Name (Separate Full-Width Row)
            Label lblOp = new Label();
            lblOp.Text = "4. ఆపరేటర్ పేరు (Operator Name)  [మీ పూర్తి పేరు ఇక్కడ ఇవ్వండి]:";
            lblOp.Font = new Font("Segoe UI", 9.5F, FontStyle.Bold);
            lblOp.ForeColor = Color.FromArgb(203, 213, 225);
            lblOp.UseMnemonic = false;
            lblOp.Bounds = new Rectangle(24, 352, 492, 22);
            this.Controls.Add(lblOp);

            txtOperatorName = new TextBox();
            txtOperatorName.Font = new Font("Segoe UI", 10F, FontStyle.Regular);
            txtOperatorName.BackColor = Color.FromArgb(30, 41, 59);
            txtOperatorName.ForeColor = Color.White;
            txtOperatorName.Bounds = new Rectangle(24, 376, 492, 28);
            txtOperatorName.Text = Environment.UserName ?? "Operator";
            this.Controls.Add(txtOperatorName);

            Label lblNote = new Label();
            lblNote.Text = "[OK] మీరు ఎంచుకున్న జిల్లా, మండలం, GP & ఆపరేటర్ వివరాలు నేరుగా అడ్మిన్ రిపోర్ట్‌లో సేవ్ అవుతాయి.";
            lblNote.Font = new Font("Segoe UI", 8.5F, FontStyle.Regular);
            lblNote.ForeColor = Color.FromArgb(52, 211, 153);
            lblNote.AutoSize = false;
            lblNote.UseMnemonic = false;
            lblNote.Bounds = new Rectangle(24, 412, 492, 34);
            this.Controls.Add(lblNote);

            btnContinue = new Button();
            btnContinue.Text = "Continue to Deployment Tool  ->";
            btnContinue.Font = new Font("Segoe UI", 10.5F, FontStyle.Bold);
            btnContinue.BackColor = Color.FromArgb(16, 185, 129);
            btnContinue.ForeColor = Color.White;
            btnContinue.FlatStyle = FlatStyle.Flat;
            btnContinue.FlatAppearance.BorderSize = 0;
            btnContinue.UseMnemonic = false;
            btnContinue.Bounds = new Rectangle(110, 454, 320, 44);
            btnContinue.Cursor = Cursors.Hand;
            btnContinue.Click += BtnContinue_Click;
            this.Controls.Add(btnContinue);

            PopulateDistricts("Telangana");
        }

        private void RbState_CheckedChanged(object sender, EventArgs e)
        {
            string state = rbAndhra.Checked ? "Andhra Pradesh" : "Telangana";
            PopulateDistricts(state);
        }

        private void PopulateDistricts(string state)
        {
            cboDistrict.Items.Clear();
            cboDistrict.Items.Add("-- Select Your District (మీ జిల్లా ఎంచుకోండి) --");
            string[] list = state == "Andhra Pradesh" ? AndhraDistricts : TelanganaDistricts;
            cboDistrict.Items.AddRange(list);
            if (cboDistrict.Items.Count > 0)
            {
                cboDistrict.SelectedIndex = 0;
            }
        }

        private void LoadSavedOfficeProfile()
        {
            try
            {
                string savedState = "";
                string savedDistrict = "";
                string savedMandal = "";
                string savedOffice = "";
                string savedOperator = "";

                using (RegistryKey key = Registry.CurrentUser.OpenSubKey(@"Software\EVedhika"))
                {
                    if (key != null)
                    {
                        savedState = Convert.ToString(key.GetValue("SelectedState", ""));
                        savedDistrict = Convert.ToString(key.GetValue("SelectedDistrict", ""));
                        savedMandal = Convert.ToString(key.GetValue("SelectedMandalName", ""));
                        savedOffice = Convert.ToString(key.GetValue("SelectedOfficeName", ""));
                        savedOperator = Convert.ToString(key.GetValue("SelectedOperatorName", ""));
                    }
                }

                if (!string.IsNullOrEmpty(savedState))
                {
                    if (savedState.IndexOf("Andhra", StringComparison.OrdinalIgnoreCase) >= 0)
                    {
                        rbAndhra.Checked = true;
                        PopulateDistricts("Andhra Pradesh");
                    }
                    else
                    {
                        rbTelangana.Checked = true;
                        PopulateDistricts("Telangana");
                    }
                }

                if (!string.IsNullOrEmpty(savedDistrict))
                {
                    for (int i = 0; i < cboDistrict.Items.Count; i++)
                    {
                        string itemText = cboDistrict.Items[i].ToString();
                        if (itemText.IndexOf(savedDistrict, StringComparison.OrdinalIgnoreCase) >= 0)
                        {
                            cboDistrict.SelectedIndex = i;
                            break;
                        }
                    }
                }
                else
                {
                    // Auto-match from MachineName if possible
                    string host = (Environment.MachineName ?? "").ToUpperInvariant();
                    for (int i = 0; i < cboDistrict.Items.Count; i++)
                    {
                        string englishDist = ExtractEnglishDistrict(cboDistrict.Items[i].ToString()).ToUpperInvariant();
                        if (englishDist.Length >= 4 && host.Contains(englishDist.Substring(0, 4)))
                        {
                            cboDistrict.SelectedIndex = i;
                            break;
                        }
                    }
                }

                if (!string.IsNullOrEmpty(savedMandal))
                {
                    txtMandalName.Text = savedMandal;
                }

                if (!string.IsNullOrEmpty(savedOffice))
                {
                    string cleanOffice = savedOffice;
                    if (!string.IsNullOrEmpty(savedMandal))
                    {
                        string suffix = " (" + savedMandal + " Mandal)";
                        if (cleanOffice.EndsWith(suffix, StringComparison.OrdinalIgnoreCase))
                        {
                            cleanOffice = cleanOffice.Substring(0, cleanOffice.Length - suffix.Length).Trim();
                        }
                    }
                    txtOfficeName.Text = cleanOffice;
                }

                if (!string.IsNullOrEmpty(savedOperator))
                {
                    txtOperatorName.Text = savedOperator;
                }
            }
            catch { }
        }

        private static string ExtractEnglishDistrict(string rawItem)
        {
            if (string.IsNullOrEmpty(rawItem)) return "District Office";
            int idx = rawItem.IndexOf('(');
            if (idx > 0)
            {
                return rawItem.Substring(0, idx).Trim();
            }
            return rawItem.Trim();
        }

        private void BtnContinue_Click(object sender, EventArgs e)
        {
            if (cboDistrict.SelectedIndex <= 0 || cboDistrict.SelectedItem == null || cboDistrict.SelectedItem.ToString().StartsWith("--"))
            {
                MessageBox.Show(
                    "దయచేసి మీ జిల్లాను ఎంచుకోండి!\n\nPlease select your actual District so your Gram Panchayat / Mandal office location is recorded accurately.",
                    "District Required / జిల్లా ఎంచుకోండి",
                    MessageBoxButtons.OK,
                    MessageBoxIcon.Warning);
                cboDistrict.DroppedDown = true;
                return;
            }

            SelectedState = rbAndhra.Checked ? "Andhra Pradesh" : "Telangana";
            string rawDist = cboDistrict.SelectedItem.ToString();
            SelectedDistrict = ExtractEnglishDistrict(rawDist);

            string mandal = txtMandalName.Text.Trim();
            SelectedMandalName = mandal;

            string officeBase = !string.IsNullOrEmpty(txtOfficeName.Text.Trim())
                ? txtOfficeName.Text.Trim()
                : ((Environment.MachineName ?? "GP-OFFICE") + " GP Office");

            if (!string.IsNullOrEmpty(mandal) && officeBase.IndexOf(mandal, StringComparison.OrdinalIgnoreCase) < 0)
            {
                SelectedOfficeName = $"{officeBase} ({mandal} Mandal)";
            }
            else
            {
                SelectedOfficeName = officeBase;
            }

            string operatorName = !string.IsNullOrEmpty(txtOperatorName.Text.Trim())
                ? txtOperatorName.Text.Trim()
                : (Environment.UserName ?? "Operator");

            SystemInfoHelper.SaveConfiguredOfficeProfile(SelectedState, SelectedDistrict, SelectedOfficeName, operatorName, SelectedMandalName);

            this.DialogResult = DialogResult.OK;
            this.Close();
        }
    }
}
