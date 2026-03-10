import * as htmlToImage from 'html-to-image';
import { jsPDF } from 'jspdf';
import type { AnalysisResult } from '../types';

interface ExportPDFParams {
    pdfRef: React.RefObject<HTMLDivElement | null>;
    history: AnalysisResult[];
    setLoading: (loading: boolean) => void;
}

export const downloadPDF = async ({ pdfRef, history, setLoading }: ExportPDFParams) => {
    if (!pdfRef.current || history.length === 0) return;

    setLoading(true);

    try {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pageHeight = pdf.internal.pageSize.getHeight();
        const margin = 10;
        const usableWidth = pdfWidth - (margin * 2);
        let currentY = margin;

        const addElementToPDF = async (elementId: string) => {
            const el = document.getElementById(elementId);

            // Seguro 1: Si no encuentra el pedazo de HTML, nos avisa en consola
            if (!el) {
                console.warn(`La cámara no encontró el bloque: ${elementId}`);
                return;
            }

            // Seguro 2: Esperamos 100ms para que Recharts y React terminen de pintar todo en pantalla
            await new Promise((resolve) => setTimeout(resolve, 100));

            // Tomamos la foto con fondo blanco limpio
            const dataUrl = await htmlToImage.toPng(el, { quality: 1, pixelRatio: 2, backgroundColor: '#ffffff' });
            const imgHeight = (el.offsetHeight * usableWidth) / el.offsetWidth;

            if (currentY + imgHeight > pageHeight - margin) {
                pdf.addPage();
                currentY = margin;
            }

            pdf.addImage(dataUrl, 'PNG', margin, currentY, usableWidth, imgHeight);
            currentY += imgHeight + 5;
        };

        // 1. Pegamos el encabezado y gráficas
        await addElementToPDF('pdf-header');

        // 2. Pegamos tarjeta por tarjeta
        for (let i = 0; i < history.length; i++) {
            await addElementToPDF(`pdf-review-${i}`);
        }

        pdf.save('Reporte-Intelligence-Hub.pdf');
    } catch (error) {
        console.error("Error generando PDF:", error);
        alert("Hubo un error al generar el PDF.");
    } finally {
        setLoading(false);
    }
};