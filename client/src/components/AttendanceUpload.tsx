import { useState, useRef } from "react";
import { Upload, Download, FileText, CheckCircle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { uploadAttendance } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface UploadResult {
    message: string;
    successCount: number;
    failureCount: number;
    successful: string[];
    failed: { rollNo: string; reason: string }[];
}

export function AttendanceUpload() {
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<UploadResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const downloadTemplate = () => {
        const csvContent = "rollNo,attendancePercentage\nCS001,85\nCS002,78";
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "attendance_template.csv";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const parseCSV = (text: string): { rollNo: string; attendancePercentage: number }[] => {
        const lines = text.trim().split("\n");
        const data: { rollNo: string; attendancePercentage: number }[] = [];

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const [rollNo, attendancePercentage] = line.split(",").map((s) => s.trim());
            if (rollNo && attendancePercentage) {
                data.push({
                    rollNo,
                    attendancePercentage: parseFloat(attendancePercentage),
                });
            }
        }

        return data;
    };

    const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.endsWith(".csv")) {
            toast({
                title: "Invalid File",
                description: "Please upload a CSV file",
                variant: "destructive",
            });
            return;
        }

        setUploading(true);
        setResult(null);

        try {
            const text = await file.text();
            const attendanceData = parseCSV(text);

            if (attendanceData.length === 0) {
                toast({
                    title: "Empty File",
                    description: "No valid data found in the CSV file",
                    variant: "destructive",
                });
                setUploading(false);
                return;
            }

            const uploadResult = await uploadAttendance(attendanceData);
            setResult(uploadResult);

            toast({
                title: "Upload Complete",
                description: `Successfully updated ${uploadResult.successCount} student(s)`,
            });
        } catch (error: any) {
            toast({
                title: "Upload Failed",
                description: error.message || "Failed to upload attendance",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
            // Reset file input
            if (fileInputRef.current) {
                fileInputRef.current.value = "";
            }
        }
    };

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Upload className="h-5 w-5" />
                        Upload Attendance
                    </CardTitle>
                    <CardDescription>
                        Upload student attendance data via CSV file
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertTitle>CSV Format</AlertTitle>
                        <AlertDescription>
                            Your CSV file should have two columns: <code>rollNo</code> and{" "}
                            <code>attendancePercentage</code>. The first row should be the header.
                        </AlertDescription>
                    </Alert>

                    <div className="flex gap-3">
                        <Button
                            variant="outline"
                            onClick={downloadTemplate}
                            className="gap-2"
                        >
                            <Download className="h-4 w-4" />
                            Download Template
                        </Button>

                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            disabled={uploading}
                            className="gap-2"
                        >
                            <Upload className="h-4 w-4" />
                            {uploading ? "Uploading..." : "Upload CSV"}
                        </Button>

                        <input
                            ref={fileInputRef}
                            type="file"
                            accept=".csv"
                            onChange={handleFileSelect}
                            className="hidden"
                        />
                    </div>
                </CardContent>
            </Card>

            {result && (
                <Card>
                    <CardHeader>
                        <CardTitle>Upload Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center gap-3 rounded-lg border p-4">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                                <div>
                                    <p className="text-2xl font-bold">{result.successCount}</p>
                                    <p className="text-sm text-muted-foreground">Successful</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 rounded-lg border p-4">
                                <XCircle className="h-8 w-8 text-red-500" />
                                <div>
                                    <p className="text-2xl font-bold">{result.failureCount}</p>
                                    <p className="text-sm text-muted-foreground">Failed</p>
                                </div>
                            </div>
                        </div>

                        {result.failed.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Failed Records:</h4>
                                <div className="max-h-64 overflow-y-auto rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="p-2 text-left">Roll No</th>
                                                <th className="p-2 text-left">Reason</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {result.failed.map((item, index) => (
                                                <tr key={index} className="border-t">
                                                    <td className="p-2">{item.rollNo}</td>
                                                    <td className="p-2 text-muted-foreground">{item.reason}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}
