import { useState } from "react";
import { motion } from "framer-motion";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Calendar } from "@/components/ui/calendar";
import { 
  Bell, Plus, Trash2, Clock, Pill, 
  Calendar as CalendarIcon, AlertCircle 
} from "lucide-react";
import { toast } from "sonner";

interface Reminder {
  id: string;
  title: string;
  type: "medicine" | "checkup" | "exercise";
  frequency: "daily" | "weekly" | "monthly";
  time: string;
  startDate: string;
  isActive: boolean;
}

export const HealthReminders = () => {
  const [reminders, setReminders] = useState<Reminder[]>([
    {
      id: "1",
      title: "Blood Pressure Medication",
      type: "medicine",
      frequency: "daily",
      time: "09:00",
      startDate: "2024-11-01",
      isActive: true
    },
    {
      id: "2",
      title: "Monthly Health Checkup",
      type: "checkup",
      frequency: "monthly",
      time: "10:00",
      startDate: "2024-11-15",
      isActive: true
    },
    {
      id: "3",
      title: "Morning Exercise",
      type: "exercise",
      frequency: "daily",
      time: "06:30",
      startDate: "2024-11-01",
      isActive: false
    }
  ]);

  const [showAddReminder, setShowAddReminder] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "medicine": return <Pill className="w-4 h-4" />;
      case "checkup": return <AlertCircle className="w-4 h-4" />;
      case "exercise": return <Bell className="w-4 h-4" />;
      default: return <Bell className="w-4 h-4" />;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "medicine": return "bg-blue-500/10 text-blue-400 border-blue-500/20";
      case "checkup": return "bg-purple-500/10 text-purple-400 border-purple-500/20";
      case "exercise": return "bg-green-500/10 text-green-400 border-green-500/20";
      default: return "bg-gray-500/10 text-gray-400 border-gray-500/20";
    }
  };

  const toggleReminder = (id: string) => {
    setReminders(prev =>
      prev.map(r => r.id === id ? { ...r, isActive: !r.isActive } : r)
    );
    toast.success("Reminder updated");
  };

  const deleteReminder = (id: string) => {
    setReminders(prev => prev.filter(r => r.id !== id));
    toast.success("Reminder deleted");
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-white">Health Reminders</h2>
          <p className="text-gray-400 text-sm mt-1">Never miss your medicine or checkup</p>
        </div>
        <Button
          onClick={() => setShowAddReminder(true)}
          className="bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
        >
          <Plus className="w-4 h-4 mr-2" />
          Add Reminder
        </Button>
      </div>

      {/* Calendar View */}
      <Card className="p-6 bg-white/5 border-white/10">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Calendar */}
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-4">Calendar</h3>
            <div className="bg-[#1a1f2e] rounded-lg p-4 border border-white/10">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="rounded-md"
              />
            </div>
          </div>

          {/* Today's Reminders */}
          <div className="flex-1">
            <h3 className="text-white font-semibold mb-4">Today's Schedule</h3>
            <div className="space-y-3">
              {reminders
                .filter(r => r.isActive && (r.frequency === "daily" || r.frequency === "weekly"))
                .sort((a, b) => a.time.localeCompare(b.time))
                .map((reminder) => (
                  <motion.div
                    key={reminder.id}
                    whileHover={{ scale: 1.02 }}
                    className="p-3 rounded-lg bg-gradient-to-r from-white/5 to-white/10 border border-white/10"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${getTypeColor(reminder.type)}`}>
                          {getTypeIcon(reminder.type)}
                        </div>
                        <div>
                          <p className="text-white font-medium text-sm">{reminder.title}</p>
                          <div className="flex items-center gap-2 mt-1">
                            <Clock className="w-3 h-3 text-gray-400" />
                            <span className="text-xs text-gray-400">{reminder.time}</span>
                          </div>
                        </div>
                      </div>
                      <Badge variant="outline" className="text-xs capitalize">
                        {reminder.frequency}
                      </Badge>
                    </div>
                  </motion.div>
                ))}
            </div>
          </div>
        </div>
      </Card>

      {/* All Reminders List */}
      <div className="space-y-3">
        <h3 className="text-white font-semibold">All Reminders</h3>
        {reminders.map((reminder) => (
          <motion.div
            key={reminder.id}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            layout
          >
            <Card className={`p-4 transition-all ${
              reminder.isActive 
                ? "bg-white/5 border-white/10" 
                : "bg-white/[0.02] border-white/5 opacity-60"
            }`}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-4 flex-1">
                  <div className={`p-3 rounded-lg ${getTypeColor(reminder.type)}`}>
                    {getTypeIcon(reminder.type)}
                  </div>
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{reminder.title}</h4>
                    <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" />
                        {reminder.time}
                      </div>
                      <div className="flex items-center gap-1">
                        <CalendarIcon className="w-3.5 h-3.5" />
                        {reminder.frequency}
                      </div>
                      <Badge 
                        variant="outline" 
                        className={`text-xs ${getTypeColor(reminder.type)} border`}
                      >
                        {reminder.type}
                      </Badge>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => toggleReminder(reminder.id)}
                    className={reminder.isActive ? "text-green-400" : "text-gray-400"}
                  >
                    {reminder.isActive ? "Active" : "Inactive"}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    onClick={() => deleteReminder(reminder.id)}
                    className="text-red-400 hover:bg-red-500/10"
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Add Reminder Dialog */}
      <Dialog open={showAddReminder} onOpenChange={setShowAddReminder}>
        <DialogContent className="bg-[#1a1f2e] border-white/10 max-w-md">
          <DialogHeader>
            <DialogTitle className="text-white">Add New Reminder</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Reminder Title</label>
              <Input 
                placeholder="e.g., Take Blood Pressure Medicine" 
                className="bg-white/5 border-white/10"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Type</label>
              <select className="w-full p-2 rounded-md bg-white/5 border border-white/10 text-white">
                <option value="medicine">Medicine</option>
                <option value="checkup">Health Checkup</option>
                <option value="exercise">Exercise</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Frequency</label>
              <select className="w-full p-2 rounded-md bg-white/5 border border-white/10 text-white">
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
              </select>
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Time</label>
              <Input 
                type="time" 
                className="bg-white/5 border-white/10"
              />
            </div>

            <div>
              <label className="text-sm text-gray-400 mb-1 block">Start Date</label>
              <Input 
                type="date" 
                className="bg-white/5 border-white/10"
              />
            </div>

            <Button 
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
              onClick={() => {
                toast.success("Reminder added successfully!");
                setShowAddReminder(false);
              }}
            >
              <Bell className="w-4 h-4 mr-2" />
              Create Reminder
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
