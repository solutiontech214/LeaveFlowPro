import { useState, useRef } from "react";
import { Upload, Download, FileText, CheckCircle, XCircle, UserPlus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { importStudents } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";

interface UploadResult {
    message: string;
    successCount: number;
    failureCount: number;
    successful: string[];
    failed: { rollNo: string; reason: string }[];
}

export function StudentImport() {
    const [uploading, setUploading] = useState(false);
    const [result, setResult] = useState<UploadResult | null>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const { toast } = useToast();

    const downloadTemplate = () => {
        const csvContent = `name,email,password,department,division,rollNo,attendancePercentage
Rahul Sharma,rahul.sharma@institute.edu,Student@123,Computer Science,A,CS21B101,85
Priya Patel,priya.patel@institute.edu,Student@123,Electronics,B,EC21B201,90`;
        const blob = new Blob([csvContent], { type: "text/csv" });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = "student_import_template.csv";
        a.click();
        window.URL.revokeObjectURL(url);
    };

    const parseCSV = (text: string) => {
        const lines = text.trim().split("\n");
        const students: any[] = [];

        // Skip header row
        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const values = line.split(",").map((s) => s.trim());
            if (values.length >= 7) {
                students.push({
                    name: values[0],
                    email: values[1],
                    password: values[2],
                    department: values[3],
                    division: values[4],
                    rollNo: values[5],
                    attendancePercentage: parseFloat(values[6]) || 0,
                });
            }
        }

        return students;
    };

    const [lastUploadedStudents, setLastUploadedStudents] = useState<any[]>([]);

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
        setLastUploadedStudents([]);

        try {
            const text = await file.text();
            const students = parseCSV(text);

            if (students.length === 0) {
                toast({
                    title: "Empty File",
                    description: "No valid student data found in the CSV file",
                    variant: "destructive",
                });
                setUploading(false);
                return;
            }

            const uploadResult = await importStudents(students);
            setResult(uploadResult);

            // Calculate successful students
            const failedRollNos = new Set(uploadResult.failed.map((f: any) => f.rollNo));
            const successful = students.filter((s) => !failedRollNos.has(s.rollNo));
            setLastUploadedStudents(successful);

            if (uploadResult.successCount > 0) {
                toast({
                    title: "Import Complete",
                    description: `Successfully imported ${uploadResult.successCount} student(s)`,
                });
            } else {
                toast({
                    title: "Import Failed",
                    description: "No students were imported. Check errors below.",
                    variant: "destructive",
                });
            }
        } catch (error: any) {
            toast({
                title: "Import Failed",
                description: error.message || "Failed to import students",
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
                        <UserPlus className="h-5 w-5" />
                        Import Students
                    </CardTitle>
                    <CardDescription>
                        Bulk import student accounts via CSV file upload
                    </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                    <Alert>
                        <FileText className="h-4 w-4" />
                        <AlertTitle>CSV Format</AlertTitle>
                        <AlertDescription>
                            Your CSV file should have these columns: <code>name</code>, <code>email</code>,{" "}
                            <code>password</code>, <code>department</code>, <code>division</code>,{" "}
                            <code>rollNo</code>, <code>attendancePercentage</code>
                        </AlertDescription>
                    </Alert>

                    <Alert variant="destructive">
                        <AlertTitle>Important</AlertTitle>
                        <AlertDescription>
                            Passwords in the CSV will be stored securely (hashed). Students will use the
                            provided email and password to login. Make sure roll numbers and emails are unique.
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
                            {uploading ? "Importing..." : "Upload CSV"}
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
                        <CardTitle>Import Results</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-4 md:grid-cols-2">
                            <div className="flex items-center gap-3 rounded-lg border p-4">
                                <CheckCircle className="h-8 w-8 text-green-500" />
                                <div>
                                    <p className="text-2xl font-bold">{result.successCount}</p>
                                    <p className="text-sm text-muted-foreground">Students Imported</p>
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

                        {lastUploadedStudents.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-sm">Successfully Uploaded Students:</h4>
                                <div className="max-h-64 overflow-y-auto rounded-lg border">
                                    <table className="w-full text-sm">
                                        <thead className="bg-muted">
                                            <tr>
                                                <th className="p-2 text-left">Name</th>
                                                <th className="p-2 text-left">Roll No</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {lastUploadedStudents.map((student, index) => (
                                                <tr key={index} className="border-t">
                                                    <td className="p-2">{student.name}</td>
                                                    <td className="p-2">{student.rollNo}</td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        )}

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
