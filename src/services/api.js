import axios from 'axios';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';
import * as Print from 'expo-print';

const API_KEY = "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";
const OPENAI_BASE_URL = 'https://api.openai.com/v1';
const BACKEND_BASE_URL = 'http://192.168.100.2:8000/api'; // Cambia esto a tu URL del backend

export const api = {
  // Convertir audio a texto
  async convertAudioToText(audioFile) {
    const formData = new FormData();
    formData.append('file', audioFile);
    formData.append('model', 'whisper-1');
    formData.append('language', 'es');
    
    try {
      const response = await axios.post(
        `${OPENAI_BASE_URL}/audio/transcriptions`,
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
            Authorization: `Bearer ${API_KEY}`,
          },
        }
      );
      return response.data.text;
    } catch (error) {
      console.error('Error en transcripción:', error);
      throw error;
    }
  },

  // Procesar consulta con el asistente del backend
  async processAssistantQuery(query, type = 'text') {
    try {
      const response = await axios.post(
        `${BACKEND_BASE_URL}/assistant/query`,
        {
          query,
          type
        },
        {
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json',
          },
        }
      );
      console.log("SEND ",query,type)
      console.log("response ",response.data)
      return response.data;
    } catch (error) {
      console.error('Error procesando consulta:', error);
      throw error;
    }
  },

  // Obtener métricas específicas
  async getMetrics(metric, period = 'month', startDate = null, endDate = null) {
    try {
      const params = { metric, period };
      if (startDate) params.start_date = startDate;
      if (endDate) params.end_date = endDate;

      const response = await axios.get(
        `${BACKEND_BASE_URL}/assistant/metrics`,
        { params }
      );
      return response.data;
    } catch (error) {
      console.error('Error obteniendo métricas:', error);
      throw error;
    }
  },

  // Exportar datos a Excel
  async exportToExcel(data, filename = 'ventas_report.xlsx') {
    try {
      // Crear el contenido CSV (más simple que Excel real)
      let csvContent = '';
      
      if (Array.isArray(data) && data.length > 0) {
        // Headers
        const headers = Object.keys(data[0]);
        csvContent = headers.join(',') + '\n';
        
        // Data
        data.forEach(item => {
          const row = headers.map(header => {
            const value = item[header];
            // Escape commas and quotes
            if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
              return `"${value.replace(/"/g, '""')}"`;
            }
            return value;
          });
          csvContent += row.join(',') + '\n';
        });
      }

      // Guardar archivo
      const fileUri = FileSystem.documentDirectory + filename.replace('.xlsx', '.csv');
      await FileSystem.writeAsStringAsync(fileUri, csvContent, {
        encoding: FileSystem.EncodingType.UTF8,
      });

      // Compartir archivo
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(fileUri);
      }

      return fileUri;
    } catch (error) {
      console.error('Error exportando a Excel:', error);
      throw error;
    }
  },

  // Exportar datos a PDF
  async exportToPDF(data, title = 'Reporte de Ventas') {
    try {
      let htmlContent = `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="utf-8">
          <title>${title}</title>
          <style>
            body {
              font-family: Arial, sans-serif;
              padding: 20px;
              color: #333;
            }
            h1 {
              color: #00BFFF;
              border-bottom: 2px solid #00BFFF;
              padding-bottom: 10px;
            }
            .info {
              background-color: #f0f8ff;
              padding: 15px;
              border-radius: 8px;
              margin: 20px 0;
            }
            .metric {
              margin: 10px 0;
              padding: 10px;
              background: #fff;
              border-left: 4px solid #00BFFF;
            }
            table {
              width: 100%;
              border-collapse: collapse;
              margin-top: 20px;
            }
            th, td {
              border: 1px solid #ddd;
              padding: 12px;
              text-align: left;
            }
            th {
              background-color: #00BFFF;
              color: white;
            }
            tr:nth-child(even) {
              background-color: #f2f2f2;
            }
            .footer {
              margin-top: 30px;
              text-align: center;
              color: #666;
              font-size: 12px;
            }
          </style>
        </head>
        <body>
          <h1>${title}</h1>
          <div class="info">
            <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES')}</p>
            <p>Hora: ${new Date().toLocaleTimeString('es-ES')}</p>
          </div>
      `;

      // Si es un objeto con estadísticas
      if (data && typeof data === 'object' && !Array.isArray(data)) {
        htmlContent += '<div class="metrics">';
        Object.entries(data).forEach(([key, value]) => {
          const label = key.replace(/_/g, ' ').charAt(0).toUpperCase() + key.slice(1);
          htmlContent += `
            <div class="metric">
              <strong>${label}:</strong> ${value}
            </div>
          `;
        });
        htmlContent += '</div>';
      }

      // Si es un array, crear tabla
      if (Array.isArray(data) && data.length > 0) {
        htmlContent += '<table>';
        
        // Headers
        const headers = Object.keys(data[0]);
        htmlContent += '<thead><tr>';
        headers.forEach(header => {
          const label = header.replace(/_/g, ' ').charAt(0).toUpperCase() + header.slice(1);
          htmlContent += `<th>${label}</th>`;
        });
        htmlContent += '</tr></thead>';
        
        // Body
        htmlContent += '<tbody>';
        data.forEach(item => {
          htmlContent += '<tr>';
          headers.forEach(header => {
            let value = item[header];
            if (typeof value === 'number' && header.includes('total')) {
              value = `Bs. ${value.toFixed(2)}`;
            }
            htmlContent += `<td>${value || '-'}</td>`;
          });
          htmlContent += '</tr>';
        });
        htmlContent += '</tbody></table>';
      }

      htmlContent += `
          <div class="footer">
            <p>Sistema de Análisis de Ventas - Generado automáticamente</p>
          </div>
        </body>
        </html>
      `;

      // Generar PDF
      const { uri } = await Print.printToFileAsync({
        html: htmlContent,
        base64: false
      });

      // Compartir PDF
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri);
      }

      return uri;
    } catch (error) {
      console.error('Error exportando a PDF:', error);
      throw error;
    }
  },

  // Generar reporte combinado
  async generateReport(queryResult, format = 'pdf') {
    try {
      const { response, data, type } = queryResult;
      
      // Preparar datos para el reporte
      let reportData = data;
      let reportTitle = 'Reporte de Consulta';

      // Personalizar título según el tipo
      switch (type) {
        case 'best_sales':
          reportTitle = 'Reporte de Mejores Ventas';
          break;
        case 'top_seller':
          reportTitle = 'Reporte de Mejor Vendedor';
          break;
        case 'top_products':
          reportTitle = 'Reporte de Productos Más Vendidos';
          break;
        case 'sales_by_branch':
          reportTitle = 'Reporte de Ventas por Sucursal';
          break;
        case 'summary':
          reportTitle = 'Resumen General de Ventas';
          break;
        case 'trend':
          reportTitle = 'Tendencia de Ventas';
          break;
        case 'comparison':
          reportTitle = 'Comparación de Ventas';
          break;
      }

      if (format === 'excel') {
        // Para Excel, convertir objetos simples a arrays
        if (!Array.isArray(reportData) && typeof reportData === 'object') {
          reportData = [reportData];
        }
        return await this.exportToExcel(reportData, `${type}_report.csv`);
      } else {
        return await this.exportToPDF(reportData, reportTitle);
      }
    } catch (error) {
      console.error('Error generando reporte:', error);
      throw error;
    }
  },

  // Transcribir audio y procesar consulta
  async transcribeAndQuery(audioFile) {
    try {
      // Primero transcribimos el audio
      const transcription = await this.convertAudioToText(audioFile);
      
      // Luego procesamos la consulta
      const queryResult = await this.processAssistantQuery(transcription, 'voice');
      if (queryResult.type === "help") {
        Alert.alert("Consulta no reconocida", "Intenta reformular la pregunta, como: '¿Cuáles fueron las mejores ventas del mes?'");
      } else if (!queryResult.data) {
        Alert.alert("Sin resultados", "No se encontraron datos para tu consulta.");
      } else {
        return {
          originalText: transcription,
          ...queryResult
        };
      }
     
    } catch (error) {
      console.error('Error en transcripción y consulta:', error);
      throw error;
    }
  }
};