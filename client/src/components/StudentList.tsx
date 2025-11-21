import { useState, useEffect } from "react";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getAllStudents } from "@/lib/api";
import { useToast } from "@/hooks/use-toast";
import { Search, Users } from "lucide-react";

interface Student {
    id: string;
    name: string;
    email: string;
    rollNo: string;
    department: string;
    division: string;
    attendancePercentage: number;
}

export function StudentList() {
    const [students, setStudents] = useState<Student[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const { toast } = useToast();

    useEffect(() => {
        loadStudents();
    }, []);

    const loadStudents = async () => {
        try {
            const data = await getAllStudents();
            setStudents(data);
        } catch (error: any) {
            toast({
                title: "Error",
                description: error.message || "Failed to load students",
                variant: "destructive",
            });
        } finally {
            setLoading(false);
        }
    };

    const filteredStudents = students.filter((student) =>
        student.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.rollNo.toLowerCase().includes(searchTerm.toLowerCase()) ||
        student.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent mx-auto"></div>
                    <p className="mt-4 text-muted-foreground">Loading students...</p>
                </div>
            </div>
        );
    }

    return (
        <Card>
            <CardHeader>
                <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center gap-2">
                        <Users className="h-5 w-5" />
                        Student List ({students.length})
                    </CardTitle>
                    <div className="relative w-64">
                        <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                        <Input
                            placeholder="Search by name or roll no..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="pl-8"
                        />
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow>
                                <TableHead>Name</TableHead>
                                <TableHead>Roll No</TableHead>
                                <TableHead>Department</TableHead>
                                <TableHead>Division</TableHead>
                                <TableHead className="text-right">Attendance</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {filteredStudents.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center">
                                        No students found.
                                    </TableCell>
                                </TableRow>
                            ) : (
                                filteredStudents.map((student) => (
                                    <TableRow key={student.id}>
                                        <TableCell className="font-medium">
                                            <div>{student.name}</div>
                                            <div className="text-xs text-muted-foreground">{student.email}</div>
                                        </TableCell>
                                        <TableCell>{student.rollNo}</TableCell>
                                        <TableCell>{student.department}</TableCell>
                                        <TableCell>{student.division}</TableCell>
                                        <TableCell className="text-right">
                                            <span
                                                className={`font-bold ${student.attendancePercentage < 75
                                                        ? "text-red-500"
                                                        : "text-green-500"
                                                    }`}
                                            >
                                                {student.attendancePercentage}%
                                            </span>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
