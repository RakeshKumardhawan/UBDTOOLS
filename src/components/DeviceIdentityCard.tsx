import React, { useRef, useState } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { Cpu, Printer, Download, Copy, Check, ShieldCheck, HardDrive, Network, MapPin, Sparkles, X } from 'lucide-react';
import { getDeviceHardwareIdentity, DeviceIdentity } from '../utils/hardwareIdentity';

interface DeviceIdentityCardProps {
  deviceIdentity?: DeviceIdentity;
  officeLocation?: string;
  onClose?: () => void;
  isModal?: boolean;
}

export const DeviceIdentityCard: React.FC<DeviceIdentityCardProps> = ({
  deviceIdentity,
  officeLocation = 'Grama Panchayat / Mandal Office',
  onClose,
  isModal = false,
}) => {
  const hw = deviceIdentity || getDeviceHardwareIdentity();
  const cardRef = useRef<HTMLDivElement>(null);
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const timestamp = new Date().toLocaleString('en-IN', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const qrPayload = JSON.stringify({
    app: 'E-Vedhika UBD Deployment Tool',
    domain: 'www.e-vedhika.in',
    hardwareId: hw.hardwareId,
    macAddress: hw.macSuffix,
    hardwareUuid: hw.hardwareUuid,
    location: officeLocation,
    status: hw.status,
    verifiedAt: new Date().toISOString(),
  });

  const handleCopyPayload = () => {
    const textToCopy = `E-VEDHIKA HARDWARE IDENTITY VERIFICATION
------------------------------------
Hardware ID:   ${hw.hardwareId}
MAC Address:   ${hw.macSuffix}
BIOS UUID:     ${hw.hardwareUuid}
Location:      ${officeLocation}
Status:        ${hw.status}
Timestamp:     ${timestamp}
Portal:        https://www.e-vedhika.in/api/telemetry`;

    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePrint = () => {
    const printWindow = window.open('', '_blank', 'width=700,height=800');
    if (!printWindow) {
      alert('Pop-up blocked. Please allow pop-ups to print the verification badge.');
      return;
    }

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>E-Vedhika Device Identity Badge - ${hw.hardwareId}</title>
          <style>
            body {
              font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
              background-color: #0d1117;
              color: #f0f6fc;
              display: flex;
              justify-content: center;
              align-items: center;
              min-height: 100vh;
              margin: 0;
              padding: 20px;
            }
            .badge-card {
              background: linear-gradient(135deg, #161b22 0%, #0d1117 100%);
              border: 2px solid #00f0ff;
              border-radius: 16px;
              padding: 30px;
              max-width: 500px;
              width: 100%;
              box-shadow: 0 10px 30px rgba(0, 240, 255, 0.2);
              text-align: center;
            }
            .header {
              border-bottom: 2px solid #30363d;
              padding-bottom: 15px;
              margin-bottom: 20px;
            }
            .title {
              font-size: 20px;
              font-weight: 800;
              color: #00f0ff;
              letter-spacing: 1px;
              margin: 0 0 5px 0;
            }
            .subtitle {
              font-size: 11px;
              color: #8b949e;
              text-transform: uppercase;
              letter-spacing: 2px;
            }
            .qr-container {
              background: #ffffff;
              padding: 15px;
              border-radius: 12px;
              display: inline-block;
              margin: 15px 0;
            }
            .info-grid {
              text-align: left;
              background: rgba(255,255,255,0.03);
              border-radius: 10px;
              padding: 15px;
              margin-top: 15px;
              font-family: monospace;
              font-size: 13px;
            }
            .info-row {
              display: flex;
              justify-content: space-between;
              padding: 6px 0;
              border-bottom: 1px solid rgba(255,255,255,0.05);
            }
            .info-row:last-child {
              border-bottom: none;
            }
            .label { color: #8b949e; }
            .value { color: #3fb950; font-weight: bold; }
            .footer {
              margin-top: 20px;
              font-size: 10px;
              color: #8b949e;
            }
            @media print {
              body { background: white; color: black; }
              .badge-card { border-color: #000; box-shadow: none; background: white; color: black; }
              .title { color: #000; }
              .subtitle { color: #333; }
              .info-grid { background: #f5f5f5; border: 1px solid #ccc; }
              .label { color: #555; }
              .value { color: #000; }
            }
          </style>
        </head>
        <body>
          <div class="badge-card">
            <div class="header">
              <div class="title">E-VEDHIKA HARDWARE BADGE</div>
              <div class="subtitle">Official Workstation Verification Seal</div>
            </div>
            
            <div class="qr-container">
              <div id="qr-target"></div>
            </div>

            <div class="info-grid">
              <div class="info-row">
                <span class="label">Hardware ID:</span>
                <span class="value">${hw.hardwareId}</span>
              </div>
              <div class="info-row">
                <span class="label">MAC Address:</span>
                <span class="value">${hw.macSuffix}</span>
              </div>
              <div class="info-row">
                <span class="label">BIOS UUID:</span>
                <span class="value" style="font-size:11px;">${hw.hardwareUuid}</span>
              </div>
              <div class="info-row">
                <span class="label">Location:</span>
                <span class="value" style="font-size:11px;">${officeLocation}</span>
              </div>
              <div class="info-row">
                <span class="label">Status:</span>
                <span class="value">${hw.status}</span>
              </div>
              <div class="info-row">
                <span class="label">Verified Date:</span>
                <span class="value" style="font-size:11px; color:#c9d1d9;">${timestamp}</span>
              </div>
            </div>

            <div class="footer">
              E-Vedhika Central Telemetry System | www.e-vedhika.in/api/telemetry
            </div>
          </div>

          <script>
            setTimeout(() => {
              window.print();
            }, 300);
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  const handleSaveBadgeImage = () => {
    setDownloading(true);
    try {
      const svgElement = cardRef.current?.querySelector('svg');
      if (!svgElement) {
        alert('QR code visual not found.');
        setDownloading(false);
        return;
      }

      const svgData = new XMLSerializer().serializeToString(svgElement);
      const svgBlob = new Blob([svgData], { type: 'image/svg+xml;charset=utf-8' });
      const blobURL = URL.createObjectURL(svgBlob);

      const image = new Image();
      image.onload = () => {
        const canvas = document.createElement('canvas');
        const size = 600;
        canvas.width = size;
        canvas.height = Math.round(size * 1.3);
        const ctx = canvas.getContext('2d');

        if (ctx) {
          const gradient = ctx.createLinearGradient(0, 0, size, canvas.height);
          gradient.addColorStop(0, '#0d1117');
          gradient.addColorStop(1, '#161b22');
          ctx.fillStyle = gradient;
          ctx.fillRect(0, 0, size, canvas.height);

          ctx.strokeStyle = '#00f0ff';
          ctx.lineWidth = 6;
          ctx.strokeRect(15, 15, size - 30, canvas.height - 30);

          ctx.fillStyle = '#00f0ff';
          ctx.font = 'bold 24px sans-serif';
          ctx.textAlign = 'center';
          ctx.fillText('E-VEDHIKA HARDWARE BADGE', size / 2, 60);

          ctx.fillStyle = '#8b949e';
          ctx.font = 'bold 12px sans-serif';
          ctx.fillText('WORKSTATION UNIQUE IDENTITY SEAL', size / 2, 85);

          const qrX = (size - 240) / 2;
          ctx.fillStyle = '#ffffff';
          ctx.beginPath();
          ctx.roundRect(qrX, 110, 240, 240, 16);
          ctx.fill();

          ctx.drawImage(image, qrX + 20, 130, 200, 200);

          const boxX = 40;
          const boxY = 380;
          const boxW = size - 80;
          const boxH = 320;

          ctx.fillStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.beginPath();
          ctx.roundRect(boxX, boxY, boxW, boxH, 12);
          ctx.fill();
          ctx.strokeStyle = 'rgba(0, 240, 255, 0.3)';
          ctx.lineWidth = 1;
          ctx.stroke();

          ctx.textAlign = 'left';
          ctx.font = '14px monospace';

          const rows = [
            { label: 'Hardware ID:', val: hw.hardwareId, color: '#3fb950' },
            { label: 'MAC Address:', val: hw.macSuffix, color: '#00f0ff' },
            { label: 'BIOS UUID:', val: hw.hardwareUuid, color: '#e6edf3' },
            { label: 'Location:', val: officeLocation, color: '#e6edf3' },
            { label: 'Status:', val: hw.status, color: '#3fb950' },
            { label: 'Verified Date:', val: timestamp, color: '#8b949e' },
          ];

          let lineY = boxY + 35;
          rows.forEach((row) => {
            ctx.fillStyle = '#8b949e';
            ctx.fillText(row.label, boxX + 20, lineY);
            ctx.fillStyle = row.color;
            ctx.fillText(row.val, boxX + 160, lineY);
            lineY += 45;
          });

          const pngUrl = canvas.toDataURL('image/png');
          const downloadLink = document.createElement('a');
          downloadLink.href = pngUrl;
          downloadLink.download = `EVedhika_DeviceBadge_${hw.hardwareId}.png`;
          document.body.appendChild(downloadLink);
          downloadLink.click();
          document.body.removeChild(downloadLink);
        }
        setDownloading(false);
      };
      image.src = blobURL;
    } catch (err) {
      console.error('Failed to export badge image:', err);
      alert('Unable to generate image download. Please use the Print option.');
      setDownloading(false);
    }
  };

  return (
    <div className={`relative bg-surface/90 border border-accent/40 rounded-2xl p-5 sm:p-6 shadow-2xl backdrop-blur-md max-w-lg w-full ${isModal ? 'z-50' : ''}`}>
      {isModal && onClose && (
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          aria-label="Close Badge Modal"
        >
          <X size={18} />
        </button>
      )}

      <div ref={cardRef} className="space-y-5">
        <div className="flex items-center justify-between border-b border-ink-faint pb-3.5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400">
              <Cpu size={22} />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h3 className="font-syne text-[0.95rem] font-bold text-white tracking-wide">
                  Device Verification Badge
                </h3>
                <ShieldCheck size={14} className="text-emerald-400" />
              </div>
              <p className="text-[0.62rem] font-mono text-slate-400 uppercase tracking-widest">
                E-Vedhika Unique Hardware Identity
              </p>
            </div>
          </div>

          <span className="text-[0.58rem] font-mono font-bold px-2 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/40">
            {hw.status}
          </span>
        </div>

        <div className="bg-slate-900/80 border border-ink/80 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-4 justify-between">
          <div className="bg-white p-3 rounded-xl shadow-lg border border-slate-200 shrink-0 flex items-center justify-center">
            <QRCodeSVG
              value={qrPayload}
              size={110}
              level="H"
              includeMargin={false}
              fgColor="#090d16"
              bgColor="#ffffff"
            />
          </div>

          <div className="flex-1 space-y-2 text-center sm:text-left font-mono text-[0.72rem]">
            <div>
              <span className="text-[0.6rem] text-slate-400 uppercase block tracking-wider">Hardware ID Badge</span>
              <span className="text-[1.05rem] font-black text-emerald-300 font-mono tracking-wider">{hw.hardwareId}</span>
            </div>

            <div className="flex items-center gap-1.5 justify-center sm:justify-start text-slate-300 text-[0.68rem]">
              <Network size={12} className="text-accent shrink-0" />
              <span className="text-slate-400">MAC:</span>
              <span className="font-semibold text-white">{hw.macSuffix}</span>
            </div>

            <div className="flex items-center gap-1.5 justify-center sm:justify-start text-slate-300 text-[0.68rem]">
              <HardDrive size={12} className="text-amber-400 shrink-0" />
              <span className="text-slate-400">UUID:</span>
              <span className="text-slate-300 font-mono text-[0.62rem] truncate max-w-[140px] sm:max-w-[180px]" title={hw.hardwareUuid}>
                {hw.hardwareUuid}
              </span>
            </div>
          </div>
        </div>

        <div className="bg-ink/30 border border-ink-faint rounded-xl p-3.5 space-y-2 text-[0.7rem] font-mono">
          <div className="flex justify-between items-center text-slate-300 border-b border-ink-faint/50 pb-1.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <MapPin size={12} className="text-cyan-400" />
              Office Station:
            </span>
            <span className="font-semibold text-cyan-300 truncate max-w-[200px]" title={officeLocation}>
              {officeLocation}
            </span>
          </div>

          <div className="flex justify-between items-center text-slate-300 border-b border-ink-faint/50 pb-1.5">
            <span className="text-slate-400 flex items-center gap-1.5">
              <Sparkles size={12} className="text-emerald-400" />
              Central Telemetry ID:
            </span>
            <span className="font-bold text-emerald-400">https://www.e-vedhika.in/api/telemetry</span>
          </div>

          <div className="flex justify-between items-center text-slate-300 pt-0.5">
            <span className="text-slate-500">Verified Timestamp:</span>
            <span className="text-slate-400 text-[0.62rem]">{timestamp}</span>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-2 pt-1">
          <button
            onClick={handlePrint}
            className="btn py-2 px-3 text-[0.68rem] bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-300 border border-cyan-500/40 rounded-xl flex items-center justify-center gap-1.5 font-mono transition-all cursor-pointer"
            title="Print hardware identity badge"
          >
            <Printer size={13} />
            <span>Print</span>
          </button>

          <button
            onClick={handleSaveBadgeImage}
            disabled={downloading}
            className="btn py-2 px-3 text-[0.68rem] bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 rounded-xl flex items-center justify-center gap-1.5 font-mono transition-all cursor-pointer disabled:opacity-50"
            title="Download QR Badge as PNG Image"
          >
            <Download size={13} />
            <span>{downloading ? 'Saving...' : 'Save PNG'}</span>
          </button>

          <button
            onClick={handleCopyPayload}
            className="btn py-2 px-3 text-[0.68rem] bg-purple-500/10 hover:bg-purple-500/20 text-purple-300 border border-purple-500/40 rounded-xl flex items-center justify-center gap-1.5 font-mono transition-all cursor-pointer"
            title="Copy verification payload details"
          >
            {copied ? <Check size={13} className="text-emerald-400" /> : <Copy size={13} />}
            <span>{copied ? 'Copied!' : 'Copy'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
