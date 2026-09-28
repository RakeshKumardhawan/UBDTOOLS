using System;
using System.Drawing;
using System.Drawing.Drawing2D;
using System.Drawing.Text;
using System.Windows.Forms;

namespace EVedhikaUBDDeploymentTool.Helpers
{
    public class ModernMetricsCardPanel : Control
    {
        public int TotalChecks { get; set; }
        public int PassedChecks { get; set; }
        public int IssuesCount { get; set; }
        public int HealthScore { get; set; }

        public ModernMetricsCardPanel()
        {
            TotalChecks = 90;
            PassedChecks = 90;
            IssuesCount = 0;
            HealthScore = 100;

            this.SetStyle(ControlStyles.UserPaint |
                           ControlStyles.AllPaintingInWmPaint |
                           ControlStyles.OptimizedDoubleBuffer |
                           ControlStyles.ResizeRedraw, true);
            this.BackColor = Color.FromArgb(15, 23, 42); // Slate-900
            this.Height = 115;
        }

        public void SetMetrics(int total, int passed, int issues, int health)
        {
            this.TotalChecks = total;
            this.PassedChecks = passed;
            this.IssuesCount = issues;
            this.HealthScore = health;
            this.Invalidate();
        }

        protected override void OnPaint(PaintEventArgs e)
        {
            base.OnPaint(e);
            Graphics g = e.Graphics;
            g.SmoothingMode = SmoothingMode.AntiAlias;
            g.TextRenderingHint = TextRenderingHint.ClearTypeGridFit;

            // Fill canvas with deep background
            using (var bgBrush = new SolidBrush(Color.FromArgb(11, 15, 25)))
            {
                g.FillRectangle(bgBrush, this.ClientRectangle);
            }

            int cardCount = 4;
            int margin = 8;
            int totalWidth = this.Width - (margin * (cardCount + 1));
            int cardWidth = Math.Max(160, totalWidth / cardCount);
            int cardHeight = this.Height - 16;
            int top = 8;

            // CARD 1: TOTAL VERIFICATION (Dark Slate / Indigo)
            DrawMetricCard(g,
                new Rectangle(margin, top, cardWidth, cardHeight),
                "మొత్తం వెరిఫికేషన్ (TOTAL CHECKS)",
                TotalChecks.ToString() + " Checks",
                "● Grama Panchayat Standards",
                Color.FromArgb(20, 24, 40),
                Color.FromArgb(15, 18, 30),
                Color.FromArgb(99, 102, 241), // Indigo accent
                Color.White,
                0);

            // CARD 2: PASSED CHECKS (Emerald Gradient)
            string passedSub = (PassedChecks >= TotalChecks && TotalChecks > 0) ? "● 100% Fully Configured" : string.Format("● {0}% Configured", Math.Round((double)PassedChecks / (TotalChecks > 0 ? TotalChecks : 1) * 100));
            DrawMetricCard(g,
                new Rectangle(margin * 2 + cardWidth, top, cardWidth, cardHeight),
                string.Format("సక్సెస్ అయినవి (PASSED {0}/{1})", PassedChecks, TotalChecks),
                PassedChecks.ToString() + " Passed",
                passedSub,
                Color.FromArgb(13, 36, 32),
                Color.FromArgb(10, 24, 22),
                Color.FromArgb(16, 185, 129), // Emerald accent
                Color.FromArgb(52, 211, 153),
                1);

            // CARD 3: ISSUES / WARNINGS (Amber Gradient)
            string issuesSub = (IssuesCount == 0) ? "● Zero System Conflicts" : string.Format("● {0} System Conflicts Detected", IssuesCount);
            DrawMetricCard(g,
                new Rectangle(margin * 3 + cardWidth * 2, top, cardWidth, cardHeight),
                "ప్రాబ్లమ్స్ (ISSUES/WARNINGS)",
                IssuesCount.ToString() + " Issues",
                issuesSub,
                Color.FromArgb(38, 28, 14),
                Color.FromArgb(24, 18, 10),
                Color.FromArgb(245, 158, 11), // Amber accent
                Color.FromArgb(251, 191, 36),
                2);

            // CARD 4: AVG HEALTH SCORE (Cyan Gradient)
            DrawMetricCard(g,
                new Rectangle(margin * 4 + cardWidth * 3, top, cardWidth, cardHeight),
                "సగటు హెల్త్ స్కోర్ (AVG HEALTH)",
                HealthScore.ToString() + "%",
                "● Optimal Government State",
                Color.FromArgb(12, 33, 48),
                Color.FromArgb(8, 22, 34),
                Color.FromArgb(6, 182, 212), // Cyan accent
                Color.FromArgb(34, 211, 238),
                3);
        }

        private void DrawMetricCard(Graphics g, Rectangle rect, string title, string value, string subtitle,
                                   Color gradTop, Color gradBottom, Color accentColor, Color valueColor, int iconType)
        {
            int radius = 12;
            using (GraphicsPath path = GetRoundedRectangle(rect, radius))
            {
                // Background gradient
                using (var brush = new LinearGradientBrush(rect, gradTop, gradBottom, LinearGradientMode.Vertical))
                {
                    g.FillPath(brush, path);
                }

                // Smooth border
                using (var pen = new Pen(Color.FromArgb(60, accentColor), 1.2f))
                {
                    g.DrawPath(pen, path);
                }

                // Title Text
                using (var fontTitle = new Font("Segoe UI", 7.5f, FontStyle.Bold))
                using (var titleBrush = new SolidBrush(Color.FromArgb(203, 213, 225))) // Slate-300
                {
                    var titleRect = new Rectangle(rect.X + 12, rect.Y + 12, rect.Width - 55, 28);
                    g.DrawString(title, fontTitle, titleBrush, titleRect);
                }

                // Big Value Text
                using (var fontValue = new Font("Segoe UI", 16f, FontStyle.Bold))
                using (var valBrush = new SolidBrush(valueColor))
                {
                    g.DrawString(value, fontValue, valBrush, rect.X + 10, rect.Y + 44);
                }

                // Subtitle Text
                using (var fontSub = new Font("Segoe UI", 7.5f, FontStyle.Regular))
                using (var subBrush = new SolidBrush(Color.FromArgb(148, 163, 184))) // Slate-400
                {
                    g.DrawString(subtitle, fontSub, subBrush, rect.X + 12, rect.Y + 78);
                }

                // Icon Box on Right
                int iconBoxSize = 36;
                var iconBoxRect = new Rectangle(rect.Right - iconBoxSize - 12, rect.Y + (rect.Height - iconBoxSize) / 2, iconBoxSize, iconBoxSize);
                using (GraphicsPath iconPath = GetRoundedRectangle(iconBoxRect, 8))
                {
                    using (var iconBg = new SolidBrush(Color.FromArgb(40, accentColor)))
                    {
                        g.FillPath(iconBg, iconPath);
                    }
                    using (var iconBorder = new Pen(Color.FromArgb(90, accentColor), 1f))
                    {
                        g.DrawPath(iconBorder, iconPath);
                    }

                    // Draw minimalist glyph inside icon box
                    DrawIconGlyph(g, iconBoxRect, iconType, accentColor);
                }
            }
        }

        private void DrawIconGlyph(Graphics g, Rectangle box, int type, Color color)
        {
            using (var pen = new Pen(color, 2f))
            {
                pen.StartCap = LineCap.Round;
                pen.EndCap = LineCap.Round;
                int cx = box.X + box.Width / 2;
                int cy = box.Y + box.Height / 2;

                if (type == 0) // Monitor / Screen
                {
                    g.DrawRectangle(pen, cx - 8, cy - 7, 16, 11);
                    g.DrawLine(pen, cx - 4, cy + 6, cx + 4, cy + 6);
                }
                else if (type == 1) // Checkmark
                {
                    g.DrawLine(pen, cx - 6, cy, cx - 2, cy + 4);
                    g.DrawLine(pen, cx - 2, cy + 4, cx + 6, cy - 4);
                }
                else if (type == 2) // Warning Exclamation
                {
                    g.DrawLine(pen, cx, cy - 6, cx, cy + 1);
                    using (var brush = new SolidBrush(color))
                    {
                        g.FillEllipse(brush, cx - 1, cy + 4, 3, 3);
                    }
                }
                else if (type == 3) // Pulse Wave
                {
                    Point[] pts = new Point[]
                    {
                        new Point(cx - 9, cy),
                        new Point(cx - 4, cy),
                        new Point(cx - 1, cy - 6),
                        new Point(cx + 2, cy + 6),
                        new Point(cx + 5, cy),
                        new Point(cx + 9, cy)
                    };
                    g.DrawLines(pen, pts);
                }
            }
        }

        private static GraphicsPath GetRoundedRectangle(Rectangle bounds, int radius)
        {
            GraphicsPath path = new GraphicsPath();
            int diameter = radius * 2;
            Rectangle arc = new Rectangle(bounds.Location, new Size(diameter, diameter));

            // Top Left
            path.AddArc(arc, 180, 90);

            // Top Right
            arc.X = bounds.Right - diameter;
            path.AddArc(arc, 270, 90);

            // Bottom Right
            arc.Y = bounds.Bottom - diameter;
            path.AddArc(arc, 0, 90);

            // Bottom Left
            arc.X = bounds.Left;
            path.AddArc(arc, 90, 90);

            path.CloseFigure();
            return path;
        }
    }
}
