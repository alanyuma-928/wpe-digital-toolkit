import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import type { WeatherSnapshot, SafetyFlag } from "@/context/WeatherContext";

export interface FITTVP {
  frequency: string;
  intensity: string;
  time: string;
  type: string;
  volume: string;
  progression: string;
}

export interface ClientProfile {
  name: string;
  age: string;
  restingHR: string;
  betaBlocker: boolean;
  notes: string;
}

export interface RxPayload {
  client: ClientProfile;
  fittvp: FITTVP;
  weather: WeatherSnapshot | null;
  flag: SafetyFlag | null;
}

const ts = () => new Date().toISOString();

export const generateRxPdf = ({ client, fittvp, weather, flag }: RxPayload) => {
  const doc = new jsPDF({ unit: "pt", format: "letter" });
  const margin = 48;
  let y = margin;

  // H2 Header
  doc.setFont("helvetica", "bold");
  doc.setFontSize(18);
  doc.setTextColor(0, 51, 102);
  doc.text("Clinical Exercise Prescription", margin, y);
  y += 24;

  doc.setFontSize(9);
  doc.setTextColor(80);
  doc.setFont("helvetica", "normal");
  doc.text(`Generated: ${ts()}`, margin, y);
  y += 18;

  // Client Profile (### delimited)
  doc.setFont("courier", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  doc.text("### CLIENT PROFILE ###", margin, y);
  y += 14;
  doc.setFont("courier", "normal");
  const profileLines = [
    `Name:         ${client.name || "—"}`,
    `Age:          ${client.age || "—"}`,
    `Resting HR:   ${client.restingHR || "—"} bpm`,
    `Beta-Blocker: ${client.betaBlocker ? "YES (HR zones invalidated)" : "No"}`,
    `Notes:        ${client.notes || "—"}`,
  ];
  profileLines.forEach((l) => {
    doc.text(l, margin, y);
    y += 12;
  });
  doc.setFont("courier", "bold");
  doc.text("### END CLIENT PROFILE ###", margin, y);
  y += 20;

  // FITT-VP table
  autoTable(doc, {
    startY: y,
    head: [["Component", "Prescription"]],
    body: [
      ["Frequency", fittvp.frequency],
      ["Intensity", fittvp.intensity],
      ["Time", fittvp.time],
      ["Type", fittvp.type],
      ["Volume", fittvp.volume],
      ["Progression", fittvp.progression],
    ],
    headStyles: { fillColor: [0, 51, 102], textColor: 255 },
    styles: { font: "helvetica", fontSize: 10 },
    margin: { left: margin, right: margin },
  });
  // @ts-expect-error lastAutoTable injected by autoTable
  y = (doc as { lastAutoTable: { finalY: number } }).lastAutoTable.finalY + 24;

  // Thermal Safety Audit
  doc.setFont("helvetica", "bold");
  doc.setFontSize(12);
  doc.setTextColor(0, 51, 102);
  doc.text("Thermal Safety Audit (KNYL)", margin, y);
  y += 16;
  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);
  doc.setTextColor(0, 0, 0);
  const audit = [
    `Timestamp: ${ts()}`,
    `Station: KNYL · Yuma MCAS`,
    `Temp: ${weather?.tempF ?? "n/a"}°F  |  Humidity: ${weather?.humidity ?? "n/a"}%`,
    `WBGT (est.): ${weather?.wbgtF ?? "n/a"}°F  |  UV: ${weather?.uvIndex ?? "n/a"}`,
    `AQI: ${weather?.aqi ? `${weather.aqi.value} ${weather.aqi.category} (${weather.aqi.parameter})` : "n/a"}`,
    `Flag: ${flag ? `${flag.shape} ${flag.color} — ${flag.label}` : "n/a"}`,
    flag ? `Guidance: ${flag.guidance}` : "",
  ].filter(Boolean);
  audit.forEach((l) => {
    const wrapped = doc.splitTextToSize(l, 515);
    doc.text(wrapped, margin, y);
    y += wrapped.length * 12;
  });

  doc.save(`Rx_${(client.name || "client").replace(/\s+/g, "_")}_${Date.now()}.pdf`);
};
