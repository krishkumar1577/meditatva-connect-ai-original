import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { 
  FileText, Upload, Users, Plus, Trash2, Eye, 
  Download, Calendar, User, Heart, Pill 
} from "lucide-react";
import { toast } from "sonner";

interface FamilyMember {
  id: string;
  name: string;
  relation: string;
  photo: string;
  age: number;
}

interface MedicalDocument {
  id: string;
  memberId: string;
  type: "prescription" | "report" | "medication";
  title: string;
  date: string;
  fileUrl: string;
  doctor?: string;
}

export const MedicalCabinet = () => {
  const [familyMembers, setFamilyMembers] = useState<FamilyMember[]>([
    { id: "1", name: "John Doe", relation: "Self", photo: "👤", age: 35 },
    { id: "2", name: "Jane Doe", relation: "Spouse", photo: "👤", age: 32 },
    { id: "3", name: "Emma Doe", relation: "Daughter", photo: "👤", age: 8 },
  ]);

  const [documents, setDocuments] = useState<MedicalDocument[]>([
    {
      id: "1",
      memberId: "1",
      type: "prescription",
      title: "Blood Pressure Medication",
      date: "2024-11-05",
      fileUrl: "#",
      doctor: "Dr. Smith"
    },
    {
      id: "2",
      memberId: "1",
      type: "report",
      title: "Complete Blood Count",
      date: "2024-10-28",
      fileUrl: "#",
      doctor: "Dr. Johnson"
    },
    {
      id: "3",
      memberId: "2",
      type: "medication",
      title: "Vitamin D Supplements",
      date: "2024-11-01",
      fileUrl: "#"
    },
  ]);

  const [selectedMember, setSelectedMember] = useState<string>("1");
  const [showAddMember, setShowAddMember] = useState(false);
  const [showUploadDoc, setShowUploadDoc] = useState(false);

  const getDocumentIcon = (type: string) => {
    switch (type) {
      case "prescription": return <FileText className="w-5 h-5" />;
      case "report": return <Heart className="w-5 h-5" />;
      case "medication": return <Pill className="w-5 h-5" />;
      default: return <FileText className="w-5 h-5" />;
    }
  };

  const getDocumentColor = (type: string) => {
    switch (type) {
      case "prescription": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "report": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "medication": return "bg-green-500/10 text-green-400 border-green-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const filteredDocuments = documents.filter(doc => doc.memberId === selectedMember);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Medical Cabinet</h2>
          <p className="text-gray-400 text-sm mt-1">Store & manage family health records</p>
        </div>
        <Button
          onClick={() => setShowAddMember(true)}
          className="bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-600 hover:to-blue-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Member
        </Button>
      </div>

      {/* Family Members */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        {familyMembers.map((member) => (
          <motion.div
            key={member.id}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Card
              onClick={() => setSelectedMember(member.id)}
              className={`p-4 cursor-pointer transition-all ${
                selectedMember === member.id
                  ? "bg-gradient-to-br from-cyan-500/20 to-blue-500/20 border-cyan-500/50"
                  : "bg-white/5 border-white/10 hover:bg-white/10"
              }`}
            >
              <div className="text-center space-y-2">
                <div className="text-4xl mx-auto">{member.photo}</div>
                <div>
                  <p className="text-white font-medium text-sm">{member.name}</p>
                  <p className="text-gray-400 text-xs">{member.relation}</p>
                  <Badge variant="outline" className="mt-1 text-xs">
                    {member.age} yrs
                  </Badge>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Documents Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">
            Documents ({filteredDocuments.length})
          </h3>
          <Button
            onClick={() => setShowUploadDoc(true)}
            variant="outline"
            className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
          >
            <Upload className="w-4 h-4 mr-2" />
            Upload Document
          </Button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <AnimatePresence>
            {filteredDocuments.map((doc) => (
              <motion.div
                key={doc.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
              >
                <Card className={`p-4 border ${getDocumentColor(doc.type)}`}>
                  <div className="space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2">
                        {getDocumentIcon(doc.type)}
                        <Badge variant="outline" className="text-xs capitalize">
                          {doc.type}
                        </Badge>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => toast.success("Viewing document...")}
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          className="h-7 w-7 p-0"
                          onClick={() => toast.success("Downloading...")}
                        >
                          <Download className="w-3.5 h-3.5" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <h4 className="font-medium text-white text-sm">{doc.title}</h4>
                      {doc.doctor && (
                        <p className="text-xs text-gray-400 mt-1">{doc.doctor}</p>
                      )}
                    </div>

                    <div className="flex items-center text-xs text-gray-400">
                      <Calendar className="w-3.5 h-3.5 mr-1" />
                      {new Date(doc.date).toLocaleDateString()}
                    </div>
                  </div>
                </Card>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>

        {filteredDocuments.length === 0 && (
          <div className="text-center py-12">
            <FileText className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No documents found</p>
            <Button
              onClick={() => setShowUploadDoc(true)}
              variant="outline"
              className="mt-4"
            >
              Upload First Document
            </Button>
          </div>
        )}
      </div>

      {/* Add Member Dialog */}
      <Dialog open={showAddMember} onOpenChange={setShowAddMember}>
        <DialogContent className="bg-[#1a1f2e] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Add Family Member</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Name" className="bg-white/5 border-white/10" />
            <Input placeholder="Relation" className="bg-white/5 border-white/10" />
            <Input placeholder="Age" type="number" className="bg-white/5 border-white/10" />
            <Button 
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
              onClick={() => {
                toast.success("Family member added!");
                setShowAddMember(false);
              }}
            >
              Add Member
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Upload Document Dialog */}
      <Dialog open={showUploadDoc} onOpenChange={setShowUploadDoc}>
        <DialogContent className="bg-[#1a1f2e] border-white/10">
          <DialogHeader>
            <DialogTitle className="text-white">Upload Document</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <Input placeholder="Document Title" className="bg-white/5 border-white/10" />
            <select className="w-full p-2 rounded-md bg-white/5 border border-white/10 text-white">
              <option value="prescription">Prescription</option>
              <option value="report">Medical Report</option>
              <option value="medication">Medication</option>
            </select>
            <Input placeholder="Doctor Name (optional)" className="bg-white/5 border-white/10" />
            <Input type="date" className="bg-white/5 border-white/10" />
            <Input type="file" className="bg-white/5 border-white/10" />
            <Button 
              className="w-full bg-gradient-to-r from-cyan-500 to-blue-500"
              onClick={() => {
                toast.success("Document uploaded!");
                setShowUploadDoc(false);
              }}
            >
              Upload Document
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
