import { PageLayout } from "@/components/layout/PageLayout";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Plus, 
  Shield,
  UserCheck,
  Phone,
  Mail,
  Briefcase,
  Calendar,
  Trash2,
  Loader2
} from "lucide-react";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import type { Tables, TablesInsert } from "@/integrations/supabase/types";

type TeamMember = Tables<"team_members">;

const roles = {
  official: ["Event Director", "Finance Manager", "Operations Head", "Marketing Lead", "Logistics Coordinator"],
  volunteer: ["Registration Desk", "Food Court Assistant", "Stage Coordinator", "Security Support", "Information Booth"]
};

const shifts = ["Morning (8AM-2PM)", "Afternoon (12PM-6PM)", "Evening (2PM-8PM)", "Night (6PM-10PM)"];

export default function Team() {
  const [team, setTeam] = useState<TeamMember[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [showForm, setShowForm] = useState(false);
  const [formType, setFormType] = useState<"official" | "volunteer">("official");
  const [newMember, setNewMember] = useState({
    name: "",
    email: "",
    mobile: "",
    responsibilities: "",
    shift_details: ""
  });

  useEffect(() => {
    fetchTeamMembers();
  }, []);

  const fetchTeamMembers = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("team_members")
      .select("*")
      .order("created_at", { ascending: false });
    
    if (error) {
      toast.error("Failed to fetch team members");
      console.error(error);
    } else {
      setTeam(data || []);
    }
    setLoading(false);
  };

  const handleAddMember = async () => {
    if (!newMember.name || !newMember.responsibilities) {
      toast.error("Please fill in name and role");
      return;
    }

    setSaving(true);
    const memberData: TablesInsert<"team_members"> = {
      name: newMember.name,
      email: newMember.email || null,
      mobile: newMember.mobile || null,
      responsibilities: newMember.responsibilities,
      shift_details: formType === "volunteer" ? newMember.shift_details : null,
      role: formType
    };

    const { error } = await supabase
      .from("team_members")
      .insert(memberData);
    
    if (error) {
      toast.error("Failed to add team member");
      console.error(error);
    } else {
      toast.success("Team member added successfully");
      setNewMember({ name: "", email: "", mobile: "", responsibilities: "", shift_details: "" });
      setShowForm(false);
      fetchTeamMembers();
    }
    setSaving(false);
  };

  const handleDelete = async (id: string) => {
    const { error } = await supabase
      .from("team_members")
      .delete()
      .eq("id", id);
    
    if (error) {
      toast.error("Failed to delete team member");
      console.error(error);
    } else {
      toast.success("Team member deleted");
      setTeam(team.filter(m => m.id !== id));
    }
  };

  const officials = team.filter(m => m.role === "official");
  const volunteers = team.filter(m => m.role === "volunteer");

  if (loading) {
    return (
      <PageLayout>
        <div className="container py-8 flex items-center justify-center min-h-[400px]">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      </PageLayout>
    );
  }

  return (
    <PageLayout>
      <div className="container py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Team Management</h1>
            <p className="text-muted-foreground mt-1">Manage officials and volunteers</p>
          </div>
          <Button onClick={() => setShowForm(!showForm)} variant="accent">
            <Plus className="h-4 w-4 mr-2" />
            Add Member
          </Button>
        </div>

        {showForm && (
          <Card className="mb-8 animate-slide-up">
            <CardHeader>
              <CardTitle>Add Team Member</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="mb-4">
                <div className="flex gap-2">
                  <Button 
                    variant={formType === "official" ? "default" : "outline"}
                    onClick={() => setFormType("official")}
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Official
                  </Button>
                  <Button 
                    variant={formType === "volunteer" ? "default" : "outline"}
                    onClick={() => setFormType("volunteer")}
                  >
                    <UserCheck className="h-4 w-4 mr-2" />
                    Volunteer
                  </Button>
                </div>
              </div>
              <div className="grid md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  <Input
                    id="name"
                    value={newMember.name}
                    onChange={(e) => setNewMember({ ...newMember, name: e.target.value })}
                    placeholder="Enter full name"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="role">Role</Label>
                  <select
                    id="role"
                    value={newMember.responsibilities}
                    onChange={(e) => setNewMember({ ...newMember, responsibilities: e.target.value })}
                    className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                  >
                    <option value="">Select role</option>
                    {roles[formType].map(r => (
                      <option key={r} value={r}>{r}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={newMember.email}
                    onChange={(e) => setNewMember({ ...newMember, email: e.target.value })}
                    placeholder="Enter email"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Phone</Label>
                  <Input
                    id="phone"
                    value={newMember.mobile}
                    onChange={(e) => setNewMember({ ...newMember, mobile: e.target.value })}
                    placeholder="Enter phone number"
                  />
                </div>
                {formType === "volunteer" && (
                  <div className="space-y-2">
                    <Label htmlFor="shift">Shift</Label>
                    <select
                      id="shift"
                      value={newMember.shift_details}
                      onChange={(e) => setNewMember({ ...newMember, shift_details: e.target.value })}
                      className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    >
                      <option value="">Select shift</option>
                      {shifts.map(s => (
                        <option key={s} value={s}>{s}</option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="md:col-span-2 flex gap-2">
                  <Button onClick={handleAddMember} disabled={saving}>
                    {saving && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
                    Add Member
                  </Button>
                  <Button variant="outline" onClick={() => setShowForm(false)}>Cancel</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        <Tabs defaultValue="officials" className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-2">
            <TabsTrigger value="officials" className="flex items-center gap-2">
              <Shield className="h-4 w-4" />
              Officials ({officials.length})
            </TabsTrigger>
            <TabsTrigger value="volunteers" className="flex items-center gap-2">
              <UserCheck className="h-4 w-4" />
              Volunteers ({volunteers.length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value="officials">
            {officials.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                <p>No officials added yet. Click "Add Member" to get started.</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {officials.map((member) => (
                  <Card key={member.id} className="animate-fade-in">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                            <Users className="h-6 w-6 text-primary" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{member.name}</h3>
                            <Badge variant="secondary">{member.responsibilities}</Badge>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        {member.email && (
                          <div className="flex items-center gap-2">
                            <Mail className="h-3 w-3" />
                            {member.email}
                          </div>
                        )}
                        {member.mobile && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {member.mobile}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>

          <TabsContent value="volunteers">
            {volunteers.length === 0 ? (
              <Card className="p-8 text-center text-muted-foreground">
                <p>No volunteers added yet. Click "Add Member" to get started.</p>
              </Card>
            ) : (
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {volunteers.map((member) => (
                  <Card key={member.id} className="animate-fade-in">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="h-12 w-12 rounded-full bg-info/10 flex items-center justify-center">
                            <UserCheck className="h-6 w-6 text-info" />
                          </div>
                          <div>
                            <h3 className="font-semibold text-foreground">{member.name}</h3>
                            <Badge variant="outline">{member.responsibilities}</Badge>
                          </div>
                        </div>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-8 w-8 text-destructive"
                          onClick={() => handleDelete(member.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                      <div className="mt-4 space-y-2 text-sm text-muted-foreground">
                        {member.shift_details && (
                          <div className="flex items-center gap-2">
                            <Calendar className="h-3 w-3" />
                            {member.shift_details}
                          </div>
                        )}
                        {member.responsibilities && (
                          <div className="flex items-center gap-2">
                            <Briefcase className="h-3 w-3" />
                            {member.responsibilities}
                          </div>
                        )}
                        {member.mobile && (
                          <div className="flex items-center gap-2">
                            <Phone className="h-3 w-3" />
                            {member.mobile}
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}