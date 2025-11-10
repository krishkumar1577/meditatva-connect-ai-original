import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { 
  Calendar, Clock, Video, MapPin, User, Phone, 
  Plus, CheckCircle, XCircle, AlertCircle 
} from "lucide-react";
import { toast } from "sonner";

interface Appointment {
  id: string;
  doctor: string;
  specialty: string;
  date: string;
  time: string;
  mode: "online" | "offline";
  status: "upcoming" | "completed" | "cancelled";
  location?: string;
  avatar: string;
}

export const AppointmentsSection = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([
    {
      id: "1",
      doctor: "Dr. Sarah Wilson",
      specialty: "Cardiologist",
      date: "2024-11-15",
      time: "10:00 AM",
      mode: "online",
      status: "upcoming",
      avatar: "👩‍⚕️"
    },
    {
      id: "2",
      doctor: "Dr. Michael Chen",
      specialty: "General Physician",
      date: "2024-11-20",
      time: "2:30 PM",
      mode: "offline",
      status: "upcoming",
      location: "MediTatva Clinic, Downtown",
      avatar: "👨‍⚕️"
    },
    {
      id: "3",
      doctor: "Dr. Emily Brown",
      specialty: "Dermatologist",
      date: "2024-11-02",
      time: "11:00 AM",
      mode: "online",
      status: "completed",
      avatar: "👩‍⚕️"
    },
  ]);

  const [showBooking, setShowBooking] = useState(false);
  const [selectedTab, setSelectedTab] = useState<"upcoming" | "completed" | "all">("upcoming");

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "upcoming": return <AlertCircle className="w-4 h-4" />;
      case "completed": return <CheckCircle className="w-4 h-4" />;
      case "cancelled": return <XCircle className="w-4 h-4" />;
      default: return <AlertCircle className="w-4 h-4" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "upcoming": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "completed": return "bg-green-500/10 text-green-400 border-green-500/20";
      case "cancelled": return "bg-red-500/10 text-red-400 border-red-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const filteredAppointments = appointments.filter(apt => 
    selectedTab === "all" ? true : apt.status === selectedTab
  );

  const handleCancelAppointment = (id: string) => {
    setAppointments(prev => 
      prev.map(apt => apt.id === id ? { ...apt, status: "cancelled" as const } : apt)
    );
    toast.success("Appointment cancelled");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Appointments</h2>
          <p className="text-gray-400 text-sm mt-1">Manage your doctor consultations</p>
        </div>
        <Button
          onClick={() => setShowBooking(true)}
          className="bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Book Appointment
        </Button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-white/10">
        {["upcoming", "completed", "all"].map((tab) => (
          <button
            key={tab}
            onClick={() => setSelectedTab(tab as typeof selectedTab)}
            className={`px-4 py-2 capitalize transition-all ${
              selectedTab === tab
                ? "text-cyan-400 border-b-2 border-cyan-400"
                : "text-gray-400 hover:text-white"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Appointments List */}
      <div className="space-y-4">
        <AnimatePresence>
          {filteredAppointments.map((apt) => (
            <motion.div
              key={apt.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              layout
            >
              <Card className="p-5 bg-white/5 border-white/10 hover:bg-white/10 transition-all">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                  {/* Doctor Info */}
                  <div className="flex items-start gap-4 flex-1">
                    <div className="text-4xl">{apt.avatar}</div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-semibold">{apt.doctor}</h3>
                        <Badge 
                          variant="outline" 
                          className={`${getStatusColor(apt.status)} border`}
                        >
                          <span className="flex items-center gap-1">
                            {getStatusIcon(apt.status)}
                            {apt.status}
                          </span>
                        </Badge>
                      </div>
                      <p className="text-gray-400 text-sm mb-3">{apt.specialty}</p>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                        <div className="flex items-center gap-2 text-gray-300">
                          <Calendar className="w-4 h-4 text-cyan-400" />
                          {new Date(apt.date).toLocaleDateString()}
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          <Clock className="w-4 h-4 text-purple-400" />
                          {apt.time}
                        </div>
                        <div className="flex items-center gap-2 text-gray-300">
                          {apt.mode === "online" ? (
                            <Video className="w-4 h-4 text-green-400" />
                          ) : (
                            <MapPin className="w-4 h-4 text-orange-400" />
                          )}
                          {apt.mode === "online" ? "Video Consultation" : apt.location}
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2 min-w-[140px]">
                    {apt.status === "upcoming" && (
                      <>
                        {apt.mode === "online" && (
                          <Button
                            size="sm"
                            className="bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600"
                            onClick={() => toast.success("Joining video call...")}
                          >
                            <Video className="w-4 h-4 mr-2" />
                            Join Call
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-500/50 text-red-400 hover:bg-red-500/10"
                          onClick={() => handleCancelAppointment(apt.id)}
                        >
                          Cancel
                        </Button>
                      </>
                    )}
                    {apt.status === "completed" && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="border-cyan-500/50 text-cyan-400 hover:bg-cyan-500/10"
                        onClick={() => toast.success("Viewing prescription...")}
                      >
                        View Details
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </AnimatePresence>

        {filteredAppointments.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-400">No {selectedTab} appointments</p>
          </div>
        )}
      </div>

      {/* Book Appointment Dialog */}
      <Dialog open={showBooking} onOpenChange={setShowBooking}>
        <DialogContent className="bg-[#1a1f2e] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Book New Appointment</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Doctor Name</label>
              <Input placeholder="Search doctor..." className="bg-white/5 border-white/10" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Specialty</label>
              <select className="w-full p-2 rounded-md bg-white/5 border border-white/10 text-white">
                <option value="">Select Specialty</option>
                <option value="general">General Physician</option>
                <option value="cardio">Cardiologist</option>
                <option value="derma">Dermatologist</option>
                <option value="ortho">Orthopedic</option>
              </select>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Consultation Mode</label>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1">
                  <Video className="w-4 h-4 mr-2" />
                  Online
                </Button>
                <Button variant="outline" className="flex-1">
                  <MapPin className="w-4 h-4 mr-2" />
                  Offline
                </Button>
              </div>
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Preferred Date</label>
              <Input type="date" className="bg-white/5 border-white/10" />
            </div>
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Preferred Time</label>
              <Input type="time" className="bg-white/5 border-white/10" />
            </div>
            <Button 
              className="w-full bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600"
              onClick={() => {
                toast.success("Appointment booked successfully!");
                setShowBooking(false);
              }}
            >
              Confirm Booking
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
