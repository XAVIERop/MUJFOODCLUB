import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import Header from '@/components/Header';
import { Download, Loader2, QrCode } from 'lucide-react';
import QRCodeLib from 'qrcode';
import { getTableOptions } from '@/utils/tableMapping';

interface Cafe {
  id: string;
  name: string;
  slug: string;
}

const TableQRGenerator = () => {
  const [cafes, setCafes] = useState<Cafe[]>([]);
  const [selectedCafe, setSelectedCafe] = useState<string>('');
  const [isLoading, setIsLoading] = useState(true);
  const [qrCodes, setQrCodes] = useState<{ table: number; dataUrl: string }[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  
  // Production website URL for QR codes
  const PRODUCTION_URL = 'https://mujfoodclub.in';

  // Load cafes
  useEffect(() => {
    const loadCafes = async () => {
      try {
        const { data, error } = await supabase
          .from('cafes')
          .select('id, name, slug')
          .order('name');

        if (error) throw error;
        setCafes(data || []);
      } catch (error) {
        console.error('Error loading cafes:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadCafes();
  }, []);

  // Generate QR codes when cafe is selected
  const generateQRCodes = async (cafeSlug: string, cafeName: string) => {
    setIsGenerating(true);
    setQrCodes([]);

    try {
      // Get table numbers for this cafe
      const tables = getTableOptions(cafeName);
      
      // Generate QR code for each table
      const qrPromises = tables.map(async (tableNum) => {
        const url = `${PRODUCTION_URL}/table-order/${cafeSlug}/${tableNum}`;
        const dataUrl = await QRCodeLib.toDataURL(url, {
          width: 400,
          margin: 2,
          color: {
            dark: '#000000',
            light: '#FFFFFF'
          }
        });
        return { table: tableNum, dataUrl };
      });

      const generated = await Promise.all(qrPromises);
      setQrCodes(generated);
    } catch (error) {
      console.error('Error generating QR codes:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCafeChange = (cafeId: string) => {
    setSelectedCafe(cafeId);
    const cafe = cafes.find(c => c.id === cafeId);
    if (cafe) {
      generateQRCodes(cafe.slug, cafe.name);
    }
  };

  const downloadQR = (table: number, dataUrl: string, cafeName: string) => {
    const link = document.createElement('a');
    link.href = dataUrl;
    link.download = `${cafeName.replace(/\s+/g, '-')}-Table-${table}.png`;
    link.click();
  };

  const downloadAllQRs = async () => {
    const cafe = cafes.find(c => c.id === selectedCafe);
    if (!cafe) return;

    // Download each QR code with a small delay
    for (const qr of qrCodes) {
      downloadQR(qr.table, qr.dataUrl, cafe.name);
      await new Promise(resolve => setTimeout(resolve, 200));
    }
  };

  const printQR = (table: number, dataUrl: string, cafeName: string) => {
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;

    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>${cafeName} - Table ${table}</title>
          <style>
            body {
              margin: 0;
              padding: 40px;
              display: flex;
              flex-direction: column;
              align-items: center;
              justify-content: center;
              font-family: Arial, sans-serif;
            }
            .qr-container {
              text-align: center;
              page-break-after: always;
            }
            h1 {
              font-size: 32px;
              margin-bottom: 10px;
              color: #333;
            }
            h2 {
              font-size: 48px;
              margin: 10px 0 30px 0;
              color: #FF6B35;
            }
            img {
              width: 400px;
              height: 400px;
              border: 2px solid #ddd;
              border-radius: 8px;
            }
            .instructions {
              margin-top: 20px;
              font-size: 16px;
              color: #666;
            }
            @media print {
              body {
                padding: 20px;
              }
            }
          </style>
        </head>
        <body>
          <div class="qr-container">
            <h1>${cafeName}</h1>
            <h2>Table ${table}</h2>
            <img src="${dataUrl}" alt="QR Code" />
            <div class="instructions">
              <p>Scan to order from your table</p>
            </div>
          </div>
        </body>
      </html>
    `);
    printWindow.document.close();
    printWindow.focus();
    setTimeout(() => {
      printWindow.print();
      printWindow.close();
    }, 500);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      
      <div className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Table QR Code Generator</h1>
          <p className="text-gray-600">Generate QR codes for table ordering</p>
        </div>

        {/* Cafe Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Select Cafe</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4 items-end">
              <div className="flex-1">
                <Select value={selectedCafe} onValueChange={handleCafeChange}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose a cafe" />
                  </SelectTrigger>
                  <SelectContent>
                    {cafes.map(cafe => (
                      <SelectItem key={cafe.id} value={cafe.id}>
                        {cafe.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {qrCodes.length > 0 && (
                <Button onClick={downloadAllQRs} variant="outline">
                  <Download className="w-4 h-4 mr-2" />
                  Download All ({qrCodes.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Loading State */}
        {isGenerating && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="w-8 h-8 animate-spin mr-2" />
            <span>Generating QR codes...</span>
          </div>
        )}

        {/* QR Codes Grid */}
        {qrCodes.length > 0 && !isGenerating && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {qrCodes.map(({ table, dataUrl }) => {
              const cafe = cafes.find(c => c.id === selectedCafe);
              return (
                <Card key={table}>
                  <CardHeader>
                    <CardTitle className="text-center">
                      Table {table}
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="flex justify-center">
                      <img 
                        src={dataUrl} 
                        alt={`QR Code for Table ${table}`}
                        className="w-full max-w-[300px] border-2 border-gray-200 rounded-lg"
                      />
                    </div>
                    <div className="flex gap-2">
                      <Button
                        onClick={() => downloadQR(table, dataUrl, cafe?.name || '')}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                      >
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                      <Button
                        onClick={() => printQR(table, dataUrl, cafe?.name || '')}
                        variant="outline"
                        className="flex-1"
                        size="sm"
                      >
                        <QrCode className="w-4 h-4 mr-1" />
                        Print
                      </Button>
                    </div>
                    <p className="text-xs text-center text-gray-500">
                      {PRODUCTION_URL}/table-order/{cafe?.slug}/{table}
                    </p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}

        {/* Empty State */}
        {!selectedCafe && !isGenerating && (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <QrCode className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Select a cafe to generate QR codes</p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};

export default TableQRGenerator;

