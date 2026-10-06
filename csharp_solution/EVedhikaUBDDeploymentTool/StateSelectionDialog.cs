using System;
using System.Drawing;
using System.Windows.Forms;

namespace EVedhikaUBDDeploymentTool
{
    public class StateSelectionDialog : Form
    {
        public string SelectedState { get; private set; } = "Telangana";

        public StateSelectionDialog()
        {
            InitializeComponent();
        }

        private void InitializeComponent()
        {
            this.Text = "E-Vedhika - Select Target Portal / State";
            this.ClientSize = new Size(460, 360);
            this.FormBorderStyle = FormBorderStyle.FixedDialog;
            this.StartPosition = FormStartPosition.CenterScreen;
            this.MaximizeBox = false;
            this.MinimizeBox = false;
            this.BackColor = Color.FromArgb(15, 23, 42); // slate-900
            this.ForeColor = Color.White;

            // 1. Header Title Label
            Label lblQuestion = new Label();
            lblQuestion.Text = "మీరు ఏ పోర్టల్/రాష్ట్రం కాన్ఫిగర్ చేయాలనుకుంటున్నారు?\n(Select Target Department / State Portal)";
            lblQuestion.Font = new Font("Segoe UI", 11.5f, FontStyle.Bold);
            lblQuestion.TextAlign = ContentAlignment.MiddleCenter;
            lblQuestion.Location = new Point(15, 18);
            lblQuestion.Size = new Size(430, 52);
            lblQuestion.ForeColor = Color.White;
            this.Controls.Add(lblQuestion);

            // 2. Selection Card Panel
            Panel cardPanel = new Panel();
            cardPanel.Location = new Point(25, 82);
            cardPanel.Size = new Size(410, 205);
            cardPanel.BackColor = Color.FromArgb(24, 34, 53); // slate-800
            this.Controls.Add(cardPanel);

            // Subtitle inside card
            Label lblSelectPrompt = new Label();
            lblSelectPrompt.Text = "SELECT PORTAL (డ్రాప్‌డౌన్ నుండి ఎంచుకోండి):";
            lblSelectPrompt.Font = new Font("Segoe UI", 8.5f, FontStyle.Bold);
            lblSelectPrompt.ForeColor = Color.FromArgb(148, 163, 184); // slate-400
            lblSelectPrompt.Location = new Point(18, 14);
            lblSelectPrompt.Size = new Size(374, 20);
            cardPanel.Controls.Add(lblSelectPrompt);

            // Dropdown for portal selection
            ComboBox cmbPortals = new ComboBox();
            cmbPortals.Items.Add("E-VEDHIKA UBD PORTAL (TELANGANA)");
            cmbPortals.Items.Add("E-VEDHIKA UBD PORTAL (ANDHRA PRADESH)");
            cmbPortals.DropDownStyle = ComboBoxStyle.DropDownList;
            cmbPortals.Font = new Font("Segoe UI", 10f, FontStyle.Bold);
            cmbPortals.Location = new Point(18, 38);
            cmbPortals.Size = new Size(374, 32);
            cmbPortals.BackColor = Color.FromArgb(15, 23, 42);
            cmbPortals.ForeColor = Color.FromArgb(56, 189, 248); // sky-400
            cmbPortals.FlatStyle = FlatStyle.Flat;

            cmbPortals.SelectedIndex = 0; // Default to Telangana
            cardPanel.Controls.Add(cmbPortals);

            // Information details text
            Label lblTargetInfo = new Label();
            lblTargetInfo.Text = "Target: ubd.telangana.gov.in (IE5 Quirks Mode + DSC Token)";
            lblTargetInfo.Font = new Font("Segoe UI", 8.5f, FontStyle.Regular);
            lblTargetInfo.ForeColor = Color.FromArgb(56, 189, 248); // sky-400
            lblTargetInfo.Location = new Point(18, 78);
            lblTargetInfo.Size = new Size(374, 40);
            cardPanel.Controls.Add(lblTargetInfo);

            cmbPortals.SelectedIndexChanged += delegate(object s, EventArgs e) {
                int idx = cmbPortals.SelectedIndex;
                if (idx == 1)
                {
                    SelectedState = "Andhra Pradesh";
                    lblTargetInfo.Text = "Target: www.ubd.ap.gov.in:8080/UBDNEW (IE5 Quirks Mode + DSC Token)";
                    lblTargetInfo.ForeColor = Color.FromArgb(52, 211, 153); // emerald-400
                }
                else
                {
                    SelectedState = "Telangana";
                    lblTargetInfo.Text = "Target: ubd.telangana.gov.in (IE5 Quirks Mode + DSC Token)";
                    lblTargetInfo.ForeColor = Color.FromArgb(56, 189, 248); // sky-400
                }
            };

            // Button to confirm selection
            Button btnConfirm = new Button();
            btnConfirm.Text = "PROCEED / ముందుకు సాగండి";
            btnConfirm.Font = new Font("Segoe UI", 11f, FontStyle.Bold);
            btnConfirm.Location = new Point(18, 130);
            btnConfirm.Size = new Size(374, 46);
            btnConfirm.BackColor = Color.FromArgb(37, 99, 235); // blue-600
            btnConfirm.ForeColor = Color.White;
            btnConfirm.FlatStyle = FlatStyle.Flat;
            btnConfirm.FlatAppearance.BorderSize = 0;
            btnConfirm.Cursor = Cursors.Hand;
            btnConfirm.Click += delegate(object s, EventArgs e) {
                int idx = cmbPortals.SelectedIndex;
                if (idx == 1)
                {
                    SelectedState = "Andhra Pradesh";
                }
                else
                {
                    SelectedState = "Telangana";
                }
                this.DialogResult = DialogResult.OK;
                this.Close();
            };
            cardPanel.Controls.Add(btnConfirm);

            // 3. Footer
            Label lblFooter = new Label();
            lblFooter.Text = "E-Vedhika UBD Enterprise Support • Developed by Rakesh Dhawan";
            lblFooter.Font = new Font("Segoe UI", 8.5f, FontStyle.Italic);
            lblFooter.TextAlign = ContentAlignment.MiddleCenter;
            lblFooter.Location = new Point(15, 305);
            lblFooter.Size = new Size(430, 26);
            lblFooter.ForeColor = Color.FromArgb(148, 163, 184); // slate-400
            this.Controls.Add(lblFooter);
        }
    }
}
